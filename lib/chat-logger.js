import { db } from './firebase';

export async function logChatInteraction({ sessionId, question, answer, chunksUsed, ip, userAgent }) {
  if (!db) {
    console.warn('Chat logger: Firestore is not configured. Skipping log.');
    return;
  }

  try {
    const logEntry = {
      sessionId: sessionId || 'anonymous',
      question,
      answer,
      chunksUsed: chunksUsed || [],
      timestamp: new Date(), // Firebase Admin can use native Date objects for timestamps
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    };

    // Fire-and-forget logging to 'chat_logs' collection
    await db.collection('chat_logs').add(logEntry);
    console.log(`[ChatLogger] Logged interaction for session ${sessionId}`);
  } catch (error) {
    // We catch and log, but do not throw to prevent crashing the response
    console.error('[ChatLogger] Failed to log interaction:', error);
  }
}
