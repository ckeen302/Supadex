export type QuestionType = 
  | 'name' 
  | 'type' 
  | 'move' 
  | 'stat' 
  | 'ability'
  | 'evolution'
  | 'location'
  | 'cry'
  | 'silhouette'
  | 'pokedex'
  | 'effectiveness';

export type QuizMode = 'standard' | 'timeAttack' | 'survival' | 'daily' | 'challenge';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: Date;
}

export interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  highestStreak: number;
  achievements: Achievement[];
  experiencePoints: number;
  level: number;
}

export interface QuizHistory {
  id: string;
  date: Date;
  mode: QuizMode;
  difficulty: Difficulty;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  points: number;
  question: string;
  options: string[];
  correctAnswer: string;
  imageUrl?: string;
  soundUrl?: string;
  hint?: string;
}

