"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error.includes("Account is inactive")) {
          setError("Your account has been deactivated. Please contact support.");
        } else if (result.error.includes("Email not verified")) {
          setError("Please verify your email before logging in.");
        } else {
          setError("Invalid email or password.");
        }
      } else {
        router.push("/dashboard/overview");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-default)] p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            E3 Portal
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] transition-shadow"
              placeholder="name@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] transition-shadow"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg bg-[var(--text-primary)] text-[var(--surface-default)] font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
