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
    age: "Age",
    intro: "Intro",
    interests: "Interests",
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
    name: "Name",
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
    company: "Company",
    points: "Points",
    trend: "Trend",
  },
  teamChallenges: {
    title: "Title",
    company: "Company",
    team: "Team",
    teamName: "Team Name",
    teamNameFromTeam: "Name (from Team)",
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
    stock: "Stock",
    isActive: "Is Active",
    description: "Description",
  },
  orders: {
    user: "User",
    storeItem: "Store Item",
    itemName: "Item Name (from Store Item)",
    price: "Price",
    pointsUsed: "Points Used",
    cashAmount: "Cash Amount",
    status: "Status",
  },
  pointLedger: {
    user: "User",
    type: "Type",
    amount: "Amount",
    reason: "Reason",
    balanceAfter: "Balance After",
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
  options?: { skipCache?: boolean },
): Promise<AirtableRecord[]> {
  const search = new URLSearchParams(params);
  const query = search.toString();
  const data = await airtableFetch<AirtableListResponse>(
    `${encodeURIComponent(table)}${query ? `?${query}` : ""}`,
    { skipCache: options?.skipCache },
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
  orders: "Orders",
  pointLedger: "PointLedger",
} as const;

export function escapeFormulaValue(value: string) {
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

export const SIGNUP_BONUS_POINTS = 5000;

async function recordSignupBonus(userId: string): Promise<void> {
  const { recordPointLedgerEntry } = await import("./point-ledger");
  await recordPointLedgerEntry({
    userId,
    type: "적립",
    amount: SIGNUP_BONUS_POINTS,
    reason: "가입 축하",
    balanceAfter: SIGNUP_BONUS_POINTS,
  });
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
    [U.mileage]: SIGNUP_BONUS_POINTS,
    [U.completedChallenges]: 0,
    [U.buddyCount]: 0,
  };
  if (input.email) fields[U.email] = input.email;
  if (input.avatarUrl) fields[U.avatarUrl] = input.avatarUrl;

  return createRecord(TABLES.users, fields);
}

/** Find a Teams record by exact Name + Company match. */
export async function findTeamByName(
  name: string,
  company: string,
): Promise<AirtableRecord | null> {
  const trimmedName = name.trim();
  const trimmedCompany = company.trim();
  if (!trimmedName || !trimmedCompany) return null;

  const escapedName = escapeFormulaValue(trimmedName);
  const escapedCompany = escapeFormulaValue(trimmedCompany);
  const T = FIELDS.teams;
  const records = await listRecords(TABLES.teams, {
    filterByFormula: `AND({${T.name}}="${escapedName}",{${T.company}}="${escapedCompany}")`,
    maxRecords: "1",
  });
  return records[0] ?? null;
}

export async function findOrCreateTeamByName(
  name: string,
  company: string,
): Promise<AirtableRecord> {
  const existing = await findTeamByName(name, company);
  if (existing) return existing;

  const trimmedName = name.trim();
  const trimmedCompany = company.trim();
  const T = FIELDS.teams;
  return createRecord(TABLES.teams, {
    [T.name]: trimmedName,
    [T.company]: trimmedCompany,
    [T.points]: 0,
    [T.trend]: "유지",
  });
}

/** Find existing social user or create with defaults. Mock id when Airtable is off. */
export async function upsertSocialUser(
  input: CreateUserInput,
): Promise<{ id: string; created: boolean }> {
  if (!isAirtableConfigured()) {
    const { getDisplayName } = await import("./format");
    const { getMockProfile, saveMockProfile } = await import(
      "./mock-profile-store"
    );
    const id = `mock-${input.provider}-${input.providerId}`;
    if (getMockProfile(id)) {
      return { id, created: false };
    }

    saveMockProfile({
      id,
      name: "",
      nickname: input.nickname || "buddi_user",
      displayName: getDisplayName({
        name: "",
        nickname: input.nickname || "buddi_user",
      }),
      company: "",
      team: "",
      totalStreakDays: 0,
      temperature: 36.5,
      avatarUrl: input.avatarUrl ?? undefined,
      mileage: SIGNUP_BONUS_POINTS,
      completedChallenges: 0,
      buddyCount: 0,
      provider: input.provider.trim(),
      providerId: input.providerId.trim(),
      email: input.email ?? undefined,
    });
    await recordSignupBonus(id);
    return { id, created: true };
  }

  const existing = await findUserByProvider(input.provider, input.providerId);
  if (existing) {
    return { id: existing.id, created: false };
  }

  const created = await createUser(input);
  await recordSignupBonus(created.id);
  console.info("[airtable] user created", {
    id: created.id,
    provider: input.provider,
    providerId: input.providerId,
    signupBonus: SIGNUP_BONUS_POINTS,
  });
  return { id: created.id, created: true };
}

