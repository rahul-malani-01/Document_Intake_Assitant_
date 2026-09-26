import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'NONE');

async function checkModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error('API Error Response:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('\n--- Available Models for your Key ---');
    const supported = data.models
      ?.filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      ?.map((m) => m.name.replace('models/', ''));

    console.log(supported);
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

checkModels();