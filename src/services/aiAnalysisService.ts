import OpenAI from "openai";
import { Stroke } from '../context/DrawingContext';

// Simple rate limiting for API calls
class RateLimiter {
  private calls: number[] = [];
  private maxCalls = 10; // Max 10 calls per minute
  private timeWindow = 60000; // 1 minute in milliseconds

  canMakeCall(): boolean {
    const now = Date.now();
    // Remove calls older than the time window
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    
    if (this.calls.length >= this.maxCalls) {
      return false;
    }
    
    this.calls.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Initialize OpenAI client
const client = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: import.meta.env.VITE_AI_API_KEY, // Do not prefix with "Bearer"
  dangerouslyAllowBrowser: true, // Allow browser usage for educational app
});

export interface BoardAnalysis {
  content: string;
  suggestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  nextSteps: string[];
}

export type ChatRole = 'system' | 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/**
 * Unified GPT-5 chat helper for the AI tutor
 */
export const chatWithTutor = async (
  history: ChatMessage[],
  subject: string
): Promise<string> => {
  try {
    if (!rateLimiter.canMakeCall()) {
      throw new Error('Rate limit exceeded. Please wait before requesting more AI assistance.');
    }
    if (!import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_AI_API_KEY === 'your-api-key-here') {
      throw new Error('AI API key not configured');
    }

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are BrightPath, a concise, encouraging AI tutor for ${subject}. Keep messages under 40 words, be specific, positive, and actionable.`
    };

    const messages: ChatMessage[] = [systemPrompt, ...history];

    const response = await client.chat.completions.create({
      model: 'openai/gpt-5-chat-latest',
      messages: messages as any,
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 0.3,
      max_tokens: 180,
    });

    return response.choices[0]?.message?.content?.trim() || "I'm here to help. What part is most confusing?";
  } catch (err) {
    console.error('Tutor chat error:', err);
    // Fallback to a compact context-aware message
    return subject === 'math'
      ? 'Try breaking it into smaller steps and check each result.'
      : 'Good question! Summarize what you know, then we’ll tackle the gap.';
  }
};

/**
 * Converts canvas strokes to a text description for AI analysis
 */
export const convertStrokesToText = (strokes: Stroke[], subject: string): string => {
  const strokeDescriptions: string[] = [];
  
  strokes.forEach((stroke, index) => {
    switch (stroke.tool) {
      case 'pen':
        strokeDescriptions.push(`Handwritten stroke ${index + 1} (${stroke.path.length} points)`);
        break;
      case 'text':
        const text = (stroke as any).text || '';
        strokeDescriptions.push(`Text: "${text}"`);
        break;
      case 'ai-text':
        const aiText = (stroke as any).text || '';
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

  return `Subject: ${subject}
Board content:
${strokeDescriptions.join('\n')}

Total strokes: ${strokes.length}`;
};

/**
 * Analyzes the board content and provides dynamic AI assistance
 */
export const analyzeBoard = async (
  strokes: Stroke[], 
  subject: string, 
  sessionTitle: string
): Promise<string> => {
  try {
    // Check rate limiting
    if (!rateLimiter.canMakeCall()) {
      throw new Error('Rate limit exceeded. Please wait before requesting more AI assistance.');
    }

    // Check if API key is available
    if (!import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_AI_API_KEY === 'your-api-key-here') {
      throw new Error('AI API key not configured');
    }

    const boardDescription = convertStrokesToText(strokes, subject);
    
    const prompt = `You are an intelligent tutoring assistant analyzing a student's work on a digital whiteboard.

Context:
- Subject: ${subject}
- Session: ${sessionTitle}
- Student is working on: ${boardDescription}

Based on the student's current work, provide a short, encouraging note (1-2 sentences) that:
1. Acknowledges what they're working on
2. Provides a helpful hint or next step
3. Encourages them to continue

The note should be:
- Very concise (maximum 15 words)
- Encouraging and positive
- Specific to their current work
- Actionable
- Easy to read on screen

Examples:
- "Great start! Try smaller steps."
- "Good work! Check calculations."
- "Nice! What pattern do you see?"

Provide only the note, no additional explanation.`;

    const response = await client.chat.completions.create({
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
      max_tokens: 512,
    });

    return response.choices[0]?.message?.content?.trim() || "Keep going! You're doing great!";
    
  } catch (error) {
    console.error('AI Analysis error:', error);
    
    // Fallback to contextual static responses based on board content
    return generateFallbackResponse(strokes, subject);
  }
};

/**
 * Fallback response generator when AI service is unavailable
 */
const generateFallbackResponse = (strokes: Stroke[], subject: string): string => {
  const strokeCount = strokes.length;
  const hasText = strokes.some(s => s.tool === 'text' || s.tool === 'ai-text');
  const hasShapes = strokes.some(s => s.tool === 'rectangle' || s.tool === 'circle');
  const hasHandwriting = strokes.some(s => s.tool === 'pen');

  // Dynamic responses based on board analysis
  if (strokeCount === 0) {
    return "Ready to start? Begin!";
  }

  if (strokeCount < 3) {
    return "Good start! Keep going.";
  }

  if (hasText && hasShapes) {
    return "Great organization!";
  }

  if (hasHandwriting && !hasText) {
    return "Nice work! Add labels?";
  }

  if (subject === 'math') {
    if (hasShapes) {
      return "Good diagrams! Check math.";
    }
    return "Step by step works!";
  }

  if (subject === 'science') {
    return "Good observations!";
  }

  if (subject === 'language') {
    return "Clear thinking! Expand more.";
  }

  return "Making progress! Continue.";
};

/**
 * Analyzes board with image if available (for future enhancement)
 */
export const analyzeBoardWithImage = async (
  imageDataUrl: string,
  subject: string
): Promise<string> => {
  try {
    // Check rate limiting
    if (!rateLimiter.canMakeCall()) {
      throw new Error('Rate limit exceeded. Please wait before requesting more AI assistance.');
    }

    // Check if API key is available
    if (!import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_AI_API_KEY === 'your-api-key-here') {
      throw new Error('AI API key not configured');
    }

    const response = await client.chat.completions.create({
      model: 'openai/gpt-5-chat-latest',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this student's whiteboard work in ${subject}. Provide a short, encouraging note (max 20 words) with a helpful hint or next step.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 1,
      max_tokens: 512,
    });

    return response.choices[0]?.message?.content?.trim() || "Keep going! You're doing great!";
    
  } catch (error) {
    console.error('AI Image Analysis error:', error);
    return "Great visual work! Keep developing your ideas.";
  }
};
