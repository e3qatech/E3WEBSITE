"use client"

import React, { useState } from "react"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { FileText, Download, Cpu, CheckCircle2, Search, Filter } from "lucide-react"
import { Card } from "@/components/ui/Card"

export function ApplicationsManager({ initialApplications }: { initialApplications: any[] }) {
  const [applications, setApplications] = useState(initialApplications)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const selectedApp = applications.find(a => a.id === selectedAppId)

  const handleParseCV = async (id: string) => {
    setParsing(true)
    try {
      const res = await fetch(`/api/careers/${id}/parse`, { method: 'POST' })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || "Failed to parse CV")
      
      setApplications(prev => prev.map(app => app.id === id ? json.application : app))
      toast("CV parsed successfully.", "success")
    } catch (e: any) {
      console.error(e)
      toast(e.message || "Failed to parse CV.", "error")
    } finally {
      setParsing(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/careers/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || "Failed to update status")
      
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app))
      toast("Application status updated.", "success")
    } catch (e: any) {
      console.error(e)
      toast(e.message || "Failed to update status.", "error")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'REVIEWING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'HIRED': return 'bg-green-500/10 text-green-500 border-green-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="Global Job Applications"
        description="Review incoming applications across all B2B and B2C portals and use AI to parse CVs."
      />

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Applications List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 bg-surface-default border border-border-default rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border-default space-y-4">
            <div className="relative">
              <Search className="absolute start-3 top-2.5 h-4 w-4 text-text-secondary" />
              <input 
                placeholder="Search candidates..." 
                className="w-full ps-9 pe-4 py-2 bg-surface-hover border border-border-default rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button className="text-xs flex items-center px-3 py-1.5 bg-surface-hover rounded-md border border-border-default text-text-secondary hover:text-white transition-colors">
                <Filter className="w-3 h-3 me-1" /> All Portals
              </button>
              <button className="text-xs flex items-center px-3 py-1.5 bg-surface-hover rounded-md border border-border-default text-text-secondary hover:text-white transition-colors">
                <Filter className="w-3 h-3 me-1" /> Status
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                No applications found.
              </div>
            ) : (
              applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full text-left p-4 border-b border-border-default hover:bg-surface-hover transition-colors ${selectedAppId === app.id ? 'bg-surface-hover border-s-2 border-s-primary' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-text-primary">{app.firstName} {app.lastName}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary mb-2">{app.jobTitle}</div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px]">{app.portal}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="w-full lg:w-2/3 bg-surface-default border border-border-default rounded-xl flex flex-col overflow-hidden">
          {selectedApp ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedApp.firstName} {selectedApp.lastName}</h2>
                  <p className="text-primary font-medium">{selectedApp.jobTitle} {selectedApp.department ? `· ${selectedApp.department}` : ''}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <select 
                    value={selectedApp.status}
                    onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value)}
                    disabled={updating}
                    className="bg-surface-hover border border-border-default rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="NEW">New</option>
                    <option value="REVIEWING">Reviewing</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <a href={selectedApp.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-surface-hover border border-border-default rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                    <Download className="w-4 h-4 me-2" /> Download CV
                  </a>
                  {!selectedApp.cvParsedData && (
                    <AdminButton variant="primary" onClick={() => handleParseCV(selectedApp.id)} disabled={parsing}>
                      <Cpu className="w-4 h-4 me-2" /> {parsing ? "Parsing..." : "AI Parse CV"}
                    </AdminButton>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-hover border border-border-default">
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Email</div>
                  <div className="text-sm text-white">{selectedApp.email}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Phone</div>
                  <div className="text-sm text-white">{selectedApp.phone || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Applied via</div>
                  <div className="text-sm text-white">{selectedApp.portal} Portal</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Applied on</div>
                  <div className="text-sm text-white">{new Date(selectedApp.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Parsed Data / AI Analysis */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Cpu className="w-5 h-5 me-2 text-primary" /> AI Candidate Analysis
                </h3>
                
                {selectedApp.cvParsedData ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Executive Summary</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {selectedApp.cvParsedData.summary}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-surface-hover border border-border-default rounded-xl">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Extracted Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedApp.cvParsedData.skills || []).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-zinc-800 text-xs rounded-md text-zinc-300 border border-zinc-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-surface-hover border border-border-default rounded-xl">
                          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Years of Experience</h4>
                          <p className="text-2xl font-bold text-white">{selectedApp.cvParsedData.experienceYears} Years</p>
                        </div>
                        <div className="p-4 bg-surface-hover border border-border-default rounded-xl">
                          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Education</h4>
                          <p className="text-sm text-white">{selectedApp.cvParsedData.education}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-border-default rounded-xl bg-surface-hover/50">
                    <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">CV Not Parsed Yet</h4>
                    <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
                      Use the AI parser to automatically extract skills, years of experience, and generate an executive summary from the uploaded CV document.
                    </p>
                    <AdminButton variant="outline" onClick={() => handleParseCV(selectedApp.id)} disabled={parsing}>
                      <Cpu className="w-4 h-4 me-2" /> {parsing ? "Analyzing CV..." : "Run AI Analysis"}
                    </AdminButton>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8">
              <FileText className="w-16 h-16 text-zinc-800 mb-4" />
              <p>Select an application to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
