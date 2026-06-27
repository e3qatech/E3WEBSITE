"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar border-b border-[var(--border-default)]">
      <div className="flex gap-4 px-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative py-4 px-2 flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-colors
                ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
              `}
            >
              {tab.icon}
              {tab.label}
              
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 start-0 end-0 h-0.5 bg-[var(--color-primary)]"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TabsContent({ value, activeTab, children }: { value: string, activeTab: string, children: React.ReactNode }) {
  if (value !== activeTab) return null
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="py-6"
    >
      {children}
    </motion.div>
  )
}
