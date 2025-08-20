import React from 'react';

const Dashboard: React.FC = () => {
  // Reserved for time-based greetings/animations

  const user = {
    name: "Arka",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
    xp: 2400,
    level: "Advanced"
  };

  const courses = [
    {
      id: 1,
      name: "Biology Molecular",
      progress: 79,
      lessons: 71,
      duration: "55 min",
      assignments: 5,
      students: 512,
      color: "bg-green-500"
    },
    {
      id: 2,
      name: "Color Theory",
      progress: 64,
      lessons: 80,
      duration: "45 min",
      assignments: 2,
      students: 254,
      color: "bg-green-500"
    },
    {
      id: 3,
      name: "Microbiology Society",
      progress: 45,
      lessons: 40,
      duration: "45 min",
      assignments: 2,
      students: 254,
      color: "bg-green-600"
    }
  ];

  // Remove unused variables to clean up code
  // const activities = [...] // Kept for future chart implementations

  const CircularProgress = ({ percentage, size = 60, strokeWidth = 6, showLabel = false }: { percentage: number; size?: number; strokeWidth?: number; showLabel?: boolean }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-['Urbanist']">
      {/* Navigation Header - Consistent with HomePage */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">BrightPath</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="/whiteboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Whiteboard
              </a>
              <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </a>
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img 
                  src={user.avatar} 
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Quick Actions Bar - Moved to top for better visibility */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => window.location.href = '/whiteboard'}
            className="group p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Whiteboard</div>
                <div className="text-xs opacity-90">Start learning</div>
              </div>
            </div>
          </button>
          
          <button className="group p-4 bg-white border-2 border-blue-200 text-gray-700 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Browse</div>
                <div className="text-xs text-gray-500">New courses</div>
              </div>
            </div>
          </button>
          
          <button className="group p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Get Help</div>
                <div className="text-xs text-gray-500">Contact tutor</div>
              </div>
            </div>
          </button>
          
          <button className="group p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Analytics</div>
                <div className="text-xs text-gray-500">View progress</div>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Focus: Today's Course - Enhanced Visual Hierarchy */}
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 ring-2 ring-blue-100">
              <div className="absolute -top-3 left-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                  🎯 Priority Today
                </div>
              </div>
              
              <div className="pt-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Hello, {user.name} 👋</h1>
                <p className="text-gray-600">Ready to continue your learning journey?</p>
              </div>

              <div className="space-y-6">
                {courses.slice(0, 2).map((course, index) => (
                  <div
                    key={course.id}
                    className={`rounded-2xl px-6 py-6 border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                      index === 0 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-center">
                      {/* Progress ring + icon */}
                      <div className="relative">
                        <CircularProgress percentage={course.progress} size={76} strokeWidth={8} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div>
                        <div className="text-lg font-semibold text-gray-900 mb-2">{course.name}</div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                          <div className="inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {course.lessons} lessons
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            {course.assignments} tasks
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            {course.students} students
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-3xl font-extrabold text-blue-600 leading-none">{course.progress}%</div>
                        <div className="flex gap-2">
                          {index === 0 ? (
                            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-lg transition-all transform hover:scale-105">
                              Continue Learning
                            </button>
                          ) : (
                            <button className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                              View Course
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Content: Your Class - Simplified */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">All Your Classes</h2>
              <div className="flex space-x-2 mb-6">
                {['All', 'Science', 'Math', 'Languages'].map((tab, index) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      index === 0 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{courses[2].name}</h3>
                      <div className="text-sm text-gray-500">{courses[2].lessons} lessons • {courses[2].duration}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{courses[2].progress}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Advanced Mathematics</h3>
                      <div className="text-sm text-gray-500">32 lessons • 50 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">67%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
            </div>            {/* Learning Activity - Enhanced with Better Integration */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Learning Progress</h2>
                <select className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>This Month</option>
                  <option>This Week</option>
                  <option>This Semester</option>
                </select>
              </div>

              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">62</div>
                  <div className="text-sm text-blue-600">Hours Studied</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-gray-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-700">80</div>
                  <div className="text-sm text-gray-600">Materials</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-gray-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-700">70</div>
                  <div className="text-sm text-gray-600">Exams Taken</div>
                </div>
              </div>

              {/* Simple Chart */}
              <div className="h-48 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="text-sm text-gray-600 mb-4">Weekly Activity</div>
                <svg className="w-full h-full" viewBox="0 0 300 120">
                  <defs>
                    <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid */}
                  {[20, 40, 60, 80].map((y) => (
                    <line key={y} x1="30" y1={y} x2="270" y2={y} stroke="#f1f5f9" strokeWidth="1"/>
                  ))}
                  
                  {/* Chart area */}
                  <path
                    d="M 30 90 Q 70 75 120 65 Q 170 55 220 45 L 270 35 L 270 100 L 30 100 Z"
                    fill="url(#activityGradient)"
                  />
                  
                  {/* Chart line */}
                  <path
                    d="M 30 90 Q 70 75 120 65 Q 170 55 220 45 L 270 35"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  {/* Data points */}
                  <circle cx="120" cy="65" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="220" cy="45" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="270" cy="35" r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
                </svg>
                
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-8">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Student Profile & Analytics (Simplified) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Profile - Clean and Professional */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <img 
                    src="/api/placeholder/64/64" 
                    alt="Profile" 
                    className="w-16 h-16 rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) nextElement.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-16 rounded-xl bg-blue-100 hidden items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                <p className="text-gray-500 text-sm">Student • 3rd Semester</p>
              </div>

              {/* Progress Stats - Clean Design */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-blue-600">Courses</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-gray-700">18</div>
                  <div className="text-sm text-gray-600">Certificates</div>
                </div>
              </div>

              {/* XP Section - Minimized */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-800">{user.xp} XP</div>
                    <div className="text-sm text-gray-500">Total Points</div>
                  </div>
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Rewards
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Goals & Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Goals</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">Complete Biology lesson</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Math assignment due</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">Review chemistry notes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Achievements - Simplified */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Course Completed</div>
                    <div className="text-xs text-gray-600">Biology Molecular</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Perfect Score</div>
                    <div className="text-xs text-gray-600">Mathematics Quiz</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
