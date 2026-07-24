import type { Buddy } from "@/lib/types";

export function formatBuddyName(buddy: Buddy): string {
  if (buddy.age != null && buddy.age > 0) {
    return `${buddy.name} · ${buddy.age}`;
  }
  return buddy.name;
}

export function formatBuddyOrg(buddy: Buddy): string {
  if (buddy.company && buddy.team) {
    return `${buddy.company} · ${buddy.team}`;
  }
  return buddy.company || buddy.team;
}
