import React, { useState, useEffect } from 'react';
import { AuroraBackground } from './ui/aurora-background';
import AuthModal from './auth/AuthModal';
import { authService } from '../services/authService';

console.log('HomePage.tsx loaded');

const HomePage: React.FC = () => {
  console.log('HomePage component rendering');
  
  const [isVisible, setIsVisible] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Trigger entrance animation
  useEffect(() => {
    console.log('HomePage useEffect running');
    setIsVisible(true);
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        if (authService.isAuthenticated()) {
          const result = await authService.getCurrentUser();
          if (result.success) {
            setIsAuthenticated(true);
            setUser(result.user);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, []);

  const handleSignUp = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleAuthSuccess = async () => {
    const result = await authService.getCurrentUser();
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">BrightPath</h1>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50">
                  Features
                </a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50">
                  About
                </a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50">
                  Contact
                </a>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 text-sm">
                      Welcome, {user?.email?.split('@')[0] || 'User'}!
                    </span>
                    <button 
                      onClick={() => window.location.href = '/whiteboard'}
                      className="relative px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span className="relative z-10">Continue Learning</span>
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="px-3 py-2 text-gray-700 hover:text-red-600 text-sm font-medium transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleSignIn}
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 text-sm font-medium transition-all duration-300"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={handleSignUp}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Sign Up
                    </button>
                    <button 
                      onClick={() => window.location.href = '/whiteboard'}
                      className="relative px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-300"
                    >
                      Try Demo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Aurora Background */}
      <AuroraBackground className="relative overflow-hidden min-h-screen pt-16">
        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 min-h-screen items-center py-12 lg:py-0">
            {/* Left Content */}
            <div className={`lg:col-span-7 transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}>
              <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                {/* Floating badge */}
                <div className="inline-flex items-center space-x-2 bg-black/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">AI-Powered Learning Platform</span>
                </div>
                
                <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl lg:text-7xl leading-tight">
                  <span className="block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>The Future of</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    Smart Learning
                  </span>
                </h1>
                
                <p className={`mt-6 text-xl text-gray-700 leading-relaxed transform transition-all duration-1000 delay-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  Experience next-generation education with AI that adapts to your learning style. 
                  Unlock your potential with intelligent tutoring and personalized guidance.
                </p>
                
                {/* Stats */}
                <div className={`mt-8 grid grid-cols-3 gap-6 transform transition-all duration-1000 delay-900 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">50K+</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">24/7</div>
                    <div className="text-sm text-gray-600">AI Support</div>
                  </div>
                </div>
                
                <div className={`mt-10 flex flex-wrap gap-4 justify-center lg:justify-start transform transition-all duration-1000 delay-1000 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  {isAuthenticated ? (
                    <>
                      <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="group relative px-8 py-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white rounded-xl font-medium text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-gray-800/90 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Dashboard
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                      
                      <button 
                        onClick={() => window.location.href = '/whiteboard'}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Continue Learning
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleSignUp}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Get Started Free
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      </button>
                      
                      <button 
                        onClick={() => window.location.href = '/whiteboard'}
                        className="group relative px-8 py-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-white rounded-xl font-medium text-base shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-gray-800/90 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Try Demo
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Right Side - Futuristic 3D Card */}
            <div className={`lg:col-span-5 relative transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
              {/* Floating holographic interface mockup */}
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Main holographic panel */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                      <span className="text-gray-600 text-sm font-mono">BrightPath AI v2.0</span>
                    </div>
                  </div>
                  
                  {/* Smart Board Image Container */}
                  <div className="p-4 pt-2 h-full flex items-start justify-center">
                    <div className="relative w-full h-72 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                      <img
                        src="https://i.imgur.com/QH4Nxjw.jpeg"
                        alt="Smart Board Interface"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay gradient for better integration */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10"></div>
                      
                      {/* AI Analysis overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-blue-600 text-xs font-medium">AI Analysis Active</span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse w-4/5"></div>
                            </div>
                            <div className="text-gray-600 text-xs">Understanding: 92%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </AuroraBackground>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse opacity-20"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 backdrop-blur-sm border border-cyan-400/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 text-sm font-medium">Next-Gen Features</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6 animate-fade-in-up">
              Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Advanced AI</span>
            </h2>
            <p className="mt-4 max-w-3xl text-xl text-slate-300 mx-auto animate-fade-in-up animate-stagger-1">
              Experience the future of education with cutting-edge artificial intelligence, immersive learning environments, 
              and personalized guidance that adapts to your unique learning journey.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Neural AI Assistant */}
              <div className="group relative animate-fade-in-up animate-stagger-2">
                <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-4">Neural AI Assistant</h3>
                      <p className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed mb-6">
                        Advanced neural networks provide contextual understanding and intelligent suggestions tailored to your learning progress and cognitive patterns.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-cyan-400">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                          <span>Real-time pattern recognition</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-cyan-400">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                          <span>Adaptive learning algorithms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantum Whiteboard */}
              <div className="group relative animate-fade-in-up animate-stagger-3">
                <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 transition-all duration-300">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors mb-4">Quantum Whiteboard</h3>
                      <p className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed mb-6">
                        Infinite digital canvas with quantum-inspired drawing tools, gesture recognition, and collaborative features for seamless creative expression.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span>Infinite zoom & precision</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span>Multi-dimensional layers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Holographic Learning */}
              <div className="group relative animate-fade-in-up animate-stagger-4">
                <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors mb-4">Holographic Learning</h3>
                      <p className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed mb-6">
                        Immersive 3D visualizations and AR/VR integration bring abstract concepts to life across mathematics, science, and language arts.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-purple-400">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          <span>3D concept visualization</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-purple-400">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          <span>Cross-subject integration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biometric Adaptation */}
              <div className="group relative animate-fade-in-up animate-stagger-5">
                <div className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-pink-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg group-hover:shadow-pink-500/50 group-hover:scale-110 transition-all duration-300">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400/20 to-rose-500/20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white group-hover:text-pink-400 transition-colors mb-4">Biometric Adaptation</h3>
                      <p className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed mb-6">
                        Advanced biometric sensors monitor engagement and cognitive load to dynamically adjust content delivery and learning pace for optimal outcomes.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-pink-400">
                          <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                          <span>Engagement monitoring</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-pink-400">
                          <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                          <span>Adaptive difficulty scaling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Revolutionizing Education
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                BrightPath combines cutting-edge AI technology with intuitive design to create 
                the ultimate learning companion. Our platform helps students overcome learning 
                challenges and achieve their academic goals.
              </p>
              <div className="mt-10 space-y-8">
                <div className="flex group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white group-hover:shadow-lg transition-all duration-300">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors">Real-time Feedback</h3>
                    <p className="mt-2 text-base text-gray-500 group-hover:text-gray-700 transition-colors">
                      Get immediate assistance and feedback as you work through problems and exercises.
                    </p>
                  </div>
                </div>
                <div className="flex group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white group-hover:shadow-lg transition-all duration-300">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Progress Tracking</h3>
                    <p className="mt-2 text-base text-gray-500 group-hover:text-gray-700 transition-colors">
                      Monitor your learning journey with detailed analytics and progress reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 animate-slide-in-right">
              <div className="relative">
                <img
                  className="w-full rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500"
                  src="https://images.pexels.com/photos/3862627/pexels-photo-3862627.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Student using digital learning tools"
                />
                {/* Overlay with stats */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">98%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">50K+</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">24/7</div>
                      <div className="text-sm text-gray-600">AI Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Futuristic background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:py-28 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div className="text-center lg:text-left lg:flex-1">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 backdrop-blur-sm border border-cyan-400/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 text-sm font-medium">Ready to Transform?</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in-up">
              <span className="block">Experience the</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-fade-in-up animate-stagger-1">
                Future of Learning
              </span>
            </h2>
            <p className="mt-6 text-xl text-slate-300 max-w-2xl animate-fade-in-up animate-stagger-2">
              Join thousands of students already using AI-powered learning to achieve extraordinary results. 
              Start your journey into next-generation education today.
            </p>
          </div>
          
          <div className="mt-10 lg:mt-0 lg:ml-12 flex flex-col sm:flex-row gap-4 lg:flex-col xl:flex-row lg:flex-shrink-0">
            <div className="animate-scale-in animate-stagger-3">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="group relative overflow-hidden inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 hover:shadow-2xl w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Launch Dashboard</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </button>
            </div>
            <div className="animate-scale-in animate-stagger-4">
              <button 
                onClick={() => window.location.href = '/whiteboard'}
                className="group relative overflow-hidden inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Start Creating</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">BrightPath</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                AI-powered intelligent learning platform. 
                Revolutionize your education with adaptive and personalized tools.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    About
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/whiteboard" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Whiteboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal Information</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Legal Notice
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <p className="text-slate-400 text-sm">
                &copy; 2025 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold">BrightPath</span>. 
                All rights reserved.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="text-slate-500 text-xs">
                Built with ❤️ for the future of education
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultMode={authMode}
      />
    </div>
  );
};

export default HomePage;
