import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPortfolioChunks } from '../lib/rag-data.js';
import fs from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Check for .env.local to load GEMINI_API_KEY if not in process.env
try {
  const envContent = await fs.readFile(resolve(__dirname, '../.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !process.env[key]) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (e) {
  // Ignore if .env.local doesn't exist
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.error("Error: GEMINI_API_KEY is missing or invalid in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

async function main() {
  console.log("Chunking portfolio data...");
  const chunks = getPortfolioChunks();
  console.log(`Generated ${chunks.length} chunks. Fetching embeddings from Gemini...`);
  
  const results = [];
  let count = 0;
  
  // Note: Gemini API free tier has strict requests-per-minute limits.
  // We add a 4.2 second delay between requests to avoid 429 Too Many Requests (limit is ~15 RPM).
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  for (const chunk of chunks) {
    try {
      const result = await model.embedContent(chunk.text);
      const embedding = result.embedding.values;
      results.push({ ...chunk, embedding });
      count++;
      process.stdout.write(`\rEmbedded ${count}/${chunks.length} chunks`);
      await delay(4200); // Wait 4.2 seconds
    } catch (err) {
      console.error(`\nFailed to embed chunk ${chunk.id}:`, err);
    }
  }
  
  console.log("\nWriting lib/embeddings.generated.json...");
  const OUT = resolve(__dirname, '../lib/embeddings.generated.json');
  await fs.writeFile(OUT, JSON.stringify(results, null, 2), 'utf8');
  console.log("Done! Embeddings are ready.");
}

main().catch(err => {
  console.error("\nError:", err);
  process.exit(1);
});
