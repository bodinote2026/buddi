import { auth } from "@/auth";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { getRecord, isAirtableConfigured, TABLES } from "@/lib/airtable";
import { mapUser } from "@/lib/mappers";
import type { User } from "@/lib/types";

export default async function ProfilePage() {
  const session = await auth();
  let sessionUser: User | null = null;

  if (
    session?.user?.airtableId &&
    isAirtableConfigured() &&
    !session.user.airtableId.startsWith("mock-")
  ) {
    try {
      const record = await getRecord(TABLES.users, session.user.airtableId);
      sessionUser = mapUser(record);
    } catch {
      sessionUser = null;
    }
  }

  return <ProfileClient sessionUser={sessionUser} />;
}
