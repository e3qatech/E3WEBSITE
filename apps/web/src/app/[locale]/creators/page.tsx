import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getPublicFeaturedCreators } from "@/lib/influencer/influencer-service";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Share2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { getBaseUrl } from "@/lib/seo-helper";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === "ar";
  const baseUrl = getBaseUrl();

  const title = isAr
    ? "شبكة صناع المحتوى والمؤثرين في قطر | إي ثري"
    : "Creator Collective & Influencer Network in Qatar | E3";

  const description = isAr
    ? "اكتشف وتعاون مع نخبة من صناع المحتوى والمؤثرين ورواد الإعلام الرقمي في الفعاليات والوجهات الترفيهية في قطر."
    : "Discover and collaborate with visionary storytellers, vloggers, and creative ambassadors driving entertainment culture across Qatar.";

  return {
    title,
    description,
    keywords: isAr
      ? ["صناع محتوى قطر", "مؤثرين الدوحة", "تسويق المؤثرين قطر", "شراكات فعاليات قطر"]
      : ["creators in qatar", "influencers doha", "influencer marketing qatar", "event ambassadors doha"],
    alternates: {
      canonical: `${baseUrl}/${locale}/creators`,
      languages: {
        en: `${baseUrl}/en/creators`,
        ar: `${baseUrl}/ar/creators`,
        "x-default": `${baseUrl}/en/creators`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/creators`,
      images: [{ url: `${baseUrl}/og-image-default.jpg` }],
    },
  };
}

export default async function PublicCreatorsDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const creators = await getPublicFeaturedCreators();

  return (
    <div className="min-h-screen bg-[var(--bg-level-1)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "مجتمع صناع المحتوى في E3" : "E3 Creator Collective"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            {isAr ? "نبتكر تجارب ترفيهية استثنائية معاً" : "Crafting Extraordinary Experiences Together"}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            {isAr
              ? "نلهم الجماهير ونروي أروع قصص الفعاليات والوجهات الترفيهية في قطر بالتعاون مع نخبة من صناع المحتوى والمؤثرين."
              : "Discover the visionary storytellers, vloggers, and creative ambassadors driving culture and entertainment across Qatar."}
          </p>

          <div className="pt-2 flex items-center justify-center gap-4">
            <Link
              href={`/${locale}/creators/apply`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-[var(--color-accent)]/20"
            >
              <span>{isAr ? "انضم إلينا كصانع محتوى" : "Join the Creator Collective"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>

        {/* Featured Creators Grid */}
        {creators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((c: any) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col justify-between space-y-4 hover:border-[var(--color-accent)]/40 transition group shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--bg-level-3)] border border-[var(--border-level-2)] flex items-center justify-center text-lg font-bold text-[var(--color-accent)] overflow-hidden shrink-0 shadow-inner">
                      {c.profileImage ? (
                        <img src={c.profileImage} alt={c.displayName} className="w-full h-full object-cover" />
                      ) : (
                        c.displayName.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-accent)] transition">
                        {c.displayName}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] mt-0.5">
                        <span>{c.location || "Qatar"}</span>
                        {c.isQatarBased && <span>🇶🇦</span>}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[var(--text-secondary)] mt-4 line-clamp-3 leading-relaxed">
                    {isAr ? c.bioAr || c.bioEn : c.bioEn || "E3 Brand Creator & Storyteller"}
                  </p>
                </div>

                {/* Categories & Socials */}
                <div className="space-y-3 pt-3 border-t border-[var(--border-level-1)]">
                  <div className="flex flex-wrap gap-1.5">
                    {c.categories?.slice(0, 3).map((cat: string) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-md bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[10px] font-semibold text-[var(--text-muted)]"
                      >
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>

                  {c.platforms?.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {c.platforms.map((p: any) => (
                        <a
                          key={p.platform}
                          href={p.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>@{p.handle}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] max-w-xl mx-auto space-y-4">
            <Sparkles className="w-10 h-10 text-[var(--color-accent)] mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {isAr ? "قائمة صناع المحتوى قيد التحديث" : "Creator Showcase Updating"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isAr
                ? "نحن بصدد إطلاق فعاليات جديدة. هل تود أن تكون أحد صناع المحتوى المميزين معنا في E3؟"
                : "We are preparing for upcoming event launches. Would you like to be featured as an official E3 creator?"}
            </p>
            <div className="pt-2">
              <Link
                href={`/${locale}/creators/apply`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition"
              >
                <span>{isAr ? "قدم طلبك الآن" : "Apply to Collaborate"}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
