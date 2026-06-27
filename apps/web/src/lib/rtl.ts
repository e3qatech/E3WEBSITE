/**
 * Core RTL and Localization Utility
 */

export function isRTL(locale: string): boolean {
  return locale === 'ar';
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

export function getAlign(locale: string, start: string = 'left', end: string = 'right'): string {
  return isRTL(locale) ? end : start;
}

export function formatNumber(number: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-QA' : 'en-US').format(number);
}

export function formatDate(date: Date, locale: string = 'en', options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-QA' : 'en-US', 
    options || defaultOptions
  ).format(date);
}
