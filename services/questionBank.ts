
import { Question } from '../types';

const STORAGE_KEY = 'udan_bangla_question_bank';

export interface QuestionBank {
  [topicId: string]: Question[];
}

export const getQuestionBank = (): QuestionBank => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to load question bank", error);
    return {};
  }
};

export const getQuestionsForTopic = (topicId: string): Question[] => {
  const bank = getQuestionBank();
  return bank[topicId] || [];
};

export const addQuestionToBank = (topicId: string, question: Question): void => {
  const bank = getQuestionBank();
  if (!bank[topicId]) {
    bank[topicId] = [];
  }
  // Assign a unique ID based on timestamp if not present
  const newQuestion = { ...question, id: Date.now() };
  bank[topicId].push(newQuestion);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
};

export const bulkAddQuestionsToBank = (topicId: string, questions: Question[]): void => {
  const bank = getQuestionBank();
  if (!bank[topicId]) {
    bank[topicId] = [];
  }
  const newQuestions = questions.map((q, idx) => ({
    ...q,
    id: Date.now() + idx
  }));
  bank[topicId] = [...bank[topicId], ...newQuestions];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
};

export const clearTopicQuestions = (topicId: string): void => {
  const bank = getQuestionBank();
  delete bank[topicId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
};
