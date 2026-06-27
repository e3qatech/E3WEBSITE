"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Package, Shuffle, Image as ImageIcon, 
  Grid, Link, MousePointer2, Search, Plus, Save, X, Move, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

const TABS = [
  { id: "basic", label: "Basic Details", icon: FileText },
  { id: "inside", label: "What's Inside", icon: Package },
  { id: "process", label: "Process Stepper", icon: Shuffle },
  { id: "hero", label: "Hero Media", icon: ImageIcon },
  { id: "gallery", label: "Portfolio Gallery", icon: Grid },
  { id: "projects", label: "Cross-Reference", icon: Link },
  { id: "cta", label: "Call to Action", icon: MousePointer2 },
  { id: "seo", label: "SEO Customizer", icon: Search },
]

export function ServicesEditor() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Form State
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    category: "",
    descriptionEn: "",
    descriptionAr: "",
    components: [] as { id: string, name: string }[],
    phases: [] as { id: string, name: string }[],
    heroMedia: null as File | null,
    gallery: [] as File[],
    relatedProjects: [] as string[],
    primaryCTA: "",
    seoTitle: "",
    seoDescription: ""
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      router.push("/dashboard/b2b/services")
    }, 1500)
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-[var(--background)]">
      
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-[var(--border-default)] bg-[var(--surface-default)] p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-black text-[var(--text-primary)]">Services CMS</h2>
          <p className="text-xs text-[var(--text-secondary)]">Advanced Capability Editor</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                  ${isActive 
                    ? 'bg-[var(--color-primary)] text-white font-bold' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--text-tertiary)]'}`} />
                {tab.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-[var(--border-default)]">
          <Button className="w-full gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <span className="animate-spin text-xl">⟳</span> : <Save className="w-4 h-4" />}
            Publish Service
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Basic Details</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Set the core identity and bilingual descriptions for this service.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Title (English)</label>
                    <input type="text" className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none" placeholder="e.g. Festival Engineering" />
                  </div>
                  <div className="space-y-1" dir="rtl">
                    <label className="text-xs font-bold text-[var(--text-secondary)] text-right block">Title (Arabic)</label>
                    <input type="text" className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none" placeholder="عنوان الخدمة" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Custom URL Slug</label>
                    <input type="text" className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none font-mono" placeholder="festival-engineering" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Category</label>
                    <select className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none">
                      <option>Design</option>
                      <option>Fabrication</option>
                      <option>Technology</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inside" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">What's Inside</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Compile the distinct deliverables and components of this service.</p>
                </div>
                
                <div className="border border-dashed border-[var(--border-default)] rounded-xl p-8 text-center bg-[var(--surface-default)]">
                  <Package className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
                  <p className="text-sm font-bold text-[var(--text-primary)] mb-1">No components added</p>
                  <p className="text-xs text-[var(--text-secondary)] mb-4">Add the features included in this service.</p>
                  <Button variant="outline" size="sm" className="gap-2"><Plus className="w-4 h-4"/> Add Component</Button>
                </div>
              </div>
            )}

            {activeTab === "process" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Process Stepper</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Map E3's execution phases (e.g. Discovery → Feasibility → Fabrication).</p>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-3 p-4 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg cursor-move hover:border-[var(--color-primary)] transition-colors">
                      <Move className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <div className="flex-1 font-bold text-sm text-[var(--text-primary)]">Phase {step}: Execution</div>
                      <X className="w-4 h-4 text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed gap-2"><Plus className="w-4 h-4"/> Add Phase</Button>
                </div>
              </div>
            )}

            {/* Other tabs omitted for brevity but they follow the exact same pattern */}
            {["hero", "gallery", "projects", "cta", "seo"].includes(activeTab) && (
              <div className="space-y-6 flex flex-col items-center justify-center h-64 border border-dashed border-[var(--border-default)] rounded-xl mt-12">
                <Search className="w-12 h-12 text-[var(--text-tertiary)] mb-2" />
                <p className="text-sm font-bold text-[var(--text-secondary)]">{TABS.find(t => t.id === activeTab)?.label} Settings Module</p>
                <p className="text-xs text-[var(--text-tertiary)]">Interactive forms load dynamically here.</p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
