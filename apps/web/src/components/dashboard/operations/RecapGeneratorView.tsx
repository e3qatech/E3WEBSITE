// @ts-nocheck
"use client"

import { useState } from "react"
import { BarChart3, FileDown, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/Button"
import dynamic from "next/dynamic"

// Dynamically import PDF components to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink),
  { ssr: false }
)
const Document = dynamic(() => import("@react-pdf/renderer").then(mod => mod.Document), { ssr: false })
const Page = dynamic(() => import("@react-pdf/renderer").then(mod => mod.Page), { ssr: false })
const Text = dynamic(() => import("@react-pdf/renderer").then(mod => mod.Text), { ssr: false })
const View = dynamic(() => import("@react-pdf/renderer").then(mod => mod.View), { ssr: false })
const StyleSheet = dynamic(() => import("@react-pdf/renderer").then(mod => mod.StyleSheet), { ssr: false })

export function RecapGeneratorView({ attractions }: { attractions: any[] }) {
  const [selectedAttraction, setSelectedAttraction] = useState("")
  const [dateRange, setDateRange] = useState("Last 30 Days")
  const [isGenerating, setIsGenerating] = useState(false)
  const [recapData, setRecapData] = useState<any>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Mock fetching aggregated data
    setTimeout(() => {
      setRecapData({
        attractionName: attractions.find(a => a.id === selectedAttraction)?.nameEn || "All Attractions",
        dateRange,
        visitors: 12450,
        revenue: 450200,
        avgRating: 4.8,
        topTickets: [
          { name: "General Admission", count: 8200 },
          { name: "VIP Pass", count: 2150 },
          { name: "Family Bundle", count: 2100 }
        ]
      })
      setIsGenerating(false)
    }, 1000)
  }

  // Simple PDF Styles
  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
    subtitle: { fontSize: 14, marginBottom: 30, color: '#666' },
    section: { marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    label: { fontSize: 12, color: '#333' },
    value: { fontSize: 12, fontWeight: 'bold' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, backgroundColor: '#f5f5f5', padding: 5 },
  })

  const RecapPDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Performance Recap Report</Text>
        <Text style={styles.subtitle}>{recapData?.attractionName} | {recapData?.dateRange}</Text>
        
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Total Visitors</Text>
            <Text style={styles.value}>{recapData?.visitors.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Revenue (QAR)</Text>
            <Text style={styles.value}>{recapData?.revenue.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Rating</Text>
            <Text style={styles.value}>{recapData?.avgRating} / 5.0</Text>
          </View>
        </View>

        <Text style={{ fontSize: 16, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>Top Ticket Types</Text>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>Ticket Name</Text>
            <Text style={styles.label}>Quantity Sold</Text>
          </View>
          {recapData?.topTickets.map((t: any, i: number) => (
            <View style={styles.row} key={i}>
              <Text style={styles.label}>{t.name}</Text>
              <Text style={styles.value}>{t.count.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )

  return (
    <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Recap Engine</h1>
          <p className="text-[var(--text-secondary)] mt-1">Aggregate operations data and generate PDF reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configurator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Report Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Attraction</label>
                <select 
                  value={selectedAttraction}
                  onChange={e => setSelectedAttraction(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">All Attractions</option>
                  {attractions.map(a => <option key={a.id} value={a.id}>{a.nameEn}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Date Range</label>
                <select 
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Year</option>
                </select>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating || (typeof window === 'undefined')} className="w-full gap-2 mt-4">
                {isGenerating ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                Generate Recap
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          {recapData ? (
            <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
              <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--surface-hover)]">
                <h3 className="font-bold text-[var(--text-primary)]">Preview: {recapData.attractionName}</h3>
                
                {typeof window !== 'undefined' && (
                  <PDFDownloadLink document={<RecapPDF />} fileName={`recap_${recapData.attractionName.replace(/\s+/g, '_').toLowerCase()}.pdf`}>
                    {({ loading }: { loading: boolean }) => (
                      <Button variant="outline" size="sm" disabled={loading} className="gap-2">
                        {loading ? 'Preparing PDF...' : <><FileDown className="w-4 h-4" /> Export PDF</>}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
              
              <div className="p-8 flex-1">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)]">
                    <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">Total Visitors</div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">{recapData.visitors.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)]">
                    <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">Revenue (QAR)</div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">{recapData.revenue.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)]">
                    <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">Average Rating</div>
                    <div className="text-2xl font-black text-amber-500">{recapData.avgRating}</div>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Top Ticket Types</h4>
                <div className="space-y-3">
                  {recapData.topTickets.map((t: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)]">
                      <span className="font-bold text-[var(--text-primary)]">{t.name}</span>
                      <span className="text-sm font-bold text-[var(--text-secondary)]">{t.count.toLocaleString()} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface-default)] border border-[var(--border-default)] border-dashed rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
              <Search className="w-12 h-12 text-[var(--border-default)] mb-4" />
              <h3 className="font-bold text-[var(--text-primary)] mb-1">No Recap Generated</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm">Select your parameters and click Generate Recap to preview the data before exporting to PDF.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
