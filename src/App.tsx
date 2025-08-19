import { useEffect } from 'react';
import Whiteboard from './components/Whiteboard';
import Toolbar from './components/Toolbar';
import AIAssistant from './components/AIAssistant';
import Header from './components/Header';
import { DrawingProvider } from './context/DrawingContext';
import { AIProvider } from './context/AIContext';

function App() {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts that might interfere
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            // Undo functionality will be handled in DrawingContext
            break;
          case 'y':
            // Redo functionality will be handled in DrawingContext
            break;
          case 's':
            e.preventDefault(); // Prevent browser save dialog
            // Save functionality can be added here
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DrawingProvider>
      <AIProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
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