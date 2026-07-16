import { FIELDS, type AirtableRecord } from "./airtable";
import { getDisplayName } from "./format";
import type {
  Buddy,
  Challenge,
  ExploreChallenge,
  StoreItem,
  Team,
  TeamChallenge,
  TeamChallengeParticipant,
  User,
} from "./types";

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function asAttachmentUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value[0] && typeof value[0] === "object") {
    const first = value[0] as { url?: string };
    if (typeof first.url === "string") return first.url;
  }
  return "";
}

function asTrend(value: unknown): Team["trend"] {
  if (value === "상승" || value === "유지" || value === "하락") return value;
  return "유지";
}

function asLinkId(value: unknown): string | undefined {
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function asBadge(value: unknown): StoreItem["badge"] {
  if (value === "인기" || value === "신상") return value;
  return null;
}

export function mapUser(record: AirtableRecord): User {
  const f = record.fields;
  const U = FIELDS.users;
  const name = asString(f[U.name]);
  const nickname = asString(f[U.nickname], "jiwoo_run");
  return {
    id: record.id,
    name,
    totalStreakDays: asNumber(f[U.totalStreakDays]),
    temperature: asNumber(f[U.temperature]),
    avatarUrl: asAttachmentUrl(f[U.avatarUrl]),
    nickname,
    displayName: getDisplayName({ name, nickname }),
    company: asString(f[U.company]) || undefined,
    team: asString(f[U.team]) || undefined,
    mileage: asNumber(f[U.mileage]),
    completedChallenges: asNumber(f[U.completedChallenges]),
    buddyCount: asNumber(f[U.buddyCount]),
    trustPercentile: asNumber(f[U.trustPercentile]) || undefined,
    provider: asString(f[U.provider]) || undefined,
    providerId: asString(f[U.providerId]) || undefined,
    email: asString(f[U.email]) || undefined,
  };
}

export function mapUserChallenge(record: AirtableRecord): Challenge {
  const f = record.fields;
  const UC = FIELDS.userChallenges;
  return {
    id: record.id,
    emoji: asString(f[UC.challengeEmoji], "💪"),
    title: asString(f[UC.challengeTitle], "챌린지"),
    description: asString(f[UC.challengeDescription]),
    progress: asNumber(f[UC.progress]),
    streakDays: asNumber(f[UC.streakDays]),
  };
}

export function mapChallenge(record: AirtableRecord): ExploreChallenge {
  const f = record.fields;
  const C = FIELDS.challenges;
  return {
    id: record.id,
    emoji: asString(f[C.emoji], "💪"),
    title: asString(f[C.title], "챌린지"),
    description: asString(f[C.description]),
    category: asString(f[C.category], "운동"),
  };
}

export function mapBuddy(record: AirtableRecord): Buddy {
  const f = record.fields;
  const B = FIELDS.buddies;
  const name = asString(f[B.name]);
  return {
    id: record.id,
    name,
    age: asNumber(f[B.age]),
    temperature: asNumber(f[B.temperature]),
    category: asString(f[B.category]),
    distanceKm: asNumber(f[B.distanceKm]),
    district: asString(f[B.district]),
    intro: asString(f[B.intro]),
    interests: asStringArray(f[B.interests]),
    avatarUrl:
      asAttachmentUrl(f[B.avatarUrl]) ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || record.id)}`,
  };
}

export function mapTeam(record: AirtableRecord): Team {
  const f = record.fields;
  const T = FIELDS.teams;
  return {
    id: record.id,
    name: asString(f[T.name]),
    points: asNumber(f[T.points]),
    trend: asTrend(f[T.trend]),
  };
}

export function mapTeamChallenge(record: AirtableRecord): TeamChallenge {
  const f = record.fields;
  const TC = FIELDS.teamChallenges;
  return {
    id: record.id,
    title: asString(f[TC.title]),
    company: asString(f[TC.company]),
    teamName: asString(f[TC.teamName]),
    participants: 0,
    completionRate: asNumber(f[TC.completionRate]),
    teamId: asLinkId(f[TC.team]),
  };
}

export function mapTeamChallengeParticipant(
  record: AirtableRecord,
): TeamChallengeParticipant {
  const f = record.fields;
  const P = FIELDS.teamChallengeParticipants;
  const userId = asLinkId(f[P.user]) ?? "";
  return {
    id: record.id,
    userId,
    nickname: asString(f[P.nickname], "버디"),
    pointsEarned: asNumber(f[P.pointsEarned]),
    streakDays: asNumber(f[P.streakDays]),
    lastCheckinAt: asString(f[P.lastCheckinAt]) || undefined,
  };
}

export function mapStoreItem(record: AirtableRecord): StoreItem {
  const f = record.fields;
  const S = FIELDS.storeItems;
  return {
    id: record.id,
    name: asString(f[S.name]),
    brand: asString(f[S.brand]),
    price: asNumber(f[S.price]),
    badge: asBadge(f[S.badge]),
    imageUrl: asAttachmentUrl(f[S.imageUrl]) || undefined,
    isFeatured: Boolean(f[S.isFeatured]),
  };
}
