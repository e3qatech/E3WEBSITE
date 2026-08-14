"use client";

import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig, UniversalMediaSectionEditor } from "@/components/dashboard/ui/UniversalMediaSectionEditor";
import { DEFAULT_B2C_LANDING_CONTENT } from "@/lib/cms-default-pages";
import { Save, Sliders, ExternalLink, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/layout/LocaleProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
  DashboardStickyActions,
} from "@/components/dashboard/ui";
import { resolveMediaType } from "@/lib/media-resolver";

interface B2CMediaManagerProps {
  initialData?: any;
}

export function B2CMediaManager({ initialData }: B2CMediaManagerProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fullContent, setFullContent] = useState<any>(initialData || null);

  const [heroMedia, setHeroMedia] = useState<UniversalMediaConfig>({
    ...DEFAULT_UNIVERSAL_MEDIA,
    ...(initialData?.heroMedia || initialData?.hero || {}),
    mediaType: initialData?.heroMedia?.mediaType || (initialData?.act1Hero?.desktopVideoUrl?.match(/\.(mp4|webm)$/i) ? "VIDEO" : "IMAGE"),
    mediaUrl: initialData?.heroMedia?.mediaUrl || initialData?.hero?.mediaUrl || initialData?.act1Hero?.desktopVideoUrl || "",
    fallbackImage: initialData?.heroMedia?.fallbackImage || initialData?.hero?.posterUrl || "",
  });

  const [maskedVideo, setMaskedVideo] = useState({
    enabled: true,
    preset: "ORGANIC_WINDOW",
    scale: 1,
    positionX: 0,
    positionY: 0,
    edgeSoftness: 12,
    idleBreathe: true,
    customerDesktopVideo: "",
    customerPoster: "",
    customerAccent: "#10b981",
    organizerDesktopVideo: "",
    organizerPoster: "",
    organizerAccent: "#3b82f6",
    ...(initialData?.maskedVideo || {}),
  });

  useEffect(() => {
    if (initialData) return;

    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch("/api/cms/pages/b2c-landing?t=" + Date.now(), { cache: "no-store" });
        if (res.ok && isMounted) {
          const json = await res.json();
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT;
          setFullContent(data);
          setHeroMedia({
            ...DEFAULT_UNIVERSAL_MEDIA,
            ...(data.heroMedia || data.hero || {}),
          });
          if (data.maskedVideo) {
            setMaskedVideo({
              ...DEFAULT_B2C_LANDING_CONTENT.maskedVideo,
              ...data.maskedVideo,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load b2c-landing CMS data:", err);
        if (isMounted) {
          toast(isAr ? "فشل تحميل محتوى وسائط B2C" : "Failed to load Media Manager content", "error");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [initialData, isAr, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const mediaUrlResolved = (heroMedia.mediaUrl || "").trim();
      const mediaTypeResolved = resolveMediaType({ url: mediaUrlResolved, explicitType: heroMedia.mediaType });

      const payload = {
        content: {
          heroMedia: {
            ...heroMedia,
            mediaUrl: mediaUrlResolved,
            mediaType: mediaTypeResolved,
          },
          hero: {
            ...(fullContent?.hero || DEFAULT_B2C_LANDING_CONTENT.hero),
            ...heroMedia,
            mediaUrl: mediaUrlResolved,
            mediaType: mediaTypeResolved,
          },
          act1Hero: {
            ...(fullContent?.act1Hero || {}),
            ...heroMedia,
            mediaUrl: mediaUrlResolved,
            desktopVideoUrl: mediaUrlResolved,
            mediaType: mediaTypeResolved,
          },
          maskedVideo,
        },
      };

      const res = await fetch("/api/cms/pages/b2c-landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(isAr ? "فشل حفظ إعدادات وسائط B2C" : "Failed to save B2C Media settings");

      const json = await res.json().catch(() => null);
      if (json?.data?.content) {
        setFullContent(json.data.content);
        if (json.data.content.heroMedia) {
          setHeroMedia({
            ...DEFAULT_UNIVERSAL_MEDIA,
            ...json.data.content.heroMedia,
          });
        }
        if (json.data.content.maskedVideo) {
          setMaskedVideo({
            ...DEFAULT_B2C_LANDING_CONTENT.maskedVideo,
            ...json.data.content.maskedVideo,
          });
        }
      }

      setIsDirty(false);
      toast(isAr ? "تم حفظ وسائط B2C بنجاح!" : "B2C Media Manager saved successfully!", "success");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Error saving media settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLoadingState title={isAr ? "جاري تحميل مدير وسائط B2C..." : "Loading B2C Media Manager..."} type="skeleton" />;
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Top Action Header */}
      <DashboardPageHeader
        title={isAr ? "مدير وسائط وخلفيات تجارب B2C" : "B2C Media Manager"}
        description={
          isAr
            ? "إدارة مقاطع فيديو الخلفية، أقنعة النوافذ العضوية، أصول وسائط الهيرو وروابط التوزيع السحابي."
            : "Manage background video feeds, organic window masked video parameters, edge softness, hero media assets, and CDN links."
        }
        breadcrumbs={[
          { label: isAr ? "محتوى B2C" : "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: isAr ? "مدير وسائط B2C" : "B2C Media Manager" },
        ]}
        badge={{ label: isAr ? "وسائط B2C" : "B2C Media", variant: "cyan" }}
        previewUrl="/b2c"
        primaryAction={{
          label: saving ? (isAr ? "جاري الحفظ..." : "Saving Changes...") : (isAr ? "حفظ إعدادات الوسائط" : "Save Media Settings"),
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      <div className="space-y-6">
        {/* Reciprocal Ownership Handoff Card */}
        <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {isAr ? "محرر صفحة B2C الرئيسية" : "B2C Landing Page Editor"}
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr
                  ? "إدارة ترتيب الأقسام، نصوص الهيرو، بيان العلامة واختيار فريق القيادة."
                  : "Manage section sequence, hero copy/actions, manifesto, and team selection."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/${locale}/dashboard/b2c/landing`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
            >
              <span>{isAr ? "فتح محرر صفحة B2C" : "Open Landing Editor"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`/${locale}/dashboard/cms/media`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-secondary)] transition-all"
            >
              <span>{isAr ? "مكتبة الوسائط العامة" : "Global Media Library"}</span>
            </a>
          </div>
        </div>

        {/* Hero Media Section */}
        <UniversalMediaSectionEditor
          title={isAr ? "إعدادات وسائط وغلاف هيرو الصفحة" : "Landing Hero Media & Cover Settings"}
          subtitle={
            isAr
              ? "إعدادات وسائط الهيرو الشاملة التي تدعم الصور والفيديو والكانفاس ثلاثي الأبعاد وصور التوافق مع الهواتف."
              : "Universal hero media configuration supporting Image, Video, 3D Canvas, IFrame, and Fallback Images. Kept in 100% lockstep with B2C Landing Layout Editor."
          }
          value={heroMedia}
          onChange={(updated: UniversalMediaConfig) => {
            setHeroMedia(updated);
            setIsDirty(true);
          }}
          accentColor="blue"
        />

        {/* Masked Organic Window Controls */}
        <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              <span>{isAr ? "إعدادات النافذة العضوية لمقاطع الفيديو" : "Organic Window Masked Video Controls"}</span>
            </h2>

            <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={maskedVideo.enabled}
                onChange={(e) => {
                  setMaskedVideo((prev: any) => ({ ...prev, enabled: e.target.checked }));
                  setIsDirty(true);
                }}
                className="rounded accent-blue-500"
              />
              <span>{isAr ? "تفعيل النافذة العضوية" : "Enable Organic Window Video"}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {isAr ? "قالب شكل القناع" : "Mask Shape Preset"}
              </label>
              <select
                value={maskedVideo.preset}
                onChange={(e) => {
                  setMaskedVideo((prev: any) => ({ ...prev, preset: e.target.value }));
                  setIsDirty(true);
                }}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              >
                <option value="ORGANIC_WINDOW">{isAr ? "قوس النافذة العضوي" : "Organic Window Arch"}</option>
                <option value="PILL_CAPSULE">{isAr ? "كبسولة دائرية" : "Pill Capsule"}</option>
                <option value="MODERN_HEXAGON">{isAr ? "شكل سداسي حديث" : "Modern Hexagon"}</option>
                <option value="CIRCLE">{isAr ? "دائرة محورية" : "Circular Focal"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {isAr ? `مقياس القناع (${maskedVideo.scale}x)` : `Mask Scale (${maskedVideo.scale}x)`}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={maskedVideo.scale}
                onChange={(e) => {
                  setMaskedVideo((prev: any) => ({ ...prev, scale: parseFloat(e.target.value) }));
                  setIsDirty(true);
                }}
                className="w-full accent-blue-500 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {isAr ? `تنعيم الحواف (${maskedVideo.edgeSoftness}px)` : `Edge Feathering / Softness (${maskedVideo.edgeSoftness}px)`}
              </label>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={maskedVideo.edgeSoftness}
                onChange={(e) => {
                  setMaskedVideo((prev: any) => ({ ...prev, edgeSoftness: parseInt(e.target.value) }));
                  setIsDirty(true);
                }}
                className="w-full accent-blue-500 mt-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <DashboardStickyActions
        onSave={handleSave}
        isSaving={saving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (window.confirm(isAr ? "إلغاء التغييرات غير المحفوظة؟" : "Discard unsaved changes?")) {
            router.refresh();
            setIsDirty(false);
          }
        }}
      />
    </DashboardPageShell>
  );
}
