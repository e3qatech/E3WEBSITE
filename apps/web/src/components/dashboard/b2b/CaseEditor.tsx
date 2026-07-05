"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"

export function CaseEditor({ initialData, attractions = [], teamMembers = [] }: { initialData?: any, attractions?: any[], teamMembers?: any[] }) {
  const router = useRouter()
  const isEditing = !!initialData

  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Fields
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "")
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "")
  const [clientName, setClientName] = useState(initialData?.clientName || "")
  const [category, setCategory] = useState(initialData?.category || "Corporate")
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear())
  const [attractionId, setAttractionId] = useState(initialData?.attractionId || "")
  
  const [thumbnailMediaType, setThumbnailMediaType] = useState(initialData?.thumbnailMediaType || "IMAGE")
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "")
  
  const [heroMediaType, setHeroMediaType] = useState(initialData?.heroMediaType || "IMAGE")
  const [heroImageUrl, setHeroImageUrl] = useState(initialData?.heroImageUrl || "")
  
  const [clientLogoUrl, setClientLogoUrl] = useState(initialData?.clientLogoUrl || "")
  
  const [challengeEn, setChallengeEn] = useState(initialData?.challengeEn || "")
  const [challengeAr, setChallengeAr] = useState(initialData?.challengeAr || "")
  const [solutionEn, setSolutionEn] = useState(initialData?.solutionEn || "")
  const [solutionAr, setSolutionAr] = useState(initialData?.solutionAr || "")

  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [isVisible, setIsVisible] = useState(initialData?.isPublished ?? false)
  
  const [metrics, setMetrics] = useState<any[]>(Array.isArray(initialData?.metrics) ? initialData.metrics : [])
  const [testimonials, setTestimonials] = useState<any[]>(Array.isArray(initialData?.testimonials) ? initialData.testimonials : [])
  const [gallery, setGallery] = useState<any[]>(Array.isArray(initialData?.gallery) ? initialData.gallery : [])
  const [technicalSpecs, setTechnicalSpecs] = useState<any[]>(Array.isArray(initialData?.technicalSpecs) ? initialData.technicalSpecs : [])
  const [servicesUsed, setServicesUsed] = useState<any[]>(Array.isArray(initialData?.servicesUsed) ? initialData.servicesUsed : [])
  const [caseTeamMembers, setCaseTeamMembers] = useState<any[]>(Array.isArray(initialData?.teamMembers) ? initialData.teamMembers : [])

  const handleSave = async () => {
    if (!slug || !titleEn || !titleAr) {
      alert("Slug and Titles are required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        slug, titleEn, titleAr, clientName, year, category,
        heroMediaType, heroImageUrl, 
        thumbnailMediaType, thumbnailUrl, 
        clientLogoUrl,
        challengeEn, challengeAr, solutionEn, solutionAr,
        isFeatured, isPublished: isVisible,
        attractionId, metrics, gallery,
        technicalSpecs, servicesUsed, testimonials,
        teamMembers: caseTeamMembers
      }

      if (isEditing) {
        const res = await fetch(`/api/b2b/cases/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("Failed to update")
      } else {
        const res = await fetch(`/api/b2b/cases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, titleEn, titleAr })
        })
        if (!res.ok) throw new Error("Failed to create. Slug might already exist.")
        const data = await res.json()
        
        await fetch(`/api/b2b/cases/${data.caseStudy.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      }

      router.push("/dashboard/b2b/cases")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const updateArrayItem = (setter: any, array: any[], index: number, field: string, value: any) => {
    const newArr = [...array]
    newArr[index][field] = value
    setter(newArr)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-surface-default p-4 rounded-2xl border border-border-default shadow-sm sticky top-6 z-30 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-surface-hover rounded-xl transition-colors text-text-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {isEditing ? "Edit Case Study" : "New Case Study"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">{titleEn || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-surface-hover px-4 py-2 rounded-xl border border-border-default">
            <input 
              type="checkbox" 
              checked={isVisible}
              onChange={e => setIsVisible(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm font-bold text-text-primary">Visible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer bg-surface-hover px-4 py-2 rounded-xl border border-border-default">
            <input 
              type="checkbox" 
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm font-bold text-text-primary">Featured</span>
          </label>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl h-10 px-6">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {["general", "hero", "narrative", "metrics", "team", "testimonials", "gallery"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === tab 
                  ? "bg-accent text-white shadow-lg" 
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface-default rounded-2xl border border-border-default p-6 md:p-8 min-h-[500px]">
          
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-border-default pb-4">Core Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (EN) *</label>
                  <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (AR) *</label>
                  <input type="text" dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none font-arabic" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Slug URL *</label>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary bg-surface-hover px-4 py-3 rounded-xl border border-border-default">/b2b/case-studies/</span>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="flex-1 bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Client Name</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Category</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Year</label>
                  <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none" />
                </div>
                <div className="space-y-2 flex flex-col justify-center">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Featured Work</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isFeatured} 
                      onChange={e => setIsFeatured(e.target.checked)} 
                      className="w-5 h-5 rounded border-border-default text-accent focus:ring-accent bg-surface-hover"
                    />
                    <span className="text-sm font-bold text-text-primary">Feature on Homepage</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Linked Attraction</label>
                <select value={attractionId} onChange={e => setAttractionId(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none">
                  <option value="">Select an Attraction (Optional)</option>
                  {attractions.map(a => (
                    <option key={a.id} value={a.id}>{a.nameEn}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Card Thumbnail</label>
                  <select value={thumbnailMediaType} onChange={e => setThumbnailMediaType(e.target.value)} className="bg-surface-hover border border-border-default rounded-lg px-2 py-1 text-xs focus:outline-none">
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">IFrame</option>
                    <option value="SPLINE">Spline 3D</option>
                    <option value="THREE_D">3D Model (GLTF)</option>
                  </select>
                </div>
                <MediaUploader value={thumbnailUrl} onChange={setThumbnailUrl} />
              </div>
            </div>
          )}

          {/* HERO TAB */}
          {activeTab === "hero" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-border-default pb-4">Hero Media</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hero Media URL</label>
                  <select value={heroMediaType} onChange={e => setHeroMediaType(e.target.value)} className="bg-surface-hover border border-border-default rounded-lg px-2 py-1 text-xs focus:outline-none">
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">IFrame</option>
                    <option value="SPLINE">Spline 3D</option>
                    <option value="THREE_D">3D Model (GLTF)</option>
                  </select>
                </div>
                <MediaUploader value={heroImageUrl} onChange={setHeroImageUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Client Logo URL</label>
                <MediaUploader value={clientLogoUrl} onChange={setClientLogoUrl} />
              </div>
            </div>
          )}

          {/* NARRATIVE TAB */}
          {activeTab === "narrative" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-border-default pb-4">Narrative (Challenge, Solution, Result)</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border-default pb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-accent uppercase tracking-wider">The Challenge (EN)</label>
                    <textarea value={challengeEn} rows={4} onChange={e => setChallengeEn(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-accent uppercase tracking-wider">The Challenge (AR)</label>
                    <textarea value={challengeAr} dir="rtl" rows={4} onChange={e => setChallengeAr(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none font-arabic" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border-default pb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Our Solution (EN)</label>
                    <textarea value={solutionEn} rows={4} onChange={e => setSolutionEn(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Our Solution (AR)</label>
                    <textarea value={solutionAr} dir="rtl" rows={4} onChange={e => setSolutionAr(e.target.value)} className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:border-accent focus:outline-none resize-none font-arabic" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* METRICS TAB */}
          {activeTab === "metrics" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <h2 className="text-lg font-black">Impact Metrics</h2>
                <Button onClick={() => setMetrics([...metrics, { labelEn: "", valueEn: "", labelAr: "", valueAr: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Metric
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="p-4 border border-border-default rounded-xl bg-surface-hover relative group flex flex-col gap-3">
                    <button onClick={() => setMetrics(metrics.filter((_, i) => i !== index))} className="absolute top-2 end-2 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="text-[10px] font-bold text-text-tertiary uppercase">Value</label>
                      <input type="text" placeholder="e.g. 50k+" value={metric.valueEn} onChange={e => updateArrayItem(setMetrics, metrics, index, "valueEn", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm font-bold text-accent" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-tertiary uppercase">Label (EN)</label>
                      <input type="text" placeholder="Attendees" value={metric.labelEn} onChange={e => updateArrayItem(setMetrics, metrics, index, "labelEn", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-tertiary uppercase">Value (AR)</label>
                      <input type="text" dir="rtl" placeholder="٥٠ ألف+" value={metric.valueAr || ""} onChange={e => updateArrayItem(setMetrics, metrics, index, "valueAr", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm font-bold font-arabic" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-tertiary uppercase">Label (AR)</label>
                      <input type="text" dir="rtl" placeholder="زائر" value={metric.labelAr || ""} onChange={e => updateArrayItem(setMetrics, metrics, index, "labelAr", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm font-arabic" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === "team" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <h2 className="text-lg font-black">Team Members</h2>
                <Button onClick={() => setCaseTeamMembers([...caseTeamMembers, { employeeProfileId: "", roleEn: "", roleAr: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Team Member
                </Button>
              </div>
              <div className="space-y-4">
                {caseTeamMembers.map((item, index) => (
                  <div key={index} className="p-4 border border-border-default rounded-xl bg-surface-hover relative group">
                    <button onClick={() => setCaseTeamMembers(caseTeamMembers.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pe-12">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-text-secondary">Select Member</label>
                        <select value={item.employeeProfileId} onChange={e => updateArrayItem(setCaseTeamMembers, caseTeamMembers, index, "employeeProfileId", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm">
                          <option value="">Select a Team Member</option>
                          {teamMembers.map((tm: any) => (
                            <option key={tm.id} value={tm.id}>{tm.firstName} {tm.lastName} - {tm.designation}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Project Role (EN)</label>
                        <input type="text" value={item.roleEn} onChange={e => updateArrayItem(setCaseTeamMembers, caseTeamMembers, index, "roleEn", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm" placeholder="e.g. Lead Designer" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Project Role (AR)</label>
                        <input type="text" dir="rtl" value={item.roleAr || ""} onChange={e => updateArrayItem(setCaseTeamMembers, caseTeamMembers, index, "roleAr", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm font-arabic" placeholder="المصمم الرئيسي" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TESTIMONIALS TAB */}
          {activeTab === "testimonials" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <h2 className="text-lg font-black">Testimonials</h2>
                <Button onClick={() => setTestimonials([...testimonials, { authorName: "", quoteEn: "", quoteAr: "", isVisible: true }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Testimonial
                </Button>
              </div>
              <div className="space-y-4">
                {testimonials.map((item, index) => (
                  <div key={index} className="p-4 border border-border-default rounded-xl bg-surface-hover relative group">
                    <button onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-4 pe-12">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={item.isVisible !== false} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "isVisible", e.target.checked)} className="rounded" />
                        <label className="text-sm font-bold">Visible on Website</label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Author Name / Designation</label>
                        <input type="text" value={item.authorName} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "authorName", e.target.value)} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Quote (EN)</label>
                        <textarea value={item.quoteEn} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "quoteEn", e.target.value)} rows={3} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary">Quote (AR)</label>
                        <textarea value={item.quoteAr || ""} dir="rtl" onChange={e => updateArrayItem(setTestimonials, testimonials, index, "quoteAr", e.target.value)} rows={3} className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm resize-none font-arabic" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-border-default pb-4">
                <h2 className="text-lg font-black">Gallery</h2>
                <Button onClick={() => setGallery([...gallery, { url: "", captionEn: "", captionAr: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Media
                </Button>
              </div>
              <div className="space-y-4">
                {gallery.map((item, index) => (
                  <div key={index} className="p-4 border border-border-default rounded-xl bg-surface-hover relative group">
                    <button onClick={() => setGallery(gallery.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4">
                        <MediaUploader value={item.url} onChange={(url) => updateArrayItem(setGallery, gallery, index, "url", url)} />
                      </div>
                      <div className="md:col-span-8 space-y-4">
                        <input type="text" value={item.captionEn || ""} onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionEn", e.target.value)} className="w-full px-4 py-2 bg-surface-default border border-border-default rounded-xl text-sm outline-none" placeholder="Caption (EN)" />
                        <input type="text" dir="rtl" value={item.captionAr || ""} onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionAr", e.target.value)} className="w-full px-4 py-2 bg-surface-default border border-border-default rounded-xl text-sm outline-none font-arabic" placeholder="Caption (AR)" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
