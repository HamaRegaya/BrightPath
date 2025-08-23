import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import type { User, Session } from '@supabase/supabase-js';

export class AuthController {
  /**
   * Sign up a new user
   */
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, userData } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json({
        success: true,
        user: data.user,
        session: data.session,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Sign up error:', error);
      res.status(500).json({ 
        error: 'Internal server error during sign up',
        success: false
      });
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        res.status(401).json({ error: error.message });
        return;
      }

      res.json({
        success: true,
        user: data.user,
        session: data.session,
        message: 'Signed in successfully'
      });
    } catch (error) {
      console.error('Sign in error:', error);
      res.status(500).json({ 
        error: 'Internal server error during sign in',
        success: false
      });
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(req: Request, res: Response): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json({
        success: true,
        message: 'Signed out successfully'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      res.status(500).json({ 
        error: 'Internal server error during sign out',
        success: false
      });
    }
  }

  /**
   * Get current user info
   */
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const { data, error } = await supabase.auth.getUser(token);

      if (error) {
        res.status(401).json({ error: error.message });
        return;
      }

      res.json({
        success: true,
        user: data.user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        error: 'Internal server error while getting user',
        success: false
      });
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (error) {
        res.status(401).json({ error: error.message });
        return;
      }

      res.json({
        success: true,
        session: data.session,
        user: data.user
      });
    } catch (error) {
      console.error('Refresh session error:', error);
      res.status(500).json({ 
        error: 'Internal server error during session refresh',
        success: false
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        error: 'Internal server error during password reset',
        success: false
      });
    }
  }
}

export const authController = new AuthController();
