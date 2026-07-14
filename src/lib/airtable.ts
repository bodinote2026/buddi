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

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function airtableFetch<T = AirtableListResponse>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getBaseUrl()}/${path}`;
  const method = init?.method ?? "GET";
  const isRead = method === "GET";

  const doFetch = async () =>
    fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...(isRead ? { next: { revalidate: 60 } } : { cache: "no-store" }),
    });

  let res = await doFetch();

  if (res.status === 429) {
    await sleep(500);
    res = await doFetch();
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable ${res.status}${body ? `: ${body}` : ""}`);
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
  return airtableFetch<AirtableRecord>(
    `${encodeURIComponent(table)}/${id}`,
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
  storeItems: "Store Items",
} as const;

function escapeFormulaValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function findUserByProvider(
  provider: string,
  providerId: string,
): Promise<AirtableRecord | null> {
  const U = FIELDS.users;
  const records = await listRecords(TABLES.users, {
    filterByFormula: `AND({${U.provider}}="${escapeFormulaValue(provider)}",{${U.providerId}}="${escapeFormulaValue(providerId)}")`,
    maxRecords: "1",
  });
  return records[0] ?? null;
}

export interface CreateUserInput {
  provider: string;
  providerId: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export async function createUser(
  input: CreateUserInput,
): Promise<AirtableRecord> {
  const U = FIELDS.users;
  const fields: Record<string, unknown> = {
    [U.name]: input.name || "버디 유저",
    [U.provider]: input.provider,
    [U.providerId]: input.providerId,
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
  return { id: created.id, created: true };
}

