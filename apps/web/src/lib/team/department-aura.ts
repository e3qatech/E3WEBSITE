/**
 * UX-03B-B: Team Profile "Department Aura" Color & Atmosphere Design System
 *
 * Deterministic color tokens and radial light aura system calibrated per department:
 * 1. Executive Management: Emerald + Champagne
 * 2. Creative & Marketing: Violet + Magenta
 * 3. Operations: Amber + Red
 * 4. Technical & Production: Cyan + Electric Blue
 * 5. Finance & Administration: Cobalt + Silver
 * 6. Food & Beverage: Copper + Warm Green
 * 7. Fallback: Neutral E3 Cyan + Teal
 */

export interface DepartmentAuraTheme {
  key: string;
  nameEn: string;
  primaryColor: string;
  secondaryColor: string;
  warmGlowColor: string;
  auraGradient: string;
  contourStroke: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
}

export const DEPARTMENT_AURA_THEMES: Record<string, DepartmentAuraTheme> = {
  executive: {
    key: 'executive',
    nameEn: 'Executive Management',
    primaryColor: '#10b981', // Emerald
    secondaryColor: '#e2b774', // Champagne Gold
    warmGlowColor: 'rgba(226, 183, 116, 0.18)',
    auraGradient: 'radial-gradient(circle at 60% 40%, rgba(16,185,129,0.38) 0%, rgba(226,183,116,0.22) 45%, transparent 75%)',
    contourStroke: 'rgba(16,185,129,0.25)',
    badgeBorder: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-500 dark:text-emerald-400',
  },
  creative: {
    key: 'creative',
    nameEn: 'Creative & Marketing',
    primaryColor: '#8b5cf6', // Violet
    secondaryColor: '#ec4899', // Magenta
    warmGlowColor: 'rgba(236, 72, 153, 0.18)',
    auraGradient: 'radial-gradient(circle at 60% 40%, rgba(139,92,246,0.40) 0%, rgba(236,72,153,0.24) 45%, transparent 75%)',
    contourStroke: 'rgba(139,92,246,0.28)',
    badgeBorder: 'border-violet-500/30',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-500 dark:text-violet-400',
  },
  operations: {
    key: 'operations',
    nameEn: 'Operations',
    primaryColor: '#f59e0b', // Amber
    secondaryColor: '#ef4444', // Red
    warmGlowColor: 'rgba(245, 158, 11, 0.18)',
    auraGradient: 'radial-gradient(circle at 60% 40%, rgba(245,158,11,0.38) 0%, rgba(239,68,68,0.22) 45%, transparent 75%)',
    contourStroke: 'rgba(245,158,11,0.26)',
    badgeBorder: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-500 dark:text-amber-400',
  },
  technical: {
    key: 'technical',
    nameEn: 'Technical & Production',
    primaryColor: '#06b6d4', // Cyan
    secondaryColor: '#3b82f6', // Electric Blue
    warmGlowColor: 'rgba(6, 182, 212, 0.18)',
    auraGradient: 'radial-gradient(circle at 60% 40%, rgba(6,182,212,0.40) 0%, rgba(59,130,246,0.25) 45%, transparent 75%)',
    contourStroke: 'rgba(6,182,212,0.28)',
    badgeBorder: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-500 dark:text-cyan-400',
  },
  finance: {
    key: 'finance',
    nameEn: 'Finance & Administration',
    primaryColor: '#1d4ed8', // Cobalt
    secondaryColor: '#cbd5e1', // Silver
    warmGlowColor: 'rgba(203, 213, 225, 0.18)',
    auraGradient: 'radial-gradient(circle at 60% 40%, rgba(29,78,216,0.38) 0%, rgba(203,213,225,0.22) 45%, transparent 75%)',
    contourStroke: 'rgba(29,78,216,0.26)',
    badgeBorder: 'border-blue-600/30',
    badgeBg: 'bg-blue-600/10',
    badgeText: 'text-blue-500 dark:text-blue-400',
  },
  foodBeverage: {
    key: 'foodBeverage',
    nameEn: 'Food & Beverage',
    primaryColor: '#c2410c', // Copper
    secondaryColor: '#15803d', // Warm Green
    warmGlowColor: 'rgba(194, 65, 12, 0.18)',
    auraGradient: 'radial-gradient(circle at 60% 40%, rgba(194,65,12,0.38) 0%, rgba(21,128,61,0.24) 45%, transparent 75%)',
    contourStroke: 'rgba(194,65,12,0.26)',
    badgeBorder: 'border-orange-600/30',
    badgeBg: 'bg-orange-600/10',
    badgeText: 'text-orange-500 dark:text-orange-400',
  },
  fallback: {
    key: 'fallback',
    nameEn: 'E3 Event Engineering Experts',
    primaryColor: '#06b6d4', // Cyan
    secondaryColor: '#14b8a6', // Teal
    warmGlowColor: 'rgba(6, 182, 212, 0.15)',
    auraGradient: 'radial-gradient(circle at 60% 40%, rgba(6,182,212,0.35) 0%, rgba(20,184,166,0.22) 45%, transparent 75%)',
    contourStroke: 'rgba(6,182,212,0.25)',
    badgeBorder: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-500 dark:text-cyan-400',
  },
};

/**
 * Resolves the department aura theme deterministically given an English or Arabic department string or key.
 */
export function resolveDepartmentAura(department?: string | null, departmentKey?: string | null): DepartmentAuraTheme {
  const norm = (department || '').toLowerCase().trim();
  const keyNorm = (departmentKey || '').toLowerCase().trim();

  // 1. Executive Management (Highest organizational precedence)
  if (
    keyNorm === 'executive' ||
    keyNorm === 'leadership' ||
    keyNorm === 'executive-leadership' ||
    norm.includes('executive') ||
    norm.includes('leadership') ||
    norm.includes('تنفيذ') ||
    norm.includes('قياد') ||
    norm.includes('مجلس') ||
    norm.includes('رئيس') ||
    norm.includes('director') ||
    norm.includes('c-suite')
  ) {
    return DEPARTMENT_AURA_THEMES.executive;
  }

  // 2. Food & Beverage (Specific hospitality domain)
  if (
    keyNorm === 'food-beverage' ||
    keyNorm === 'foodbeverage' ||
    keyNorm === 'fnb' ||
    keyNorm === 'f&b' ||
    norm.includes('food') ||
    norm.includes('beverage') ||
    norm.includes('أغذي') ||
    norm.includes('مشروب') ||
    norm.includes('مطاعم') ||
    norm.includes('catering') ||
    norm.includes('f&b')
  ) {
    return DEPARTMENT_AURA_THEMES.foodBeverage;
  }

  // 3. Creative & Marketing
  if (
    keyNorm === 'creative' ||
    keyNorm === 'marketing' ||
    keyNorm === 'creative-marketing' ||
    norm.includes('creative') ||
    norm.includes('marketing') ||
    norm.includes('تسويق') ||
    norm.includes('إبداع') ||
    norm.includes('تصميم') ||
    norm.includes('design') ||
    norm.includes('brand') ||
    norm.includes('content')
  ) {
    return DEPARTMENT_AURA_THEMES.creative;
  }

  // 4. Technical & Production
  if (
    keyNorm === 'technical' ||
    keyNorm === 'production' ||
    keyNorm === 'technology' ||
    keyNorm === 'events-production' ||
    keyNorm === 'technology-systems' ||
    norm.includes('tech') ||
    norm.includes('production') ||
    norm.includes('إنتاج') ||
    norm.includes('هندس') ||
    norm.includes('تقني') ||
    norm.includes('أنظم') ||
    norm.includes('systems') ||
    norm.includes('audio') ||
    norm.includes('video') ||
    norm.includes('staging')
  ) {
    return DEPARTMENT_AURA_THEMES.technical;
  }

  // 5. Finance & Administration
  if (
    keyNorm === 'finance' ||
    keyNorm === 'admin' ||
    keyNorm === 'administration' ||
    norm.includes('finance') ||
    norm.includes('مالي') ||
    norm.includes('accounting') ||
    norm.includes('محاسب') ||
    norm.includes('admin') ||
    norm.includes('إدار') ||
    norm.includes('legal') ||
    norm.includes('قانون') ||
    norm.includes('hr') ||
    norm.includes('موارد')
  ) {
    return DEPARTMENT_AURA_THEMES.finance;
  }

  // 6. Operations & Guest Experience
  if (
    keyNorm === 'operations' ||
    keyNorm === 'operations-guest-experience' ||
    norm.includes('operation') ||
    norm.includes('تشغيل') ||
    norm.includes('logistics') ||
    norm.includes('لوجست') ||
    norm.includes('guest') ||
    norm.includes('ضيافة') ||
    norm.includes('venue')
  ) {
    return DEPARTMENT_AURA_THEMES.operations;
  }

  // Fallback to neutral E3 Cyan/Teal
  return DEPARTMENT_AURA_THEMES.fallback;
}
