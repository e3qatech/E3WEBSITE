import BrandsManager from '@/components/dashboard/b2c/BrandsManager';

export default function BrandsPage() {
  return (
    <div className="w-full h-full p-8">
      <h1 className="text-3xl font-bold mb-8">Brands & IP Manager</h1>
      <BrandsManager />
    </div>
  );
}
