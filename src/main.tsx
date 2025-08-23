import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Debug logging
console.log('Main.tsx loaded');
console.log('Environment variables:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
