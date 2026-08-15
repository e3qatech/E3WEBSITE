import 'server-only';
/**
 * BookingQube Server Integration Compatibility Facade.
 * Strictly protected with 'server-only'. Never importable by client components.
 * Client components must import checkout utilities directly from '@/lib/bookingqube-client'.
 */
export * from './bookingqube-server';
