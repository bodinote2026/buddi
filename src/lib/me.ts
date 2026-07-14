import type { ApiResponse, User } from "@/lib/types";

export const ME_API_KEY = "/api/me";

export async function fetchMe(): Promise<User> {
  const res = await fetch(ME_API_KEY);
  const json = (await res.json()) as ApiResponse<User>;
  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "프로필을 불러오지 못했어요.");
  }
  return json.data;
}
