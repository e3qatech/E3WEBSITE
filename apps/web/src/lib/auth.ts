import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import db from "@/lib/db"
import type { RoleType } from "@prisma/client"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "e3-qatar-super-secret-key-development-2026!",
  trustHost: true,
  session: { strategy: "jwt", maxAge: 86400 },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const cleanEmail = (credentials?.email as string || '').toLowerCase().trim();
        const inputPassword = (credentials?.password as string || '').trim();

        if (!cleanEmail || !inputPassword) {
          return null
        }

        let user: any = null;
        try {
          user = await db.user.findUnique({
            where: { email: cleanEmail }
          });
        } catch (dbErr) {
          console.error('[AUTH DB QUERY ERROR]', dbErr);
        }

        if (!user || !user.isActive || !user.password) {
          throw new Error("Invalid credentials");
        }

        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(
            inputPassword,
            user.password
          );
        } catch (cmpErr) {
          console.error('[AUTH BCRYPT ERROR]', cmpErr);
        }

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Authoritative role correction for confirmed Master Admin
        if (user && cleanEmail === 'amaan@eeeqa.com' && user.role !== 'SUPER_ADMIN') {
          try {
            user = await db.user.update({
              where: { id: user.id },
              data: {
                role: 'SUPER_ADMIN',
                isActive: true,
                sessionVersion: (user.sessionVersion || 1) + 1,
              },
            });
          } catch (updErr) {
            console.error('[AUTH ROLE UPDATE ERROR]', updErr);
          }
        }

        return {
          id: user.id,
          email: user.email || cleanEmail,
          role: (user.role || 'CLIENT') as RoleType,
          sessionVersion: user.sessionVersion || 1,
          isActive: user.isActive ?? true
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user.id || token.sub || '') as string;
        token.sub = (user.id || token.sub || '') as string;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.isActive = user.isActive;
      }

      try {
        const { getCustomRolesMap, resolveUserPlatformRole } = await import("./custom-roles");
        const customRoles = await getCustomRolesMap();
        const resolvedRole = resolveUserPlatformRole(
          (token.email as string) || (token.id as string),
          (token.role as string) || "CLIENT",
          customRoles
        );
        token.role = resolvedRole as any;
      } catch (_e) {
        // Fallback to token.role
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id || token.sub) as string;
        session.user.role = token.role as any;
        session.user.sessionVersion = (token.sessionVersion as number) || 1;
        session.user.isActive = Boolean(token.isActive ?? true);
      }
      return session;
    }
  }
})
