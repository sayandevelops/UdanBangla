
import { Question } from '../types';
import { getDb, firestore } from './firebase';

// Firestore collection name
const QUESTIONS_COLLECTION = 'questions';

// Helper to map Firestore doc -> Question
const mapDocToQuestion = (docSnap: any): Question => {
  const data = docSnap.data();
  return {
    id: docSnap.id, // Use Firestore doc ID
    questionText: data.questionText,
    options: data.options,
    correctAnswerIndex: data.correctAnswerIndex,
    explanation: data.explanation ?? '',
  };
};

export const getQuestionsForTopic = async (topicId: string): Promise<Question[]> => {
  try {
    const db = getDb();
    const q = firestore.query(
      firestore.collection(db, QUESTIONS_COLLECTION),
      firestore.where('topicId', '==', topicId)
    );
    const snapshot = await firestore.getDocs(q);
    return snapshot.docs.map(mapDocToQuestion);
  } catch (error) {
    console.error('Failed to load questions from Firestore', error);
    return [];
  }
};

export const addQuestionToBank = async (topicId: string, question: Question): Promise<void> => {
  try {
    const db = getDb();
    await firestore.addDoc(firestore.collection(db, QUESTIONS_COLLECTION), {
      topicId,
      questionText: question.questionText,
      options: question.options,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation ?? '',
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to add question to Firestore', error);
    throw error;
  }
};

export const bulkAddQuestionsToBank = async (topicId: string, questions: Question[]): Promise<void> => {
  try {
    const db = getDb();

    // For simplicity in the demo, use multiple addDoc calls (can be optimized with batched writes).
    const ops = questions.map((q) =>
      firestore.addDoc(firestore.collection(db, QUESTIONS_COLLECTION), {
        topicId,
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation ?? '',
        createdAt: Date.now(),
      })
    );

    await Promise.all(ops);
  } catch (error) {
    console.error('Failed to bulk add questions to Firestore', error);
    throw error;
  }
};

export const clearTopicQuestions = async (topicId: string): Promise<void> => {
  try {
    const db = getDb();
    const q = firestore.query(
      firestore.collection(db, QUESTIONS_COLLECTION),
      firestore.where('topicId', '==', topicId)
    );
    const snapshot = await firestore.getDocs(q);

    const deletions = snapshot.docs.map((docSnap) =>
      firestore.deleteDoc(firestore.doc(db, QUESTIONS_COLLECTION, docSnap.id))
    );

    await Promise.all(deletions);
  } catch (error) {
    console.error('Failed to clear topic questions in Firestore', error);
    throw error;
  }
};

export const deleteQuestionById = async (questionId: string | number): Promise<void> => {
  try {
    const db = getDb();
    await firestore.deleteDoc(firestore.doc(db, QUESTIONS_COLLECTION, String(questionId)));
  } catch (error) {
    console.error('Failed to delete question from Firestore', error);
    throw error;
  }
};

// Utility used in admin profile to show total items in the bank
export const getTotalQuestionCount = async (): Promise<number> => {
  try {
    const db = getDb();
    const snapshot = await firestore.getDocs(
      firestore.collection(db, QUESTIONS_COLLECTION)
    );
    return snapshot.size;
  } catch (error) {
    console.error('Failed to get total question count from Firestore', error);
    return 0;
  }
};
