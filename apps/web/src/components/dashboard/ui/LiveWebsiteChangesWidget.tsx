"use client"

import { formatDistanceToNow } from 'date-fns'
import { Activity, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ActivityItem {
  id: string
  action: string
  target: string
  category: string
  user: string
  timestamp: string
  status: string
}

export function LiveWebsiteChangesWidget() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity')
      if (res.ok) {
        const json = await res.json()
        if (json.activity) {
          setActivities(json.activity)
        }
      }
    } catch (_e) {
      // Ignore network errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActivity()
    const interval = setInterval(fetchActivity, 10000) // Live refresh every 10s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Live Website Changes</h3>
            <p className="text-[11px] text-[var(--text-tertiary)]">Real-time audit log of CMS & site updates</p>
          </div>
        </div>

        <button
          onClick={fetchActivity}
          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
          title="Refresh Live Activity"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
            <span>No recent website modifications logged yet.</span>
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-2)]/60 hover:bg-[var(--surface-hover)] transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="mt-0.5 w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                      {item.action}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                    Target: <span className="font-semibold text-[var(--text-primary)]">{item.target}</span> • by {item.user}
                  </p>
                </div>
              </div>

              <div className="text-end shrink-0">
                <span className="text-[10px] text-[var(--text-tertiary)] block">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
                <span className="inline-block mt-0.5 text-[9px] font-extrabold text-emerald-400">
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
