// Frontend API client for BrightPath Backend
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Stroke {
  id: string;
  tool: string;
  path: Array<{ x: number; y: number }>;
  color: string;
  text?: string;
}

export interface APIResponse<T> {
  success: boolean;
  timestamp: string;
  error?: string;
  data?: T;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
    return response.json();
  }

  async getAIStatus(): Promise<{
    configured: boolean;
    rateLimit: { remaining: number; resetTime: number };
  }> {
    const result = await this.makeRequest<any>('/ai/status');
    return result.status;
  }

  async chatWithTutor(
    history: ChatMessage[], 
    subject: string, 
    strokes?: Stroke[], 
    imageDataUrl?: string
  ): Promise<string> {
    const requestBody: any = { history, subject };
    
    // Include whiteboard data if provided
    if (strokes && strokes.length > 0) {
      requestBody.strokes = strokes;
    }
    
    if (imageDataUrl) {
      requestBody.imageDataUrl = imageDataUrl;
    }
    
    const result = await this.makeRequest<{ response: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    return result.response;
  }

  async analyzeBoard(strokes: Stroke[], subject: string, sessionTitle?: string, imageDataUrl?: string): Promise<string> {
    const requestBody: any = { strokes, subject, sessionTitle };
    
    // Include image data if provided
    if (imageDataUrl) {
      requestBody.imageDataUrl = imageDataUrl;
    }
    
    const result = await this.makeRequest<{ analysis: string }>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    return result.analysis;
  }

  async explainConcept(concept: string, subject: string, level: string = 'beginner'): Promise<string> {
    const result = await this.makeRequest<{ explanation: string }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ concept, subject, level }),
    });
    return result.explanation;
  }
}

export const apiClient = new APIClient();
