"use client"

import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { UniversalMediaConfig, UniversalMediaSectionEditor } from '@/components/dashboard/ui/UniversalMediaSectionEditor'
import { DEFAULT_B2C_LANDING_CONTENT, DEFAULT_B2C_SECTION_SEQUENCE, B2CSectionItem } from '@/lib/cms-default-pages'
import { Save, Sparkles, Users, CheckCircle, UserCheck, ShieldCheck, ListOrdered, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { resolveMediaType } from '@/lib/media-resolver'
import { EverlastingMemoriesManager } from './content/EverlastingMemoriesManager'

interface B2CLandingCMSViewProps {
  initialData?: any
}

export function B2CLandingCMSView({ initialData }: B2CLandingCMSViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<any>(initialData || DEFAULT_B2C_LANDING_CONTENT)
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([])

  const fetchLatestData = async () => {
    try {
      const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.content) {
          setContent(json.data.content);
        }
      }
    } catch (_e) {}
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          setAvailableTeamMembers(json);
        }
      }
    } catch (_e) {}
  };

  useEffect(() => {
    if (initialData) {
      setContent(initialData);
    }
    fetchLatestData();
    fetchTeamMembers();

    window.addEventListener('e3_cms_b2c_landing_updated', fetchLatestData);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('e3_cms_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'b2c_landing_updated') {
          fetchLatestData();
        }
      };
    } catch (_e) {}

    return () => {
      window.removeEventListener('e3_cms_b2c_landing_updated', fetchLatestData);
      if (bc) bc.close();
    };
  }, [initialData]);

  const handleAct1Change = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      act1Hero: { ...prev.act1Hero, [field]: val }
    }))
  }

  const handleAct2Change = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      act2Curtain: { ...prev.act2Curtain, [field]: val }
    }))
  }

  const handleCoreTeamChange = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      coreTeam: { ...prev.coreTeam, [field]: val }
    }))
  }

  const toggleTeamMemberSelection = (member: any) => {
    const currentCoreTeam = content.coreTeam || {}
    const currentSelectedIds: string[] = Array.isArray(currentCoreTeam.selectedMemberIds)
      ? currentCoreTeam.selectedMemberIds
      : (Array.isArray(currentCoreTeam.members) ? currentCoreTeam.members.map((m: any) => m.id) : [])

    const matchesMember = (id: string, m: any) =>
      id === m.id || id === m.slug || `team-${m.slug}` === id || (typeof id === 'string' && (id.includes(m.id) || m.id.includes(id)))

    const isSelected = currentSelectedIds.some(id => matchesMember(id, member))
    let newSelectedIds: string[]

    if (isSelected) {
      newSelectedIds = currentSelectedIds.filter(id => !matchesMember(id, member))
    } else {
      newSelectedIds = [...currentSelectedIds, member.id]
    }

    // Map selected member objects for immediate preview & persistence
    const selectedObjects = availableTeamMembers
      .filter(m => newSelectedIds.some(id => matchesMember(id, m)))
      .map(m => ({
        id: m.id,
        slug: m.slug || m.id,
        nameEn: `${m.firstName || ''} ${m.lastName || ''}`.trim() || "Team Member",
        nameAr: m.firstNameAr ? `${m.firstNameAr} ${m.lastNameAr || ''}`.trim() : `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        roleEn: m.designation || "Executive",
        roleAr: m.designationAr || m.designation || "قيادي",
        bioEn: m.aboutSummary || m.tagline || "",
        bioAr: m.aboutSummaryAr || m.aboutSummary || m.tagline || "",
        portrait: m.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        showProfileLink: true,
        profileCtaLabelEn: "View Profile",
        profileCtaLabelAr: "عرض الملف"
      }))

    setContent((prev: any) => ({
      ...prev,
      coreTeam: {
        ...prev.coreTeam,
        selectedMemberIds: newSelectedIds,
        members: selectedObjects
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const heroMedia = content.heroMedia || {}
      const act1Hero = content.act1Hero || {}
      
      const mediaUrlResolved = (heroMedia.mediaUrl || act1Hero.mediaUrl || act1Hero.desktopVideoUrl || '').trim()
      const mediaTypeResolved = resolveMediaType({ url: mediaUrlResolved, explicitType: heroMedia.mediaType })
      
      const updatedContent = {
        ...content,
        heroMedia: {
          ...heroMedia,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        hero: {
          ...(content.hero || {}),
          ...heroMedia,
          ...act1Hero,
          headerEn: act1Hero.titleEn || content.hero?.headerEn,
          headerAr: act1Hero.titleAr || content.hero?.headerAr,
          subHeaderEn: act1Hero.subtextEn || content.hero?.subHeaderEn,
          subHeaderAr: act1Hero.subtextAr || content.hero?.subHeaderAr,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
          posterUrl: (heroMedia.posterUrl || '').trim(),
        },
        act1Hero: {
          ...act1Hero,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        sectionSequence: sectionSequence,
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            content: updatedContent,
            published: true,
          }
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save landing page changes')
      }

      try {
        const bc = new BroadcastChannel('e3_cms_sync');
        bc.postMessage({ type: 'b2c_landing_updated', timestamp: Date.now() });
        bc.close();
      } catch (_e) {}

      window.dispatchEvent(new Event('e3_cms_b2c_landing_updated'));

      toast('CMS Page Saved Successfully: Landing Page content and team selection saved to database.')
      router.refresh()
    } catch (error: any) {
      toast(`Error Saving CMS Page: ${error.message || 'Could not update page'}`)
    } finally {
      setSaving(false)
    }
  }

  const selectedIds: string[] = Array.isArray(content.coreTeam?.selectedMemberIds)
    ? content.coreTeam.selectedMemberIds
    : (Array.isArray(content.coreTeam?.members) ? content.coreTeam.members.map((m: any) => m.id) : [])

  const sectionSequence: B2CSectionItem[] = (() => {
    const rawSeq: any[] = Array.isArray(content?.sectionSequence) ? content.sectionSequence : [];
    if (rawSeq.length === 0) return DEFAULT_B2C_SECTION_SEQUENCE;

    const userOrdered: B2CSectionItem[] = [];
    const seenIds = new Set<string>();

    for (let i = 0; i < rawSeq.length; i++) {
      const item = rawSeq[i];
      if (item && typeof item.id === 'string' && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        const defaultSec = DEFAULT_B2C_SECTION_SEQUENCE.find((d) => d.id === item.id);
        userOrdered.push({
          ...(defaultSec || {}),
          ...item,
          id: item.id,
          enabled: item.enabled !== undefined ? Boolean(item.enabled) : (defaultSec?.enabled ?? true),
          order: userOrdered.length + 1,
        });
      }
    }

    DEFAULT_B2C_SECTION_SEQUENCE.forEach((defaultSec) => {
      if (!seenIds.has(defaultSec.id)) {
        userOrdered.push({
          ...defaultSec,
          order: userOrdered.length + 1,
        });
      }
    });

    return userOrdered;
  })();

  const updateSectionSequence = (newSeq: B2CSectionItem[]) => {
    const normalized = newSeq.map((sec, index) => ({
      ...sec,
      order: index + 1,
    }));
    setContent((prev: any) => ({
      ...prev,
      sectionSequence: normalized,
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const items = [...sectionSequence];
    if (direction === 'up' && index > 0) {
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
    } else if (direction === 'down' && index < items.length - 1) {
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
    } else if (direction === 'top' && index > 0) {
      const [item] = items.splice(index, 1);
      items.unshift(item);
    } else if (direction === 'bottom' && index < items.length - 1) {
      const [item] = items.splice(index, 1);
      items.push(item);
    }
    updateSectionSequence(items);
  };

  const toggleSectionEnabled = (index: number) => {
    const items = [...sectionSequence];
    items[index] = {
      ...items[index],
      enabled: !items[index].enabled,
    };
    updateSectionSequence(items);
  };

  const resetSectionSequence = () => {
    updateSectionSequence(DEFAULT_B2C_SECTION_SEQUENCE);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-level-1)] shadow-sm">
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Landing Page CMS Editor</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage acts, section sequence ordering, media configurations, and team members displayed on the landing page.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* B2C Landing Page Section Sequence & Ordering Manager */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-level-1)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-purple-500" />
              <span>B2C Landing Page Section Sequence Manager</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Reorder sections, toggle visibility, or customize sequence flow for the public B2C landing page (<code className="text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded">/b2c</code>).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              {sectionSequence.filter(s => s.enabled).length} / {sectionSequence.length} Active Sections
            </span>
            <button
              onClick={resetSectionSequence}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-level-1)] hover:bg-purple-500/10 text-xs font-semibold text-[var(--text-secondary)] hover:text-purple-400 rounded-xl border border-[var(--border-level-1)] transition-all cursor-pointer"
              title="Reset to default section ordering"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Order</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sectionSequence.map((sec, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === sectionSequence.length - 1;

            return (
              <div
                key={sec.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  sec.enabled
                    ? 'bg-[var(--bg-level-1)] border-[var(--border-level-1)] hover:border-purple-500/30'
                    : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {sec.nameEn}
                      </h4>
                      <span className="text-xs font-medium text-[var(--text-tertiary)] font-sans" dir="rtl">
                        ({sec.nameAr})
                      </span>
                      {!sec.enabled && (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Hidden
                        </span>
                      )}
                    </div>
                    {sec.descriptionEn && (
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                        {sec.descriptionEn}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleSectionEnabled(idx)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sec.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {sec.enabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Reorder Buttons */}
                  <div className="flex items-center bg-[var(--surface-default)] rounded-lg p-1 border border-[var(--border-level-1)] gap-1">
                    <button
                      onClick={() => moveSection(idx, 'top')}
                      disabled={isFirst}
                      type="button"
                      className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-30 disabled:hover:text-[var(--text-secondary)] rounded transition-all cursor-pointer"
                      title="Move to Top"
                    >
                      <ChevronsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={isFirst}
                      type="button"
                      className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-30 disabled:hover:text-[var(--text-secondary)] rounded transition-all cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={isLast}
                      type="button"
                      className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-30 disabled:hover:text-[var(--text-secondary)] rounded transition-all cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'bottom')}
                      disabled={isLast}
                      type="button"
                      className="p-1 text-[var(--text-secondary)] hover:text-purple-400 disabled:opacity-30 disabled:hover:text-[var(--text-secondary)] rounded transition-all cursor-pointer"
                      title="Move to Bottom"
                    >
                      <ChevronsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Media Settings */}
      <UniversalMediaSectionEditor
        title="Landing Hero Media Settings"
        subtitle="Universal hero media configuration supporting Video, Image, 3D Canvas, IFrame, and Mobile Fallbacks."
        value={content.heroMedia || {
          mediaType: content.act1Hero?.desktopVideoUrl?.match(/\.(mp4|webm)$/i) ? 'VIDEO' : 'IMAGE',
          mediaUrl: content.act1Hero?.desktopVideoUrl || content.hero?.mediaUrl || '',
          fallbackImage: content.act1Hero?.mobileVideoUrl || content.hero?.posterUrl || '',
          posterUrl: content.act1Hero?.mobileVideoUrl || content.hero?.posterUrl || '',
        }}
        onChange={(heroMedia: UniversalMediaConfig) => setContent((prev: any) => ({
          ...prev,
          heroMedia,
          act1Hero: {
            ...prev.act1Hero,
            mediaUrl: heroMedia.mediaUrl,
            desktopVideoUrl: heroMedia.mediaUrl,
            mediaType: heroMedia.mediaType,
            mobileVideoUrl: heroMedia.fallbackImage || heroMedia.posterUrl,
          },
          hero: {
            ...prev.hero,
            mediaUrl: heroMedia.mediaUrl,
            mediaType: heroMedia.mediaType,
            posterUrl: heroMedia.fallbackImage || heroMedia.posterUrl,
          }
        }))}
        accentColor="purple"
      />

      {/* Act 1: Hero Headlines */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          <span>Act 1: Hero Title & Headlines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline Text (English)</label>
            <input
              type="text"
              value={content.act1Hero?.titleEn || content.hero?.headerEn || ''}
              onChange={(e) => handleAct1Change('titleEn', e.target.value)}
              placeholder="e.g. Some days pass. Others become stories."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline Text (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={content.act1Hero?.titleAr || content.hero?.headerAr || ''}
              onChange={(e) => handleAct1Change('titleAr', e.target.value)}
              placeholder="مثال: أيام تمرّ… وأيام تتحول إلى حكايات."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext Description (English)</label>
            <textarea
              rows={3}
              value={content.act1Hero?.subtextEn || content.hero?.subHeaderEn || ''}
              onChange={(e) => handleAct1Change('subtextEn', e.target.value)}
              placeholder="Enter hero subtitle description..."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext Description (Arabic)</label>
            <textarea
              rows={3}
              dir="rtl"
              value={content.act1Hero?.subtextAr || content.hero?.subHeaderAr || ''}
              onChange={(e) => handleAct1Change('subtextAr', e.target.value)}
              placeholder="أدخل الوصف الفرعي للهيرو..."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Act 2: Brand Manifesto */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          <span>Act 2: Brand Manifesto & Subtext</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Manifesto Headline (English)</label>
            <input
              type="text"
              value={content.act2Curtain?.headingEn || ''}
              onChange={(e) => handleAct2Change('headingEn', e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Manifesto Headline (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={content.act2Curtain?.headingAr || ''}
              onChange={(e) => handleAct2Change('headingAr', e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Core Team & Leadership Selector Section */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-level-1)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>Core Team & Leadership Display Selector</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select which team members from <code className="text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded">/dashboard/team</code> will be showcased on the landing page.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            {selectedIds.length} Members Selected
          </span>
        </div>

        {/* Section Headline Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Team Section Title (English)</label>
            <input
              type="text"
              value={content.coreTeam?.headlineEn || 'The people behind the experience'}
              onChange={(e) => handleCoreTeamChange('headlineEn', e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Team Section Title (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={content.coreTeam?.headlineAr || 'الفريق الذي يصنع التجربة'}
              onChange={(e) => handleCoreTeamChange('headlineAr', e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Team Members Grid Selection Picker */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Select Team Members from Database Profiles (/dashboard/team):
          </label>

          {availableTeamMembers.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-1)]">
              <Users className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[var(--text-secondary)]">No team members registered yet in database.</p>
              <a href="/dashboard/team" className="text-xs font-bold text-purple-400 hover:underline mt-2 inline-block">
                Manage Team Profiles under /dashboard/team ↗
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableTeamMembers.map((member) => {
                const isSelected = selectedIds.some(id => id === member.id || id === member.slug || `team-${member.slug}` === id)
                const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Team Member'

                return (
                  <div
                    key={member.id}
                    onClick={() => toggleTeamMemberSelection(member)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 select-none ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-md'
                        : 'border-[var(--border-level-1)] bg-[var(--bg-level-1)] hover:border-purple-500/40'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10">
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-purple-400">
                          {member.firstName?.[0] || 'E'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{fullName}</h4>
                      <p className="text-xs text-purple-400 truncate">{member.designation || member.department || 'Executive'}</p>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <UserCheck className="w-5 h-5 text-purple-400 fill-purple-500/20" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-[var(--border-level-1)]" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Everlasting Memories Section Manager */}
      <EverlastingMemoriesManager
        value={content.guestMemories}
        onChange={(guestMemories) => setContent((prev: any) => ({ ...prev, guestMemories }))}
      />

      {/* Universal Footer Media Section */}
      <UniversalMediaSectionEditor
        title="Landing Footer Banner Media Settings"
        subtitle="Universal footer banner media supporting Image, Video, 3D Canvas, IFrame, and Mobile Fallbacks."
        value={content.footerMedia || { mediaType: 'IMAGE', mediaUrl: '' }}
        onChange={(footerMedia: UniversalMediaConfig) => setContent((prev: any) => ({ ...prev, footerMedia }))}
        accentColor="indigo"
      />
    </div>
  )
}
