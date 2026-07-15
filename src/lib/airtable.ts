export interface AirtableRecord {
  id: string;
  createdTime?: string;
  fields: Record<string, unknown>;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

/** Airtable field names (Title Case + spaces) */
export const FIELDS = {
  users: {
    name: "Name",
    totalStreakDays: "Total Streak Days",
    temperature: "Temperature",
    avatarUrl: "Avatar URL",
    nickname: "Nickname",
    company: "Company",
    team: "Team",
    mileage: "Mileage",
    completedChallenges: "Completed Challenges",
    buddyCount: "Buddy Count",
    trustPercentile: "Trust Percentile",
    provider: "Provider",
    providerId: "Provider ID",
    email: "Email",
  },
  challenges: {
    title: "Title",
    emoji: "Emoji",
    description: "Description",
    category: "Category",
    isActive: "Is Active",
  },
  userChallenges: {
    user: "User",
    challenge: "Challenge",
    progress: "Progress",
    streakDays: "Streak Days",
    status: "Status",
    lastCheckinAt: "Last Checkin At",
    challengeTitle: "Challenge Title",
    challengeEmoji: "Challenge Emoji",
    challengeDescription: "Challenge Description",
  },
  buddies: {
    name: "Name",
    age: "Age",
    temperature: "Temperature",
    category: "Category",
    distanceKm: "Distance Km",
    avatarUrl: "Avatar URL",
    isRecommended: "Is Recommended",
    district: "District",
    intro: "Intro",
    interests: "Interests",
  },
  teams: {
    name: "Name",
    points: "Points",
    trend: "Trend",
  },
  teamChallenges: {
    title: "Title",
    company: "Company",
    team: "Team",
    teamName: "Team Name",
    participants: "Participants",
    completionRate: "Completion Rate",
  },
  teamChallengeParticipants: {
    user: "User",
    nickname: "Nickname (from User)",
    teamChallenge: "Team Challenge",
    pointsEarned: "Points Earned",
    streakDays: "Streak Days",
    lastCheckinAt: "Last Checkin At",
  },
  storeItems: {
    name: "Name",
    brand: "Brand",
    price: "Price",
    badge: "Badge",
    imageUrl: "Image URL",
    isFeatured: "Is Featured",
  },
} as const;

function getBaseUrl() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!baseId) throw new Error("AIRTABLE_BASE_ID가 설정되지 않았습니다.");
  return `https://api.airtable.com/v0/${baseId}`;
}

function getToken() {
  const token = process.env.AIRTABLE_PAT;
  if (!token) throw new Error("AIRTABLE_PAT가 설정되지 않았습니다.");
  return token;
}

export function isAirtableConfigured() {
  return Boolean(process.env.AIRTABLE_PAT && process.env.AIRTABLE_BASE_ID);
}

export class AirtableApiError extends Error {
  readonly status: number;
  readonly body: string;
  readonly method: string;
  readonly path: string;

  constructor(status: number, body: string, method: string, path: string) {
    super(`Airtable ${status}: ${body}`);
    this.name = "AirtableApiError";
    this.status = status;
    this.body = body;
    this.method = method;
    this.path = path;
  }
}

function logAirtableFailure(
  status: number,
  body: string,
  method: string,
  path: string,
) {
  let error: unknown = body;
  if (body) {
    try {
      error = JSON.parse(body);
    } catch {
      /* keep raw body */
    }
  }
  console.error("[airtable] request failed", { status, method, path, error });
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function airtableFetch<T = AirtableListResponse>(
  path: string,
  init?: RequestInit & { skipCache?: boolean },
): Promise<T> {
  const url = `${getBaseUrl()}/${path}`;
  const method = init?.method ?? "GET";
  const isRead = method === "GET";
  const { skipCache, ...requestInit } = init ?? {};

  const doFetch = async () =>
    fetch(url, {
      ...requestInit,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
        ...requestInit.headers,
      },
      ...(isRead && !skipCache
        ? { next: { revalidate: 60 } }
        : { cache: "no-store" }),
    });

  let res = await doFetch();

  if (res.status === 429) {
    await sleep(500);
    res = await doFetch();
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logAirtableFailure(res.status, body, method, path);
    throw new AirtableApiError(res.status, body, method, path);
  }

  return res.json() as Promise<T>;
}

export async function listRecords(
  table: string,
  params?: Record<string, string>,
): Promise<AirtableRecord[]> {
  const search = new URLSearchParams(params);
  const query = search.toString();
  const data = await airtableFetch<AirtableListResponse>(
    `${encodeURIComponent(table)}${query ? `?${query}` : ""}`,
  );
  return data.records;
}

export async function getRecord(
  table: string,
  id: string,
): Promise<AirtableRecord> {
  // Always fresh — used for session user after profile/onboarding writes
  return airtableFetch<AirtableRecord>(
    `${encodeURIComponent(table)}/${id}`,
    { skipCache: true },
  );
}

export async function createRecord(
  table: string,
  fields: Record<string, unknown>,
): Promise<AirtableRecord> {
  return airtableFetch<AirtableRecord>(encodeURIComponent(table), {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

export async function updateRecord(
  table: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<AirtableRecord> {
  return airtableFetch<AirtableRecord>(
    `${encodeURIComponent(table)}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    },
  );
}

export const TABLES = {
  users: "Users",
  challenges: "Challenges",
  userChallenges: "UserChallenges",
  buddies: "Buddies",
  teams: "Teams",
  teamChallenges: "TeamChallenges",
  teamChallengeParticipants: "TeamChallengeParticipants",
  storeItems: "Store Items",
} as const;

function escapeFormulaValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Build lookup formula for OAuth users.
 * - Provider: case-insensitive (Single select option may be "Kakao" while OAuth sends "kakao")
 * - Provider ID: string OR numeric compare (field may be Number while OAuth id is a numeric string)
 */
export function buildFindUserByProviderFormula(
  provider: string,
  providerId: string,
): string {
  const U = FIELDS.users;
  const providerNorm = escapeFormulaValue(provider.trim().toLowerCase());
  const idTrimmed = providerId.trim();
  const idEscaped = escapeFormulaValue(idTrimmed);
  const idQuoted = `{${U.providerId}}="${idEscaped}"`;
  const idClause = /^\d+$/.test(idTrimmed)
    ? `OR(${idQuoted},{${U.providerId}}=${idTrimmed})`
    : idQuoted;

  return `AND(LOWER({${U.provider}})="${providerNorm}",${idClause})`;
}

/** Airtable may return 404 or 403 when a record id is deleted or no longer accessible. */
function isStaleUserRecordError(err: unknown): boolean {
  return (
    err instanceof AirtableApiError &&
    (err.status === 404 || err.status === 403)
  );
}

/** Resolve a valid Users record id from session claims, re-linking via provider when stale. */
export async function resolveSessionAirtableUserId(input: {
  airtableId?: string | null;
  provider?: string | null;
  providerId?: string | null;
}): Promise<string | null> {
  if (!isAirtableConfigured()) {
    return input.airtableId ?? null;
  }

  const { airtableId, provider, providerId } = input;

  if (airtableId && !airtableId.startsWith("mock-")) {
    try {
      await getRecord(TABLES.users, airtableId);
      return airtableId;
    } catch (err) {
      if (!isStaleUserRecordError(err)) {
        throw err;
      }
      console.warn("[airtable] stale session user id, re-resolving", {
        airtableId,
        status: err instanceof AirtableApiError ? err.status : undefined,
      });
    }
  }

  if (provider && providerId) {
    const record = await findUserByProvider(provider, providerId);
    if (record) {
      console.info("[airtable] resolved user from provider", { id: record.id });
      return record.id;
    }
  }

  return null;
}

export async function findUserByProvider(
  provider: string,
  providerId: string,
): Promise<AirtableRecord | null> {
  const formula = buildFindUserByProviderFormula(provider, providerId);
  const params = { filterByFormula: formula, maxRecords: "1" };
  const query = new URLSearchParams(params).toString();

  console.info("[airtable] findUserByProvider request", {
    provider: provider.trim(),
    providerId: providerId.trim(),
    formula,
    path: `${TABLES.users}?${query}`,
  });

  const records = await listRecords(TABLES.users, params);

  const first = records[0];
  console.info("[airtable] findUserByProvider result", {
    count: records.length,
    recordIds: records.map((r) => r.id),
    storedProvider: first?.fields[FIELDS.users.provider],
    storedProviderId: first?.fields[FIELDS.users.providerId],
  });

  return first ?? null;
}

export interface CreateUserInput {
  provider: string;
  providerId: string;
  /** Kakao nickname → Nickname field. Name is left empty for Kakao. */
  nickname: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export async function createUser(
  input: CreateUserInput,
): Promise<AirtableRecord> {
  const U = FIELDS.users;
  const fields: Record<string, unknown> = {
    [U.name]: "",
    [U.nickname]: input.nickname || "buddi_user",
    [U.company]: "",
    [U.team]: "",
    [U.provider]: input.provider.trim(),
    [U.providerId]: input.providerId.trim(),
    [U.totalStreakDays]: 0,
    [U.temperature]: 36.5,
    [U.mileage]: 0,
    [U.completedChallenges]: 0,
    [U.buddyCount]: 0,
  };
  if (input.email) fields[U.email] = input.email;
  if (input.avatarUrl) fields[U.avatarUrl] = input.avatarUrl;

  return createRecord(TABLES.users, fields);
}

/** Find existing social user or create with defaults. Mock id when Airtable is off. */
export async function upsertSocialUser(
  input: CreateUserInput,
): Promise<{ id: string; created: boolean }> {
  if (!isAirtableConfigured()) {
    return {
      id: `mock-${input.provider}-${input.providerId}`,
      created: true,
    };
  }

  const existing = await findUserByProvider(input.provider, input.providerId);
  if (existing) {
    return { id: existing.id, created: false };
  }

  const created = await createUser(input);
  console.info("[airtable] user created", {
    id: created.id,
    provider: input.provider,
    providerId: input.providerId,
  });
  return { id: created.id, created: true };
}

