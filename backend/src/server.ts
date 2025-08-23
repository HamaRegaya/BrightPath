import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import aiRoutes from './routes/aiRoutes';
import authRoutes from './routes/authRoutes';
import { corsMiddleware, validateRequest, errorHandler } from './middleware/middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5173/',
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// AI-specific rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 AI requests per minute
  message: {
    error: 'Too many AI requests, please wait before requesting more assistance.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request validation middleware
app.use(validateRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'BrightPath Backend',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    success: false,
    availableRoutes: [
      'GET /health',
      'GET /api/ai/status',
      'POST /api/ai/chat',
      'POST /api/ai/analyze',
      'POST /api/ai/explain',
      'POST /api/auth/signup',
      'POST /api/auth/signin',
      'POST /api/auth/signout',
      'GET /api/auth/user',
      'POST /api/auth/refresh',
      'POST /api/auth/reset-password',
      'GET /api/auth/status'
    ]
  });
});

// Global error handler
app.use(errorHandler);

// Start server
// Start server only in development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 BrightPath Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 AI API: http://localhost:${PORT}/api/ai`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🔑 AI API configured: ${process.env.AI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`📚 Supabase configured: ${process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY ? 'Yes' : 'No'}`);
  });
}

export default app;
