import { getDb, firestore } from './firebase';
import { User, UserProfileStats } from '../types';

const USERS_COLLECTION = 'users';
const USER_STATS_COLLECTION = 'userStats';
const QUIZ_RESULTS_COLLECTION = 'quizResults';

export const saveUserProfile = async (user: User) => {
  try {
    const db = getDb();
    const ref = firestore.doc(db, USERS_COLLECTION, user.uid);
    await firestore.setDoc(
      ref,
      {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        photoURL: user.photoURL,
        creationTime: user.metadata.creationTime ?? null,
        lastSignInTime: user.metadata.lastSignInTime ?? null,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save user profile', error);
  }
};

export const recordQuizResult = async (params: {
  userId: string;
  topicId: string;
  topicTitle: string;
  exam: string | null;
  score: number;
  totalQuestions: number;
}) => {
  try {
    const db = getDb();
    await firestore.addDoc(firestore.collection(db, QUIZ_RESULTS_COLLECTION), {
      userId: params.userId,
      topicId: params.topicId,
      topicTitle: params.topicTitle,
      exam: params.exam,
      score: params.score,
      totalQuestions: params.totalQuestions,
      percentage: params.totalQuestions > 0 ? (params.score / params.totalQuestions) * 100 : 0,
      finishedAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to record quiz result', error);
  }
};

export const getUserStats = async (userId: string): Promise<UserProfileStats | null> => {
  try {
    const db = getDb();
    const ref = firestore.doc(db, USER_STATS_COLLECTION, userId);
    const snap = await firestore.getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserProfileStats;
  } catch (error) {
    console.error('Failed to load user stats', error);
    return null;
  }
};

export const updateUserStatsOnQuiz = async (params: {
  userId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
}) => {
  try {
    const db = getDb();
    const ref = firestore.doc(db, USER_STATS_COLLECTION, params.userId);
    const snap = await firestore.getDoc(ref);

    const percentage = params.totalQuestions > 0 ? Math.round((params.score / params.totalQuestions) * 100) : 0;

    let prev: UserProfileStats | null = null;
    if (snap.exists()) {
      prev = snap.data() as UserProfileStats;
    }

    const testsAttempted = (prev?.testsAttempted ?? 0) + 1;
    const prevAvg = prev?.averageScore ?? 0;
    const averageScore = Math.round(((prevAvg * (testsAttempted - 1) + percentage) / testsAttempted));

    const recentScores = [...(prev?.recentScores ?? []), percentage].slice(-5);

    const subjectWise = [...(prev?.subjectWise ?? [])];
    const idx = subjectWise.findIndex((s) => s.subject === params.topicTitle);
    if (idx === -1) {
      subjectWise.push({
        subject: params.topicTitle,
        accuracy: percentage,
        totalQuestions: params.totalQuestions,
        color: 'bg-blue-500',
      });
    } else {
      const sub = subjectWise[idx];
      const totalQuestions = sub.totalQuestions + params.totalQuestions;
      const newAccuracy = Math.round(
        ((sub.accuracy * sub.totalQuestions + percentage * params.totalQuestions) / totalQuestions)
      );
      subjectWise[idx] = {
        ...sub,
        accuracy: newAccuracy,
        totalQuestions,
      };
    }

    const stats: UserProfileStats = {
      targetExam: 'WBJEE',
      testsAttempted,
      averageScore,
      globalRank: prev?.globalRank ?? 0, // can be computed later via leaderboard
      subscriptionPlan: prev?.subscriptionPlan ?? 'Free',
      subjectWise,
      weakChapters: prev?.weakChapters ?? [],
      recentScores,
    };

    await firestore.setDoc(ref, stats, { merge: true });
  } catch (error) {
    console.error('Failed to update user stats after quiz', error);
  }
};


