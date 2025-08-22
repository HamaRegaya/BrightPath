import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({
  baseURL: process.env.AI_API_BASE_URL || 'https://api.aimlapi.com/v1',
  apiKey: process.env.AI_API_KEY,
});

// Simple rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Remove old requests
  const recentRequests = userRequests.filter((time: number) => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173/',
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BrightPath Backend is running!',
    timestamp: new Date().toISOString(),
    service: 'BrightPath Backend',
    version: '1.0.0'
  });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { history, subject } = req.body;
    const clientIP = req.ip || 'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait before requesting more AI assistance.',
        success: false 
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an array of chat messages' });
    }

    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ error: 'Subject is required and must be a string' });
    }

    const systemPrompt = {
      role: 'system',
      content: `You are BrightPath, a concise, encouraging AI tutor for ${subject}. Keep messages under 40 words, be specific, positive, and actionable.`
    };

    const messages = [systemPrompt, ...history];

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-5-chat-latest',
      messages: messages as any,
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 0.3,
      max_tokens: 180,
    });

    const responseText = response.choices[0]?.message?.content?.trim() || "I'm here to help. What part is most confusing?";

    res.json({ 
      success: true, 
      response: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to chat with tutor',
      success: false
    });
  }
});

// AI Board Analysis endpoint
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { strokes, subject, sessionTitle } = req.body;
    const clientIP = req.ip || 'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait before requesting more AI assistance.',
        success: false 
      });
    }

    if (!Array.isArray(strokes)) {
      return res.status(400).json({ error: 'Strokes must be an array' });
    }

    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ error: 'Subject is required and must be a string' });
    }

    // Convert strokes to text description
    const strokeDescriptions: string[] = [];
    strokes.forEach((stroke: any, index: number) => {
      switch (stroke.tool) {
        case 'pen':
          strokeDescriptions.push(`Handwritten stroke ${index + 1} (${stroke.path?.length || 0} points)`);
          break;
        case 'text':
          const text = stroke.text || '';
          strokeDescriptions.push(`Text: "${text}"`);
          break;
        case 'ai-text':
          const aiText = stroke.text || '';
          strokeDescriptions.push(`AI suggestion: "${aiText}"`);
          break;
        case 'rectangle':
          strokeDescriptions.push(`Rectangle shape`);
          break;
        case 'circle':
          strokeDescriptions.push(`Circle shape`);
          break;
        case 'eraser':
          strokeDescriptions.push(`Erased area`);
          break;
      }
    });

    const boardDescription = `Subject: ${subject}
Board content:
${strokeDescriptions.join('\n')}
Total strokes: ${strokes.length}`;

    const prompt = `You are an intelligent tutoring assistant analyzing a student's work on a digital whiteboard.

Context:
- Subject: ${subject}
- Session: ${sessionTitle || 'Untitled Session'}
- Student is working on: ${boardDescription}

Provide a short, encouraging note (1-2 sentences, maximum 15 words) that:
1. Acknowledges what they're working on
2. Provides a helpful hint or next step
3. Encourages them to continue

Examples: "Great start! Try smaller steps." or "Good work! Check calculations."

Provide only the note, no additional explanation.`;

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-5-chat-latest',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful tutoring assistant that provides concise, encouraging feedback to students.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 1,
      max_tokens: 100,
    });

    const analysis = response.choices[0]?.message?.content?.trim() || "Keep going! You're doing great!";
    
    res.json({ 
      success: true, 
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Board analysis error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze board',
      success: false
    });
  }
});

// AI Status endpoint
app.get('/api/ai/status', (req, res) => {
  const isConfigured = !!(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your-api-key-here');
  
  res.json({
    success: true,
    status: {
      configured: isConfigured,
      rateLimit: {
        remaining: 10, // Simplified for now
        resetTime: 0
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Simple AI test route
app.post('/api/ai/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI endpoint is working!',
    receivedData: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI API: http://localhost:${PORT}/api/ai`);
  console.log(`🔑 AI API configured: ${!!(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your-api-key-here')}`);
});

export default app;
