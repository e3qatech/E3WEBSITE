import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Building2,
  Ticket,
  Briefcase,
  UserCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Lock,
  ExternalLink,
  ChevronRight,
  KeyRound,
  Check,
} from 'lucide-react';
import { ThemeToggle } from '@/components/auth/ThemeToggle';
import { LanguageToggle } from '@/components/auth/LanguageToggle';
import { LoginDetailsClient } from './LoginDetailsClient';

export const metadata: Metadata = {
  title: 'E3 Portals & Official Login Details | E3 Qatar',
  description: 'Official directory of administrative workspaces, testing credentials, permissions matrix, and direct authentication entry points.',
};

export default async function LoginDetailsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'ar' ? 'ar' : 'en';

  return <LoginDetailsClient locale={validLocale} />;
}
