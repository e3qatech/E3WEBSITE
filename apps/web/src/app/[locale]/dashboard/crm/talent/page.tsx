import { db } from "@/lib/db";
import { TalentList } from "@/components/dashboard/crm/TalentList";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isHRAuthorized } from "@/lib/careers/job-eligibility";

export const metadata = {
  title: "Talent Acquisition & AI Hub | E3 Admin",
};

export const dynamic = "force-dynamic";

export default async function TalentPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login/admin?callbackUrl=/${locale}/dashboard/crm/talent`);
  }
  const role = (session.user as any)?.role;
  const permissions = (session.user as any)?.permissions;

  if (
    !["SUPER_ADMIN", "ADMIN", "HR", "HR_ADMIN"].includes(role) &&
    !isHRAuthorized(role, permissions)
  ) {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch both Talent records and JobApplication records to provide a complete, unified talent pool
  const [talentList, applicationsList, jobsList] = await Promise.all([
    db.talent.findMany({
      orderBy: { appliedDate: "desc" },
      include: { job: { select: { title: true, department: true } } },
    }),
    db.jobApplication.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.job.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, department: true, location: true },
    }),
  ]);

  // Merge into unified candidate profile schema with smart deduplication
  const talentMap = new Map<string, any>();

  // 1. Process JobApplications (the primary application records with active candidate status and parsed CV data)
  for (const app of applicationsList) {
    const emailKey = (app.email || "").trim().toLowerCase();
    const roleKey = (app.jobTitle || "").trim().toLowerCase();
    const dedupeKey = emailKey ? `${emailKey}::${roleKey}` : app.id;

    talentMap.set(dedupeKey, {
      id: app.id,
      name: `${app.firstName || ""} ${app.lastName || ""}`.trim() || "Applicant",
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone,
      position: app.jobTitle,
      department: app.department || "Operations",
      experienceLevel: (app.cvParsedData as any)?.experienceYears
        ? `${(app.cvParsedData as any).experienceYears} Yrs`
        : "Mid-Level",
      status: app.status || "NEW",
      rating: null,
      appliedDate: app.createdAt.toISOString(),
      resumeUrl: app.cvUrl,
      cvParsedData: app.cvParsedData,
      skills: (app.cvParsedData as any)?.skills || [],
      languages: null,
      education: (app.cvParsedData as any)?.education || null,
      certifications: null,
      notes: (app.cvParsedData as any)?.summary || null,
      job: { title: app.jobTitle },
      source: "JOB_APPLICATION",
    });
  }

  // 2. Process Talent table records (incorporate direct CRM talent, or merge extra CRM fields)
  for (const t of talentList) {
    const emailKey = (t.email || "").trim().toLowerCase();
    const roleKey = (t.position || t.job?.title || "").trim().toLowerCase();
    const dedupeKey = emailKey ? `${emailKey}::${roleKey}` : t.id;

    if (talentMap.has(dedupeKey)) {
      // Merge with existing JobApplication record: keep more advanced status, retain notes/rating if present
      const existing = talentMap.get(dedupeKey);
      const isExistingNew = existing.status === "NEW";
      const isTalentAdvanced = t.status && t.status !== "NEW";

      talentMap.set(dedupeKey, {
        ...existing,
        // If talent record was advanced in CRM while application was NEW, respect talent status
        status: isTalentAdvanced && isExistingNew ? t.status : existing.status,
        rating: existing.rating ?? t.rating,
        phone: existing.phone || t.phone,
        notes: existing.notes || t.notes,
        resumeUrl: existing.resumeUrl || t.resumeUrl,
        cvParsedData:
          existing.cvParsedData ||
          (t.skills ? { skills: t.skills, experienceYears: 4, summary: t.notes } : null),
        skills:
          Array.isArray(existing.skills) && existing.skills.length > 0
            ? existing.skills
            : t.skills || [],
      });
    } else {
      // Direct CRM Talent record with no matching job application
      talentMap.set(dedupeKey, {
        id: t.id,
        name: t.name,
        firstName: t.name.split(" ")[0] || t.name,
        lastName: t.name.split(" ").slice(1).join(" ") || "",
        email: t.email,
        phone: t.phone,
        position: t.position || t.job?.title || "Professional",
        department: t.department || t.job?.department || "General",
        experienceLevel: t.experienceLevel || "Experienced",
        status: t.status || "NEW",
        rating: t.rating,
        appliedDate: t.appliedDate.toISOString(),
        resumeUrl: t.resumeUrl,
        cvParsedData: t.skills
          ? {
              skills: Array.isArray(t.skills) ? t.skills : [],
              experienceYears: 4,
              summary: t.notes || "",
            }
          : null,
        skills: t.skills || [],
        languages: t.languages,
        education: t.education,
        certifications: t.certifications,
        notes: t.notes,
        job: t.job ? { title: t.job.title } : null,
        source: "DIRECT_TALENT",
      });
    }
  }

  const unifiedTalent = Array.from(talentMap.values());

  return (
    <TalentList
      initialTalent={unifiedTalent as any}
      availableJobs={jobsList}
      locale={locale}
    />
  );
}
