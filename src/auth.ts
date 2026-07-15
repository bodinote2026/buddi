import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import type { Provider } from "next-auth/providers";
import { isAirtableConfigured, resolveSessionAirtableUserId, upsertSocialUser } from "@/lib/airtable";

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
        console.info("[auth] signIn upsert attempt", {
          provider: account.provider,
          providerId: account.providerAccountId,
        });
        const result = await upsertSocialUser({
          provider: account.provider,
          providerId: account.providerAccountId,
          nickname: user.name?.trim() || "buddi_user",
          email: user.email,
          avatarUrl: user.image,
        });
        console.info("[auth] Airtable upsert ok", {
          id: result.id,
          created: result.created,
          provider: account.provider,
          providerId: account.providerAccountId,
        });
        return true;
      } catch (err) {
        console.error("[auth] signIn Airtable upsert failed — blocking login", err);
        return false;
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
          console.info("[auth] jwt upsert attempt", {
            provider: account.provider,
            providerId: account.providerAccountId,
          });
          const result = await upsertSocialUser({
            provider: account.provider,
            providerId: account.providerAccountId,
            nickname,
            email: user?.email ?? (token.email as string | undefined),
            avatarUrl: user?.image ?? (token.picture as string | undefined),
          });
          token.airtableId = result.id;
          token.nickname = nickname;
          console.info("[auth] jwt upsert ok", {
            id: result.id,
            created: result.created,
            providerId: account.providerAccountId,
          });
        } catch (err) {
          console.error(
            "[auth] jwt upsert failed — session without airtableId",
            err,
          );
          token.nickname = nickname;
        }
      }

      if (user?.name) token.name = user.name;
      if (user?.email) token.email = user.email;
      if (user?.image) token.picture = user.image;

      if (
        isAirtableConfigured() &&
        token.provider &&
        token.providerId &&
        typeof token.provider === "string" &&
        typeof token.providerId === "string"
      ) {
        try {
          const resolved = await resolveSessionAirtableUserId({
            airtableId:
              typeof token.airtableId === "string" ? token.airtableId : undefined,
            provider: token.provider,
            providerId: token.providerId,
          });
          if (resolved) token.airtableId = resolved;
        } catch (err) {
          console.error("[auth] jwt user id resolve failed", err);
        }
      }

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
