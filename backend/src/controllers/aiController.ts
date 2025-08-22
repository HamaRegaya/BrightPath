import { Request, Response } from 'express';
import { aiService, type ChatMessage, type Stroke } from '../services/aiService';

export class AIController {
  /**
   * Chat with AI tutor
   */
  async chatWithTutor(req: Request, res: Response): Promise<void> {
    try {
      const { history, subject } = req.body;

      if (!Array.isArray(history)) {
        res.status(400).json({ error: 'History must be an array of chat messages' });
        return;
      }

      if (!subject || typeof subject !== 'string') {
        res.status(400).json({ error: 'Subject is required and must be a string' });
        return;
      }

      const response = await aiService.chatWithTutor(history as ChatMessage[], subject);
      
      res.json({ 
        success: true, 
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chat with tutor error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to chat with tutor',
        success: false
      });
    }
  }

  /**
   * Analyze whiteboard content
   */
  async analyzeBoard(req: Request, res: Response): Promise<void> {
    try {
      const { strokes, subject, sessionTitle, imageDataUrl } = req.body;

      if (!Array.isArray(strokes)) {
        res.status(400).json({ error: 'Strokes must be an array' });
        return;
      }

      if (!subject || typeof subject !== 'string') {
        res.status(400).json({ error: 'Subject is required and must be a string' });
        return;
      }

      const sessionName = sessionTitle || 'Untitled Session';
      
      // Use image analysis if image data is provided, otherwise use text-based analysis
      let analysis: string;
      if (imageDataUrl && typeof imageDataUrl === 'string') {
        console.log('🖼️ Using AI image analysis for enhanced context');
        analysis = await aiService.analyzeBoardWithImage(imageDataUrl, subject, sessionName);
      } else {
        console.log('📝 Using text-based board analysis');
        analysis = await aiService.analyzeBoard(strokes as Stroke[], subject, sessionName);
      }
      
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
  }

  /**
   * Explain a concept
   */
  async explainConcept(req: Request, res: Response): Promise<void> {
    try {
      const { concept, subject, level } = req.body;

      if (!concept || typeof concept !== 'string') {
        res.status(400).json({ error: 'Concept is required and must be a string' });
        return;
      }

      if (!subject || typeof subject !== 'string') {
        res.status(400).json({ error: 'Subject is required and must be a string' });
        return;
      }

      const explanation = await aiService.explainConcept(concept, subject, level);
      
      res.json({ 
        success: true, 
        explanation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Concept explanation error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to explain concept',
        success: false
      });
    }
  }

  /**
   * Get AI service status and rate limit info
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const rateInfo = aiService.canMakeCall();
      const isConfigured = aiService.isConfigured();
      
      res.json({
        success: true,
        status: {
          configured: isConfigured,
          rateLimit: {
            remaining: rateInfo.remaining,
            resetTime: rateInfo.resetTime
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ 
        error: 'Failed to get AI service status',
        success: false
      });
    }
  }
}

export const aiController = new AIController();
