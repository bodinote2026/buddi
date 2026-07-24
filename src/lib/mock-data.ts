import type {
  Buddy,
  Challenge,
  ExploreChallenge,
  StoreItem,
  Team,
  TeamChallenge,
  User,
} from "./types";

export const MOCK_USER: User = {
  id: "user-1",
  name: "한지우",
  totalStreakDays: 21,
  temperature: 36.9,
  avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=hanjiwoo",
  nickname: "jiwoo_run",
  displayName: "한지우",
  company: "바디노트",
  team: "마케팅 1팀",
  mileage: 2450,
  completedChallenges: 28,
  buddyCount: 17,
  trustPercentile: 5,
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
];

export const MOCK_TEAMS: Team[] = [
  {
    id: "team-1",
    name: "마케팅 1팀",
    company: "바디노트",
    points: 18420,
    trend: "상승",
  },
  {
    id: "team-2",
    name: "개발본부",
    company: "바디노트",
    points: 16780,
    trend: "유지",
  },
  {
    id: "team-3",
    name: "디자인팀",
    company: "바디노트",
    points: 14250,
    trend: "상승",
  },
  {
    id: "team-4",
    name: "영업 2팀",
    company: "바디노트",
    points: 12900,
    trend: "하락",
  },
  {
    id: "team-5",
    name: "경영지원팀",
    company: "바디노트",
    points: 11340,
    trend: "하락",
  },
];

export const MOCK_TEAM_CHALLENGES: TeamChallenge[] = [
  {
    id: "tc-1",
    title: "2주 만보 걷기 챌린지",
    company: "바디노트",
    teamName: "마케팅 1팀",
    teamId: "team-1",
    participants: 0,
    completionRate: 84,
    createdTime: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "tc-2",
    title: "점심 스트레칭 챌린지",
    company: "바디노트",
    teamName: "개발본부",
    teamId: "team-2",
    participants: 0,
    completionRate: 67,
    createdTime: "2026-07-12T09:00:00.000Z",
  },
  {
    id: "tc-3",
    title: "계단 오르기 챌린지",
    company: "버핏그라운드",
    teamName: "디자인팀",
    teamId: "team-3",
    participants: 0,
    completionRate: 58,
    createdTime: "2026-07-14T09:00:00.000Z",
  },
];

export const BUDDY_AVATAR_URLS = {} as const;

export const MOCK_BUDDIES: Buddy[] = [];

export const MOCK_STORE_ITEMS: StoreItem[] = [
  {
    id: "si-1",
    name: "바디노트 헬시 스낵 팩",
    brand: "BodyNote",
    price: 10000,
    badge: "인기",
    isFeatured: true,
    emoji: "🥗",
    description:
      "견과류, 건과일, 프로틴 바가 들어 있는 건강 스낵 구성. 출근 전·운동 후 간편하게 드세요.",
    stock: 24,
    isActive: true,
  },
  {
    id: "si-2",
    name: "버핏그라운드 러닝 기어 세트",
    brand: "Buffett Ground",
    price: 35000,
    badge: "신상",
    isFeatured: true,
    emoji: "🏃",
    description:
      "러닝 벨트, 스포츠 양말, 휴대용 수건이 포함된 러닝 스타터 키트입니다.",
    stock: 8,
    isActive: true,
  },
  {
    id: "si-3",
    name: "퍼플 보온 텀블러",
    brand: "BUDDI",
    price: 9000,
    isFeatured: false,
    emoji: "🥤",
    description: "500ml 스테인리스 보온 텀블러. BUDDI 시그니처 퍼플 컬러.",
    stock: 0,
    isActive: true,
  },
  {
    id: "si-4",
    name: "민트 요가 매트",
    brand: "BUDDI",
    price: 15000,
    isFeatured: false,
    emoji: "🧘",
    description: "미끄럼 방지 TPE 소재 6mm 요가 매트. 집·스튜디오 모두 사용 가능.",
    stock: 15,
    isActive: true,
  },
  {
    id: "si-5",
    name: "헬시 카페 음료 교환권",
    brand: "Green Cafe",
    price: 6000,
    isFeatured: false,
    emoji: "☕",
    description: "제휴 카페에서 아메리카노 또는 라떼 1잔으로 교환 가능한 모바일 쿠폰.",
    stock: 50,
    isActive: true,
  },
];

export const INTEREST_OPTIONS = ["운동", "맛집", "여행"] as const;

export const INTEREST_STYLES: Record<string, { emoji: string; className: string }> = {
  운동: { emoji: "🏋", className: "bg-primary-light text-primary" },
  맛집: { emoji: "🍽", className: "bg-[#F5EDE3] text-[#A67C52]" },
  여행: { emoji: "✈", className: "bg-[#E5F7F2] text-[#2A9B7A]" },
};

export const CONNECTED_DEVICES = [
  {
    id: "d-1",
    name: "바디노트 스마트 밴드",
    description: "심박 · 수면 측정",
    status: "connected" as const,
  },
  {
    id: "d-2",
    name: "바디노트 체성분 측정기",
    description: "체지방 · 근육량",
    status: "connected" as const,
  },
  {
    id: "d-3",
    name: "Apple Health",
    description: "걸음 수 · 운동 기록",
    status: "link" as const,
  },
] as const;

export const PROFILE_SETTINGS = [
  { id: "s-1", label: "알림 설정", emoji: "🔔" },
  { id: "s-2", label: "개인정보 보호", emoji: "🛡" },
  { id: "s-3", label: "환경 설정", emoji: "⚙" },
] as const;
