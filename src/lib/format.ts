export function formatTemperature(value: number | undefined | null): string {
  return `${(value ?? 0).toFixed(1)}°`;
}

export function formatPoints(value: number): string {
  return `${value.toLocaleString("ko-KR")}P`;
}
