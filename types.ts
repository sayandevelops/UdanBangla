
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  id: number | string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizConfig {
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
}

export enum QuizStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface TopicDef {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
}

export interface User {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface SubjectPerformance {
  subject: string;
  accuracy: number; // 0-100
  totalQuestions: number;
  color: string;
}

export interface UserProfileStats {
  targetExam: string;
  testsAttempted: number;
  averageScore: number;
  globalRank: number;
  subscriptionPlan: 'Free' | 'Pro' | 'Elite';
  subjectWise: SubjectPerformance[];
  weakChapters: string[];
  recentScores: number[]; // Last 5 scores
}
