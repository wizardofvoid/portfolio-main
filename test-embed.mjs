import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'node:fs/promises';

async function test() {
  const envContent = await fs.readFile('.env.local', 'utf-8');
  let key = '';
  envContent.split('\n').forEach(line => {
    if (line.startsWith('GEMINI_API_KEY=')) {
      key = line.split('=')[1].trim();
    }
  });

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log("Available models:");
    data.models.filter(m => m.supportedGenerationMethods.includes('embedContent')).forEach(m => console.log(m.name, m.supportedGenerationMethods));
  } catch(e) {
    console.error(e);
  }
}
test();
