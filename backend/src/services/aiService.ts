import dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config();

import OpenAI from "openai";
import { RateLimiter } from '../utils/rateLimiter';

export interface Stroke {
  id: string;
  tool: string;
  path: Array<{ x: number; y: number }>;
  color: string;
  text?: string;
}

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

class AIService {
  private client: OpenAI;
  private rateLimiter: RateLimiter;

  constructor() {
    const apiKey = process.env.AI_API_KEY;
    const baseURL = process.env.AI_API_BASE_URL || 'https://api.aimlapi.com/v1';
    
    // console.log(`🔧 Initializing AI Service:`);
    // console.log(`   Base URL: ${baseURL}`);
    // console.log(`   API Key exists: ${!!apiKey}`);
    // console.log(`   API Key length: ${apiKey?.length || 0}`);
    // console.log(`   API Key first 8 chars: ${apiKey?.substring(0, 8)}...`);
    
    // Initialize OpenAI client exactly like the working frontend version
    this.client = new OpenAI({
      baseURL,
      apiKey, // Do not prefix with "Bearer" - API service handles this
    });
    
    // Rate limit: 10 calls per minute
    this.rateLimiter = new RateLimiter(10, 60000);
  }

  /**
   * Check if AI service is properly configured
   */
  isConfigured(): boolean {
    const apiKey = process.env.AI_API_KEY;
    console.log(`🔑 API Key configured: ${apiKey ? 'Yes' : 'No'}`);
    console.log(`🔑 API Key length: ${apiKey?.length || 0}`);
    console.log(`🔗 Base URL: ${process.env.AI_API_BASE_URL}`);
    return !!(apiKey && apiKey !== 'your-api-key-here');
  }

  /**
   * Check rate limiting
   */
  canMakeCall(): { allowed: boolean; remaining: number; resetTime: number } {
    const allowed = this.rateLimiter.canMakeCall();
    return {
      allowed,
      remaining: this.rateLimiter.getRemainingCalls(),
      resetTime: this.rateLimiter.getTimeUntilReset()
    };
  }

  /**
   * Chat with AI tutor
   */
  async chatWithTutor(
    history: ChatMessage[], 
    subject: string, 
    strokes?: Stroke[], 
    imageDataUrl?: string
  ): Promise<string> {
    const rateCheck = this.canMakeCall();
    if (!rateCheck.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateCheck.resetTime / 1000)} seconds.`);
    }

    if (!this.isConfigured()) {
      throw new Error('AI API key not configured');
    }

    // Build context with whiteboard content if available
    let contextInfo = `You are BrightPath, an AI tutor helping students with ${subject}. Provide clear, helpful guidance that matches the level of their problem. Give practical help and encouragement.`;
    
    if (strokes && strokes.length > 0) {
      const boardDescription = this.convertStrokesToText(strokes, subject);
      contextInfo += `\n\nCurrent whiteboard content:\n${boardDescription}`;
    }

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: contextInfo
    };

    const messages: ChatMessage[] = [systemPrompt, ...history];

    try {
      // If we have image data, use vision model
      if (imageDataUrl) {
        const response = await this.client.chat.completions.create({
          model: 'openai/gpt-5-chat-latest',
          messages: [
            {
              role: 'system',
              content: contextInfo
            },
            ...history.slice(0, -1), // All history except the last message
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: history[history.length - 1]?.content || 'Can you help me with this?'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageDataUrl
                  }
                }
              ]
            }
          ] as any,
          temperature: 0.7,
          top_p: 0.7,
          frequency_penalty: 0.3,
          max_tokens: 180,
        });

        return response.choices[0]?.message?.content?.trim() || "I can see your work. What specific part would you like help with?";
      } else {
        // Text-only chat
        const response = await this.client.chat.completions.create({
          model: 'openai/gpt-5-chat-latest',
          messages: messages as any,
          temperature: 0.7,
          top_p: 0.7,
          frequency_penalty: 0.3,
          max_tokens: 180,
        });

        return response.choices[0]?.message?.content?.trim() || "I'm here to help. What part is most confusing?";
      }
    } catch (err: any) {
      console.error('Tutor chat error:', err);
      
      // Provide specific error messages based on error type
      if (err.status === 401) {
        throw new Error('AI service authentication failed. Please check configuration.');
      } else if (err.status === 429) {
        throw new Error('AI service rate limit exceeded. Please wait before trying again.');
      } else if (err.status === 403) {
        throw new Error('AI service access denied. Please check API permissions.');
      }
      
      // Fallback to helpful context-aware guidance
      return subject === 'math'
        ? 'Try isolating the variable step by step. What operation should you do first?'
        : 'Break it into smaller parts. What\'s the main concept here?';
    }
  }

  /**
   * Convert canvas strokes to text description
   */
  private convertStrokesToText(strokes: Stroke[], subject: string): string {
    const strokeDescriptions: string[] = [];
    
    strokes.forEach((stroke, index) => {
      switch (stroke.tool) {
        case 'pen':
          strokeDescriptions.push(`Handwritten stroke ${index + 1} (${stroke.path.length} points)`);
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

    return `Subject: ${subject}
Board content:
${strokeDescriptions.join('\n')}

Total strokes: ${strokes.length}`;
  }

  /**
   * Analyze board content
   */
  async analyzeBoard(strokes: Stroke[], subject: string, sessionTitle: string): Promise<string> {
    const rateCheck = this.canMakeCall();
    if (!rateCheck.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateCheck.resetTime / 1000)} seconds.`);
    }

    if (!this.isConfigured()) {
      throw new Error('AI API key not configured');
    }

    const boardDescription = this.convertStrokesToText(strokes, subject);
    
    const prompt = `You are an AI tutor helping a student with their work.

Context:
- Subject: ${subject}
- Session: ${sessionTitle}
- Student's work: ${boardDescription}

Provide a helpful hint or guidance in MAXIMUM 20 words that:
1. If they just started: give a hint for the next step
2. If they're in the middle: guide them to the next operation  
3. If they reached the final answer: congratulate them (e.g., "Great! You found x = -1/2. Can you double-check by substituting back?")
4. Avoid repeating the same phrase about what type of problem it is
5. Don't solve for them, just guide

Be encouraging and vary your responses. No redundant phrases.

Respond with exactly the helpful guidance, nothing more.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'openai/gpt-5-chat-latest',
        messages: [
          {
            role: 'system',
            content: 'You are an AI tutor that gives varied, concise hints. Congratulate students when they reach answers. Avoid redundant phrases. Maximum 20 words per response.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 1,
        max_tokens: 50, // Limit tokens for concise responses
      });

      return response.choices[0]?.message?.content?.trim() || 
             "What part needs help?";
    } catch (err: any) {
      console.error('Board analysis error:', err);
      
      // Provide specific error messages based on error type
      if (err.status === 401) {
        console.error('❌ Authentication failed. Check API key configuration.');
        return "AI analysis temporarily unavailable. Check configuration.";
      } else if (err.status === 429) {
        console.error('❌ Rate limit exceeded on AI service.');
        return "Too many requests. Please wait a moment before trying again.";
      } else if (err.status === 403) {
        console.error('❌ API access forbidden. Check API key permissions.');
        return "AI service access denied. Please check API configuration.";
      }
      
      return "What part needs help?";
    }
  }

  /**
   * Generate AI explanation for concepts
   */
  async explainConcept(concept: string, subject: string, level: string = 'beginner'): Promise<string> {
    const rateCheck = this.canMakeCall();
    if (!rateCheck.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateCheck.resetTime / 1000)} seconds.`);
    }

    if (!this.isConfigured()) {
      throw new Error('AI API key not configured');
    }

    const prompt = `Explain "${concept}" in ${subject} for a ${level} level student. Keep it under 100 words, use simple language, and include a practical example.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'openai/gpt-5-chat-latest',
        messages: [{ role: 'user', content: prompt }] as any,
        temperature: 0.6,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content?.trim() || 
             `${concept} is an important concept in ${subject}. Would you like to explore a specific aspect of it?`;
    } catch (err) {
      console.error('Concept explanation error:', err);
      return `${concept} is a key topic in ${subject}. Let's break it down into smaller, manageable parts to understand it better.`;
    }
  }

  /**
   * Analyze board with image for visual understanding
   */
  async analyzeBoardWithImage(imageDataUrl: string, subject: string, sessionTitle: string): Promise<string> {
    const rateCheck = this.canMakeCall();
    if (!rateCheck.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(rateCheck.resetTime / 1000)} seconds.`);
    }

    if (!this.isConfigured()) {
      throw new Error('AI API key not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'openai/gpt-5-chat-latest',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an AI tutor helping a student with ${subject}. 

Session: ${sessionTitle}

Look at what the student has written/drawn. Give a helpful hint in MAXIMUM 20 words that:
- If they just started: give a hint for the next step
- If they're in the middle: guide them to the next operation
- If they reached the final answer: congratulate them and ask them to verify
- Avoid repeating the same phrase about what type of problem it is
- Don't solve for them, just guide

Be encouraging and concise. Vary your responses.`
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
        frequency_penalty: 0.5,
        max_tokens: 50, // Limit tokens to ensure concise responses
      });

      return response.choices[0]?.message?.content?.trim() || 
             "What specific part needs help?";
             
    } catch (err: any) {
      console.error('Board image analysis error:', err);
      
      // Provide specific error messages based on error type
      if (err.status === 401) {
        console.error('❌ Authentication failed. Check API key configuration.');
        return "AI image analysis temporarily unavailable. Check configuration.";
      } else if (err.status === 429) {
        console.error('❌ Rate limit exceeded on AI service.');
        return "Too many requests. Please wait a moment before trying again.";
      } else if (err.status === 403) {
        console.error('❌ API access forbidden. Check API key permissions.');
        return "AI service access denied. Please check API configuration.";
      }
      
      return "What specific part needs help?";
    }
  }
}

export const aiService = new AIService();
