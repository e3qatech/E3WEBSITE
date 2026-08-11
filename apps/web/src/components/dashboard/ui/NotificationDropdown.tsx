"use client"

import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Bell, CheckCircle2, Info, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [_loading, _setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const json = await res.json()
        if (json.notifications) {
          setNotifications(json.notifications)
        }
      }
    } catch (_e) {
      // Ignore network errors
    }
  }

  useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000) // Poll every 15s for live updates
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
        aria-label="View Notifications"
      >
        <Bell className="w-4 h-4" strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 end-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-[var(--surface-default)]"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-level-1)] bg-[var(--bg-level-2)]/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-level-1)]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-tertiary)] flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-60" />
                <span>All caught up! No new notifications.</span>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleRead(item.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                    !item.read
                      ? 'bg-[var(--surface-hover)]/70 hover:bg-[var(--surface-active)]'
                      : 'hover:bg-[var(--surface-hover)]/40 opacity-75'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'success' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                    {item.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                    {item.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                    {item.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{item.title}</h4>
                      <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
