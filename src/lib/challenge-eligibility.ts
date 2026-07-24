import {
  findTeamByName,
  getRecord,
  isAirtableConfigured,
  TABLES,
} from "./airtable";
import { mapTeamChallenge, mapUser } from "./mappers";
import { MOCK_TEAMS, MOCK_USER } from "./mock-data";
import { getMockProfile } from "./mock-profile-store";
import { TeamCheckinError } from "./team-checkin";
import type { TeamChallenge, User } from "./types";

export const PARTICIPATION_DENIED_MESSAGE =
  "우리 회사·부서 챌린지만 참여할 수 있어요";

export function companiesMatch(
  userCompany?: string,
  challengeCompany?: string,
): boolean {
  const left = userCompany?.trim();
  const right = challengeCompany?.trim();
  return Boolean(left && right && left === right);
}

export function userCanParticipate(
  user: User,
  userTeamRecordId: string | null,
  challenge: TeamChallenge,
): boolean {
  if (!companiesMatch(user.company, challenge.company)) return false;
  if (!userTeamRecordId || !challenge.teamId) return false;
  return userTeamRecordId === challenge.teamId;
}

export async function loadUserForEligibility(userId: string): Promise<User> {
  if (!isAirtableConfigured() || userId.startsWith("mock-")) {
    return getMockProfile(userId) ?? { ...MOCK_USER, id: userId };
  }

  const record = await getRecord(TABLES.users, userId);
  return mapUser(record);
}

export async function resolveUserTeamRecordId(
  user: User,
): Promise<string | null> {
  const teamName = user.team?.trim();
  if (!teamName) return null;

  if (!isAirtableConfigured()) {
    return MOCK_TEAMS.find((team) => team.name.trim() === teamName)?.id ?? null;
  }

  const record = await findTeamByName(teamName);
  return record?.id ?? null;
}

export async function loadTeamChallenge(
  challengeId: string,
): Promise<TeamChallenge> {
  if (!isAirtableConfigured()) {
    const { MOCK_TEAM_CHALLENGES } = await import("./mock-data");
    const challenge = MOCK_TEAM_CHALLENGES.find((item) => item.id === challengeId);
    if (!challenge) {
      throw new TeamCheckinError("챌린지를 찾을 수 없습니다.", 404);
    }
    return challenge;
  }

  const record = await getRecord(TABLES.teamChallenges, challengeId);
  return mapTeamChallenge(record);
}

export async function evaluateParticipation(
  userId: string,
  challenge: TeamChallenge,
): Promise<boolean> {
  const user = await loadUserForEligibility(userId);
  const userTeamId = await resolveUserTeamRecordId(user);
  return userCanParticipate(user, userTeamId, challenge);
}

export async function enrichChallengesForUser(
  userId: string | null | undefined,
  challenges: TeamChallenge[],
): Promise<TeamChallenge[]> {
  if (!userId) {
    return challenges.map((challenge) => ({
      ...challenge,
      canParticipate: false,
    }));
  }

  const user = await loadUserForEligibility(userId);
  const userTeamId = await resolveUserTeamRecordId(user);

  return challenges.map((challenge) => ({
    ...challenge,
    canParticipate: userCanParticipate(user, userTeamId, challenge),
  }));
}

export async function assertUserCanCheckIn(
  userId: string,
  challengeId: string,
): Promise<TeamChallenge> {
  const challenge = await loadTeamChallenge(challengeId);
  const allowed = await evaluateParticipation(userId, challenge);
  if (!allowed) {
    throw new TeamCheckinError(PARTICIPATION_DENIED_MESSAGE, 403);
  }
  return challenge;
}
