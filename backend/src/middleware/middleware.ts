import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173/'];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && (!req.body || Object.keys(req.body).length === 0)) {
    return res.status(400).json({ error: 'Request body is required' });
  }
  next();
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const status = (err as any).status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: message,
    success: false,
    timestamp: new Date().toISOString()
  });
};
