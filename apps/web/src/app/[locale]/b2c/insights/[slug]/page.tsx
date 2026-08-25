import { Metadata } from "next";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import Link from "next/link";
import { Calendar, ArrowLeft, Clock, Sparkles, User, ArrowRight, Share2, Tag } from "lucide-react";
import { localizeHref } from "@/lib/url-helper";
import { SocialShareButtons } from "@/components/b2c/SocialShareButtons";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const isAr = locale === "ar";

  const insight = await db.insight.findFirst({
    where: {
      OR: [{ slugEn: slug }, { slugAr: slug }, { id: slug }],
      publishStatus: "PUBLISHED",
    },
  });

  if (!insight) {
    return { title: "Article Not Found | E3 Qatar" };
  }

  const title = isAr ? (insight.titleAr || insight.titleEn) : insight.titleEn;
  const description = isAr ? (insight.excerptAr || insight.excerptEn || "") : (insight.excerptEn || "");
  const ogImg = insight.featuredMediaUrl || insight.featuredMediaId || undefined;

  return {
    title: `${title} | E3 Insights & Press`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: insight.publishedAt ? new Date(insight.publishedAt).toISOString() : undefined,
      images: ogImg ? [ogImg] : undefined,
    },
    alternates: {
      canonical: `/${locale}/b2c/insights/${insight.slugEn || slug}`,
      languages: {
        en: `/en/b2c/insights/${insight.slugEn || slug}`,
        ar: `/ar/b2c/insights/${insight.slugAr || insight.slugEn || slug}`,
      },
    },
  };
}

export default async function InsightArticlePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await props.params;
  const isAr = locale === "ar";

  const insight = await db.insight.findFirst({
    where: {
      OR: [{ slugEn: slug }, { slugAr: slug }, { id: slug }],
      publishStatus: "PUBLISHED",
    },
    include: {
      author: true,
    },
  });

  if (!insight) {
    notFound();
  }

  const title = isAr ? (insight.titleAr || insight.titleEn) : insight.titleEn;
  const body = isAr ? (insight.bodyAr || insight.bodyEn || "") : (insight.bodyEn || "");
  const excerpt = isAr ? (insight.excerptAr || insight.excerptEn) : insight.excerptEn;
  const publishedDate = insight.publishedAt
    ? new Date(insight.publishedAt).toLocaleDateString(isAr ? "ar-QA" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const mediaUrl = insight.featuredMediaUrl || insight.featuredMediaId || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80";

  // Calculate Reading Time
  const words = (body || excerpt || "").trim().split(/\s+/).length;
  const readingMins = Math.max(2, Math.ceil(words / 180));
  const readingTimeText = isAr ? `${readingMins} دقائق قراءة` : `${readingMins} min read`;

  // Author details
  const authorName = insight.author
    ? isAr
      ? `${insight.author.firstNameAr || insight.author.firstName} ${insight.author.lastNameAr || insight.author.lastName}`.trim()
      : `${insight.author.firstName} ${insight.author.lastName}`.trim()
    : isAr ? "فريق إي ثري قطر" : "E3 Editorial Team";

  const authorDesignation = insight.author
    ? isAr
      ? insight.author.designationAr || insight.author.designation
      : insight.author.designation
    : isAr ? "إدارة المحتوى والتحرير" : "E3 Editorial & Media";

  const authorImage = insight.author?.profileImage || null;

  // Fetch 3 related/recent stories
  let relatedInsights: any[] = [];
  try {
    relatedInsights = await db.insight.findMany({
      where: {
        publishStatus: "PUBLISHED",
        id: { not: insight.id },
      },
      include: {
        author: true,
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });
  } catch (e) {
    console.error("[InsightArticlePage] Failed to fetch related insights:", e);
  }

  // Structured Data JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": insight.contentType === "NEWS" ? "NewsArticle" : "BlogPosting",
    "headline": title,
    "description": excerpt,
    "image": mediaUrl ? [mediaUrl] : [],
    "datePublished": insight.publishedAt,
    "dateModified": insight.updatedAt,
    "author": insight.author ? {
      "@type": "Person",
      "name": authorName,
    } : {
      "@type": "Organization",
      "name": "E3 Qatar",
    },
    "publisher": {
      "@type": "Organization",
      "name": "E3 Qatar",
      "logo": {
        "@type": "ImageObject",
        "url": "https://e3-qatar.vercel.app/brand/e3-logo.png",
      },
    },
  };

  return (
    <article className="min-h-screen bg-[var(--surface-default)] pt-28 pb-20 text-[var(--text-primary)] font-poppins transition-colors duration-300" dir={isAr ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-level-1)] pb-4">
          <Link
            href={`/${locale}/b2c/insights`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--e3-royal-blue)] transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
            <span>{isAr ? "العودة إلى كافة المقالات والأخبار" : "Back to Insights & News"}</span>
          </Link>

          <span className="text-[11px] font-mono text-[var(--text-tertiary)] hidden sm:block">
            {isAr ? "المركز الإعلامي الرسمي" : "Official E3 Editorial"}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] border border-[var(--e3-royal-blue)]/20 text-xs font-mono font-extrabold uppercase tracking-wider shadow-sm">
              {insight.contentType.replace(/_/g, " ")}
            </span>
            {publishedDate && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] font-mono">
                <Calendar className="w-3.5 h-3.5 text-[var(--e3-royal-blue)]" />
                {publishedDate}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              {readingTimeText}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display uppercase tracking-tight leading-[1.08] text-[var(--text-primary)]">
            {title}
          </h1>

          {excerpt && (
            <p className="text-base sm:text-lg text-[var(--text-secondary)] font-normal leading-relaxed border-s-4 border-[var(--e3-royal-blue)] ps-4 my-4">
              {excerpt}
            </p>
          )}

          {/* Author & Share Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border-level-2)]">
            <div className="flex items-center gap-3">
              {authorImage ? (
                <img
                  src={authorImage}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover border border-[var(--border-level-2)] shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-[var(--text-secondary)]">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-sm font-bold text-[var(--text-primary)] block">
                  {authorName}
                </span>
                <span className="text-xs text-[var(--text-tertiary)] block">
                  {authorDesignation}
                </span>
              </div>
            </div>

            {/* Social Share Controls */}
            <SocialShareButtons
              title={title}
              locale={locale}
            />
          </div>
        </header>

        {/* Featured Hero Media */}
        {mediaUrl && (
          <div className="rounded-3xl overflow-hidden border border-[var(--border-level-2)] shadow-2xl bg-black max-h-[500px]">
            <UniversalMediaRenderer
              src={mediaUrl}
              type="IMAGE"
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content (Adaptive High-Contrast Rich Text) */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed space-y-6 pt-6 border-t border-[var(--border-level-2)] text-[var(--text-primary)]">
          {body ? (
            <div
              className="space-y-4 [&>p]:leading-relaxed [&>p]:text-[var(--text-secondary)] [&>h2]:text-2xl [&>h2]:font-black [&>h2]:font-display [&>h2]:uppercase [&>h2]:text-[var(--text-primary)] [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[var(--text-primary)] [&>ul]:list-disc [&>ul]:ps-5 [&>ol]:list-decimal [&>ol]:ps-5 [&>blockquote]:border-s-4 [&>blockquote]:border-[var(--e3-royal-blue)] [&>blockquote]:ps-4 [&>blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <p className="text-[var(--text-secondary)] italic">
              {isAr ? "نص المقال الكامل قيد النشر والتحديث." : "Full article text is being prepared and updated."}
            </p>
          )}
        </div>

        {/* Bottom Social Share Callout */}
        <div className="p-6 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-start">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase block font-display">
              {isAr ? "هل أعجبك هذا الموضوع؟" : "Found this insight valuable?"}
            </span>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr ? "شارك المقال مع زملائك ومجتمع المهتمين بالترفيه في قطر." : "Share this article with your network and entertainment partners."}
            </p>
          </div>
          <SocialShareButtons
            title={title}
            locale={locale}
          />
        </div>

        {/* RELATED STORIES & MORE INSIGHTS */}
        {relatedInsights.length > 0 && (
          <section className="pt-16 border-t border-[var(--border-level-2)] space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--e3-royal-blue)] block mb-1">
                  {isAr ? "المزيد من الرؤى" : "KEEP READING"}
                </span>
                <h3 className="text-2xl font-black font-display uppercase tracking-tight text-[var(--text-primary)]">
                  {isAr ? "مقالات وقصص ذات صلة" : "Related Stories & Releases"}
                </h3>
              </div>
              <Link
                href={`/${locale}/b2c/insights`}
                className="text-xs font-bold uppercase text-[var(--e3-royal-blue)] hover:underline flex items-center gap-1"
              >
                <span>{isAr ? "عرض الكل" : "View All"}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedInsights.map((rel) => {
                const relTitle = isAr ? rel.titleAr || rel.titleEn : rel.titleEn;
                const relImg = rel.featuredMediaUrl || rel.featuredMediaId || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80";
                return (
                  <Link
                    key={rel.id}
                    href={localizeHref(`/b2c/insights/${rel.slugEn || rel.id}`, locale)}
                    className="group rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:border-[var(--e3-royal-blue)] hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-black relative">
                      <img src={relImg} alt={relTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 start-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/70 text-white backdrop-blur-md">
                        {rel.contentType}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--e3-royal-blue)] transition-colors line-clamp-2 leading-snug">
                        {relTitle}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                        {isAr ? rel.excerptAr || rel.excerptEn : rel.excerptEn}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
