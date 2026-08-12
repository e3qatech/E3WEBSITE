import { LocationManager } from '@/components/dashboard/b2c/LocationManager';

export const metadata = {
  title: 'Locations Manager | E3 Qatar Dashboard',
  description: 'Manage GIS coordinates, venues, and map pins across Qatar.'
};

export default function LocationsDashboardPage() {
  return <LocationManager />;
}
