

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileStats } from '../types';
import { getTotalQuestionCount } from '../services/questionBank';
import { 
  User, LogOut, Award, BookOpen, Target, 
  TrendingUp, Zap, Crown, BarChart3, AlertCircle,
  ChevronRight, Calendar, CheckCircle2,
  Server, Users, Database, Activity, ShieldCheck, LayoutDashboard
} from 'lucide-react';

interface ProfileViewProps {
  onBack: () => void;
  onGotoAdmin?: () => void;
}

// Mock Data Service - In a real app, this would come from the backend
const MOCK_STATS: UserProfileStats = {
  targetExam: 'WBJEE / Class 12',
  testsAttempted: 14,
  averageScore: 72,
  globalRank: 1420,
  subscriptionPlan: 'PRO',
  subjectWise: [
    { subject: 'Physics', accuracy: 65, totalQuestions: 150, color: 'bg-violet-500' },
    { subject: 'Chemistry', accuracy: 82, totalQuestions: 140, color: 'bg-emerald-500' },
    { subject: 'Mathematics', accuracy: 58, totalQuestions: 200, color: 'bg-blue-500' },
    { subject: 'Biology', accuracy: 75, totalQuestions: 80, color: 'bg-rose-500' }
  ],
  weakChapters: ['Rotational Mechanics', 'Integration', 'Organic Chemistry Basics', 'Plant Physiology'],
  recentScores: [55, 62, 58, 70, 75]
};

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onGotoAdmin }) => {
  const { currentUser, logout } = useAuth();
  const [totalQuestions, setTotalQuestions] = useState(0);

  const isAdmin = currentUser?.email === 'sayon8023@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      // Async fetch
      getTotalQuestionCount().then(setTotalQuestions);
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
      onBack();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getInitials = (name: string | null) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // --- ADMIN DASHBOARD RENDER ---
  if (isAdmin) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-100 min-h-[calc(100vh-64px)] font-sans">
        
        {/* Admin Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
             <div className="h-16 w-16 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={32} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900">System Administrator</h2>
                <p className="text-slate-500 text-sm">Welcome back, Sayon. System status is nominal.</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={onGotoAdmin}
               className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-200"
             >
               <LayoutDashboard size={18} /> Open Console
             </button>
             <button 
               onClick={handleLogout}
               className="px-4 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
             >
               <LogOut size={18} /> Sign Out
             </button>
          </div>
        </div>

        {/* System Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
                 <h3 className="text-3xl font-bold text-slate-900">2,451</h3>
               </div>
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                 <Users size={24} />
               </div>
             </div>
             <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg w-fit">
               <TrendingUp size={12} /> +12% this week
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Question Bank</p>
                 <h3 className="text-3xl font-bold text-slate-900">{totalQuestions}</h3>
               </div>
               <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                 <Database size={24} />
               </div>
             </div>
             <p className="text-xs text-slate-400">Items across all topics</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Server Status</p>
                 <h3 className="text-3xl font-bold text-emerald-600">Online</h3>
               </div>
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                 <Server size={24} />
               </div>
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-500">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
               99.9% Uptime
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Active Sessions</p>
                 <h3 className="text-3xl font-bold text-slate-900">42</h3>
               </div>
               <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                 <Activity size={24} />
               </div>
             </div>
             <p className="text-xs text-slate-400">Current live quizzes</p>
          </div>

        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity Log */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-slate-400" /> System Audit Log
            </h3>
            <div className="space-y-4">
              {[
                { action: 'Admin Login', user: 'sayon8023@gmail.com', time: 'Just now', type: 'secure' },
                { action: 'New User Registration', user: 'student_wb@gmail.com', time: '5 mins ago', type: 'info' },
                { action: 'Question Bank Update', user: 'System', time: '1 hour ago', type: 'update' },
                { action: 'Quiz Generated (AI)', user: 'User #8821', time: '2 hours ago', type: 'ai' },
                { action: 'Database Backup', user: 'Automated', time: '5 hours ago', type: 'system' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="flex items-center gap-4">
                      <div className={`h-2 w-2 rounded-full ${
                        log.type === 'secure' ? 'bg-green-500' : 
                        log.type === 'update' ? 'bg-blue-500' :
                        log.type === 'ai' ? 'bg-violet-500' : 'bg-slate-400'
                      }`}></div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{log.action}</p>
                        <p className="text-xs text-slate-500">{log.user}</p>
                      </div>
                   </div>
                   <span className="text-xs font-mono text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-center text-slate-500 hover:text-primary-600 font-medium">
              View All Logs
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6">
             <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
             <div className="space-y-3">
               <button 
                onClick={onGotoAdmin} 
                className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
               >
                 <span className="font-medium">Manage Question Bank</span>
                 <ChevronRight size={16} className="opacity-50" />
               </button>
               <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 opacity-70 cursor-not-allowed">
                 <span className="font-medium">User Management</span>
                 <span className="text-xs bg-black/30 px-2 py-1 rounded">Soon</span>
               </button>
               <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 opacity-70 cursor-not-allowed">
                 <span className="font-medium">System Settings</span>
                 <span className="text-xs bg-black/30 px-2 py-1 rounded">Soon</span>
               </button>
             </div>
             
             <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-slate-400">
                  Udan Bangla v1.0.2 <br/>
                  Server: asia-south1-c
                </p>
             </div>
          </div>

        </div>
      </main>
    );
  }

  // --- STUDENT DASHBOARD RENDER (Existing) ---
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-64px)]">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Student Dashboard</h2>
          <p className="text-slate-500">Track your progress and exam readiness.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={onBack}
             className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
           >
             Take Quiz
           </button>
           <button 
             onClick={handleLogout}
             className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-2"
           >
             <LogOut size={18} /> Sign Out
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Identity Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700 border-4 border-white shadow-lg">
                  {getInitials(currentUser?.displayName || currentUser?.email)}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 h-6 w-6 rounded-full border-2 border-white"></div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900">
                {currentUser?.displayName || 'Student Aspirant'}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{currentUser?.email || currentUser?.phoneNumber}</p>
              
              <div className="w-full flex justify-between items-center bg-slate-50 rounded-xl p-3 mb-2">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Target size={16} /> Target
                </span>
                <span className="text-sm font-bold text-slate-900">{MOCK_STATS.targetExam}</span>
              </div>
              <div className="w-full flex justify-between items-center bg-amber-50 rounded-xl p-3 border border-amber-100">
                <span className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <Crown size={16} /> Plan
                </span>
                <span className="text-sm font-bold text-amber-700">{MOCK_STATS.subscriptionPlan} Member</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <BookOpen size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Tests</span>
               </div>
               <div className="text-2xl font-bold text-slate-900">{MOCK_STATS.testsAttempted}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Award size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Rank</span>
               </div>
               <div className="text-2xl font-bold text-slate-900">#{MOCK_STATS.globalRank}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Zap size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Avg Score</span>
               </div>
               <div className="text-2xl font-bold text-slate-900">{MOCK_STATS.averageScore}%</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Calendar size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
               </div>
               <div className="text-2xl font-bold text-slate-900">3 Days</div>
            </div>
          </div>

          {/* Weak Areas */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-500" size={20} />
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {MOCK_STATS.weakChapters.map((chapter, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100">
                  {chapter}
                </span>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-sm text-primary-600 font-semibold hover:bg-primary-50 rounded-lg transition-colors">
              Generate Practice Test
            </button>
          </div>

        </div>

        {/* Right Column - Detailed Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance Graph */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Performance Trend</h3>
                <p className="text-sm text-slate-500">Your score trajectory over last 5 mock tests</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            
            <div className="h-48 flex items-end justify-between gap-4 px-2">
              {MOCK_STATS.recentScores.map((score, index) => (
                <div key={index} className="w-full flex flex-col items-center gap-2 group">
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-slate-600 mb-1">{score}%</div>
                   <div 
                    className="w-full max-w-[60px] bg-primary-600 rounded-t-lg transition-all duration-500 hover:bg-primary-700 relative overflow-hidden"
                    style={{ height: `${score * 2}px` }} // scale for visual
                   >
                     <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                   </div>
                   <span className="text-xs font-medium text-slate-400">Test {index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Wise Analysis */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Subject Proficiency</h3>
            <div className="space-y-6">
              {MOCK_STATS.subjectWise.map((sub) => (
                <div key={sub.subject}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-700">{sub.subject}</span>
                    <span className="text-sm font-bold text-slate-900">{sub.accuracy}% Accuracy</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${sub.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${sub.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Callout (Mock) */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Crown size={20} className="text-yellow-400" /> 
                    Unlock WBJEE Elite
                  </h3>
                  <p className="text-slate-300 text-sm max-w-sm">
                    Get access to 5000+ premium questions, detailed video solutions, and AI-driven personalized study plans.
                  </p>
               </div>
               <button className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
                 Upgrade Now
               </button>
            </div>
            {/* Background decorations */}
            <div className="absolute right-0 bottom-0 h-32 w-32 bg-white/5 rounded-full blur-2xl -mr-10 -mb-10"></div>
          </div>

        </div>
      </div>
    </main>
  );
};
