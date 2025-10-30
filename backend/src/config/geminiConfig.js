import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Gemini API configuration
const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY
};

// Initialize Gemini client
let geminiClient;

try {
  if (geminiConfig.apiKey) {
    geminiClient = new GoogleGenAI({
      apiKey: geminiConfig.apiKey
    });
    console.log('✅ Gemini API client initialized');
  } else {
    console.log('⚠️ GEMINI_API_KEY not configured in .env');
  }
} catch (error) {
  console.error('❌ Gemini API initialization error:', error.message);
}

export { geminiClient, geminiConfig };
export default { geminiClient, geminiConfig };

