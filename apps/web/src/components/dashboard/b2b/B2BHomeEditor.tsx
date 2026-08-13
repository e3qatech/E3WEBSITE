"use client"

import * as React from "react"
import { AdminFormLayout } from "@/components/dashboard/ui/AdminFormLayout"
import { AdminFormSection, AdminFormGrid } from "@/components/dashboard/ui/AdminFormSection"
import { AdminInput } from "@/components/dashboard/ui/AdminInput"
import { AdminTextarea } from "@/components/dashboard/ui/AdminTextarea"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminMediaPicker } from "@/components/dashboard/ui/AdminMediaPicker"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { Save } from "lucide-react"

import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminSeoCustomizer } from "@/components/dashboard/ui/AdminSeoCustomizer"

export function B2BHomeEditor({ 
  initialData,
  services = [],
  caseStudies = []
}: { 
  initialData: any
  services?: any[]
  caseStudies?: any[]
}) {
  const [isSaving, setIsSaving] = React.useState(false)
  const { toast } = useToast()

  // State
  const [activeLang, setActiveLang] = React.useState<'en' | 'ar'>('en')
  const [hero, setHero] = React.useState(initialData.content?.hero || {})
  const [stats, setStats] = React.useState<any[]>(initialData.content?.stats || [])
  const [wowAndHow, setWowAndHow] = React.useState(initialData.content?.wowAndHow || {})
  const [capabilities, setCapabilities] = React.useState(initialData.content?.capabilities || {})
  const [caseStudiesSection, setCaseStudiesSection] = React.useState(initialData.content?.caseStudies || initialData.content?.caseStudiesSection || {})
  const [deliveryProcess, setDeliveryProcess] = React.useState(initialData.content?.deliveryProcess || {})
  const [partnerRibbon, setPartnerRibbon] = React.useState(initialData.content?.partnerRibbon || {})
  const [featuredServiceIds, setFeaturedServiceIds] = React.useState<string[]>(initialData.content?.featuredServiceIds || [])
  const [featuredCaseStudyIds, setFeaturedCaseStudyIds] = React.useState<string[]>(initialData.content?.featuredCaseStudyIds || [])
  const [seo, setSeo] = React.useState<any>(initialData.seo || {})

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { 
            hero, 
            stats, 
            wowAndHow,
            capabilities,
            caseStudies: caseStudiesSection,
            deliveryProcess,
            partnerRibbon,
            featuredServiceIds,
            featuredCaseStudyIds
          },
          seo
        })
      })

      if (!res.ok) throw new Error("Failed to save")
      
      toast("B2B Homepage content updated successfully", "success")
    } catch {
      toast("Failed to update B2B homepage content", "error")
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
        {/* LANGUAGE SWITCHER */}
        <div className="flex bg-surface-default p-1 rounded-md w-fit border border-border-default">
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${activeLang === 'en' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('ar')}
            className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${activeLang === 'ar' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            العربية
          </button>
        </div>

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
                <option value="VIDEO">Uploaded Video File</option>
                <option value="YOUTUBE">YouTube Video URL</option>
                <option value="VIMEO">Vimeo Video URL</option>
                <option value="IFRAME">External iFrame</option>
                <option value="SPLINE">Spline / 3D Scene</option>
              </select>

              {(hero.mediaType === 'IFRAME' || hero.mediaType === 'SPLINE' || hero.mediaType === 'YOUTUBE' || hero.mediaType === 'VIMEO') ? (
                <input 
                  type="text" 
                  value={hero.mediaUrl || ''} 
                  onChange={e => setHero({ ...hero, mediaUrl: e.target.value })} 
                  placeholder="https://www.youtube.com/watch?v=... or https://..." 
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
                value={activeLang === 'en' ? (hero.title || "") : (hero.titleAr || "")} 
                onChange={e => setHero({ ...hero, [activeLang === 'en' ? 'title' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Ideas to Life"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Subtitle" 
                value={activeLang === 'en' ? (hero.subtitle || "") : (hero.subtitleAr || "")} 
                onChange={e => setHero({ ...hero, [activeLang === 'en' ? 'subtitle' : 'subtitleAr']: e.target.value })} 
                placeholder="Short punchy text"
                rows={2}
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Description" 
                value={activeLang === 'en' ? (hero.description || "") : (hero.descriptionAr || "")} 
                onChange={e => setHero({ ...hero, [activeLang === 'en' ? 'description' : 'descriptionAr']: e.target.value })} 
                placeholder="Longer descriptive text..."
                rows={3}
              />
            </div>
            <AdminInput 
              label="Primary CTA Label" 
              value={activeLang === 'en' ? (hero.primaryCta || "") : (hero.primaryCtaAr || "")} 
              onChange={e => setHero({ ...hero, [activeLang === 'en' ? 'primaryCta' : 'primaryCtaAr']: e.target.value })} 
            />
            <AdminInput 
              label="Primary CTA Link" 
              value={hero.primaryLink || ""} 
              onChange={e => setHero({ ...hero, primaryLink: e.target.value })} 
            />
            <AdminInput 
              label="Secondary CTA Label" 
              value={activeLang === 'en' ? (hero.secondaryCta || "") : (hero.secondaryCtaAr || "")} 
              onChange={e => setHero({ ...hero, [activeLang === 'en' ? 'secondaryCta' : 'secondaryCtaAr']: e.target.value })} 
            />
            <AdminInput 
              label="Secondary CTA Link" 
              value={hero.secondaryLink || ""} 
              onChange={e => setHero({ ...hero, secondaryLink: e.target.value })} 
            />
          </AdminFormGrid>
        </AdminFormSection>

        {/* STATS SECTION */}
        <AdminFormSection id="stats" title="Credibility Stats" description="The statistics displayed prominently on the board.">
          <div className="space-y-4">
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setStats([...stats, { value: '', label: '' }])}
                className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                + Add Stat
              </button>
            </div>
            {stats.map((stat, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-border-default rounded-md bg-surface-active relative">
                <button 
                  onClick={() => {
                    const newStats = [...stats]
                    newStats.splice(idx, 1)
                    setStats(newStats)
                  }}
                  className="absolute top-2 end-2 text-text-tertiary hover:text-error transition-colors"
                >
                  &times;
                </button>
                <div className="w-1/3">
                  <AdminInput 
                    label="Value" 
                    value={activeLang === 'en' ? (stat.value || "") : (stat.valueAr || stat.value || "")} 
                    onChange={e => {
                      const newStats = [...stats]
                      newStats[idx][activeLang === 'en' ? 'value' : 'valueAr'] = e.target.value
                      setStats(newStats)
                    }} 
                    placeholder="e.g. 50+"
                  />
                </div>
                <div className="w-2/3">
                  <AdminInput 
                    label="Label" 
                    value={activeLang === 'en' ? (stat.label || "") : (stat.labelAr || stat.label || "")} 
                    onChange={e => {
                      const newStats = [...stats]
                      newStats[idx][activeLang === 'en' ? 'label' : 'labelAr'] = e.target.value
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
                value={activeLang === 'en' ? (wowAndHow.title || "") : (wowAndHow.titleAr || "")} 
                onChange={e => setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'title' : 'titleAr']: e.target.value })} 
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Section Description" 
                value={activeLang === 'en' ? (wowAndHow.description || "") : (wowAndHow.descriptionAr || "")} 
                onChange={e => setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'description' : 'descriptionAr']: e.target.value })} 
                rows={3}
              />
            </div>
            
            {/* Wow Bullets */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-text-primary">Wow Bullets</label>
                <button 
                  onClick={() => {
                    const currentBullets = activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])
                    setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: [...currentBullets, ''] })
                  }}
                  className="text-xs font-bold bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                >
                  + Add Bullet
                </button>
              </div>
              {(activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])).map((bullet: string, idx: number) => (
                <div key={`wow-${idx}`} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={bullet}
                    onChange={e => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets[idx] = e.target.value
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: newBullets })
                    }}
                    className="w-full h-10 px-3 bg-surface-default border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button 
                    onClick={() => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets.splice(idx, 1)
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: newBullets })
                    }}
                    className="text-text-tertiary hover:text-error px-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* How Bullets */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-text-primary">How Bullets</label>
                <button 
                  onClick={() => {
                    const currentBullets = activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])
                    setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: [...currentBullets, ''] })
                  }}
                  className="text-xs font-bold bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                >
                  + Add Bullet
                </button>
              </div>
              {(activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])).map((bullet: string, idx: number) => (
                <div key={`how-${idx}`} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={bullet}
                    onChange={e => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets[idx] = e.target.value
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: newBullets })
                    }}
                    className="w-full h-10 px-3 bg-surface-default border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button 
                    onClick={() => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets.splice(idx, 1)
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: newBullets })
                    }}
                    className="text-text-tertiary hover:text-error px-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </AdminFormGrid>
        </AdminFormSection>

        {/* CORE CAPABILITIES SECTION HEADERS & SELECTION */}
        <AdminFormSection id="capabilities" title="Core Capabilities (Services)" description="Customize the capabilities section headers and select featured services.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Capabilities Section Title" 
                value={activeLang === 'en' ? (capabilities.titleEn || capabilities.title || "") : (capabilities.titleAr || "")} 
                onChange={e => setCapabilities({ ...capabilities, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Core Capabilities"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Capabilities Section Description" 
                value={activeLang === 'en' ? (capabilities.descriptionEn || capabilities.description || "") : (capabilities.descriptionAr || "")} 
                onChange={e => setCapabilities({ ...capabilities, [activeLang === 'en' ? 'descriptionEn' : 'descriptionAr']: e.target.value })} 
                rows={2}
                placeholder="e.g. Everything required to deliver landmark experiences."
              />
            </div>
            <AdminInput 
              label="View All Services CTA Label" 
              value={activeLang === 'en' ? (capabilities.ctaEn || "") : (capabilities.ctaAr || "")} 
              onChange={e => setCapabilities({ ...capabilities, [activeLang === 'en' ? 'ctaEn' : 'ctaAr']: e.target.value })} 
              placeholder="e.g. View All Services"
            />
          </AdminFormGrid>
          
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Featured Services Grid Selection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border border-border-default rounded-md bg-surface-default">
              {services?.map(service => (
                <label key={service.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-surface-hover rounded-md transition-colors">
                  <input 
                    type="checkbox"
                    checked={featuredServiceIds.includes(service.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setFeaturedServiceIds([...featuredServiceIds, service.id])
                      } else {
                        setFeaturedServiceIds(featuredServiceIds.filter(id => id !== service.id))
                      }
                    }}
                    className="w-4 h-4 rounded border-border-default text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-primary">{service.titleEn || service.slug}</span>
                </label>
              ))}
              {(!services || services.length === 0) && (
                <p className="text-sm text-text-tertiary">No services available.</p>
              )}
            </div>
          </div>
        </AdminFormSection>

        {/* FEATURED WORK / CASE STUDIES SECTION HEADERS & SELECTION */}
        <AdminFormSection id="caseStudies" title="Featured Work (Case Studies)" description="Customize the case studies section headers and select featured projects.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Case Studies Section Title" 
                value={activeLang === 'en' ? (caseStudiesSection.titleEn || caseStudiesSection.title || "") : (caseStudiesSection.titleAr || "")} 
                onChange={e => setCaseStudiesSection({ ...caseStudiesSection, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Featured Work"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Case Studies Section Description" 
                value={activeLang === 'en' ? (caseStudiesSection.descriptionEn || caseStudiesSection.description || "") : (caseStudiesSection.descriptionAr || "")} 
                onChange={e => setCaseStudiesSection({ ...caseStudiesSection, [activeLang === 'en' ? 'descriptionEn' : 'descriptionAr']: e.target.value })} 
                rows={2}
                placeholder="e.g. Landmark projects delivered across the region."
              />
            </div>
            <AdminInput 
              label="View All Case Studies CTA Label" 
              value={activeLang === 'en' ? (caseStudiesSection.ctaEn || "") : (caseStudiesSection.ctaAr || "")} 
              onChange={e => setCaseStudiesSection({ ...caseStudiesSection, [activeLang === 'en' ? 'ctaEn' : 'ctaAr']: e.target.value })} 
              placeholder="e.g. View All Case Studies"
            />
          </AdminFormGrid>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Featured Case Studies Selection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border border-border-default rounded-md bg-surface-default">
              {caseStudies?.map(cs => (
                <label key={cs.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-surface-hover rounded-md transition-colors">
                  <input 
                    type="checkbox"
                    checked={featuredCaseStudyIds.includes(cs.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setFeaturedCaseStudyIds([...featuredCaseStudyIds, cs.id])
                      } else {
                        setFeaturedCaseStudyIds(featuredCaseStudyIds.filter(id => id !== cs.id))
                      }
                    }}
                    className="w-4 h-4 rounded border-border-default text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-primary">{cs.titleEn || cs.slug}</span>
                </label>
              ))}
              {(!caseStudies || caseStudies.length === 0) && (
                <p className="text-sm text-text-tertiary">No case studies available.</p>
              )}
            </div>
          </div>
        </AdminFormSection>

        {/* DELIVERY PROCESS PIPELINE */}
        <AdminFormSection id="deliveryProcess" title="Delivery Process Pipeline" description="Manage the 5-step operational delivery methodology pipeline.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Delivery Section Title" 
                value={activeLang === 'en' ? (deliveryProcess.titleEn || deliveryProcess.title || "") : (deliveryProcess.titleAr || "")} 
                onChange={e => setDeliveryProcess({ ...deliveryProcess, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Delivery Process"
              />
            </div>
          </AdminFormGrid>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-text-primary">Pipeline Steps</h4>
              <button 
                type="button"
                onClick={() => {
                  const currentSteps = deliveryProcess.steps || []
                  const num = String(currentSteps.length + 1).padStart(2, '0')
                  setDeliveryProcess({
                    ...deliveryProcess,
                    steps: [...currentSteps, { stepNumber: num, nameEn: '', nameAr: '', descEn: '', descAr: '' }]
                  })
                }}
                className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                + Add Step
              </button>
            </div>

            {(deliveryProcess.steps || []).map((step: any, idx: number) => (
              <div key={idx} className="p-4 border border-border-default rounded-md bg-surface-active space-y-3 relative">
                <button 
                  type="button"
                  onClick={() => {
                    const newSteps = [...(deliveryProcess.steps || [])]
                    newSteps.splice(idx, 1)
                    setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                  }}
                  className="absolute top-2 end-2 text-text-tertiary hover:text-error transition-colors"
                >
                  &times;
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <AdminInput 
                      label="Step Number" 
                      value={step.stepNumber || String(idx + 1).padStart(2, '0')} 
                      onChange={e => {
                        const newSteps = [...(deliveryProcess.steps || [])]
                        newSteps[idx].stepNumber = e.target.value
                        setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                      }} 
                      placeholder="01"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <AdminInput 
                      label="Step Name" 
                      value={activeLang === 'en' ? (step.nameEn || step.name || "") : (step.nameAr || step.name || "")} 
                      onChange={e => {
                        const newSteps = [...(deliveryProcess.steps || [])]
                        newSteps[idx][activeLang === 'en' ? 'nameEn' : 'nameAr'] = e.target.value
                        setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                      }} 
                      placeholder="e.g. Discover"
                    />
                  </div>
                </div>

                <AdminTextarea 
                  label="Step Description" 
                  value={activeLang === 'en' ? (step.descEn || step.desc || "") : (step.descAr || step.desc || "")} 
                  onChange={e => {
                    const newSteps = [...(deliveryProcess.steps || [])]
                    newSteps[idx][activeLang === 'en' ? 'descEn' : 'descAr'] = e.target.value
                    setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                  }} 
                  rows={2}
                  placeholder="Short description of this delivery milestone..."
                />
              </div>
            ))}
          </div>
        </AdminFormSection>

        {/* PARTNER RIBBON */}
        <AdminFormSection id="partnerRibbon" title="Partner Ribbon Header" description="Heading for the client & partner marquee ribbon.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Partner Ribbon Section Title" 
                value={activeLang === 'en' ? (partnerRibbon.titleEn || partnerRibbon.title || "") : (partnerRibbon.titleAr || "")} 
                onChange={e => setPartnerRibbon({ ...partnerRibbon, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Trusted by Industry Leaders"
              />
            </div>
          </AdminFormGrid>
        </AdminFormSection>

        {/* SEO */}
        <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />

      </div>
    </AdminFormLayout>
    </div>
  )
}
