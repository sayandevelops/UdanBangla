import { getDb, firestore } from './firebase';

const USERS_COLLECTION = 'users';
const QUIZ_RESULTS_COLLECTION = 'quizResults';

export const getTotalUsers = async (): Promise<number> => {
  try {
    const db = getDb();
    const snap = await firestore.getDocs(firestore.collection(db, USERS_COLLECTION));
    return snap.size;
  } catch (error) {
    console.error('Failed to get total users', error);
    return 0;
  }
};

export const getActiveSessionsCount = async (): Promise<number> => {
  try {
    const db = getDb();
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const q = firestore.query(
      firestore.collection(db, QUIZ_RESULTS_COLLECTION),
      firestore.where('finishedAt', '>=', tenMinutesAgo)
    );
    const snap = await firestore.getDocs(q);
    return snap.size;
  } catch (error) {
    console.error('Failed to get active sessions count', error);
    return 0;
  }
};


