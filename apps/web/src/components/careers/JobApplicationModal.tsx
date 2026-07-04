"use client"

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MediaUploader } from '@/components/shared/MediaUploader'
import { Send, CheckCircle2, FileText } from 'lucide-react'

interface JobApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  department?: string
  portal?: 'B2B' | 'B2C' | 'SHARED'
}

export function JobApplicationModal({ isOpen, onClose, jobTitle, department, portal = 'SHARED' }: JobApplicationModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cvUrl: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.cvUrl) {
      setError('Please upload your CV (PDF or Document) before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jobTitle,
          department,
          portal
        })
      })

      if (!res.ok) {
        throw new Error('Failed to submit application')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your application.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply for ${jobTitle}`}>
      <div className="p-6">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Application Received!</h3>
            <p className="text-zinc-400">
              Thank you for applying to the {jobTitle} position. Our team will review your CV and get back to you soon.
            </p>
            <Button onClick={onClose} className="mt-4 w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">First Name</label>
                <Input 
                  required 
                  value={formData.firstName} 
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Last Name</label>
                <Input 
                  required 
                  value={formData.lastName} 
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email</label>
                <Input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone</label>
                <Input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-zinc-950 border-zinc-800 text-white" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Upload CV (PDF or DOC)</label>
              <div className="p-4 border border-dashed border-zinc-700 rounded-lg bg-zinc-950/50">
                {formData.cvUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-green-400">
                      <FileText className="w-4 h-4 mr-2" />
                      CV Uploaded Successfully
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, cvUrl: '' }))}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <MediaUploader 
                    value="" 
                    onChange={url => setFormData(prev => ({ ...prev, cvUrl: url }))} 
                    accept=".pdf,.doc,.docx"
                  />
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-white text-black hover:bg-zinc-200">
                {submitting ? "Submitting..." : (
                  <>
                    Submit Application <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
