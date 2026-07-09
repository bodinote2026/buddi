import { FIELDS, type AirtableRecord } from "./airtable";
import type { Buddy, Challenge, ExploreChallenge, User } from "./types";

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function asAttachmentUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value[0] && typeof value[0] === "object") {
    const first = value[0] as { url?: string };
    if (typeof first.url === "string") return first.url;
  }
  return "";
}

export function mapUser(record: AirtableRecord): User {
  const f = record.fields;
  const U = FIELDS.users;
  return {
    id: record.id,
    name: asString(f[U.name], "한지우"),
    totalStreakDays: asNumber(f[U.totalStreakDays]),
    temperature: asNumber(f[U.temperature]),
    avatarUrl: asAttachmentUrl(f[U.avatarUrl]),
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
    avatarUrl:
      asAttachmentUrl(f[B.avatarUrl]) ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name || record.id)}`,
  };
}
