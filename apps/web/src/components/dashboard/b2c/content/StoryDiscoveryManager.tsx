"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import {
  Compass,
  Plus,
  Save,
  Sparkles,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  LayoutTemplate
} from 'lucide-react'
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
  DashboardUnsavedChangesGuard,
  AdminEmptyState
} from '@/components/dashboard/ui'
import { useLocale } from '@/components/layout/LocaleProvider'
import { cn } from '@/lib/utils'

export function StoryDiscoveryManager({
  initialStoryTypes,
  initialIntentSelector,
}: {
  initialStoryTypes?: any[];
  initialIntentSelector?: any;
} = {}) {
  const router = useRouter()
  const { toast } = useToast()
  const { locale } = useLocale()
  const isAr = locale === 'ar'

  const [loading, setLoading] = useState(initialStoryTypes === undefined)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [fullContent, setFullContent] = useState<any>(null)

  const [intentSelector, setIntentSelector] = useState({
    titleEn: initialIntentSelector?.titleEn || '',
    titleAr: initialIntentSelector?.titleAr || '',
  })

  const [storyTypes, setStoryTypes] = useState<any[]>(initialStoryTypes || [])

  const loadData = useCallback(async () => {
    if (initialStoryTypes !== undefined && initialIntentSelector !== undefined) return
    setLoading(true)
    setError(null)
    try {
      const [pageRes, typesRes] = await Promise.all([
        fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/b2c/story-types?t=' + Date.now(), { cache: 'no-store' })
      ])

      if (pageRes.ok) {
        const json = await pageRes.json()
        const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
        setFullContent(data)
        if (data.intentSelector) {
          setIntentSelector({
            titleEn: data.intentSelector.titleEn || DEFAULT_B2C_LANDING_CONTENT.intentSelector.titleEn,
            titleAr: data.intentSelector.titleAr || DEFAULT_B2C_LANDING_CONTENT.intentSelector.titleAr,
          })
        }
      }

      if (typesRes.ok) {
        const typesData = await typesRes.json()
        setStoryTypes(Array.isArray(typesData) ? typesData : [])
      } else {
        throw new Error('Failed to load story classifications from server')
      }
    } catch (err: any) {
      console.error('Failed to load b2c-landing CMS data:', err)
      setError(err?.message || (isAr ? 'فشل تحميل بيانات مسارات الحكايات' : 'Failed to load Story Discovery content'))
      toast(isAr ? 'فشل تحميل بيانات مسارات الحكايات' : 'Failed to load Story Discovery content', 'error')
    } finally {
      setLoading(false)
    }
  }, [isAr, toast, initialStoryTypes, initialIntentSelector])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Explicit initial async load
    loadData()
  }, [loadData])

  const handleAddStoryType = () => {
    setIsDirty(true)
    setStoryTypes(prev => [
      ...prev,
      {
        isNew: true,
        slug: `story-${Date.now()}`,
        titleEn: isAr ? 'مسار جديد' : 'New Story Type',
        titleAr: 'مسار جديد',
        icon: '',
        coverMediaUrl: '',
        accentColor: '#8b5cf6',
        isActive: true,
        orderIndex: prev.length
      }
    ])
  }

  const handleDeleteStoryType = (index: number) => {
    setIsDirty(true)
    setStoryTypes(prev => prev.filter((_, i) => i !== index))
  }

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= storyTypes.length) return

    setIsDirty(true)
    setStoryTypes(prev => {
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[targetIdx]
      updated[targetIdx] = temp

      // Update orderIndex values
      return updated.map((item, idx) => ({ ...item, orderIndex: idx }))
    })
  }

  const handleStoryTypeChange = (index: number, field: string, value: any) => {
    setIsDirty(true)
    setStoryTypes(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (fullContent) {
        const updatedContent = {
          ...fullContent,
          intentSelector: {
            ...fullContent.intentSelector,
            titleEn: intentSelector.titleEn,
            titleAr: intentSelector.titleAr,
          }
        }

        const pageRes = await fetch('/api/cms/pages/b2c-landing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { content: updatedContent } })
        })

        if (!pageRes.ok) throw new Error('Failed to update page header content')
      }

      const typesRes = await fetch('/api/b2c/story-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyTypes })
      })

      if (!typesRes.ok) {
        const errJson = await typesRes.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to update story types')
      }

      setIsDirty(false)
      setLastSaved(new Date())
      toast(isAr ? 'تم حفظ مسارات الحكايات بنجاح!' : 'Story Discovery content manager saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving content'), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLoadingState
        title={isAr ? "جاري تحميل مدير مسارات الحكايات..." : "Loading Story Discovery Manager..."}
        type="skeleton"
      />
    )
  }

  if (error) {
    return (
      <DashboardPageShell variant="focused">
        <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-rose-300">
            {isAr ? "تعذر تحميل مسارات الحكايات" : "Could not load Story Discovery content"}
          </h3>
          <p className="text-xs text-rose-200/80 leading-relaxed">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? "إعادة المحاولة" : "Retry Connection"}</span>
          </button>
        </div>
      </DashboardPageShell>
    )
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title={isAr ? "مدير محتوى مسارات الحكايات" : "Story Discovery Content Manager"}
        description={
          isAr
            ? "إدارة تصنيفات حكايات الزوار التفاعلية، وتصنيف أنشطة التجارب، ومسارات السرد القصصي."
            : "Manage interactive guest story selection categories, classification filters, and narrative tracks."
        }
        breadcrumbs={[
          { label: isAr ? "محتوى الأفراد" : "B2C Content", href: `/${locale}/dashboard/b2c/attractions` },
          { label: isAr ? "مسارات الحكايات" : "Story Discovery" },
        ]}
        badge={{ label: `${storyTypes.length} ${isAr ? 'مسارات' : 'Tracks'}`, variant: "purple" }}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving
            ? (isAr ? 'جاري الحفظ...' : 'Saving Changes...')
            : (isAr ? 'حفظ مسارات الحكايات' : 'Save Story Discovery'),
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <button
            onClick={handleAddStoryType}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border-level-1)] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? "إضافة مسار حكاية" : "Add Story Type"}</span>
          </button>
        }
      />

      {/* Reciprocal Handoff Card to Discover Page Editor */}
      <div className="bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-[var(--surface-default)] border border-purple-500/30 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "محرر صفحة اكتشف إي ثري العامة" : "Discover Page CMS Editor"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "لتعديل البانر الرئيسي، ورسائل القيادة، ورقم غينيس، وإعدادات SEO لصفحة /b2c/discover، انتقل إلى المحرر المخصص."
                : "To configure the hero section, leadership messages, Guinness record, and SEO for /b2c/discover, use the dedicated editor."}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/b2c/discover`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all shrink-0 cursor-pointer"
        >
          <span>{isAr ? "فتح محرر صفحة اكتشف" : "Open Discover Page Editor"}</span>
          <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
        </Link>
      </div>

      {/* Section Header */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-purple-500 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>{isAr ? "عنوان ودعوة الاستكشاف التفاعلي" : "Section Title & Prompt"}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isAr ? "نص الدعوة (بالإنجليزية)" : "Title Prompt (English)"}
            </label>
            <input
              type="text"
              value={intentSelector.titleEn}
              onChange={(e) => {
                setIsDirty(true)
                setIntentSelector(prev => ({ ...prev, titleEn: e.target.value }))
              }}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isAr ? "نص الدعوة (بالعربية)" : "Title Prompt (Arabic)"}
            </label>
            <input
              type="text"
              dir="rtl"
              value={intentSelector.titleAr}
              onChange={(e) => {
                setIsDirty(true)
                setIntentSelector(prev => ({ ...prev, titleAr: e.target.value }))
              }}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>
      </div>

      {/* Story Types Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-purple-500 flex items-center gap-2">
              <Compass className="w-5 h-5" />
              <span>
                {isAr
                  ? `تصنيفات ومسارات الحكايات (${storyTypes.length})`
                  : `Story Classifications (${storyTypes.length})`}
              </span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isAr
                ? "إدارة التصنيفات والمسارات المستخدمة لفلترة وعرض أنشطة التجارب."
                : "Manage the categories used to classify What's Inside activities."}
            </p>
          </div>

          <button
            onClick={handleAddStoryType}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إضافة مسار" : "Add Story Type"}</span>
          </button>
        </div>

        {storyTypes.length === 0 ? (
          <AdminEmptyState
            title={isAr ? "لا توجد مسارات حكايات حالياً" : "No story tracks configured"}
            description={
              isAr
                ? "أضف مسار حكاية جديد لتمكين الزوار من استكشاف الأنشطة بناءً على اهتماماتهم."
                : "Create your first narrative track to let visitors explore experiences by their intent."
            }
            action={{
              label: isAr ? "إضافة مسار حكاية جديد" : "Create New Story Track",
              onClick: handleAddStoryType,
              icon: <Plus className="w-4 h-4" />
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {storyTypes.map((opt, idx) => (
              <div
                key={opt.id || opt.slug || idx}
                className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 shadow-sm relative overflow-hidden"
              >
                <div
                  className={cn("absolute top-0 w-1.5 h-full", isAr ? "right-0" : "left-0")}
                  style={{ backgroundColor: opt.accentColor || '#8b5cf6' }}
                />

                <div className={cn("flex items-center justify-between border-b border-[var(--border-level-1)] pb-3", isAr ? "pr-4" : "pl-4")}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                      {opt.titleEn || (isAr ? `مسار #${idx + 1}` : `Type #${idx + 1}`)}
                      {opt._count?.features !== undefined && (
                        <span className="px-2 py-0.5 bg-[var(--surface-subtle)] rounded-md text-[10px] font-mono">
                          {opt._count.features} {isAr ? "أنشطة مرتبطة" : "Activities Assigned"}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Ordering controls */}
                    <div className="flex items-center gap-1 bg-[var(--surface-default)] p-1 rounded-lg border border-[var(--border-level-1)]">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded hover:bg-[var(--surface-hover)] disabled:opacity-30 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === storyTypes.length - 1}
                        title="Move Down"
                        className="p-1 rounded hover:bg-[var(--surface-hover)] disabled:opacity-30 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={opt.isActive ?? true}
                        onChange={(e) => handleStoryTypeChange(idx, 'isActive', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>{isAr ? "مفعل على الموقع" : "Active on Frontend"}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteStoryType(idx)}
                      title={isAr ? "حذف المسار" : "Delete Track"}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", isAr ? "pr-4" : "pl-4")}>
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                      {isAr ? "العنوان (بالإنجليزية)" : "Title (English)"}
                    </label>
                    <input
                      type="text"
                      value={opt.titleEn || ''}
                      onChange={(e) => handleStoryTypeChange(idx, 'titleEn', e.target.value)}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                      {isAr ? "العنوان (بالعربية)" : "Title (Arabic)"}
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={opt.titleAr || ''}
                      onChange={(e) => handleStoryTypeChange(idx, 'titleAr', e.target.value)}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                      {isAr ? "الوصف المختصر (بالإنجليزية)" : "Short Description (Optional - English)"}
                    </label>
                    <input
                      type="text"
                      value={opt.descriptionEn || ''}
                      onChange={(e) => handleStoryTypeChange(idx, 'descriptionEn', e.target.value)}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                      {isAr ? "الوصف المختصر (بالعربية)" : "Short Description (Optional - Arabic)"}
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={opt.descriptionAr || ''}
                      onChange={(e) => handleStoryTypeChange(idx, 'descriptionAr', e.target.value)}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                        {isAr ? "المعرف الفريد (Slug)" : "Unique Slug ID"}
                      </label>
                      <input
                        type="text"
                        value={opt.slug || ''}
                        onChange={(e) => handleStoryTypeChange(idx, 'slug', e.target.value)}
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                        {isAr ? "لون السمة" : "Accent HEX"}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={opt.accentColor || '#8b5cf6'}
                          onChange={(e) => handleStoryTypeChange(idx, 'accentColor', e.target.value)}
                          className="w-7 h-7 rounded border border-gray-600 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={opt.accentColor || ''}
                          onChange={(e) => handleStoryTypeChange(idx, 'accentColor', e.target.value)}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                      {isAr
                        ? "صورة غلاف مخصصة (اختياري - يتم استخدام النشاط الأول افتراضياً)"
                        : "Custom Cover Media (Optional - fallbacks to first activity)"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={opt.coverMediaUrl || ''}
                        onChange={(e) => handleStoryTypeChange(idx, 'coverMediaUrl', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--text-tertiary)]"
                      />
                      <AdminMediaPicker
                        value={opt.coverMediaUrl || ''}
                        onChange={(url: string) => handleStoryTypeChange(idx, 'coverMediaUrl', url)}
                        label={isAr ? "الوسائط" : "Media"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardPageShell>
  );
}
