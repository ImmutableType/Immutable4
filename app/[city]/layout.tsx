// app/[city]/layout.tsx
import { urlOptimizer } from '../../lib/locations/seo/urlOptimizer';
import { redirect } from 'next/navigation';
import ClientLayout from '../(client)/layout';

interface CityLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    city: string;
  }>;
}

export default async function CityLayout({ children, params }: CityLayoutProps) {
  const { city } = await params;
  
  // Validate city - redirect to reader if invalid
  if (!urlOptimizer.isValidCity(city)) {
    redirect('/reader');
  }
  
  // Wrap children in the ClientLayout to get the navigation and styling
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}