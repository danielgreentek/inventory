'use client';
import { AuthProvider } from '@/lib/auth-context';
import { UIProvider } from '@/lib/ui-context';
import { InventoryProvider } from '@/lib/inventory-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>
        <InventoryProvider>
          {children}
        </InventoryProvider>
      </UIProvider>
    </AuthProvider>
  );
}
