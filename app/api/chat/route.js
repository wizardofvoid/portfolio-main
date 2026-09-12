import { GoogleGenerativeAI } from '@google/generative-ai';
import { logChatInteraction } from '../../../lib/chat-logger';
import crypto from 'crypto';

// In-memory rate limiting (per lambda instance)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  let record = rateLimitMap.get(ip);
  if (!record) {
    record = [];
  }
  
  // Clean up old requests
  record = record.filter(time => time > windowStart);
  
  if (record.length >= MAX_REQUESTS) {
    return false;
  }
  
  record.push(now);
  rateLimitMap.set(ip, record);
  return true;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Hash IP for privacy in logs
    const hashedIp = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { messages, sessionId } = await req.json();
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;

    // Load pre-computed embeddings
    let chunks = [];
    try {
      const mod = await import('../../../lib/embeddings.generated.json', { with: { type: 'json' } });
      chunks = mod.default;
    } catch (err) {
      console.warn("Embeddings not found. Please run `npm run embed`.");
      // Fallback: empty chunks
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // 1. Embed the user's question
    let contextText = '';
    let usedChunkIds = [];
    
    if (chunks.length > 0) {
      const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
      const embedResult = await embedModel.embedContent(latestMessage);
      const queryEmbedding = embedResult.embedding.values;

      // 2. Cosine similarity
      const scoredChunks = chunks.map(chunk => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

      // Sort by score descending and take top 3
      scoredChunks.sort((a, b) => b.score - a.score);
      const topChunks = scoredChunks.slice(0, 3);
      
      usedChunkIds = topChunks.map(c => c.id);
      contextText = topChunks.map(c => c.text).join('\n\n');
    }

    // 3. Construct the prompt
    const systemInstruction = `You are Ayush Saraf, a final-year Computer Science student at VIT Vellore and an Oracle-certified Java developer. 
You are responding to a visitor on your portfolio website.
Speak in the first person (use "I", "my"). Be concise, professional, warm, and confident. 
Do not hallucinate facts. If asked something outside the provided context, politely say you're not sure but they can contact you at sarafa736@gmail.com.

Here is the relevant context from your portfolio to answer the question:
---
${contextText}
---`;

    const chatModel = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction,
    });

    // Format history for Gemini API
    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Gemini API throws an error if history starts with a 'model' message
    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const chat = chatModel.startChat({ history });

    // 4. Stream response
    const result = await chat.sendMessageStream([{ text: latestMessage }]);

    // We will accumulate the full answer to log it
    let fullAnswer = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullAnswer += chunkText;
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
          
          // Fire and forget log
          logChatInteraction({
            sessionId,
            question: latestMessage,
            answer: fullAnswer,
            chunksUsed: usedChunkIds,
            ip: hashedIp,
            userAgent
          });
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (err) {
    console.error("API Chat Error:", err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
