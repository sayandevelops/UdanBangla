
import React, { useState, useEffect } from 'react';
import { TopicDef, Question, AdminModule } from '../types';
import { addQuestionToBank, bulkAddQuestionsToBank, getQuestionsForTopic, clearTopicQuestions, deleteQuestionById } from '../services/questionBank';
import { Upload, Plus, FileText, Trash2, CheckCircle, AlertCircle, Save, Database, LayoutDashboard, BookOpen, ClipboardList, Layers } from 'lucide-react';

interface AdminPanelProps {
  topics: TopicDef[];
  onExit: () => void;
}

type AdminTab = 'MANUAL' | 'CSV' | 'VIEW';

// Module-specific state interfaces
interface PracticeQuestionsState {
  selectedExam: string;
  selectedSubject: string;
  selectedTopicId: string;
  activeTab: AdminTab;
  manualQ: Partial<Question>;
  csvContent: string;
  currentTopicQuestions: Question[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ topics, onExit }) => {
  // ============================================
  // MANDATORY MODULE SELECTION (First Step)
  // ============================================
  const [selectedModule, setSelectedModule] = useState<AdminModule | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Fixed exam -> subjects mapping (extend as needed)
  const EXAM_SUBJECT_MAP: Record<string, string[]> = {
    WBJEE: ['Physics', 'Chemistry', 'Mathematics'],
    // add other exams here if needed
  };

  const exams = Object.keys(EXAM_SUBJECT_MAP);

  // ============================================
  // MOCK_TEST Module State (Isolated)
  // ============================================
  const [mockTestState, setMockTestState] = useState<PracticeQuestionsState>({
    selectedExam: '',
    selectedSubject: '',
    selectedTopicId: '',
    activeTab: 'MANUAL',
    manualQ: {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: ''
    },
    csvContent: '',
    currentTopicQuestions: []
  });

  // Computed filtered topics for mock test module
  const visibleTopics = mockTestState.selectedSubject
    ? topics.filter(t => (t.title || '').toLowerCase().includes(mockTestState.selectedSubject.toLowerCase()))
    : [];

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // ============================================
  // PRACTICE_QUESTIONS Module Effects
  // ============================================
  const refreshQuestions = async (topicId: string) => {
    const qs = await getQuestionsForTopic(topicId);
    setMockTestState(prev => ({...prev, currentTopicQuestions: qs}));
  };

  useEffect(() => {
    if (selectedModule === AdminModule.MOCK_TEST && mockTestState.selectedTopicId) {
      refreshQuestions(mockTestState.selectedTopicId);
    } else if (selectedModule === AdminModule.MOCK_TEST) {
      setMockTestState(prev => ({...prev, currentTopicQuestions: []}));
    }
  }, [mockTestState.selectedTopicId, selectedModule]);

  useEffect(() => {
    if (selectedModule === AdminModule.MOCK_TEST) {
      setMockTestState(prev => ({...prev, selectedTopicId: visibleTopics[0]?.id || ''}));
    }
  }, [mockTestState.selectedSubject, mockTestState.selectedExam, selectedModule]);

  // ============================================
  // MOCK_TEST Module Handlers
  // ============================================
  const handleMockTestManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockTestState.manualQ.questionText || mockTestState.manualQ.options?.some(o => !o)) {
      showNotification('error', 'Please fill in all fields');
      return;
    }

    if (!mockTestState.selectedExam || !mockTestState.selectedSubject) {
      showNotification('error', 'Please select an exam and subject before saving.');
      return;
    }

    const allowedSubjects = EXAM_SUBJECT_MAP[mockTestState.selectedExam] || [];
    if (!allowedSubjects.map(s => s.toLowerCase()).includes(mockTestState.selectedSubject.toLowerCase())) {
      showNotification('error', 'Selected subject is not valid for the chosen exam.');
      return;
    }

    const newQuestion: Question = {
      id: 0,
      questionText: mockTestState.manualQ.questionText!,
      options: mockTestState.manualQ.options as string[],
      correctAnswerIndex: Number(mockTestState.manualQ.correctAnswerIndex),
      explanation: mockTestState.manualQ.explanation || 'No explanation provided.'
    };

    try {
      const topicIdToUse = mockTestState.selectedTopicId || `${mockTestState.selectedExam}::${mockTestState.selectedSubject}`;
      await addQuestionToBank(topicIdToUse, newQuestion);
      if (mockTestState.selectedTopicId) await refreshQuestions(mockTestState.selectedTopicId);
      showNotification('success', 'Question added successfully');
      
      setMockTestState(prev => ({
        ...prev,
        manualQ: {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          explanation: ''
        }
      }));
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.includes('permission')
        ? 'Permission error while saving to Firestore. Check your Firestore security rules.'
        : (err?.message || 'Failed to add question.');
      showNotification('error', msg);
    }
  };

  const handleMockTestCsvUpload = async () => {
    if (!mockTestState.csvContent) {
      showNotification('error', 'Please enter CSV content');
      return;
    }

    if (!mockTestState.selectedExam || !mockTestState.selectedSubject) {
      showNotification('error', 'Please select an exam and subject before uploading.');
      return;
    }

    const allowedSubjects = EXAM_SUBJECT_MAP[mockTestState.selectedExam] || [];
    if (!allowedSubjects.map(s => s.toLowerCase()).includes(mockTestState.selectedSubject.toLowerCase())) {
      showNotification('error', 'Selected subject is not valid for the chosen exam.');
      return;
    }

    try {
      const rows = mockTestState.csvContent.trim().split('\n');
      const questions: Question[] = [];
      const startIdx = rows[0].toLowerCase().startsWith('question') ? 1 : 0;

      for (let i = startIdx; i < rows.length; i++) {
        const cols = rows[i].split(',').map(c => c.trim());
        if (cols.length < 6) continue;

        questions.push({
          id: 0,
          questionText: cols[0],
          options: [cols[1], cols[2], cols[3], cols[4]],
          correctAnswerIndex: parseInt(cols[5]) || 0,
          explanation: cols[6] || ''
        });
      }

      if (questions.length === 0) {
        showNotification('error', 'No valid questions found in CSV');
        return;
      }

      const topicIdToUse = mockTestState.selectedTopicId || `${mockTestState.selectedExam}::${mockTestState.selectedSubject}`;
      await bulkAddQuestionsToBank(topicIdToUse, questions);
      if (mockTestState.selectedTopicId) await refreshQuestions(mockTestState.selectedTopicId);
      showNotification('success', `Uploaded ${questions.length} questions successfully`);
      setMockTestState(prev => ({...prev, csvContent: ''}));
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.includes('permission')
        ? 'Permission error while saving to Firestore. Check your Firestore security rules.'
        : 'Failed to parse or upload CSV.';
      showNotification('error', msg);
    }
  };

  const handleDeleteQuestion = async (questionId: string | number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestionById(questionId);
        await refreshQuestions(mockTestState.selectedTopicId);
        showNotification('success', 'Question deleted successfully');
      } catch (err: any) {
        console.error(err);
        showNotification('error', 'Failed to delete question');
      }
    }
  };

  // ============================================
  // PRACTICE_QUESTIONS Module Placeholder
  // ============================================
  // TODO: Implement Practice Questions specific state and handlers

  // ============================================
  // COURSE Module Placeholder
  // ============================================
  // TODO: Implement Course specific state and handlers


  // ============================================
  // CONDITIONAL RENDER: Module Selection OR Module UI
  // ============================================

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold">Admin Console</h1>
          {selectedModule && <span className="ml-4 text-sm text-slate-400">/ {selectedModule}</span>}
        </div>
        <div className="flex items-center gap-4">
          {selectedModule && (
            <button
              onClick={() => setSelectedModule(null)}
              className="text-sm text-slate-400 hover:text-white transition-colors border-r border-slate-600 pr-4"
            >
              Back to Modules
            </button>
          )}
          <button onClick={onExit} className="text-sm text-slate-400 hover:text-white transition-colors">
            Exit to App
          </button>
        </div>
      </header>

      {/* ============================================
          STEP 1: NO MODULE SELECTED - Show Module Selection
          ============================================ */}
      {!selectedModule ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Console</h2>
              <p className="text-slate-600">Select a content module to manage</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mock Test Module Card */}
              <button
                onClick={() => setSelectedModule(AdminModule.MOCK_TEST)}
                className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 hover:shadow-lg hover:border-blue-400 transition-all text-left"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Mock Test</h3>
                <p className="text-sm text-slate-600 mb-4">Create and manage mock exam papers</p>
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">Available</span>
              </button>

              {/* Course Module Card */}
              <button
                onClick={() => setSelectedModule(AdminModule.COURSE)}
                className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 hover:shadow-lg hover:border-green-400 transition-all text-left"
              >
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Course</h3>
                <p className="text-sm text-slate-600 mb-4">Organize topics and lessons into courses</p>
                <span className="inline-block text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded">Coming Soon</span>
              </button>

              {/* Practice Questions Module Card */}
              <button
                onClick={() => setSelectedModule(AdminModule.PRACTICE_QUESTIONS)}
                className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 hover:shadow-lg hover:border-purple-400 transition-all text-left"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Layers size={24} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Practice Questions</h3>
                <p className="text-sm text-slate-600 mb-4">Add and manage question bank</p>
                <span className="inline-block text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded">Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ============================================
          STEP 2: MOCK_TEST Module UI
          ============================================ */}
      {selectedModule === AdminModule.MOCK_TEST ? (
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Exam</label>
                <select
                  value={mockTestState.selectedExam}
                  onChange={(e) => setMockTestState(prev => ({...prev, selectedExam: e.target.value, selectedSubject: '', selectedTopicId: ''}))}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Exam</option>
                  {exams.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Subject</label>
                <select
                  value={mockTestState.selectedSubject}
                  onChange={(e) => setMockTestState(prev => ({...prev, selectedSubject: e.target.value, selectedTopicId: ''}))}
                  disabled={!mockTestState.selectedExam}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60"
                >
                  <option value="">Select Subject</option>
                  {(EXAM_SUBJECT_MAP[mockTestState.selectedExam] || []).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Topic (optional)</label>
                <select
                  value={mockTestState.selectedTopicId}
                  onChange={(e) => setMockTestState(prev => ({...prev, selectedTopicId: e.target.value}))}
                  disabled={!mockTestState.selectedSubject || visibleTopics.length === 0}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60"
                >
                  <option value="">-- No topic (save to subject) --</option>
                  {visibleTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <nav className="flex-1 p-2 space-y-1">
              <button 
                onClick={() => setMockTestState(prev => ({...prev, activeTab: 'MANUAL'}))}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${mockTestState.activeTab === 'MANUAL' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Plus size={18} /> Single Entry
              </button>
              <button 
                onClick={() => setMockTestState(prev => ({...prev, activeTab: 'CSV'}))}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${mockTestState.activeTab === 'CSV' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Upload size={18} /> Bulk Upload (CSV)
              </button>
              <button 
                onClick={() => setMockTestState(prev => ({...prev, activeTab: 'VIEW'}))}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${mockTestState.activeTab === 'VIEW' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Database size={18} /> View Question Bank
                <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                  {mockTestState.currentTopicQuestions.length}
                </span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            {notification && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {notification.message}
              </div>
            )}

            {mockTestState.activeTab === 'MANUAL' && (
              <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText size={24} className="text-primary-600"/> Add New Question
                </h2>
                <form onSubmit={handleMockTestManualSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Question Text</label>
                    <textarea 
                      value={mockTestState.manualQ.questionText}
                      onChange={e => setMockTestState(prev => ({...prev, manualQ: {...prev.manualQ, questionText: e.target.value}}))}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"
                      placeholder="Enter the question here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Option {idx + 1}</label>
                        <input 
                          type="text"
                          value={mockTestState.manualQ.options![idx]}
                          onChange={e => {
                            const newOpts = [...mockTestState.manualQ.options!];
                            newOpts[idx] = e.target.value;
                            setMockTestState(prev => ({...prev, manualQ: {...prev.manualQ, options: newOpts}}));
                          }}
                          className={`w-full p-3 border rounded-xl focus:ring-2 outline-none ${mockTestState.manualQ.correctAnswerIndex === idx ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Correct Answer</label>
                    <select 
                      value={mockTestState.manualQ.correctAnswerIndex}
                      onChange={e => setMockTestState(prev => ({...prev, manualQ: {...prev.manualQ, correctAnswerIndex: Number(e.target.value)}}))}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {mockTestState.manualQ.options!.map((opt, idx) => (
                        <option key={idx} value={idx}>Option {idx + 1} {opt ? `- ${opt.substring(0, 30)}...` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Explanation</label>
                    <textarea 
                      value={mockTestState.manualQ.explanation}
                      onChange={e => setMockTestState(prev => ({...prev, manualQ: {...prev.manualQ, explanation: e.target.value}}))}
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-24"
                      placeholder="Explain why the answer is correct..."
                    />
                  </div>

                  <button type="submit" className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
                    Add Question to Bank
                  </button>
                </form>
              </div>
            )}

            {mockTestState.activeTab === 'CSV' && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Upload size={24} className="text-primary-600"/> Bulk Upload
                  </h2>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800">
                    <p className="font-bold mb-2">Expected CSV Format (No Header required):</p>
                    <code>Question Text, Option1, Option2, Option3, Option4, CorrectIndex(0-3), Explanation</code>
                  </div>
                  
                  <textarea 
                    value={mockTestState.csvContent}
                    onChange={e => setMockTestState(prev => ({...prev, csvContent: e.target.value}))}
                    className="w-full h-64 p-4 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                    placeholder={`Example:
What is the capital of West Bengal?, Kolkata, Dhaka, Siliguri, Howrah, 0, Kolkata is the capital.
Who wrote Gitanjali?, Nazrul, Tagore, Bankim, Sarat, 1, Rabindranath Tagore wrote it.`}
                  />
                  
                  <button 
                    onClick={handleMockTestCsvUpload}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-all"
                  >
                    Parse & Upload
                  </button>
                </div>
              </div>
            )}

            {mockTestState.activeTab === 'VIEW' && (
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Current Question Bank</h2>
                  <button 
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete all questions for this topic?')) {
                        await clearTopicQuestions(mockTestState.selectedTopicId);
                        await refreshQuestions(mockTestState.selectedTopicId);
                        showNotification('success', 'Bank cleared');
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Clear All
                  </button>
                </div>

                {mockTestState.currentTopicQuestions.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Database className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500">No questions found for this topic.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockTestState.currentTopicQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                           <h3 className="font-bold text-slate-800 text-lg">Q{idx + 1}. {q.questionText}</h3>
                           <div className="flex items-center gap-2">
                             <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">ID: {q.id}</span>
                             <button
                               onClick={() => handleDeleteQuestion(q.id)}
                               className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                               title="Delete this question"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`px-3 py-2 rounded-lg text-sm border ${oIdx === q.correctAnswerIndex ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-slate-500 italic border-l-4 border-slate-300 pl-3">
                          <span className="font-semibold not-italic text-slate-700">Explanation: </span> 
                          {q.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      ) : null}

      {/* ============================================
          STEP 2: PRACTICE_QUESTIONS Module UI (Placeholder)
          ============================================ */}
      {selectedModule === AdminModule.PRACTICE_QUESTIONS ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Layers size={64} className="mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Practice Questions Module</h2>
            <p className="text-slate-600">Coming Soon - Module-specific UI will be rendered here</p>
          </div>
        </div>
      ) : null}

      {/* ============================================
          STEP 2: COURSE Module UI (Placeholder)
          ============================================ */}
      {selectedModule === AdminModule.COURSE ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <BookOpen size={64} className="mx-auto text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Module</h2>
            <p className="text-slate-600">Coming Soon - Module-specific UI will be rendered here</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
