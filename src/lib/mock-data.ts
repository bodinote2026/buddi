import type { Buddy, Challenge, ExploreChallenge, User } from "./types";

export const MOCK_USER: User = {
  id: "user-1",
  name: "한지우",
  totalStreakDays: 21,
  temperature: 94,
  avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=hanjiwoo",
};

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "uc-1",
    emoji: "💊",
    title: "아침 비타민 챌린지",
    description: "매일 오전 8시 영양제 인증",
    progress: 72,
    streakDays: 13,
  },
  {
    id: "uc-2",
    emoji: "🌅",
    title: "얼리버드 기상 챌린지",
    description: "매일 오전 6시 기상 인증",
    progress: 45,
    streakDays: 6,
  },
  {
    id: "uc-3",
    emoji: "💧",
    title: "하루 2L 물 마시기",
    description: "하루 8잔 수분 섭취",
    progress: 88,
    streakDays: 21,
  },
];

export const MOCK_EXPLORE_CHALLENGES: ExploreChallenge[] = [
  {
    id: "ch-1",
    emoji: "💊",
    title: "아침 비타민 챌린지",
    description: "매일 오전 8시 영양제 인증",
    category: "영양제",
  },
  {
    id: "ch-2",
    emoji: "🌅",
    title: "얼리버드 기상 챌린지",
    description: "매일 오전 6시 기상 인증",
    category: "기상",
  },
  {
    id: "ch-3",
    emoji: "💧",
    title: "하루 2L 물 마시기",
    description: "하루 8잔 수분 섭취",
    category: "수분",
  },
  {
    id: "ch-4",
    emoji: "🏃",
    title: "매일 30분 걷기",
    description: "하루 30분 이상 걷기 인증",
    category: "운동",
  },
  {
    id: "ch-5",
    emoji: "🥗",
    title: "건강한 한 끼 챌린지",
    description: "하루 한 끼 건강식 인증",
    category: "식단",
  },
];

export const MOCK_BUDDIES: Buddy[] = [
  {
    id: "buddy-1",
    name: "김서연",
    age: 28,
    temperature: 96,
    category: "러닝 메이트",
    distanceKm: 1.2,
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=seoyeon",
  },
  {
    id: "buddy-2",
    name: "이준호",
    age: 31,
    temperature: 88,
    category: "저녁 식사 파트너",
    distanceKm: 0.8,
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=junho",
  },
  {
    id: "buddy-3",
    name: "박지민",
    age: 26,
    temperature: 92,
    category: "클라이밍 버디",
    distanceKm: 2.4,
    avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=jimin",
  },
];

export const BUDDY_FILTERS = [
  "전체",
  "러닝",
  "식사",
  "클라이밍",
  "헬스",
] as const;

export const CHALLENGE_CATEGORIES = [
  "전체",
  "영양제",
  "기상",
  "수분",
  "운동",
  "식단",
] as const;

export const STORE_PRODUCTS = [
  {
    id: "p-1",
    name: "멀티비타민 30일분",
    points: 1200,
    emoji: "💊",
  },
  {
    id: "p-2",
    name: "요가 매트",
    points: 2500,
    emoji: "🧘",
  },
  {
    id: "p-3",
    name: "텀블러 500ml",
    points: 800,
    emoji: "🥤",
  },
  {
    id: "p-4",
    name: "프로틴바 12개입",
    points: 1500,
    emoji: "🍫",
  },
] as const;
