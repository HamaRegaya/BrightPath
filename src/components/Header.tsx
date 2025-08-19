import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Upload, Settings, HelpCircle, Calculator, Microscope, FileText, PenTool, Clock, Wifi } from 'lucide-react';
import { useDrawing } from '../context/DrawingContext';

const Header: React.FC = () => {
  const { currentSubject, setCurrentSubject, sessionTitle, setSessionTitle, strokes } = useDrawing();
  const [sessionTime, setSessionTime] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const subjects = [
    { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-blue-600' },
    { id: 'science', name: 'Science', icon: Microscope, color: 'text-green-600' },
    { id: 'language', name: 'Language Arts', icon: FileText, color: 'text-purple-600' },
    { id: 'general', name: 'General', icon: PenTool, color: 'text-gray-600' }
  ];

  const currentSubjectData = subjects.find(s => s.id === currentSubject) || subjects[0];

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                BrightPath
              </h1>
              <span className="text-xs text-gray-500 font-medium">AI Learning Assistant</span>
            </div>
          </div>
          
          {/* Vertical Separator */}
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          
          {/* Session Title Input */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Session:</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session name..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white min-w-[200px]"
            />
          </div>

          {/* Session Stats */}
          <div className="flex items-center space-x-4 text-sm">
            {/* Session Timer */}
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(sessionTime)}</span>
            </div>
            
            {/* Stroke Count */}
            <div className="flex items-center space-x-1 text-gray-600">
              <span className="text-xs">Strokes:</span>
              <span className="font-medium">{strokes.length}</span>
            </div>

            {/* Online Status */}
            <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
              <Wifi className="w-4 h-4" />
              <span className="text-xs font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Subject Selector */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-600">Subject:</label>
            <div className="relative">
              {/* Current Subject Display */}
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-2.5 min-w-[160px] cursor-pointer hover:bg-white hover:border-gray-400 transition-all duration-200 group">
                <currentSubjectData.icon className={`w-4 h-4 ${currentSubjectData.color}`} />
                <span className="text-sm font-medium text-gray-700 flex-1">{currentSubjectData.name}</span>
                <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* Hidden Select for Functionality */}
              <select
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {subjects.map((subject) => {
                  return (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button 
              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group relative"
              title="Save Session"
            >
              <Save className="w-5 h-5" />
            </button>
            <button 
              className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 group relative"
              title="Import Content"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button 
              className="p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group relative"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              className="p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group relative"
              title="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;