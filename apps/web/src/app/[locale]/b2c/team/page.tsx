import { Metadata } from "next";
import { TeamClient } from "@/components/b2c/TeamClient";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "The Visionaries | E3 Team",
  description: "A collective of industrial designers, master fabricators, and event strategists redefining what's possible in the MENA region."
};

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const teamMembers = await db.employeeProfile.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const setting = await db.setting.findUnique({
    where: { key: "B2C_TEAM_PAGE_SETTINGS" }
  });
  const settings = setting ? (typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value) : null;

  return <TeamClient locale={locale} initialMembers={teamMembers as any} initialSettings={settings} />;
}
