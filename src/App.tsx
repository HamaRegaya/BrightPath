import React from 'react';
import Whiteboard from './components/Whiteboard';
import Toolbar from './components/Toolbar';
import AIAssistant from './components/AIAssistant';
import Header from './components/Header';
import { DrawingProvider } from './context/DrawingContext';
import { AIProvider } from './context/AIContext';

function App() {
  return (
    <DrawingProvider>
      <AIProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <div className="flex-1 flex relative">
            {/* Left Sidebar - Drawing Tools */}
            <Toolbar />
            
            {/* Main Whiteboard Area */}
            <div className="flex-1 flex flex-col">
              <Whiteboard />
            </div>
            
            {/* Right Sidebar - AI Assistant */}
            <AIAssistant />
          </div>
        </div>
      </AIProvider>
    </DrawingProvider>
  );
}

export default App;