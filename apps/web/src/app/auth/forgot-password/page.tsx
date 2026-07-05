"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Simulate API call for password reset email
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address.")
      }
      
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-default)] text-[var(--text-primary)] px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-default)] shadow-xl relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 end-0 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />

        <div className="mb-8">
          <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 me-2" />
            Back to login
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Reset Password
          </h1>
          <p className="text-[var(--text-secondary)]">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Check your email</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              We have sent a password reset link to <strong>{email}</strong>
            </p>
            <Button variant="outline" fullWidth onClick={() => setIsSuccess(false)}>
              Try another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="admin@e3qatar.com"
              />
            </div>

            {error && (
              <div className="text-[var(--color-error)] text-sm font-medium bg-[var(--color-error)]/10 p-3 rounded-lg border border-[var(--color-error)]/20 animate-in fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting || !email}
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
