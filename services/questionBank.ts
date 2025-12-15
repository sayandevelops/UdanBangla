
import { Question } from '../types';

// Using LocalStorage to mock a database for persistence in the demo
const STORAGE_KEY = 'udan_bangla_question_bank';

const getStore = (): any[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveStore = (data: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
};

export const getQuestionsForTopic = async (topicId: string): Promise<Question[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  const allQuestions = getStore();
  return allQuestions.filter(q => q.topicId === topicId);
};

export const addQuestionToBank = async (topicId: string, question: Question) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const allQuestions = getStore();
  
  // Create a new record with ID
  const newRecord = {
    ...question,
    id: question.id || `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    topicId,
    createdAt: new Date().toISOString()
  };
  
  allQuestions.push(newRecord);
  saveStore(allQuestions);
};

export const bulkAddQuestionsToBank = async (topicId: string, questions: Question[]) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const allQuestions = getStore();
  
  const newRecords = questions.map((q, idx) => ({
    ...q,
    id: q.id || `q-${Date.now()}-${idx}`,
    topicId,
    createdAt: new Date().toISOString()
  }));
  
  allQuestions.push(...newRecords);
  saveStore(allQuestions);
};

export const clearTopicQuestions = async (topicId: string) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const allQuestions = getStore();
  const filtered = allQuestions.filter(q => q.topicId !== topicId);
  saveStore(filtered);
};

export const getTotalQuestionCount = async (): Promise<number> => {
  const allQuestions = getStore();
  return allQuestions.length;
};
