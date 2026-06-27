import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Providers (like Credentials which uses Node APIs) are injected in auth.ts
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig
