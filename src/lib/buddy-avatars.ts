/** v2 seed buddies — shared real-photo avatars for home carousel and buddies tab */
export const BUDDY_AVATAR_URLS: Record<string, string> = {
  김서연:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&h=480&fit=crop&crop=face",
  이준호:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop&crop=face",
  박지민:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=480&h=480&fit=crop&crop=face",
  정민우:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=480&h=480&fit=crop&crop=face",
};

const DEFAULT_BUDDY_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=480&h=480&fit=crop&crop=face";

export function resolveBuddyAvatarUrl(
  name: string,
  airtableUrl?: string,
): string {
  if (name && BUDDY_AVATAR_URLS[name]) return BUDDY_AVATAR_URLS[name];
  if (airtableUrl && !airtableUrl.includes("dicebear.com")) return airtableUrl;
  return DEFAULT_BUDDY_AVATAR;
}
