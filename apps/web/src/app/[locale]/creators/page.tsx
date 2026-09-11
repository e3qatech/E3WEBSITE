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

import { PublicCreatorDirectory } from "@/components/influencer/PublicCreatorDirectory";

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
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider border border-[var(--color-accent)]/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{isAr ? "شبكة صناع المحتوى المعتمدة في قطر" : "Official Qatar Creator Collective"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.1]">
            {isAr ? "نبتكر تجارب ترفيهية استثنائية معاً" : "Crafting Extraordinary Experiences Together"}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? "نلهم الجماهير ونروي أروع قصص الفعاليات والوجهات الترفيهية في قطر بالتعاون مع نخبة من صناع المحتوى والمؤثرين المعتمدين."
              : "Discover the visionary storytellers, vloggers, and creative ambassadors driving culture, tourism, and entertainment across Qatar."}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/creators/apply`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-95 transition shadow-xl shadow-[var(--color-accent)]/25 hover:scale-[1.02]"
            >
              <span>{isAr ? "انضم إلينا كصانع محتوى" : "Join the Creator Collective"}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>

          {/* Value Stats Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-xs">
            <div className="p-4 rounded-2xl bg-[var(--bg-level-2)]/80 backdrop-blur-md border border-[var(--border-level-1)] text-center">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block">100%</span>
              <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                {isAr ? "معايير سلامة العلامة" : "Brand-Safe Verified"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-level-2)]/80 backdrop-blur-md border border-[var(--border-level-1)] text-center">
              <span className="text-xl sm:text-2xl font-black text-[var(--color-accent)] block">120+</span>
              <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                {isAr ? "فعالية ووجهة ترفيهية" : "Qatar Campaigns"}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[var(--bg-level-2)]/80 backdrop-blur-md border border-[var(--border-level-1)] text-center">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block">🇶🇦 Doha</span>
              <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                {isAr ? "حضور محلي وخليجي" : "Local & GCC Impact"}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Client Directory Component */}
        <PublicCreatorDirectory creators={creators as any} locale={locale} />
      </div>
    </div>
  );
}
