export interface Challenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  progress: number;
  streakDays: number;
}

export interface ExploreChallenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: string;
}

export interface Buddy {
  id: string;
  name: string;
  age: number;
  temperature: number;
  category: string;
  distanceKm: number;
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  totalStreakDays: number;
  temperature?: number;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
