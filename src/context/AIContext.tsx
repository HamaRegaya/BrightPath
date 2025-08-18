import React, { createContext, useContext, useState, ReactNode } from 'react';

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
      // Simulate AI response (replace with actual AI API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = generateAIResponse(text, subject);
      const aiMessage: Message = {
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        sender: 'ai',
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

// Placeholder AI response generator (replace with actual AI integration)
const generateAIResponse = (userMessage: string, subject: string): string => {
  const responses = {
    math: [
      "Let me help you with that math problem! First, let's identify what type of problem this is. Can you tell me what specific concept you're working on?",
      "Great question! In mathematics, it's important to break problems down step by step. What's the first step you think we should take?",
      "I see you're working on a math problem. Remember, the key is to understand the underlying concept rather than just memorize steps. What part seems challenging?"
    ],
    science: [
      "That's an interesting science question! Let's think about this systematically. What do you already know about this topic?",
      "Science is all about observation and understanding patterns. Can you describe what you've observed so far?",
      "Good question! In science, we often start by forming a hypothesis. What do you think might be happening here?"
    ],
    language: [
      "That's a thoughtful language arts question! Let's work on this together. What's the main idea you're trying to express?",
      "Great! When working with language, it's important to consider your audience and purpose. Who are you writing for?",
      "I'd be happy to help with that! Let's start by organizing your thoughts. What are the key points you want to make?"
    ],
    general: [
      "That's a great question! Let me help you think through this step by step. What information do you have to work with?",
      "I'm here to help! Learning is all about asking good questions like this one. What's your initial approach to solving this?",
      "Excellent! The best way to tackle any problem is to break it down. What would you say is the main challenge here?"
    ]
  };

  const subjectResponses = responses[subject as keyof typeof responses] || responses.general;
  return subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
};