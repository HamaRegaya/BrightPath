import { apiClient, type ChatMessage, type Stroke } from './apiClient';

export { type ChatMessage, type Stroke };

export interface BoardAnalysis {
  content: string;
  suggestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  nextSteps: string[];
}

/**
 * Fallback response generator when backend is unavailable
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
 * Chat with AI tutor via backend
 */
export const chatWithTutor = async (
  history: ChatMessage[],
  subject: string
): Promise<string> => {
  try {
    const response = await apiClient.chatWithTutor(history, subject);
    return response;
  } catch (err) {
    console.error('Tutor chat error:', err);
    // Fallback to context-aware message
    return subject === 'math'
      ? 'Try breaking it into smaller steps and check each result.'
      : 'Good question! Summarize what you know, then we\'ll tackle the gap.';
  }
};

/**
 * Analyze board content via backend
 */
export const analyzeBoard = async (
  strokes: Stroke[], 
  subject: string, 
  sessionTitle: string
): Promise<string> => {
  try {
    const analysis = await apiClient.analyzeBoard(strokes, subject, sessionTitle);
    return analysis;
  } catch (err) {
    console.error('Board analysis error:', err);
    return generateFallbackResponse(strokes, subject);
  }
};

/**
 * Explain concept via backend
 */
export const explainConcept = async (
  concept: string,
  subject: string,
  level: string = 'beginner'
): Promise<string> => {
  try {
    const explanation = await apiClient.explainConcept(concept, subject, level);
    return explanation;
  } catch (err) {
    console.error('Concept explanation error:', err);
    return `${concept} is a key topic in ${subject}. Let's break it down into smaller, manageable parts to understand it better.`;
  }
};

/**
 * Check if backend AI service is available
 */
export const checkAIService = async (): Promise<{
  available: boolean;
  configured: boolean;
  rateLimit?: { remaining: number; resetTime: number };
}> => {
  try {
    const status = await apiClient.getAIStatus();
    return {
      available: true,
      configured: status.configured,
      rateLimit: status.rateLimit
    };
  } catch (err) {
    console.error('AI service check error:', err);
    return {
      available: false,
      configured: false
    };
  }
};

/**
 * Convert canvas strokes to text description (kept for compatibility)
 */
export const convertStrokesToText = (strokes: Stroke[], subject: string): string => {
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
};

// Note: All functions now use the backend instead of direct API calls
