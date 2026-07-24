import { FIELDS, type AirtableRecord } from "./airtable";
import { getDisplayName } from "./format";
import { MOCK_CHALLENGES } from "./mock-data";
import type {
  Buddy,
  Challenge,
  ExploreChallenge,
  StoreItem,
  Team,
  TeamChallenge,
  TeamChallengeParticipant,
  User,
  PointLedgerEntry,
  PointLedgerType,
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
  if (typeof value === "string" && value.startsWith("rec")) return value;
  if (Array.isArray(value)) {
    if (typeof value[0] === "string") return value[0];
    if (value[0] && typeof value[0] === "object") {
      const id = (value[0] as { id?: string }).id;
      if (typeof id === "string") return id;
    }
  }
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
    age: (() => {
      const value = f[U.age];
      return typeof value === "number" && value > 0
        ? Math.floor(value)
        : undefined;
    })(),
    intro: asString(f[U.intro]) || undefined,
    interests: (() => {
      const values = asStringArray(f[U.interests]);
      return values.length > 0 ? values : undefined;
    })(),
  };
}

export function mapUserToBuddy(record: AirtableRecord): Buddy {
  const user = mapUser(record);
  const nickname = user.nickname ?? user.displayName;
  return {
    id: user.id,
    name: nickname,
    age: user.age,
    temperature: user.temperature ?? 36.5,
    company: user.company ?? "",
    team: user.team ?? "",
    intro: user.intro,
    interests: user.interests,
    avatarUrl: user.avatarUrl?.trim() || undefined,
  };
}

function pickNonPlaceholderField(
  fields: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = asString(fields[key]);
    if (value && !isPlaceholderTitle(value)) return value;
  }
  return "";
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

function titlesMatch(a: string, b: string): boolean {
  const normalize = (value: string) =>
    value.replace(/\s*\([^)]*\)\s*/g, "").trim();
  const left = normalize(a);
  const right = normalize(b);
  return (
    left === right ||
    left.startsWith(right) ||
    right.startsWith(left) ||
    left.includes(right) ||
    right.includes(left)
  );
}

function resolveChallengeDetails(
  title: string,
  challengeById: Map<string, AirtableRecord>,
): { emoji: string; description: string } {
  const C = FIELDS.challenges;
  for (const record of challengeById.values()) {
    const challengeTitle = asString(record.fields[C.title]);
    if (!challengeTitle || !titlesMatch(title, challengeTitle)) continue;
    return {
      emoji: asString(record.fields[C.emoji]),
      description: asString(record.fields[C.description]),
    };
  }
  return { emoji: "", description: "" };
}

function isPlaceholderTitle(title: string): boolean {
  const trimmed = title.trim();
  return (
    !trimmed ||
    trimmed === "챌린지" ||
    trimmed === "-" ||
    trimmed === " - "
  );
}

function resolveByProgressStreak(
  progress: number,
  streakDays: number,
  challengeById: Map<string, AirtableRecord>,
): { title: string; emoji: string; description: string } | null {
  const seed = MOCK_CHALLENGES.find(
    (challenge) =>
      challenge.progress === progress && challenge.streakDays === streakDays,
  );
  if (!seed) return null;

  const matched = resolveChallengeDetails(seed.title, challengeById);
  return {
    title: seed.title,
    emoji: matched.emoji || seed.emoji,
    description: matched.description || seed.description,
  };
}

export function mapUserChallenge(
  record: AirtableRecord,
  challengeById?: Map<string, AirtableRecord>,
): Challenge {
  const f = record.fields;
  const UC = FIELDS.userChallenges;
  const progress = asNumber(f[UC.progress]);
  const streakDays = asNumber(f[UC.streakDays]);

  let emoji = pickNonPlaceholderField(f, [
    UC.challengeEmoji,
    "Challenge Emoji",
    "Emoji (from Challenges)",
    "Emoji (from Challenge)",
  ]);
  let title = pickNonPlaceholderField(f, [
    UC.challengeTitle,
    "Challenge Title",
    "Title (from Challenges)",
    "Title (from Challenge)",
    UC.name,
  ]);
  let description = pickNonPlaceholderField(f, [
    UC.challengeDescription,
    "Challenge Description",
    "Description (from Challenges)",
    "Description (from Challenge)",
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
    } else if (title && !isPlaceholderTitle(title)) {
      const matched = resolveChallengeDetails(title, challengeById);
      if (matched.emoji) emoji = matched.emoji;
      if (matched.description) description = matched.description;
    }

    if (
      isPlaceholderTitle(title) ||
      !emoji ||
      emoji === "💪" ||
      !description
    ) {
      const seeded = resolveByProgressStreak(progress, streakDays, challengeById);
      if (seeded) {
        title = seeded.title;
        emoji = seeded.emoji;
        description = seeded.description;
      }
    }
  }

  return {
    id: record.id,
    emoji: emoji || "💪",
    title: title || "챌린지",
    description,
    progress,
    streakDays,
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
  const ageValue = asNumber(f[B.age]);
  return {
    id: record.id,
    name,
    age: ageValue > 0 ? ageValue : undefined,
    temperature: asNumber(f[B.temperature], 36.5),
    company: "",
    team: asString(f[B.district]) || asString(f[B.category]),
    intro: asString(f[B.intro]) || undefined,
    interests: (() => {
      const values = asStringArray(f[B.interests]);
      return values.length > 0 ? values : undefined;
    })(),
    avatarUrl: asAttachmentUrl(f[B.avatarUrl]) || undefined,
  };
}

export function mapTeam(record: AirtableRecord): Team {
  const f = record.fields;
  const T = FIELDS.teams;
  const company = asString(f[T.company]);
  return {
    id: record.id,
    name: asString(f[T.name]),
    company: company || undefined,
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
    createdTime: record.createdTime,
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
  const stockRaw = f[S.stock];
  const stock =
    typeof stockRaw === "number" && !Number.isNaN(stockRaw) ? stockRaw : 99;
  const isActiveRaw = f[S.isActive];
  const isActive =
    isActiveRaw === undefined || isActiveRaw === null
      ? true
      : Boolean(isActiveRaw);

  return {
    id: record.id,
    name: asString(f[S.name]),
    brand: asString(f[S.brand]),
    price: asNumber(f[S.price]),
    badge: asBadge(f[S.badge]),
    imageUrl: asAttachmentUrl(f[S.imageUrl]) || undefined,
    isFeatured: Boolean(f[S.isFeatured]),
    description: asString(f[S.description]) || undefined,
    stock,
    isActive,
  };
}

function asLedgerType(value: unknown): PointLedgerType {
  if (value === "적립" || value === "사용") return value;
  return "적립";
}

export function mapPointLedgerEntry(record: AirtableRecord): PointLedgerEntry {
  const f = record.fields;
  const PL = FIELDS.pointLedger;
  return {
    id: record.id,
    type: asLedgerType(f[PL.type]),
    amount: asNumber(f[PL.amount]),
    reason: asString(f[PL.reason]),
    balanceAfter: asNumber(f[PL.balanceAfter]),
    createdAt: record.createdTime ?? new Date().toISOString(),
  };
}
