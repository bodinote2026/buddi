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
  district?: string;
  intro?: string;
  interests?: string[];
}

export interface User {
  id: string;
  name: string;
  totalStreakDays: number;
  temperature?: number;
  avatarUrl?: string;
  nickname?: string;
  /** name || nickname — for UI display */
  displayName: string;
  company?: string;
  team?: string;
  mileage?: number;
  completedChallenges?: number;
  buddyCount?: number;
  trustPercentile?: number;
  provider?: string;
  providerId?: string;
  email?: string;
}

export interface Team {
  id: string;
  name: string;
  points: number;
  trend: "상승" | "유지" | "하락";
}

export interface TeamChallenge {
  id: string;
  title: string;
  company: string;
  teamName: string;
  participants: number;
  completionRate: number;
  teamId?: string;
  checkedInToday?: boolean;
}

export interface TeamChallengeParticipant {
  id: string;
  userId: string;
  nickname: string;
  pointsEarned: number;
  streakDays: number;
  lastCheckinAt?: string;
}

export interface TeamChallengeDetail {
  challenge: TeamChallenge;
  participants: TeamChallengeParticipant[];
  myRecord: TeamChallengeParticipant | null;
  currentUserId?: string | null;
}

export interface TeamCheckinResult {
  challenge: TeamChallenge;
  participant: TeamChallengeParticipant;
  mileage: number;
}

export interface StoreItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  badge?: "인기" | "신상" | null;
  imageUrl?: string;
  isFeatured: boolean;
  emoji?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
