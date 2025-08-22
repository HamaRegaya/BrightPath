import { Router } from 'express';
import { aiController } from '../controllers/aiController';

const router = Router();

// Chat with AI tutor
router.post('/chat', aiController.chatWithTutor.bind(aiController));

// Analyze whiteboard content
router.post('/analyze', aiController.analyzeBoard.bind(aiController));

// Explain concepts
router.post('/explain', aiController.explainConcept.bind(aiController));

// Get AI service status
router.get('/status', aiController.getStatus.bind(aiController));

export default router;
