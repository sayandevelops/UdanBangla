
import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from './services/geminiService';
import { getQuestionsForTopic } from './services/questionBank'; // Import local bank
import { TopicCard } from './components/TopicCard';
import { QuizInterface } from './components/QuizInterface';
import { TopicDef, Question, QuizStatus, Difficulty } from './types';
import { Book, Loader2, Award, RefreshCw, ChevronLeft, GraduationCap, School, ArrowRight, FlaskConical, User as UserIcon, LayoutDashboard, Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ProfileView } from './components/ProfileView';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';

const GENERAL_TOPICS: TopicDef[] = [
  {
    id: 'wbcs-history',
    title: 'Bengal History',
    description: 'Ancient, Medieval, and Modern history of Bengal region.',
    iconName: 'landmark',
    color: 'text-amber-600'
  },
  {
    id: 'wb-geo',
    title: 'WB Geography',
    description: 'Rivers, soil, climate, and demographics of West Bengal.',
    iconName: 'map-pin',
    color: 'text-emerald-600'
  },
  {
    id: 'polity',
    title: 'Indian Polity',
    description: 'Constitution, Panchayati Raj, and Governance.',
    iconName: 'gavel',
    color: 'text-blue-600'
  },
  {
    id: 'bengali-lit',
    title: 'Bengali Literature',
    description: 'Famous authors, poems, and literary eras.',
    iconName: 'book-open',
    color: 'text-rose-600'
  },
  {
    id: 'science',
    title: 'General Science',
    description: 'Physics, Chemistry, and Biology basics for competitive exams.',
    iconName: 'flask',
    color: 'text-violet-600'
  },
  {
    id: 'math',
    title: 'Arithmetic',
    description: 'Quantitative aptitude and reasoning.',
    iconName: 'calculator',
    color: 'text-cyan-600'
  }
];

const WBJEE_TOPICS: TopicDef[] = [
  {
    id: 'wbjee-physics',
    title: 'Physics',
    description: 'Mechanics, Optics, Electromagnetism, and Modern Physics for Engineering.',
    iconName: 'atom',
    color: 'text-violet-600'
  },
  {
    id: 'wbjee-chemistry',
    title: 'Chemistry',
    description: 'Physical, Organic, and Inorganic Chemistry.',
    iconName: 'flask',
    color: 'text-emerald-600'
  },
  {
    id: 'wbjee-math',
    title: 'Mathematics',
    description: 'Calculus, Algebra, Coordinate Geometry, and Trigonometry.',
    iconName: 'calculator',
    color: 'text-blue-600'
  }
];

type AppView = 'HOME' | 'CLASSES' | 'TOPICS' | 'PROFILE' | 'ADMIN' | 'ADMIN_LOGIN';

// Internal component to use the Auth Context
const UdanBanglaApp = () => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<QuizStatus>(QuizStatus.IDLE);
  const [view, setView] = useState<AppView>('HOME');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<TopicDef | null>(null);

  const ADMIN_EMAIL = 'sayon8023@gmail.com';
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  // Helper to guard actions
  const requireAuth = (action: () => void) => {
    if (currentUser) {
      action();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const startQuiz = async (topic: TopicDef) => {
    // Double check auth just in case
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setSelectedTopic(topic);
      setStatus(QuizStatus.LOADING);

      // Check for locally generated/admin questions first
      const localQuestions = getQuestionsForTopic(topic.id);
      
      if (localQuestions.length > 0) {
        // Shuffle and pick 5 if available
        const shuffled = [...localQuestions].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 5));
        setStatus(QuizStatus.ACTIVE);
        return;
      }
      
      // Fallback to AI generation
      let promptTopic = topic.title;
      if (selectedClass === 'WBJEE') {
        promptTopic = `${topic.title} specifically for WBJEE (West Bengal Joint Entrance Examination) Engineering Entrance`;
      } else if (selectedClass) {
        promptTopic = `${topic.title} for Class ${selectedClass} (West Bengal Board)`;
      }
        
      const generatedQuestions = await generateQuizQuestions(promptTopic, Difficulty.MEDIUM, 5);
      setQuestions(generatedQuestions);
      setStatus(QuizStatus.ACTIVE);
    } catch (error) {
      console.error(error);
      setStatus(QuizStatus.ERROR);
    }
  };

  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
    setStatus(QuizStatus.COMPLETED);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setScore(0);
    setSelectedTopic(null);
    setStatus(QuizStatus.IDLE);
    // Stay on topics view so user can take another test
    setView('TOPICS');
  };

  const goHome = () => {
    setStatus(QuizStatus.IDLE);
    setView('HOME');
    setSelectedClass(null);
  };

  const goToClasses = () => {
    requireAuth(() => {
      setStatus(QuizStatus.IDLE);
      setView('CLASSES');
    });
  };

  const goToProfile = () => {
    requireAuth(() => {
      setStatus(QuizStatus.IDLE);
      setView('PROFILE');
    });
  };

  const goToAdmin = () => {
    if (isAdmin) {
      setStatus(QuizStatus.IDLE);
      setView('ADMIN');
    } else {
      // If not admin, redirect to Admin Login page
      setView('ADMIN_LOGIN');
    }
  };

  const selectClass = (className: string) => {
    setSelectedClass(className);
    setView('TOPICS');
  };

  const getTopicsForView = () => {
    if (selectedClass === 'WBJEE') {
      return WBJEE_TOPICS;
    }
    return GENERAL_TOPICS;
  };

  const currentTopics = getTopicsForView();
  // Combine all topics for admin
  const allTopics = [...GENERAL_TOPICS, ...WBJEE_TOPICS];

  // ----------------------------------------------------------------------
  // Renders
  // ----------------------------------------------------------------------

  const renderHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
          <div className="rounded-lg bg-primary-600 p-2 text-white">
             <Book size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Udan <span className="text-primary-600">Bangla</span></span>
        </div>
        <nav className="flex items-center gap-6">
          <ul className="hidden sm:flex gap-6 text-sm font-medium text-slate-600">
            <li>
              <button onClick={goToClasses} className="hover:text-primary-600 transition-colors">Mock Test</button>
            </li>
            <li>
              <button onClick={() => requireAuth(() => {})} className="hover:text-primary-600 transition-colors">Leaderboard</button>
            </li>
          </ul>
          
          <div className="pl-6 border-l border-slate-200 flex items-center gap-4">
             {/* Admin Button - Always visible, handles logic internally */}
             <button 
               onClick={goToAdmin}
               className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors border ${isAdmin ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
               title="Admin Panel"
             >
               {isAdmin ? <LayoutDashboard size={16} /> : <Lock size={16} />} 
               <span className="hidden lg:inline">Admin</span>
             </button>
             
             {currentUser ? (
               <button 
                onClick={goToProfile}
                className="flex items-center gap-2 rounded-full bg-slate-50 py-1.5 pl-2 pr-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
               >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-xs">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{currentUser.displayName || 'Student'}</span>
               </button>
             ) : (
               <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
               >
                 Sign In
               </button>
             )}
          </div>
        </nav>
      </div>
    </header>
  );

  const renderHero = () => (
    <div className="relative overflow-hidden bg-white pb-16 pt-12 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Prepare for <span className="text-primary-600">Excellence</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          West Bengal's premier AI-powered mock test platform for Class 11, 12 & WBJEE. 
          Master your syllabus with smart, adaptive quizzes.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <button 
            onClick={goToClasses}
            className="rounded-xl bg-primary-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
          >
            Start Mock Test <ArrowRight size={20} />
          </button>
        </div>
      </div>
      {/* Decorative bg blobs */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-100 mix-blend-multiply blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-100 mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    </div>
  );

  const renderClassSelection = () => (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Select Your Class / Exam</h2>
        <p className="mt-2 text-slate-500">Choose your grade or exam target to find relevant mock tests</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {/* Class 11 Card */}
        <button 
          onClick={() => selectClass('11')}
          className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-md transition-all duration-300 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="mb-6 rounded-full bg-primary-50 p-6 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
            <School size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-600">Class 11 (XI)</h3>
          <p className="mt-2 text-sm text-slate-500">Foundation building for higher secondary education.</p>
          <div className="mt-6 flex items-center text-sm font-semibold text-primary-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
            View Subjects <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </button>

        {/* Class 12 Card */}
        <button 
          onClick={() => selectClass('12')}
          className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-md transition-all duration-300 hover:border-bengal-red hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="mb-6 rounded-full bg-red-50 p-6 text-bengal-red transition-colors group-hover:bg-bengal-red group-hover:text-white">
            <GraduationCap size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-bengal-red">Class 12 (XII)</h3>
          <p className="mt-2 text-sm text-slate-500">Final preparation for board exams and competitive tests.</p>
          <div className="mt-6 flex items-center text-sm font-semibold text-bengal-red opacity-0 transition-all duration-300 group-hover:opacity-100">
            View Subjects <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </button>

        {/* WBJEE Card */}
        <button 
          onClick={() => selectClass('WBJEE')}
          className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-md transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="mb-6 rounded-full bg-blue-50 p-6 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <FlaskConical size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600">WBJEE</h3>
          <p className="mt-2 text-sm text-slate-500">Joint Entrance Examination for Engineering & Technology.</p>
          <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
            View Subjects <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </button>
      </div>
      
      <div className="mt-12 text-center">
         <p className="text-sm text-slate-400">More categories coming soon...</p>
      </div>
    </main>
  );

  const renderTopicSelection = () => (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button 
          onClick={() => setView('CLASSES')}
          className="mb-4 flex items-center text-sm font-medium text-slate-500 hover:text-primary-600"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Classes
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Subjects for {selectedClass === 'WBJEE' ? 'WBJEE' : `Class ${selectedClass}`}
            </h2>
            <p className="text-slate-500">Select a subject to start your mock test</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10">
            {currentTopics.length} Categories
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onSelect={startQuiz} />
        ))}
      </div>
    </main>
  );

  const renderLoading = () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-b-4 border-t-4 border-primary-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Book className="h-8 w-8 text-primary-600 opacity-50" />
        </div>
      </div>
      <h3 className="mt-8 text-xl font-semibold text-slate-900">Generating your test...</h3>
      <p className="mt-2 text-slate-500">
        Creating tailored questions for {selectedClass === 'WBJEE' ? 'WBJEE' : `Class ${selectedClass}`} - {selectedTopic?.title}
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <div className="rounded-full bg-red-100 p-6 mb-4">
        <RefreshCw className="h-10 w-10 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">Something went wrong</h3>
      <p className="mt-2 text-slate-500 max-w-md">We couldn't generate the questions at this moment. Please check your connection or try again.</p>
      <button 
        onClick={resetQuiz}
        className="mt-6 rounded-lg bg-slate-900 px-6 py-2.5 font-semibold text-white hover:bg-slate-800"
      >
        Go Back
      </button>
    </div>
  );

  const renderResults = () => {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "Keep Practicing!";
    if (percentage >= 80) message = "Excellent Work!";
    else if (percentage >= 60) message = "Good Job!";

    const contextText = selectedClass === 'WBJEE' ? 'WBJEE' : `Class ${selectedClass}`;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center border border-slate-100">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <Award size={48} />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{message}</h2>
          <p className="text-slate-500 mb-8">
            You completed the {contextText} {selectedTopic?.title} Mock Test
          </p>
          
          <div className="mb-8 flex justify-center gap-4">
            <div className="rounded-2xl bg-slate-50 p-4 w-32">
              <div className="text-sm text-slate-500 mb-1">Score</div>
              <div className="text-2xl font-bold text-primary-600">{score}/{questions.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 w-32">
              <div className="text-sm text-slate-500 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-slate-800">{percentage}%</div>
            </div>
          </div>

          <button 
            onClick={resetQuiz}
            className="w-full rounded-xl bg-primary-600 py-4 font-bold text-white shadow-lg shadow-primary-200 transition-all hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5"
          >
            Take Another Test
          </button>
          
          <button 
            onClick={goToClasses}
            className="mt-4 w-full rounded-xl bg-white py-3 font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            Change Class / Exam
          </button>
        </div>
      </div>
    );
  };

  if (view === 'ADMIN_LOGIN') {
    return <AdminLogin onLoginSuccess={() => setView('ADMIN')} onBack={goHome} />;
  }

  if (view === 'ADMIN') {
    // Check again to be safe
    if (!isAdmin) {
       setView('ADMIN_LOGIN');
       return null;
    }
    return <AdminPanel topics={allTopics} onExit={goHome} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {renderHeader()}
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {status === QuizStatus.IDLE && (
        <>
          {view === 'HOME' && renderHero()}
          {view === 'CLASSES' && renderClassSelection()}
          {view === 'TOPICS' && renderTopicSelection()}
          {view === 'PROFILE' && <ProfileView onBack={goHome} onGotoAdmin={goToAdmin} />}
        </>
      )}

      {status === QuizStatus.LOADING && renderLoading()}

      {status === QuizStatus.ACTIVE && (
        <QuizInterface 
          questions={questions} 
          onComplete={(s) => handleQuizComplete(s)}
          onExit={resetQuiz}
        />
      )}

      {status === QuizStatus.COMPLETED && renderResults()}
      {status === QuizStatus.ERROR && renderError()}

      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Udan Bangla. Made with ❤️ for WB Aspirants.</p>
        </div>
      </footer>
    </div>
  );
};

// Main App component that provides Context
function App() {
  return (
    <AuthProvider>
      <UdanBanglaApp />
    </AuthProvider>
  );
}

export default App;
