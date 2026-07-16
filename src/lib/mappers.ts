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

function pickField(
  fields: Record<string, unknown>,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = asString(fields[key]);
    if (value) return value;
  }
  return fallback;
}

function pickFieldByKeyHint(
  fields: Record<string, unknown>,
  hints: string[],
): string {
  for (const [key, value] of Object.entries(fields)) {
    const lower = key.toLowerCase();
    if (!hints.some((hint) => lower.includes(hint))) continue;
    const parsed = asString(value);
    if (parsed) return parsed;
  }
  return "";
}

function findLinkedChallengeId(
  fields: Record<string, unknown>,
  challengeById: Map<string, AirtableRecord>,
): string | undefined {
  const UC = FIELDS.userChallenges;
  const linkFieldNames = [UC.challenge, "Challenge", "Challenges"];

  for (const key of linkFieldNames) {
    const id = asLinkId(fields[key]);
    if (id && challengeById.has(id)) return id;
  }

  for (const value of Object.values(fields)) {
    const id = asLinkId(value);
    if (id && challengeById.has(id)) return id;
  }

  return undefined;
}

export function mapUserChallenge(
  record: AirtableRecord,
  challengeById?: Map<string, AirtableRecord>,
): Challenge {
  const f = record.fields;
  const UC = FIELDS.userChallenges;

  let emoji = pickField(
    f,
    [UC.challengeEmoji, "Challenge Emoji", "Emoji (from Challenges)"],
  );
  let title = pickField(
    f,
    [UC.challengeTitle, "Challenge Title", "Title (from Challenges)"],
  );
  let description = pickField(f, [
    UC.challengeDescription,
    "Challenge Description",
    "Description (from Challenges)",
  ]);

  if (!emoji) emoji = pickFieldByKeyHint(f, ["emoji"]);
  if (!title) title = pickFieldByKeyHint(f, ["title"]);
  if (!description) description = pickFieldByKeyHint(f, ["description"]);

  if (challengeById) {
    const challengeLinkId = findLinkedChallengeId(f, challengeById);
    if (challengeLinkId) {
      const linked = challengeById.get(challengeLinkId);
      if (linked) {
        const C = FIELDS.challenges;
        const cf = linked.fields;
        const linkedTitle = asString(cf[C.title]);
        const linkedEmoji = asString(cf[C.emoji]);
        const linkedDescription = asString(cf[C.description]);
        if (linkedTitle) title = linkedTitle;
        if (linkedEmoji) emoji = linkedEmoji;
        if (linkedDescription) description = linkedDescription;
      }
    }
  }

  return {
    id: record.id,
    emoji: emoji || "💪",
    title: title || "챌린지",
    description,
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
  const teamName =
    asString(f[TC.teamName]) || asString(f[TC.teamNameFromTeam]);
  return {
    id: record.id,
    title: asString(f[TC.title]),
    company: asString(f[TC.company]),
    teamName,
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
