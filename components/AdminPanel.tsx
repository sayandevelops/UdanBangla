
import React, { useState, useEffect } from 'react';
import { TopicDef, Question } from '../types';
import { addQuestionToBank, bulkAddQuestionsToBank, getQuestionsForTopic, clearTopicQuestions } from '../services/questionBank';
import { Upload, Plus, FileText, Trash2, CheckCircle, AlertCircle, Save, Database, LayoutDashboard } from 'lucide-react';

interface AdminPanelProps {
  topics: TopicDef[];
  onExit: () => void;
}

type AdminTab = 'MANUAL' | 'CSV' | 'VIEW';

export const AdminPanel: React.FC<AdminPanelProps> = ({ topics, onExit }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('MANUAL');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id || '');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Manual Entry State
  const [manualQ, setManualQ] = useState<Partial<Question>>({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: ''
  });

  // CSV State
  const [csvContent, setCsvContent] = useState('');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const [currentTopicQuestions, setCurrentTopicQuestions] = useState<Question[]>([]);

  const refreshQuestions = async (topicId: string) => {
    const qs = await getQuestionsForTopic(topicId);
    setCurrentTopicQuestions(qs);
  };

  useEffect(() => {
    if (selectedTopicId) {
      refreshQuestions(selectedTopicId);
    }
  }, [selectedTopicId]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQ.questionText || manualQ.options?.some(o => !o)) {
      showNotification('error', 'Please fill in all fields');
      return;
    }

    const newQuestion: Question = {
      id: 0, // Assigned by service
      questionText: manualQ.questionText!,
      options: manualQ.options as string[],
      correctAnswerIndex: Number(manualQ.correctAnswerIndex),
      explanation: manualQ.explanation || 'No explanation provided.'
    };

    try {
      await addQuestionToBank(selectedTopicId, newQuestion);
      await refreshQuestions(selectedTopicId);
      showNotification('success', 'Question added successfully');
      
      // Reset form
      setManualQ({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: ''
      });
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.includes('permission')
        ? 'Permission error while saving to Firestore. Check your Firestore security rules.'
        : (err?.message || 'Failed to add question.');
      showNotification('error', msg);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvContent) {
      showNotification('error', 'Please enter CSV content');
      return;
    }

    try {
      const rows = csvContent.trim().split('\n');
      const questions: Question[] = [];
      
      // Assume format: Question, Opt1, Opt2, Opt3, Opt4, AnsIndex(0-3), Explanation
      // Skip header if it looks like a header
      const startIdx = rows[0].toLowerCase().startsWith('question') ? 1 : 0;

      for (let i = startIdx; i < rows.length; i++) {
        // Simple CSV parse (splitting by comma, caveat: doesn't handle commas inside quotes well without complex regex)
        // For this demo, we assume standard CSV without internal commas or use a pipe | if needed.
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

      await bulkAddQuestionsToBank(selectedTopicId, questions);
      await refreshQuestions(selectedTopicId);
      showNotification('success', `Uploaded ${questions.length} questions successfully`);
      setCsvContent('');
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.includes('permission')
        ? 'Permission error while saving to Firestore. Check your Firestore security rules.'
        : 'Failed to parse or upload CSV.';
      showNotification('error', msg);
    }
  };

  // currentTopicQuestions now comes from Firestore via refreshQuestions

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold">Admin Console</h1>
        </div>
        <button onClick={onExit} className="text-sm text-slate-400 hover:text-white transition-colors">
          Exit to App
        </button>
      </header>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Target Subject</label>
            <select 
              value={selectedTopicId} 
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          
          <nav className="flex-1 p-2 space-y-1">
            <button 
              onClick={() => setActiveTab('MANUAL')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'MANUAL' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Plus size={18} /> Single Entry
            </button>
            <button 
              onClick={() => setActiveTab('CSV')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'CSV' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Upload size={18} /> Bulk Upload (CSV)
            </button>
            <button 
              onClick={() => setActiveTab('VIEW')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'VIEW' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Database size={18} /> View Question Bank
              <span className="ml-auto bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                {currentTopicQuestions.length}
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

          {activeTab === 'MANUAL' && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText size={24} className="text-primary-600"/> Add New Question
              </h2>
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Question Text</label>
                  <textarea 
                    value={manualQ.questionText}
                    onChange={e => setManualQ({...manualQ, questionText: e.target.value})}
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
                        value={manualQ.options![idx]}
                        onChange={e => {
                          const newOpts = [...manualQ.options!];
                          newOpts[idx] = e.target.value;
                          setManualQ({...manualQ, options: newOpts});
                        }}
                        className={`w-full p-3 border rounded-xl focus:ring-2 outline-none ${manualQ.correctAnswerIndex === idx ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Correct Answer</label>
                  <select 
                    value={manualQ.correctAnswerIndex}
                    onChange={e => setManualQ({...manualQ, correctAnswerIndex: Number(e.target.value)})}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {manualQ.options!.map((opt, idx) => (
                      <option key={idx} value={idx}>Option {idx + 1} {opt ? `- ${opt.substring(0, 30)}...` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Explanation</label>
                  <textarea 
                    value={manualQ.explanation}
                    onChange={e => setManualQ({...manualQ, explanation: e.target.value})}
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

          {activeTab === 'CSV' && (
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
                  value={csvContent}
                  onChange={e => setCsvContent(e.target.value)}
                  className="w-full h-64 p-4 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                  placeholder={`Example:
What is the capital of West Bengal?, Kolkata, Dhaka, Siliguri, Howrah, 0, Kolkata is the capital.
Who wrote Gitanjali?, Nazrul, Tagore, Bankim, Sarat, 1, Rabindranath Tagore wrote it.`}
                />
                
                <button 
                  onClick={handleCsvUpload}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-all"
                >
                  Parse & Upload
                </button>
              </div>
            </div>
          )}

          {activeTab === 'VIEW' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Current Question Bank</h2>
                <button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete all questions for this topic?')) {
                      await clearTopicQuestions(selectedTopicId);
                      await refreshQuestions(selectedTopicId);
                      showNotification('success', 'Bank cleared');
                    }
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 flex items-center gap-2"
                >
                  <Trash2 size={16} /> Clear All
                </button>
              </div>

              {currentTopicQuestions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <Database className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-500">No questions found for this topic.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTopicQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                         <h3 className="font-bold text-slate-800 text-lg">Q{idx + 1}. {q.questionText}</h3>
                         <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">ID: {q.id}</span>
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
    </div>
  );
};
