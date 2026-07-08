'use client';
import { useUI } from '@/lib/ui-context';
import { Search, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { searchQuery, setSearchQuery } = useUI();

  return (
    <div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 md:hidden"
      >
        <Menu size={20} />
      </button>
      <div className="relative flex-1">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari barang, kategori, cabang..."
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
