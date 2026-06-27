"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call for password reset using token
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSuccess(true)
      
      // Auto redirect to login after success
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-default)] shadow-xl relative overflow-hidden">
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />

      <div className="mb-8">
        <Link href="/auth/login" className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Create New Password
        </h1>
        <p className="text-[var(--text-secondary)]">
          Your new password must be different from previous used passwords.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Password Reset Successfully</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            You will be redirected to the login page momentarily.
          </p>
          <Button variant="primary" fullWidth asChild>
            <Link href="/auth/login">Return to Login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting || !token}
            />
          </div>

          <div>
            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting || !token}
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-[var(--color-error)] bg-[var(--color-error)]/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            disabled={isSubmitting || !token}
            className="mt-2"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-default)] text-[var(--text-primary)] px-4">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-default)] shadow-xl h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
