// @ts-nocheck
"use client"

import { useState } from "react"
import { BookOpen, FileDown, Search, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/Button"
import dynamic from "next/dynamic"

const CatalogPDFDownload = dynamic(() => import('./CatalogPDFDocument'), { ssr: false });

export function CatalogGeneratorView({ services }: { services: any[] }) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [template, setTemplate] = useState("Corporate Deck")
  const [isGenerating, setIsGenerating] = useState(false)
  const [catalogData, setCatalogData] = useState<any>(null)

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await fetch("/api/operations/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          serviceIds: selectedServices
        })
      })

      setCatalogData({
        template,
        items: services.filter(s => selectedServices.includes(s.id))
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Catalog Generator</h1>
          <p className="text-[var(--text-secondary)] mt-1">Export B2B service portfolios as PDF pitch decks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configurator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Catalog Options</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">Select Template</label>
                <select 
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option>Corporate Deck</option>
                  <option>Service Brochure</option>
                  <option>Full Portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 flex justify-between items-center">
                  <span>Include Services ({selectedServices.length})</span>
                  <button 
                    onClick={() => setSelectedServices(services.map(s => s.id))}
                    className="text-[var(--color-primary)] hover:underline"
                  >Select All</button>
                </label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pe-2">
                  {services.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${selectedServices.includes(s.id) ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]' : 'bg-[var(--surface-hover)] border-[var(--border-default)]'}`}
                    >
                      {selectedServices.includes(s.id) ? <CheckSquare className="w-4 h-4 me-3 text-[var(--color-primary)]" /> : <Square className="w-4 h-4 me-3 text-[var(--text-tertiary)]" />}
                      <span className="text-sm font-bold text-[var(--text-primary)]">{s.titleEn}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating || selectedServices.length === 0 || (typeof window === 'undefined')} className="w-full gap-2 mt-4">
                {isGenerating ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <BookOpen className="w-4 h-4" />}
                Generate Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          {catalogData ? (
            <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
              <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--surface-hover)]">
                <h3 className="font-bold text-[var(--text-primary)]">Preview: {catalogData.template}</h3>
                
                {typeof window !== 'undefined' && (
                  <CatalogPDFDownload catalogData={catalogData} />
                )}
              </div>
              
              <div className="p-8 flex-1 bg-[var(--surface-hover)]">
                <div className="aspect-[1/1.4] w-full max-w-sm mx-auto bg-zinc-950 text-white p-8 flex flex-col justify-center items-center text-center rounded shadow-lg border border-[var(--border-default)]">
                  <div className="text-2xl font-black mb-2">E3 {catalogData.template}</div>
                  <div className="text-sm text-white/50 uppercase tracking-widest">Service Portfolio</div>
                  <div className="mt-8 pt-8 border-t border-white/20 w-full">
                    <div className="text-xs font-bold text-white/80">{catalogData.items.length} Services Included</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface-default)] border border-[var(--border-default)] border-dashed rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
              <Search className="w-12 h-12 text-[var(--border-default)] mb-4" />
              <h3 className="font-bold text-[var(--text-primary)] mb-1">No Catalog Generated</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm">Select services and a template, then click Generate Preview.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
