import { MOCK_USER } from "./mock-data";
import type { TeamChallengeParticipant } from "./types";

/** Points awarded per successful team challenge check-in. */
export const TEAM_CHECKIN_POINTS = 50;

const participants = new Map<string, TeamChallengeParticipant>();
const mileageByUser = new Map<string, number>();
const teamPoints = new Map<string, number>();

function storeKey(userId: string, challengeId: string) {
  return `${userId}:${challengeId}`;
}

export function getMockMileage(userId: string): number {
  return mileageByUser.get(userId) ?? MOCK_USER.mileage ?? 0;
}

export function getMockTeamPoints(teamId: string, fallback: number): number {
  return teamPoints.get(teamId) ?? fallback;
}

export function setMockTeamPoints(teamId: string, points: number) {
  teamPoints.set(teamId, points);
}

export function findMockParticipant(
  userId: string,
  challengeId: string,
): TeamChallengeParticipant | undefined {
  return participants.get(storeKey(userId, challengeId));
}

export function listMockParticipantsForChallenge(
  challengeId: string,
): TeamChallengeParticipant[] {
  const out: TeamChallengeParticipant[] = [];
  for (const [k, p] of participants) {
    if (k.endsWith(`:${challengeId}`)) out.push(p);
  }
  return out.sort((a, b) => b.pointsEarned - a.pointsEarned);
}

export function upsertMockParticipant(
  userId: string,
  challengeId: string,
  nickname: string,
  pointsEarned: number,
  streakDays: number,
  lastCheckinAt: string,
): TeamChallengeParticipant {
  const existing = participants.get(storeKey(userId, challengeId));
  const record: TeamChallengeParticipant = {
    id: existing?.id ?? `tcp-mock-${userId}-${challengeId}`,
    userId,
    nickname,
    pointsEarned,
    streakDays,
    lastCheckinAt,
  };
  participants.set(storeKey(userId, challengeId), record);
  return record;
}

export function addMockMileage(userId: string, delta: number): number {
  const next = getMockMileage(userId) + delta;
  mileageByUser.set(userId, next);
  return next;
}
