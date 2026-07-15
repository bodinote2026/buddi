import type { Session } from "next-auth";
import {
  AirtableApiError,
  createRecord,
  FIELDS,
  getRecord,
  isAirtableConfigured,
  listRecords,
  resolveSessionAirtableUserId,
  TABLES,
  updateRecord,
} from "@/lib/airtable";
import {
  mapTeamChallenge,
  mapTeamChallengeParticipant,
  mapUser,
} from "@/lib/mappers";
import {
  addMockMileage,
  findMockParticipant,
  getMockTeamPoints,
  listMockParticipantsForChallenge,
  setMockTeamPoints,
  TEAM_CHECKIN_POINTS,
  upsertMockParticipant,
} from "@/lib/mock-participants-store";
import {
  MOCK_TEAM_CHALLENGES,
  MOCK_TEAMS,
  MOCK_USER,
} from "@/lib/mock-data";
import type {
  TeamChallenge,
  TeamChallengeParticipant,
  TeamCheckinResult,
} from "@/lib/types";

export { TEAM_CHECKIN_POINTS };

export class TeamCheckinError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "TeamCheckinError";
  }
}

function todayDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function isCheckedInToday(lastCheckinAt?: string): boolean {
  if (!lastCheckinAt) return false;
  const day = lastCheckinAt.slice(0, 10);
  return day === todayDateKey();
}

function computeStreak(
  existing: TeamChallengeParticipant | undefined,
  now: Date,
): number {
  if (!existing?.lastCheckinAt) return 1;
  const lastDay = existing.lastCheckinAt.slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (lastDay === todayDateKey(yesterday)) {
    return existing.streakDays + 1;
  }
  return 1;
}

function escapeFormulaValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function findParticipantRecord(
  userId: string,
  challengeId: string,
): Promise<{ record: import("@/lib/airtable").AirtableRecord | null }> {
  const P = FIELDS.teamChallengeParticipants;
  const formula = `AND({${P.user}}="${escapeFormulaValue(userId)}",{${P.teamChallenge}}="${escapeFormulaValue(challengeId)}")`;
  const records = await listRecords(TABLES.teamChallengeParticipants, {
    filterByFormula: formula,
    maxRecords: "1",
  });
  return { record: records[0] ?? null };
}

function completionBump(): number {
  return 2 + Math.floor(Math.random() * 4);
}

async function bumpTeamChallengeCompletion(
  challengeId: string,
): Promise<TeamChallenge> {
  const TC = FIELDS.teamChallenges;
  const current = await getRecord(TABLES.teamChallenges, challengeId);
  const rate = Number(current.fields[TC.completionRate] ?? 0);
  const updated = await updateRecord(TABLES.teamChallenges, challengeId, {
    [TC.completionRate]: Math.min(100, rate + completionBump()),
  });
  return mapTeamChallenge(updated);
}

function mockTeamIdForChallenge(challengeId: string): string {
  const c = MOCK_TEAM_CHALLENGES.find((x) => x.id === challengeId);
  return c?.teamId ?? MOCK_TEAMS[0]?.id ?? "team-1";
}

function mockCheckin(
  userId: string,
  nickname: string,
  challengeId: string,
): TeamCheckinResult {
  const mock = MOCK_TEAM_CHALLENGES.find((c) => c.id === challengeId);
  if (!mock) throw new TeamCheckinError("챌린지를 찾을 수 없습니다.", 404);

  const existing = findMockParticipant(userId, challengeId);
  if (isCheckedInToday(existing?.lastCheckinAt)) {
    throw new TeamCheckinError("오늘은 이미 인증했어요.", 409);
  }

  const now = new Date().toISOString();
  const streak = computeStreak(existing, new Date());
  const pointsEarned = (existing?.pointsEarned ?? 0) + TEAM_CHECKIN_POINTS;

  const participant = upsertMockParticipant(
    userId,
    challengeId,
    nickname,
    pointsEarned,
    streak,
    now,
  );

  const mileage = addMockMileage(userId, TEAM_CHECKIN_POINTS);

  const teamId = mock.teamId ?? mockTeamIdForChallenge(challengeId);
  const teamFallback =
    MOCK_TEAMS.find((t) => t.id === teamId)?.points ?? 0;
  const teamPoints = getMockTeamPoints(teamId, teamFallback) + TEAM_CHECKIN_POINTS;
  setMockTeamPoints(teamId, teamPoints);

  const challenge: TeamChallenge = {
    ...mock,
    completionRate: Math.min(100, mock.completionRate + completionBump()),
    participants: existing ? mock.participants : mock.participants + 1,
    checkedInToday: true,
  };

  return { challenge, participant, mileage };
}

async function airtableCheckin(
  userId: string,
  _nickname: string,
  challengeId: string,
): Promise<TeamCheckinResult> {
  const P = FIELDS.teamChallengeParticipants;
  const TC = FIELDS.teamChallenges;
  const U = FIELDS.users;
  const T = FIELDS.teams;

  const challengeRecord = await getRecord(TABLES.teamChallenges, challengeId);
  const challengeBase = mapTeamChallenge(challengeRecord);
  const teamLinkId = challengeBase.teamId;

  const { record: existingRecord } = await findParticipantRecord(
    userId,
    challengeId,
  );

  const existingParticipant = existingRecord
    ? mapTeamChallengeParticipant(existingRecord)
    : undefined;

  if (isCheckedInToday(existingParticipant?.lastCheckinAt)) {
    throw new TeamCheckinError("오늘은 이미 인증했어요.", 409);
  }

  const now = new Date().toISOString();
  const streak = computeStreak(existingParticipant, new Date());
  const pointsEarned =
    (existingParticipant?.pointsEarned ?? 0) + TEAM_CHECKIN_POINTS;

  let participant: TeamChallengeParticipant;
  let step = "participant";

  try {
    if (existingRecord) {
      const updated = await updateRecord(
        TABLES.teamChallengeParticipants,
        existingRecord.id,
        {
          [P.pointsEarned]: pointsEarned,
          [P.streakDays]: streak,
          [P.lastCheckinAt]: now,
        },
      );
      participant = mapTeamChallengeParticipant(updated);
    } else {
      const created = await createRecord(TABLES.teamChallengeParticipants, {
        [P.user]: [userId],
        [P.teamChallenge]: [challengeId],
        [P.pointsEarned]: TEAM_CHECKIN_POINTS,
        [P.streakDays]: 1,
        [P.lastCheckinAt]: now,
      });
      participant = mapTeamChallengeParticipant(created);

      const currentParticipants = Number(
        challengeRecord.fields[TC.participants] ?? 0,
      );
      await updateRecord(TABLES.teamChallenges, challengeId, {
        [TC.participants]: currentParticipants + 1,
      });
    }
  } catch (err) {
    console.error("[team-checkin] participant upsert failed", { step, err });
    throw err;
  }

  step = "user-mileage";
  let mileage = 0;
  try {
    const userRecord = await getRecord(TABLES.users, userId);
    const user = mapUser(userRecord);
    mileage = (user.mileage ?? 0) + TEAM_CHECKIN_POINTS;
    await updateRecord(TABLES.users, userId, {
      [U.mileage]: mileage,
    });
  } catch (err) {
    console.error("[team-checkin] user mileage update failed", { step, err });
    throw err;
  }

  if (teamLinkId) {
    step = "team-points";
    try {
      const teamRecord = await getRecord(TABLES.teams, teamLinkId);
      const currentPoints = Number(teamRecord.fields[T.points] ?? 0);
      await updateRecord(TABLES.teams, teamLinkId, {
        [T.points]: currentPoints + TEAM_CHECKIN_POINTS,
      });
    } catch (err) {
      console.error("[team-checkin] team points update failed", { step, err });
      throw err;
    }
  }

  step = "completion-rate";
  let challenge: TeamChallenge;
  try {
    challenge = await bumpTeamChallengeCompletion(challengeId);
    challenge = { ...challenge, checkedInToday: true };
  } catch (err) {
    console.error("[team-checkin] completion rate update failed", { step, err });
    throw err;
  }

  return { challenge, participant, mileage };
}

export async function performTeamCheckin(input: {
  userId: string;
  nickname: string;
  challengeId: string;
}): Promise<TeamCheckinResult> {
  const { userId, nickname, challengeId } = input;

  if (!isAirtableConfigured()) {
    return mockCheckin(userId, nickname, challengeId);
  }

  return airtableCheckin(userId, nickname, challengeId);
}

export async function getTeamChallengeDetail(
  challengeId: string,
  userId?: string | null,
): Promise<{
  challenge: TeamChallenge;
  participants: TeamChallengeParticipant[];
  myRecord: TeamChallengeParticipant | null;
}> {
  if (!isAirtableConfigured()) {
    const challenge = MOCK_TEAM_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) throw new TeamCheckinError("챌린지를 찾을 수 없습니다.", 404);

    const participants = listMockParticipantsForChallenge(challengeId);
    const uid = userId ?? MOCK_USER.id;
    const my = findMockParticipant(uid, challengeId) ?? null;

    return {
      challenge: {
        ...challenge,
        checkedInToday: isCheckedInToday(my?.lastCheckinAt),
      },
      participants,
      myRecord: my,
    };
  }

  const challengeRecord = await getRecord(TABLES.teamChallenges, challengeId);
  const challenge = mapTeamChallenge(challengeRecord);

  const P = FIELDS.teamChallengeParticipants;
  const formula = `{${P.teamChallenge}}="${escapeFormulaValue(challengeId)}"`;
  const records = await listRecords(TABLES.teamChallengeParticipants, {
    filterByFormula: formula,
  });

  const participants = records
    .map(mapTeamChallengeParticipant)
    .sort((a, b) => b.pointsEarned - a.pointsEarned);

  const myRecord =
    userId != null
      ? (participants.find((p) => p.userId === userId) ?? null)
      : null;

  return {
    challenge: {
      ...challenge,
      checkedInToday: isCheckedInToday(myRecord?.lastCheckinAt),
    },
    participants,
    myRecord,
  };
}

export function mapCheckinAirtableError(err: unknown): TeamCheckinError | null {
  if (!(err instanceof AirtableApiError)) return null;

  if (err.body.includes("ROW_DOES_NOT_EXIST")) {
    return new TeamCheckinError(
      "사용자 또는 챌린지 정보를 찾을 수 없어요. 로그아웃 후 다시 로그인해 주세요.",
      400,
    );
  }

  if (err.status === 404) {
    return new TeamCheckinError("챌린지를 찾을 수 없습니다.", 404);
  }

  if (err.status === 422) {
    return new TeamCheckinError(
      "인증 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
      422,
    );
  }

  return null;
}

export async function resolveCheckinUserId(
  session: Session | null,
): Promise<string | null> {
  if (!session?.user) return null;

  if (!isAirtableConfigured()) {
    return session.user.airtableId ?? MOCK_USER.id;
  }

  return resolveSessionAirtableUserId({
    airtableId: session.user.airtableId,
    provider: session.user.provider,
    providerId: session.user.providerId,
  });
}
