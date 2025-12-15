
import React, { useState, useEffect } from 'react';
import { TopicDef, Question } from '../types';
import { addQuestionToBank, bulkAddQuestionsToBank, getQuestionsForTopic, clearTopicQuestions } from '../services/questionBank';
import { Upload, Plus, FileText, Trash2, CheckCircle, AlertCircle, Save, Database, LayoutDashboard, Loader2, School, BookOpen } from 'lucide-react';

export interface TopicGroup {
  groupName: string;
  topics: TopicDef[];
}

interface AdminPanelProps {
  topicGroups: TopicGroup[];
  onExit: () => void;
}

type AdminTab = 'MANUAL' | 'CSV' | 'VIEW';

export const AdminPanel: React.FC<AdminPanelProps> = ({ topicGroups, onExit }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('MANUAL');
  
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const currentGroup = topicGroups[selectedGroupIndex];
  
  const [selectedTopicId, setSelectedTopicId] = useState<string>(currentGroup?.topics[0]?.id || '');
  
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Entry State
  const [manualQ, setManualQ] = useState<Partial<Question>>({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: ''
  });

  // CSV State
  const [csvContent, setCsvContent] = useState('');

  // Update selected topic when group changes
  useEffect(() => {
    if (currentGroup?.topics.length > 0) {
      const exists = currentGroup.topics.find(t => t.id === selectedTopicId);
      if (!exists) {
        setSelectedTopicId(currentGroup.topics[0].id);
      }
    }
  }, [selectedGroupIndex, currentGroup]);

  useEffect(() => {
    if (activeTab === 'VIEW' && selectedTopicId) {
      setLoadingQuestions(true);
      getQuestionsForTopic(selectedTopicId)
        .then(setQuestions)
        .finally(() => setLoadingQuestions(false));
    }
  }, [selectedTopicId, activeTab, notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQ.questionText || manualQ.options?.some(o => !o)) {
      showNotification('error', 'Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
        const newQuestion: Question = {
          id: '', // Will be assigned by Firestore
          questionText: manualQ.questionText!,
          options: manualQ.options as string[],
          correctAnswerIndex: Number(manualQ.correctAnswerIndex),
          explanation: manualQ.explanation || 'No explanation provided.'
        };

        await addQuestionToBank(selectedTopicId, newQuestion);
        showNotification('success', 'Question added successfully');
        
        // Reset form
        setManualQ({
          questionText: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          explanation: ''
        });
    } catch (e) {
        showNotification('error', 'Failed to add question');
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvContent) {
      showNotification('error', 'Please enter CSV content');
      return;
    }
    setIsSubmitting(true);
    try {
      const rows = csvContent.trim().split('\n');
      const questionsToAdd: Question[] = [];
      
      const startIdx = rows[0].toLowerCase().startsWith('question') ? 1 : 0;

      for (let i = startIdx; i < rows.length; i++) {
        const cols = rows[i].split(',').map(c => c.trim());
        if (cols.length < 6) continue;

        questionsToAdd.push({
          id: '',
          questionText: cols[0],
          options: [cols[1], cols[2], cols[3], cols[4]],
          correctAnswerIndex: parseInt(cols[5]) || 0,
          explanation: cols[6] || ''
        });
      }

      if (questionsToAdd.length === 0) {
        showNotification('error', 'No valid questions found in CSV');
        return;
      }

      await bulkAddQuestionsToBank(selectedTopicId, questionsToAdd);
      showNotification('success', `Uploaded ${questionsToAdd.length} questions successfully`);
      setCsvContent('');
    } catch (err) {
      showNotification('error', 'Failed to upload CSV');
      console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const currentTopic = currentGroup.topics.find(t => t.id === selectedTopicId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Console</h1>
            <p className="text-xs text-slate-400">Content Management System</p>
          </div>
        </div>
        <button onClick={onExit} className="text-sm text-slate-400 hover:text-white transition-colors">
          Exit to App
        </button>
      </header>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
          <div className="p-6 border-b border-slate-100 space-y-5">
            
            {/* Group Selection */}
            <div>
               <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                 <School size={14} /> Target Class / Exam
               </label>
               <select 
                value={selectedGroupIndex} 
                onChange={(e) => setSelectedGroupIndex(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              >
                {topicGroups.map((g, idx) => (
                  <option key={idx} value={idx}>{g.groupName}</option>
                ))}
              </select>
            </div>

            {/* Topic Selection */}
            <div>
               <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                 <BookOpen size={14} /> Subject / Topic
               </label>
               <select 
                value={selectedTopicId} 
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow shadow-sm"
              >
                {currentGroup?.topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <p className="px-3 text-xs font-bold text-slate-400 uppercase mb-2">Actions</p>
            <button 
              onClick={() => setActiveTab('MANUAL')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'MANUAL' ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Plus size={18} /> Single Entry
            </button>
            <button 
              onClick={() => setActiveTab('CSV')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'CSV' ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Upload size={18} /> Bulk Upload (CSV)
            </button>
            <button 
              onClick={() => setActiveTab('VIEW')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'VIEW' ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Database size={18} /> Question Bank
              <span className={`ml-auto text-xs py-0.5 px-2 rounded-full ${activeTab === 'VIEW' ? 'bg-white text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                {activeTab === 'VIEW' ? questions.length : 'View'}
              </span>
            </button>
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
               <p className="text-xs text-slate-500">
                 Database Connected<br/>
                 <span className="font-mono text-[10px] opacity-70">db-shard-asia-01</span>
               </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentTopic?.title}</h2>
                  <p className="text-slate-500">{currentGroup?.groupName}</p>
               </div>
               {activeTab === 'VIEW' && (
                 <button 
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete all questions for this topic?')) {
                        setIsSubmitting(true);
                        await clearTopicQuestions(selectedTopicId);
                        setQuestions([]); // Optimistic update
                        showNotification('success', 'Bank cleared');
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 size={16} /> Clear Subject Data
                  </button>
               )}
            </div>

            {notification && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {notification.message}
              </div>
            )}

            {activeTab === 'MANUAL' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FileText size={20} className="text-primary-600"/> Add Question Details
                </h3>
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Question Stem</label>
                    <textarea 
                      value={manualQ.questionText}
                      onChange={e => setManualQ({...manualQ, questionText: e.target.value})}
                      className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none min-h-[100px] transition-all"
                      placeholder="Type the main question here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Option {idx + 1}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-400">{String.fromCharCode(65 + idx)}</span>
                          <input 
                            type="text"
                            value={manualQ.options![idx]}
                            onChange={e => {
                              const newOpts = [...manualQ.options!];
                              newOpts[idx] = e.target.value;
                              setManualQ({...manualQ, options: newOpts});
                            }}
                            className={`w-full py-3 pl-8 pr-4 border rounded-xl focus:ring-2 outline-none transition-all ${manualQ.correctAnswerIndex === idx ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 bg-white focus:border-primary-500'}`}
                            placeholder={`Answer choice...`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Correct Answer</label>
                      <select 
                        value={manualQ.correctAnswerIndex}
                        onChange={e => setManualQ({...manualQ, correctAnswerIndex: Number(e.target.value)})}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                      >
                        {manualQ.options!.map((opt, idx) => (
                          <option key={idx} value={idx}>
                            Option {idx + 1} ({String.fromCharCode(65+idx)}) {opt ? `- ${opt.substring(0, 20)}${opt.length>20?'...':''}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Explanation / Solution</label>
                    <textarea 
                      value={manualQ.explanation}
                      onChange={e => setManualQ({...manualQ, explanation: e.target.value})}
                      className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none h-24 transition-all"
                      placeholder="Explain why the correct answer is the right choice..."
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save to Bank</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'CSV' && (
              <div className="animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-primary-600"/> Bulk Import
                  </h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 text-sm text-blue-800">
                    <p className="font-bold mb-2 flex items-center gap-2"><AlertCircle size={16}/> CSV Format Required</p>
                    <p className="mb-2 opacity-80">Paste your CSV data below. No header row needed. Each line represents one question.</p>
                    <code className="block bg-white/50 p-2 rounded border border-blue-200 font-mono text-xs">
                      Question Text, Option1, Option2, Option3, Option4, CorrectIndex(0-3), Explanation
                    </code>
                  </div>
                  
                  <textarea 
                    value={csvContent}
                    onChange={e => setCsvContent(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                    placeholder={`Example:
What is the capital of West Bengal?, Kolkata, Dhaka, Siliguri, Howrah, 0, Kolkata is the capital.
Who wrote Gitanjali?, Nazrul, Tagore, Bankim, Sarat, 1, Rabindranath Tagore wrote it.`}
                  />
                  
                  <button 
                    onClick={handleCsvUpload}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Upload size={18} /> Parse & Upload</>}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'VIEW' && (
              <div className="animate-fade-in">
                {loadingQuestions ? (
                  <div className="text-center py-20">
                      <Loader2 className="animate-spin mx-auto h-12 w-12 text-primary-500" />
                      <p className="text-slate-500 mt-4 font-medium">Fetching question bank...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Database className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No questions found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-1">This topic is currently empty. Use the Single Entry or CSV tabs to add content.</p>
                    <button 
                      onClick={() => setActiveTab('MANUAL')}
                      className="mt-6 text-primary-600 font-bold hover:underline"
                    >
                      Add First Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="font-bold text-slate-800 text-lg flex gap-3">
                             <span className="bg-slate-100 text-slate-500 h-8 w-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">{idx + 1}</span>
                             {q.questionText}
                           </h3>
                           <span className="bg-slate-50 text-slate-400 text-[10px] font-mono px-2 py-1 rounded border border-slate-100">ID: {q.id}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pl-11">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`px-4 py-3 rounded-xl text-sm border flex items-center gap-3 ${oIdx === q.correctAnswerIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs border ${oIdx === q.correctAnswerIndex ? 'border-emerald-500 bg-white text-emerald-700' : 'border-slate-300 text-slate-400'}`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="ml-11 text-sm bg-slate-50 p-4 rounded-xl text-slate-600 border border-slate-100">
                            <span className="font-bold text-slate-800 flex items-center gap-2 mb-1"><BookOpen size={14}/> Explanation: </span> 
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
