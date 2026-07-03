"use client"

import * as React from "react"
import { AdminFormLayout } from "@/components/dashboard/ui/AdminFormLayout"
import { AdminFormSection, AdminFormGrid } from "@/components/dashboard/ui/AdminFormSection"
import { AdminInput } from "@/components/dashboard/ui/AdminInput"
import { AdminTextarea } from "@/components/dashboard/ui/AdminTextarea"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminMediaPicker } from "@/components/dashboard/ui/AdminMediaPicker"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { Save, Image as ImageIcon } from "lucide-react"

import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"

export function B2BHomeEditor({ initialData }: { initialData: any }) {
  const [isSaving, setIsSaving] = React.useState(false)
  const { toast } = useToast()

  // State
  const [hero, setHero] = React.useState(initialData.content?.hero || {})
  const [stats, setStats] = React.useState<any[]>(initialData.content?.stats || [])
  const [wowAndHow, setWowAndHow] = React.useState(initialData.content?.wowAndHow || {})

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { hero, stats, wowAndHow }
        })
      })

      if (!res.ok) throw new Error("Failed to save")
      
      toast("Homepage content updated successfully", "success")
    } catch (e) {
      toast("Failed to update homepage content", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <AdminPageHeader
        title="B2B Homepage Editor"
        description="Manage the content blocks on the main B2B corporate portal."
        action={
          <AdminButton 
            variant="primary" 
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </AdminButton>
        }
      />
      <AdminFormLayout>
      <div className="space-y-8">
        {/* HERO SECTION */}
        <AdminFormSection id="hero" title="Hero Section" description="The main introduction at the top of the page.">
          <AdminFormGrid>
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-text-primary">Hero Background Media Type</label>
              <select
                value={hero.mediaType || "IMAGE"}
                onChange={e => setHero({ ...hero, mediaType: e.target.value })}
                className="w-full bg-surface-hover border border-border-default rounded-md px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none mb-2"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="IFRAME">External iFrame</option>
                <option value="SPLINE">Spline / 3D Scene</option>
              </select>

              {(hero.mediaType === 'IFRAME' || hero.mediaType === 'SPLINE') ? (
                <input 
                  type="text" 
                  value={hero.mediaUrl || ''} 
                  onChange={e => setHero({ ...hero, mediaUrl: e.target.value })} 
                  placeholder="https://..." 
                  className="w-full bg-surface-hover border border-border-default rounded-md px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              ) : (
                <AdminMediaPicker
                  label="Upload Media"
                  value={hero.mediaUrl || hero.backgroundImage || ""}
                  onChange={url => setHero({ ...hero, mediaUrl: url, backgroundImage: url })}
                  accept={hero.mediaType === 'VIDEO' ? 'video/*' : 'image/*'}
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Headline" 
                value={hero.title || ""} 
                onChange={e => setHero({ ...hero, title: e.target.value })} 
                placeholder="e.g. Ideas to Life"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Subtitle" 
                value={hero.subtitle || ""} 
                onChange={e => setHero({ ...hero, subtitle: e.target.value })} 
                placeholder="Short punchy text"
                rows={2}
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Description" 
                value={hero.description || ""} 
                onChange={e => setHero({ ...hero, description: e.target.value })} 
                placeholder="Longer descriptive text..."
                rows={3}
              />
            </div>
            <AdminInput 
              label="Primary CTA Label" 
              value={hero.primaryCta || ""} 
              onChange={e => setHero({ ...hero, primaryCta: e.target.value })} 
            />
            <AdminInput 
              label="Primary CTA Link" 
              value={hero.primaryLink || ""} 
              onChange={e => setHero({ ...hero, primaryLink: e.target.value })} 
            />
            <AdminInput 
              label="Secondary CTA Label" 
              value={hero.secondaryCta || ""} 
              onChange={e => setHero({ ...hero, secondaryCta: e.target.value })} 
            />
            <AdminInput 
              label="Secondary CTA Link" 
              value={hero.secondaryLink || ""} 
              onChange={e => setHero({ ...hero, secondaryLink: e.target.value })} 
            />
          </AdminFormGrid>
        </AdminFormSection>

        {/* STATS SECTION */}
        <AdminFormSection id="stats" title="Credibility Stats" description="The 4 statistics displayed prominently on the board.">
          <div className="space-y-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-border-default rounded-md bg-surface-active">
                <div className="w-1/3">
                  <AdminInput 
                    label="Value" 
                    value={stat.value} 
                    onChange={e => {
                      const newStats = [...stats]
                      newStats[idx].value = e.target.value
                      setStats(newStats)
                    }} 
                    placeholder="e.g. 50+"
                  />
                </div>
                <div className="w-2/3">
                  <AdminInput 
                    label="Label" 
                    value={stat.label} 
                    onChange={e => {
                      const newStats = [...stats]
                      newStats[idx].label = e.target.value
                      setStats(newStats)
                    }} 
                    placeholder="e.g. Years Experience"
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminFormSection>

        {/* WOW AND HOW */}
        <AdminFormSection id="wowhow" title="The Wow & How" description="The two distinct pillars of the E3 methodology.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Section Title" 
                value={wowAndHow.title || ""} 
                onChange={e => setWowAndHow({ ...wowAndHow, title: e.target.value })} 
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Section Description" 
                value={wowAndHow.description || ""} 
                onChange={e => setWowAndHow({ ...wowAndHow, description: e.target.value })} 
                rows={3}
              />
            </div>
            
            {/* Wow Bullets */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-text-primary">Wow Bullets</label>
              {(wowAndHow.wowBullets || []).map((bullet: string, idx: number) => (
                <input 
                  key={`wow-${idx}`}
                  type="text" 
                  value={bullet}
                  onChange={e => {
                    const newBullets = [...wowAndHow.wowBullets]
                    newBullets[idx] = e.target.value
                    setWowAndHow({ ...wowAndHow, wowBullets: newBullets })
                  }}
                  className="w-full h-10 px-3 bg-surface-default border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              ))}
            </div>

            {/* How Bullets */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-text-primary">How Bullets</label>
              {(wowAndHow.howBullets || []).map((bullet: string, idx: number) => (
                <input 
                  key={`how-${idx}`}
                  type="text" 
                  value={bullet}
                  onChange={e => {
                    const newBullets = [...wowAndHow.howBullets]
                    newBullets[idx] = e.target.value
                    setWowAndHow({ ...wowAndHow, howBullets: newBullets })
                  }}
                  className="w-full h-10 px-3 bg-surface-default border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              ))}
            </div>
          </AdminFormGrid>
        </AdminFormSection>

      </div>
    </AdminFormLayout>
    </div>
  )
}
