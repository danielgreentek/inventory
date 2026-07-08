interface BadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  Aktif: 'bg-emerald-50 text-emerald-700',
  Maintenance: 'bg-amber-50 text-amber-700',
  Rusak: 'bg-rose-50 text-rose-700',
  Dipinjam: 'bg-sky-50 text-sky-700',
  Dikembalikan: 'bg-slate-100 text-slate-600',
  Terlambat: 'bg-red-50 text-red-700',
  admin: 'bg-purple-50 text-purple-700',
  staff: 'bg-slate-100 text-slate-600',
};

export function Badge({ status }: BadgeProps) {
  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
