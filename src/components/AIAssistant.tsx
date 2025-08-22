import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, ChevronRight, Send, BookOpen, Calculator, Sparkles, Brain } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useDrawing } from '../context/DrawingContext';
import ChatMathText from './ChatMathText';

const AIAssistant: React.FC = () => {
  const { messages, sendMessage, isLoading } = useAI();
  const { currentSubject, strokes, getCurrentCanvasImage } = useDrawing();
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      });
    }
  };

  useEffect(() => {
    // Only scroll to bottom when there are messages and the component is expanded
    if (messages.length > 0 && isExpanded) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length, isExpanded]); // Only depend on message count, not the entire messages array

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Convert drawing strokes to the format expected by the API
    const apiStrokes = strokes.map(stroke => ({
      id: stroke.id,
      tool: stroke.tool,
      path: stroke.path,
      color: stroke.color,
      text: (stroke as any).text || undefined
    }));
    
    // Capture current canvas image for AI vision analysis
    const canvasImage = getCurrentCanvasImage();
    
    await sendMessage(inputMessage, currentSubject, apiStrokes, canvasImage || undefined);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestionsBySubject = {
    math: [
      "Help me solve this equation step by step",
      "Explain this mathematical concept",
      "Check my work for errors"
    ],
    science: [
      "Explain this scientific concept",
      "Help me understand this diagram",
      "What's the next step in this experiment?"
    ],
    language: [
      "Help me improve this paragraph",
      "Check my grammar and spelling",
      "Suggest better word choices"
    ],
    general: [
      "Give me a hint to solve this problem",
      "Explain this concept simply",
      "Help me organize my thoughts"
    ]
  };

  const suggestions = suggestionsBySubject[currentSubject as keyof typeof suggestionsBySubject] || suggestionsBySubject.general;

  if (!isExpanded) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-l-2xl shadow-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 group"
          title="Open AI Tutor"
        >
          <div className="flex flex-col items-center space-y-2">
            <MessageCircle className="w-6 h-6" />
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">AI</span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Tutor</h3>
            <p className="text-xs text-gray-600">Powered by BrightPath</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
          title="Minimize"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Subject Context */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            {currentSubject === 'math' && <Calculator className="w-4 h-4 text-blue-600" />}
            {currentSubject === 'science' && <BookOpen className="w-4 h-4 text-green-600" />}
            {currentSubject !== 'math' && currentSubject !== 'science' && <BookOpen className="w-4 h-4 text-purple-600" />}
            <span className="font-semibold text-gray-700 capitalize">{currentSubject} Mode</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-gray-600">Smart Help Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
        {messages.length === 0 ? (
          <div className="text-center space-y-4">
            <div className="text-gray-500 text-sm">
              👋 Hi! I'm your AI tutor. I can help you with your homework by providing hints, explanations, and guidance.
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Quick Start:</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(suggestion)}
                  className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.sender === 'ai' ? (
                  <ChatMathText text={message.text} />
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Messages end reference - positioned at the very bottom */}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>

      {/* Input */}
  <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me for help..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none bg-white transition-all duration-200 min-h-[44px] max-h-[120px]"
              disabled={isLoading}
              rows={1}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                Enter to send • Shift+Enter for new line
              </span>
              <span className="text-xs text-gray-400">
                {inputMessage.length}/500
              </span>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="self-end p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex-shrink-0"
            title="Send message (Enter)"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 mt-3 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;