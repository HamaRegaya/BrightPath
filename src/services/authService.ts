// Authentication service for frontend API calls
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth` : 'http://localhost:5000/api/auth';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
  aud: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  session?: any;
  error?: string;
  message?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success && result.session?.access_token) {
        this.saveToken(result.session.access_token);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign up. Please try again.',
      };
    }
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success && result.session?.access_token) {
        this.saveToken(result.session.access_token);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign in. Please try again.',
      };
    }
  }

  async signOut(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/signout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const result = await response.json();
      
      if (result.success) {
        this.clearToken();
      }
      
      return result;
    } catch (error) {
      this.clearToken(); // Clear token anyway
      return {
        success: true,
        message: 'Signed out locally',
      };
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    if (!this.token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await response.json();
      
      if (!result.success) {
        this.clearToken();
      }
      
      return result;
    } catch (error) {
      this.clearToken();
      return {
        success: false,
        error: 'Failed to get user information',
      };
    }
  }

  async refreshSession(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const result = await response.json();
      
      if (result.success && result.session?.access_token) {
        this.saveToken(result.session.access_token);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to refresh session',
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send reset password email',
      };
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();
export default authService;
