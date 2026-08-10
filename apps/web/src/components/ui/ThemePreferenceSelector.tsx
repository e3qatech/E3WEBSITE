"use client"

import { useTheme, ThemePreference } from '@/components/layout/ThemeProvider'
import { Sun, Moon, Laptop } from 'lucide-react'

export function ThemePreferenceSelector({ locale = 'en' }: { locale?: string }) {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme()
  const isAr = locale === 'ar'

  const options: { id: ThemePreference; labelEn: string; labelAr: string; icon: any }[] = [
    { id: 'light', labelEn: 'Light', labelAr: 'فاتح', icon: Sun },
    { id: 'dark', labelEn: 'Dark', labelAr: 'داكن', icon: Moon },
    { id: 'system', labelEn: 'System', labelAr: 'حسب النظام', icon: Laptop },
  ]

  return (
    <div
      role="radiogroup"
      aria-label={isAr ? "اختيار وضع الشاشة" : "Theme Preference"}
      className="inline-flex items-center gap-1 p-1 rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md shadow-lg"
    >
      {options.map((opt) => {
        const Icon = opt.icon
        const isSelected = themePreference === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => setThemePreference(opt.id)}
            role="radio"
            aria-checked={isSelected}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSelected
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{isAr ? opt.labelAr : opt.labelEn}</span>
          </button>
        )
      })}
    </div>
  )
}
