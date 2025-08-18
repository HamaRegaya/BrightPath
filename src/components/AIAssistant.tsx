import React, { useState } from 'react';
import { MessageCircle, ChevronRight, ChevronLeft, Send, Lightbulb, BookOpen, Calculator } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useDrawing } from '../context/DrawingContext';

const AIAssistant: React.FC = () => {
  const { messages, sendMessage, isLoading } = useAI();
  const { currentSubject } = useDrawing();
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    await sendMessage(inputMessage, currentSubject);
    setInputMessage('');
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
          className="bg-blue-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Tutor</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Subject Context */}
      <div className="p-3 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-blue-700">
          {currentSubject === 'math' && <Calculator className="w-4 h-4" />}
          {currentSubject !== 'math' && <BookOpen className="w-4 h-4" />}
          <span className="font-medium capitalize">{currentSubject} Mode</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                {message.text}
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
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask for help with your homework..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;