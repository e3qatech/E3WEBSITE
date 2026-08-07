"use client";

import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to change password');

      setMessage({ type: 'success', text: json.message || 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-default border border-border-default rounded-xl p-6 shadow-sm space-y-6 max-w-2xl">
      <div className="flex items-center gap-3 pb-4 border-b border-border-default">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Change Your Password</h2>
          <p className="text-xs text-text-secondary">
            Update your account password. Updating your password automatically revokes older session tokens.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" disabled={loading} className="gap-2">
            <KeyRound className="w-4 h-4" />
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </div>
  );
}
