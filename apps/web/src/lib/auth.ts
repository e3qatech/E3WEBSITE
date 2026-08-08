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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          throw new Error("Invalid credentials")
        }

        if (!user.isActive) {
          throw new Error("Invalid credentials")
        }

        if (!user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role as RoleType,
          sessionVersion: user.sessionVersion,
          isActive: user.isActive
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.sessionVersion = user.sessionVersion
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.sessionVersion = token.sessionVersion as number;
        session.user.isActive = token.isActive as boolean;
      }
      return session
    }
  }
})
