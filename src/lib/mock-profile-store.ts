import type { User } from "./types";

/**
 * In-memory store for mock / non-persisted profile patches.
 * Needed because GET /api/me for mock-* ids otherwise always returns empty Company/Team,
 * which makes OnboardingGuard bounce users back after a successful PATCH.
 */
const store = new Map<string, User>();

export function saveMockProfile(user: User) {
  store.set(user.id, user);
}

export function getMockProfile(id: string): User | undefined {
  return store.get(id);
}
