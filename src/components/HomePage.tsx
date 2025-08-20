import React, { useState, useEffect } from 'react';

const HomePage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Array of professional education images from Pexels
  const carouselImages = [
    {
      url: "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Students learning with technology"
    },
    {
      url: "src/assets/images/smart-board.png",
      alt: "Students collaborating on projects"
    },
    {
      url: "src/assets/images/board 2.png",
      alt: "Digital learning environment"
    },
    {
      url: "src/assets/images/student.png",
      alt: "Interactive learning session"
    },
    {
      url: "https://images.pexels.com/photos/4145032/pexels-photo-4145032.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      alt: "Students using tablets for learning"
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">BrightPath</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  About
                </a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Contact
                </a>
                <button 
                  onClick={() => window.location.href = '/whiteboard'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Carousel */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 min-h-screen items-center">
            {/* Left Content */}
            <div className={`px-4 sm:px-6 lg:px-8 py-12 lg:py-0 transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}>
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                  <span className="block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Learn with</span>
                  <span className="block text-blue-600 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>AI-Powered</span>
                  <span className="block animate-fade-in-up" style={{ animationDelay: '0.6s' }}>Guidance</span>
                </h1>
                <p className={`mt-6 text-lg text-gray-500 sm:text-xl max-w-xl mx-auto lg:mx-0 transform transition-all duration-1000 delay-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  Transform your learning experience with our intelligent whiteboard that provides real-time AI assistance, 
                  helping students excel in math, science, and language arts.
                </p>
                <div className={`mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transform transition-all duration-1000 delay-1000 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}>
                  <button 
                    onClick={() => window.location.href = '/whiteboard'}
                    className="group relative px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-700 overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <a 
                    href="#features"
                    className="group px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-600 hover:text-white transform hover:scale-105 transition-all duration-300"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            
            {/* Right Side - Animated Carousel */}
            <div className={`relative h-96 lg:h-full min-h-[500px] transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
              {/* Carousel Container */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentImageIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-110'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ))}
                
                {/* Carousel Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-white scale-125'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Floating Animation Elements */}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase animate-fade-in-up">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl animate-fade-in-up animate-stagger-1">
              Smart Learning Tools
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto animate-fade-in-up animate-stagger-2">
              Discover powerful features designed to enhance your learning experience and boost academic success.
            </p>
          </div>

          <div className="mt-16">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-16">
              <div className="relative group animate-fade-in-up animate-stagger-3">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">AI-Powered Assistance</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 group-hover:text-gray-700 transition-colors">
                  Get intelligent hints and suggestions tailored to your current work. Our AI analyzes your progress and provides contextual guidance.
                </dd>
              </div>

              <div className="relative group animate-fade-in-up animate-stagger-4">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 group-hover:text-green-600 transition-colors">Interactive Whiteboard</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 group-hover:text-gray-700 transition-colors">
                  Draw, write, and create with our advanced digital whiteboard. Support for multiple tools including pen, shapes, and text.
                </dd>
              </div>

              <div className="relative group animate-fade-in-up animate-stagger-5">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 group-hover:text-purple-600 transition-colors">Multiple Subjects</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 group-hover:text-gray-700 transition-colors">
                  Specialized support for mathematics, science, and language arts with subject-specific AI guidance and tools.
                </dd>
              </div>

              <div className="relative group animate-fade-in-up animate-stagger-5">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 group-hover:text-pink-600 transition-colors">Personalized Learning</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 group-hover:text-gray-700 transition-colors">
                  Adaptive learning experience that adjusts to your pace and learning style for optimal educational outcomes.
                </dd>
              </div>
            </dl>
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
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white opacity-5 rounded-full animate-float"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl animate-fade-in-up">
            <span className="block">Ready to boost your learning?</span>
            <span className="block text-blue-200 animate-fade-in-up animate-stagger-1">Start your journey today.</span>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:mt-0 lg:flex-shrink-0">
            <div className="animate-scale-in animate-stagger-2">
              <button 
                onClick={() => window.location.href = '/whiteboard'}
                className="group relative overflow-hidden inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-blue-600 bg-white hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10">Get started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
            <div className="animate-scale-in animate-stagger-3">
              <a
                href="#features"
                className="group inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base font-medium rounded-xl text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 BrightPath. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
