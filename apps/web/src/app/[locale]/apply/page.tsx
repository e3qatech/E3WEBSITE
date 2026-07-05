"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MediaUploader } from '@/components/shared/MediaUploader'
import { Send, CheckCircle2, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function ApplicationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobTitle = searchParams.get('jobTitle') || 'Open Position'
  const department = searchParams.get('department') || ''
  const portal = searchParams.get('portal') || 'SHARED'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
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

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit application')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your application.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 max-w-lg mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-8 rounded-2xl">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Application Received!</h2>
        <p className="text-zinc-400">
          Thank you for applying to the <strong>{jobTitle}</strong> position. We've created an account for you using your email address so you can track your application status.
        </p>
        <div className="flex gap-4 w-full mt-8">
          <Link href="/candidate" className="flex-1">
            <Button className="w-full bg-white text-zinc-950 hover:bg-zinc-200">
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => router.back()} className="flex-1 border-zinc-700 text-white hover:bg-zinc-800">
            Back to Careers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-8 md:p-12 rounded-2xl shadow-2xl">
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-white flex items-center text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 me-2" /> Back to Careers
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Apply for {jobTitle}</h1>
        {department && <p className="text-primary font-medium">{department} Department</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">First Name</label>
            <Input 
              required 
              value={formData.firstName} 
              onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Last Name</label>
            <Input 
              required 
              value={formData.lastName} 
              onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
            <Input 
              type="email" 
              required 
              value={formData.email} 
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone Number</label>
            <Input 
              type="tel" 
              value={formData.phone} 
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Upload CV (PDF or DOC)</label>
          <div className="p-4 border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors rounded-xl bg-zinc-950/50">
            {formData.cvUrl ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-400 font-medium">
                  <FileText className="w-5 h-5 me-3" />
                  CV Uploaded Successfully
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, cvUrl: '' }))}>
                  Remove
                </Button>
              </div>
            ) : (
              <MediaUploader 
                value="" 
                onChange={url => setFormData(prev => ({ ...prev, cvUrl: url }))} 
                accept=".pdf,.doc,.docx"
                context="public_resume"
              />
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/50">
          <h3 className="text-lg font-bold text-white mb-2">Create Applicant Account</h3>
          <p className="text-sm text-zinc-400 mb-4">Set a password to track the status of your application later.</p>
          
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
            <Input 
              type="password" 
              required 
              placeholder="Minimum 8 characters"
              value={formData.password} 
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="bg-zinc-950/50 border-zinc-800 text-white" 
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button type="submit" disabled={submitting} className="w-full md:w-auto bg-white text-zinc-950 hover:bg-zinc-200 px-8 py-6 text-lg rounded-xl">
            {submitting ? "Submitting..." : (
              <>
                Submit Application <Send className="w-5 h-5 ms-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-32 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] start-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] end-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Suspense fallback={<div className="text-center text-zinc-500">Loading form...</div>}>
          <ApplicationForm />
        </Suspense>
      </div>
    </div>
  )
}
