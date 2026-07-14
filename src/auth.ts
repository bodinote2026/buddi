import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import type { Provider } from "next-auth/providers";
import { upsertSocialUser } from "@/lib/airtable";

/**
 * Provider list — add Google (etc.) here later without restructuring auth.
 * Env vars: AUTH_KAKAO_ID / AUTH_KAKAO_SECRET (Auth.js inferred).
 *
 * Kakao maps profile nickname → user.name (no real name). We store that in
 * Nickname and leave Name empty on create.
 */
const providers: Provider[] = [Kakao];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/profile",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.provider || !account.providerAccountId) return false;

      try {
        await upsertSocialUser({
          provider: account.provider,
          providerId: account.providerAccountId,
          nickname: user.name?.trim() || "buddi_user",
          email: user.email,
          avatarUrl: user.image,
        });
        return true;
      } catch (err) {
        console.error("[auth] Airtable upsert failed", err);
        return true;
      }
    },
    async jwt({ token, account, user }) {
      if (account?.provider && account.providerAccountId) {
        token.provider = account.provider;
        token.providerId = account.providerAccountId;

        const nickname =
          user?.name?.trim() ||
          (typeof token.name === "string" ? token.name.trim() : "") ||
          "buddi_user";

        try {
          const result = await upsertSocialUser({
            provider: account.provider,
            providerId: account.providerAccountId,
            nickname,
            email: user?.email ?? (token.email as string | undefined),
            avatarUrl: user?.image ?? (token.picture as string | undefined),
          });
          token.airtableId = result.id;
          token.nickname = nickname;
        } catch (err) {
          console.error("[auth] jwt upsert failed", err);
          token.airtableId = `mock-${account.provider}-${account.providerAccountId}`;
          token.nickname = nickname;
        }
      }

      if (user?.name) token.name = user.name;
      if (user?.email) token.email = user.email;
      if (user?.image) token.picture = user.image;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.airtableId = token.airtableId;
        session.user.provider = token.provider;
        session.user.providerId = token.providerId;
        session.user.nickname =
          (token.nickname as string | undefined) ||
          session.user.name ||
          undefined;
      }
      return session;
    },
  },
  trustHost: true,
});
