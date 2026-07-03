import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamMemberClient } from "@/components/b2c/TeamMemberClient";
import { db } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = await db.employeeProfile.findUnique({
    where: { slug }
  });

  if (!member) return { title: "Not Found" };

  return {
    title: `${member.firstName} ${member.lastName} | ${member.designation} at E3`,
    description: member.aboutSummary
  };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  
  const member = await db.employeeProfile.findUnique({
    where: { slug }
  });

  if (!member) {
    notFound();
  }

  const setting = await db.setting.findUnique({
    where: { key: "B2C_TEAM_PAGE_SETTINGS" }
  });
  const settings = setting ? (typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value) : null;

  return <TeamMemberClient locale={locale} member={member as any} initialSettings={settings} />;
}
