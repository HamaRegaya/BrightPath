import React, { createContext, useContext, useState, ReactNode } from 'react';
import { chatWithTutor } from '../services/aiAnalysisService';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AIContextType {
  messages: Message[];
  sendMessage: (text: string, subject: string) => Promise<void>;
  isLoading: boolean;
  clearMessages: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string, subject: string) => {
    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Build short chat history for context
      const history = [
        ...messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: text }
      ] as any;

      const aiText = await chatWithTutor(history, subject);
      const aiMessage: Message = { sender: 'ai', text: aiText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
  setMessages(prev => [...prev, { sender: 'ai', text: "I'm offline now. Try again soon.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value: AIContextType = {
    messages,
    sendMessage,
    isLoading,
    clearMessages
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Removed placeholder generator to avoid redundancy; using GPT-5 via chatWithTutor.