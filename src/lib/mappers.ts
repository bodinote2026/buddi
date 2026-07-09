import type { AirtableRecord } from "./airtable";
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
  return {
    id: record.id,
    name: asString(f.name, "한지우"),
    totalStreakDays: asNumber(f.totalStreakDays),
    temperature: asNumber(f.temperature),
    avatarUrl: asAttachmentUrl(f.avatarUrl),
  };
}

export function mapUserChallenge(record: AirtableRecord): Challenge {
  const f = record.fields;
  return {
    id: record.id,
    emoji: asString(f.challengeEmoji, "💪"),
    title: asString(f.challengeTitle, "챌린지"),
    description: asString(f.challengeDescription),
    progress: asNumber(f.progress),
    streakDays: asNumber(f.streakDays),
  };
}

export function mapChallenge(record: AirtableRecord): ExploreChallenge {
  const f = record.fields;
  return {
    id: record.id,
    emoji: asString(f.emoji, "💪"),
    title: asString(f.title, "챌린지"),
    description: asString(f.description),
    category: asString(f.category, "운동"),
  };
}

export function mapBuddy(record: AirtableRecord): Buddy {
  const f = record.fields;
  return {
    id: record.id,
    name: asString(f.name),
    age: asNumber(f.age),
    temperature: asNumber(f.temperature),
    category: asString(f.category),
    distanceKm: asNumber(f.distanceKm),
    avatarUrl:
      asAttachmentUrl(f.avatarUrl) ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(asString(f.name, record.id))}`,
  };
}
