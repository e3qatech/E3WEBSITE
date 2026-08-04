import { DefaultSession } from "next-auth";
import type { RoleType } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: RoleType;
    sessionVersion: number;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: RoleType;
      sessionVersion: number;
      isActive: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleType;
    sessionVersion: number;
    isActive: boolean;
  }
}
