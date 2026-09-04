import { PortalKey, allowedRolesForPortal } from '@/lib/auth-roles';

export interface PortalConfig {
  portalKey: PortalKey;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  badgeEn: string;
  badgeAr: string;
  allowedRoles: string[];
  defaultLanding: string;
  accentColor: string;
  secondaryAccent: string;
  themeStyle: 'control' | 'atelier' | 'people' | 'staff';
  bgGradient: string;
  showWorkspaceSelector?: boolean;
}

export const PORTAL_CONFIGS: Record<PortalKey, PortalConfig> = {
  admin: {
    portalKey: 'admin',
    titleEn: 'E3 Command Center',
    titleAr: 'مركز قيادة إي ثري',
    descriptionEn: 'Platform administration, telemetry, and corporate oversight',
    descriptionAr: 'إدارة المنصة، والقياسات الآلية، والإشراف المؤسسي',
    badgeEn: 'Admin Control',
    badgeAr: 'بوابة الإدارة',
    allowedRoles: allowedRolesForPortal('admin'),
    defaultLanding: '/dashboard',
    accentColor: '#10b981', // Jade
    secondaryAccent: '#0f172a', // Slate
    themeStyle: 'control',
    bgGradient: 'from-slate-950 via-slate-900 to-emerald-950/30',
    showWorkspaceSelector: true,
  },
  staff: {
    portalKey: 'staff',
    titleEn: 'E3 Staff Workspace',
    titleAr: 'مساحة عمل فريق الإدارة',
    descriptionEn: 'Duty rosters, operational schedules, and event execution hub',
    descriptionAr: 'جداول العمل، والمهام التشغيلية، ومتابعة الفعاليات',
    badgeEn: 'Staff Access',
    badgeAr: 'بوابة الموظفين',
    allowedRoles: ['STAFF'],
    defaultLanding: '/dashboard',
    accentColor: '#10b981', // Jade
    secondaryAccent: '#d97706', // Muted Amber
    themeStyle: 'staff',
    bgGradient: 'from-slate-950 via-zinc-900 to-amber-950/20',
  },
  business: {
    portalKey: 'business',
    titleEn: 'E3 Atelier Business Hub',
    titleAr: 'بوابة اتيليه للشركات والمؤسسات',
    descriptionEn: 'Enterprise project collaboration, file repository, and service requests',
    descriptionAr: 'إدارة مشاريع الشركات، المستندات المعمارية، وطلبات الخدمات',
    badgeEn: 'Enterprise Portal',
    badgeAr: 'بوابة الشركات',
    allowedRoles: ['CLIENT'],
    defaultLanding: '/business',
    accentColor: '#b45309', // Brass
    secondaryAccent: '#047857', // Deep Jade
    themeStyle: 'atelier',
    bgGradient: 'from-zinc-950 via-amber-950/30 to-emerald-950/20',
  },
  careers: {
    portalKey: 'careers',
    titleEn: 'E3 People Talent Network',
    titleAr: 'شبكة الكفاءات والوظائف',
    descriptionEn: 'Candidate profile, application tracking, and career opportunities',
    descriptionAr: 'الملف الشخصي للمترشح، متابعة الطلبات، والفرص الوظيفية',
    badgeEn: 'Careers Portal',
    badgeAr: 'بوابة الوظائف',
    allowedRoles: ['CANDIDATE'],
    defaultLanding: '/candidate',
    accentColor: '#f43f5e', // Coral
    secondaryAccent: '#881337', // Burgundy
    themeStyle: 'people',
    bgGradient: 'from-rose-950/40 via-zinc-950 to-amber-950/20',
  },
};
