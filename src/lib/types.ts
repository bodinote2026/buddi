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
  /** Nickname shown on buddy cards */
  name: string;
  age?: number;
  temperature: number;
  company: string;
  team: string;
  avatarUrl?: string;
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
  age?: number;
  intro?: string;
  interests?: string[];
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
  /** Logged-in user's streak; omitted when no participation record exists. */
  myStreakDays?: number;
  /** Whether the current user can check in to this challenge. */
  canParticipate?: boolean;
  createdTime?: string;
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
  canParticipate?: boolean;
}

export interface TeamCheckinResult {
  challenge: TeamChallenge;
  participant: TeamChallengeParticipant;
  mileage: number;
}

export type PointLedgerType = "적립" | "사용";

export interface PointLedgerEntry {
  id: string;
  type: PointLedgerType;
  amount: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

export interface PointHistoryResponse {
  balance: number;
  entries: PointLedgerEntry[];
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
  description?: string;
  stock: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
