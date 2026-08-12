import { Metadata } from "next";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import Link from "next/link";
import { Calendar, User, ArrowLeft, Tag, Share2 } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const isAr = locale === "ar";

  const insight = await db.insight.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      publishStatus: "PUBLISHED"
    }
  });

  if (!insight) {
    return { title: "Article Not Found | E3 Qatar" };
  }

  const title = isAr ? (insight.titleAr || insight.titleEn) : insight.titleEn;
  const description = isAr ? (insight.excerptAr || insight.excerptEn || "") : (insight.excerptEn || "");

  return {
    title: `${title} | E3 Insights`,
    description,
    openGraph: {
      title,
      description,
      images: insight.featuredMediaUrl ? [insight.featuredMediaUrl] : undefined,
    }
  };
}

export default async function InsightArticlePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  const isAr = locale === "ar";

  const insight = await db.insight.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      publishStatus: "PUBLISHED"
    },
    include: {
      author: true
    }
  });

  if (!insight) {
    notFound();
  }

  const title = isAr ? (insight.titleAr || insight.titleEn) : insight.titleEn;
  const body = isAr ? (insight.bodyAr || insight.bodyEn || "") : (insight.bodyEn || "");
  const excerpt = isAr ? (insight.excerptAr || insight.excerptEn) : insight.excerptEn;
  const publishedDate = insight.publishedAt ? new Date(insight.publishedAt).toLocaleDateString(isAr ? "ar-QA" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  // Structured Data JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": insight.contentType === "NEWS" ? "NewsArticle" : "BlogPosting",
    "headline": title,
    "description": excerpt,
    "image": insight.featuredMediaUrl ? [insight.featuredMediaUrl] : [],
    "datePublished": insight.publishedAt,
    "dateModified": insight.updatedAt,
    "author": insight.author ? {
      "@type": "Person",
      "name": isAr ? (insight.author.nameAr || insight.author.nameEn) : insight.author.nameEn
    } : {
      "@type": "Organization",
      "name": "E3 Qatar"
    }
  };

  return (
    <article className="min-h-screen bg-[var(--surface-default)] pt-24 pb-16 text-[var(--text-primary)] font-poppins" dir={isAr ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-8">
        <Link href={`/${locale}/b2c/discover`} className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[var(--text-secondary)] hover:text-[var(--e3-royal-blue)] transition-colors">
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          {isAr ? "العودة إلى اكتشف إي ثري" : "Back to Discover E3"}
        </Link>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] border border-[var(--e3-royal-blue)]/20 text-xs font-mono font-extrabold uppercase">
              {insight.category || insight.contentType}
            </span>
            {publishedDate && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {publishedDate}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight leading-[1.1]">
            {title}
          </h1>

          {excerpt && (
            <p className="text-base text-[var(--text-secondary)] font-medium leading-relaxed">
              {excerpt}
            </p>
          )}

          {insight.author && (
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-level-2)]">
              {insight.author.portraitUrl && (
                <img src={insight.author.portraitUrl} alt={insight.author.nameEn} className="w-10 h-10 rounded-full object-cover border" />
              )}
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {isAr ? (insight.author.nameAr || insight.author.nameEn) : insight.author.nameEn}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] block">
                  {isAr ? (insight.author.designationAr || insight.author.designationEn) : insight.author.designationEn}
                </span>
              </div>
            </div>
          )}
        </div>

        {insight.featuredMediaUrl && (
          <div className="rounded-3xl overflow-hidden border border-[var(--border-level-2)] shadow-2xl max-h-[450px]">
            <UniversalMediaRenderer
              src={insight.featuredMediaUrl}
              type="IMAGE"
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Rich Text Body */}
        <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-4 pt-4 border-t border-[var(--border-level-2)]">
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </div>
    </article>
  );
}
