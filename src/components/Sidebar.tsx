'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Package2, Users, FileText, ShieldCheck, X, LogOut } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inventory', label: 'Inventaris', icon: Package2 },
    { href: '/users', label: 'Pengguna', icon: Users, adminOnly: true },
    { href: '/reports', label: 'Laporan', icon: FileText },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Greentek</p>
            <h2 className="text-lg font-semibold text-slate-950">Inventory</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 md:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === 'admin')
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive(item.href)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
