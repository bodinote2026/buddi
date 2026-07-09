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
    handle: "Handle",
    mileage: "Mileage",
    completedChallenges: "Completed Challenges",
    buddyCount: "Buddy Count",
    trustPercentile: "Trust Percentile",
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
