'use client';
import { AuthProvider } from '@/lib/auth-context';
import { UIProvider } from '@/lib/ui-context';
import { InventoryProvider } from '@/lib/inventory-context';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Toast } from '@/components/Toast';
import { Footer } from '@/components/Footer';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { PageLoader } from '@/components/Loading';

function ProtectedAppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <PageLoader message="Memeriksa sesi Anda..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 px-4 pb-10 pt-4 md:px-8 md:py-6">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div className="mt-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <Toast />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>
        <InventoryProvider>
          <ProtectedAppShell>
            {children}
          </ProtectedAppShell>
        </InventoryProvider>
      </UIProvider>
    </AuthProvider>
  );
}
