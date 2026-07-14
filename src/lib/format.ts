export function formatTemperature(value: number | undefined | null): string {
  return `${(value ?? 0).toFixed(1)}°`;
}

export function formatPoints(value: number): string {
  return `${value.toLocaleString("ko-KR")}P`;
}

export function getDisplayName(user: {
  name?: string | null;
  nickname?: string | null;
}): string {
  const name = user.name?.trim();
  if (name) return name;
  return user.nickname?.trim() || "버디 유저";
}
