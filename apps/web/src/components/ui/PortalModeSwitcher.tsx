 
'use client';

import React from 'react';

export interface PortalModeSwitcherProps {
  locale?: string;
  customerLabelEn?: string;
  customerLabelAr?: string;
  organizerLabelEn?: string;
  organizerLabelAr?: string;
  customerUrl?: string;
  organizerUrl?: string;
  showOrganizerLogin?: boolean;
  organizerLoginLabelEn?: string;
  organizerLoginLabelAr?: string;
  organizerLoginUrl?: string;
  className?: string;
  onNavigate?: () => void;
}

import { PulseOrbitDropdown } from '@/components/b2c/nav/PulseOrbitDropdown';

export function PortalModeSwitcher(props: PortalModeSwitcherProps) {
  return (
    <PulseOrbitDropdown
      locale={props.locale}
      customerLabelEn={props.customerLabelEn}
      customerLabelAr={props.customerLabelAr}
      organizerLabelEn={props.organizerLabelEn}
      organizerLabelAr={props.organizerLabelAr}
      customerUrl={props.customerUrl}
      organizerUrl={props.organizerUrl}
      onNavigate={props.onNavigate}
      className={props.className}
    />
  );
}
