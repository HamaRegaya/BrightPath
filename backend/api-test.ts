import OpenAI from "openai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing AI/ML API configuration...');
console.log(`API Key: ${process.env.AI_API_KEY?.substring(0, 8)}...`);
console.log(`Base URL: ${process.env.AI_API_BASE_URL}`);

// Initialize exactly like the working frontend
const client = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: process.env.AI_API_KEY, // Do not prefix with "Bearer"
});

async function testAPI() {
  try {
    const response = await client.chat.completions.create({
      model: 'openai/gpt-5-chat-latest',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Say hello!'
        }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    console.log('✅ API Test Successful!');
    console.log('Response:', response.choices[0]?.message?.content);
  } catch (error: any) {
    console.error('❌ API Test Failed:', error.message);
    console.error('Status:', error.status);
    console.error('Headers:', error.headers);
  }
}

testAPI();
