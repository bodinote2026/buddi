/** v2 seed buddies — Korean office-style portraits (Unsplash, commercial use) */
function portraitUrl(photoId: string, fpY = 0.32): string {
  return `https://images.unsplash.com/${photoId}?w=800&h=1000&fit=crop&crop=faces&fp-y=${fpY}`;
}

export const BUDDY_AVATAR_URLS: Record<string, string> = {
  // East Asian woman, business casual, natural smile
  김서연: portraitUrl("photo-1594744803329-7eb547b9fc6b"),
  // Professional woman in office, warm smile
  박지민: portraitUrl("photo-1573496359142-b8d87734a5a2", 0.28),
  // Young man, smart casual, friendly
  이준호: portraitUrl("photo-1519085360753-af0119f7cbe7"),
  // Casual professional man, natural portrait
  정민우: portraitUrl("photo-1506794778202-cad84cf45f1d", 0.3),
};

const DEFAULT_BUDDY_AVATAR = portraitUrl(
  "photo-1560250097-0b93528c311a",
  0.28,
);

export function resolveBuddyAvatarUrl(
  name: string,
  airtableUrl?: string,
): string {
  if (name && BUDDY_AVATAR_URLS[name]) return BUDDY_AVATAR_URLS[name];
  if (airtableUrl && !airtableUrl.includes("dicebear.com")) return airtableUrl;
  return DEFAULT_BUDDY_AVATAR;
}
