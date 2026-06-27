"use client"

import { Input } from "@/components/ui/Input"

interface BilingualInputProps {
  label: string
  valueEn: string
  valueAr: string
  onChangeEn: (val: string) => void
  onChangeAr: (val: string) => void
  placeholderEn?: string
  placeholderAr?: string
  required?: boolean
  type?: "text" | "textarea"
}

export function BilingualInput({ 
  label, 
  valueEn, 
  valueAr, 
  onChangeEn, 
  onChangeAr, 
  placeholderEn = "English text", 
  placeholderAr = "النص العربي",
  required,
  type = "text"
}: BilingualInputProps) {
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-[var(--text-secondary)]">
        {label} {required && <span className="text-[var(--color-error)]">*</span>}
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* English Input */}
        <div className="relative">
          <span className="absolute start-3 top-3 text-[10px] font-black uppercase text-[var(--text-tertiary)] bg-[var(--surface-hover)] px-1 rounded z-10 pointer-events-none">
            EN
          </span>
          {type === "textarea" ? (
            <textarea
              required={required}
              value={valueEn}
              onChange={e => onChangeEn(e.target.value)}
              placeholder={placeholderEn}
              dir="ltr"
              rows={3}
              className="w-full ps-12 pe-4 py-3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-y min-h-[100px]"
            />
          ) : (
            <input
              type="text"
              required={required}
              value={valueEn}
              onChange={e => onChangeEn(e.target.value)}
              placeholder={placeholderEn}
              dir="ltr"
              className="w-full ps-12 pe-4 py-3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] h-12"
            />
          )}
        </div>

        {/* Arabic Input */}
        <div className="relative">
          <span className="absolute end-3 top-3 text-[10px] font-black uppercase text-[var(--text-tertiary)] bg-[var(--surface-hover)] px-1 rounded z-10 pointer-events-none">
            AR
          </span>
          {type === "textarea" ? (
            <textarea
              required={required}
              value={valueAr}
              onChange={e => onChangeAr(e.target.value)}
              placeholder={placeholderAr}
              dir="rtl"
              rows={3}
              className="w-full pe-12 ps-4 py-3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-y min-h-[100px]"
            />
          ) : (
            <input
              type="text"
              required={required}
              value={valueAr}
              onChange={e => onChangeAr(e.target.value)}
              placeholder={placeholderAr}
              dir="rtl"
              className="w-full pe-12 ps-4 py-3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] h-12"
            />
          )}
        </div>
      </div>
    </div>
  )
}
