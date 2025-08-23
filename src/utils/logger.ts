/**
 * Secure logging utility for production
 * Only logs in development mode
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console[level](message, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    this.log('info', `ℹ️ ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', `⚠️ ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', `❌ ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log('log', `🐛 ${message}`, ...args);
  }

  // For API calls or sensitive operations
  api(message: string, url?: string) {
    if (this.isDevelopment) {
      console.log(`🔗 API: ${message}${url ? ` - ${url}` : ''}`);
    }
  }

  // For authentication operations
  auth(message: string) {
    if (this.isDevelopment) {
      console.log(`🔐 Auth: ${message}`);
    }
  }

  // For AI operations
  ai(message: string) {
    if (this.isDevelopment) {
      console.log(`🤖 AI: ${message}`);
    }
  }
}

export const logger = new Logger();
export default logger;
