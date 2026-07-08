'use client';
import { BarChart3, Package2, ShieldCheck, TrendingUp, Filter, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useInventory } from '@/lib/inventory-context';
import { Modal } from '@/components/Modal';

export default function DashboardPage() {
  const { items, isLoading } = useInventory();
  const [selectedBranch, setSelectedBranch] = useState<string>('Semua Cabang');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [detailUnits, setDetailUnits] = useState<any[]>([]);

  const branches = ['Semua Cabang', 'Jakarta', 'Purwokerto', 'Semarang', 'Solo'];

  const filteredData = selectedBranch === 'Semua Cabang' ? items : items.filter(item => item.branch === selectedBranch);
  const filteredUnits = filteredData.flatMap(item => item.units);
  const filteredActiveUnits = filteredUnits.filter(u => u.status === 'Aktif').length;
  const filteredMaintenanceUnits = filteredUnits.filter(u => u.status === 'Maintenance').length;
  const filteredBrokenUnits = filteredUnits.filter(u => u.status === 'Rusak').length;

  const filteredSummary = [
    { label: 'Total Inventaris', value: filteredData.length, icon: Package2, accent: 'bg-brand-100 text-brand-700' },
    { label: 'Barang Aktif', value: filteredActiveUnits, icon: TrendingUp, accent: 'bg-sky-100 text-sky-700' },
    { label: 'Dalam Maintenance', value: filteredMaintenanceUnits, icon: ShieldCheck, accent: 'bg-amber-100 text-amber-700' },
    { label: 'Barang Rusak', value: filteredBrokenUnits, icon: BarChart3, accent: 'bg-rose-100 text-rose-700' },
  ];

  const filteredCategoryStats = useMemo(() => {
    const cats = [...new Set(filteredData.map((item) => item.category))];
    return cats.map((category) => ({
      category,
      count: filteredData.filter((item) => item.category === category).length,
    }));
  }, [filteredData]);

  const handleViewDetails = (status: string) => {
    const units = filteredUnits.filter((unit) => unit.status === status);
    const detailedUnits = units.map((unit) => {
      const item = filteredData.find((item) => item.units.some((u) => u.serial === unit.serial));
      return { ...unit, itemName: item?.item_name || 'Unknown', category: item?.category || 'Unknown', branch: item?.branch || 'Unknown' };
    });
    setDetailUnits(detailedUnits);
    setSelectedStatus(status);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none">
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 shadow-sm">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600 animate-pulse" /> Memuat ringkasan inventaris...
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filteredSummary.map((stat) => {
          const Icon = stat.icon;
          const isClickable = stat.label !== 'Total Inventaris';
          const statusMap: Record<string, string> = { 'Barang Aktif': 'Aktif', 'Dalam Maintenance': 'Maintenance', 'Barang Rusak': 'Rusak' };
          return (
            <div key={stat.label} className={`overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              onClick={isClickable ? () => handleViewDetails(statusMap[stat.label] || '') : undefined}>
              <div className="flex items-center justify-between gap-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${stat.accent}`}><Icon size={20} /></div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  {isClickable && <Eye size={14} className="text-slate-400" />}
                </div>
              </div>
              <p className="mt-8 text-4xl font-semibold text-slate-950">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Ringkasan Inventaris</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">Status kategori per kategori</h3>
          </div>
        </div>
        <div className="space-y-5">
          {filteredCategoryStats.map((stat) => (
            <div key={stat.category} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">{stat.category}</p>
                <p className="text-sm text-slate-500">Total item: {stat.count}</p>
              </div>
              <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${filteredData.length > 0 ? (stat.count / filteredData.length) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Detail Unit ${selectedStatus}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Menampilkan {detailUnits.length} unit dengan status {selectedStatus?.toLowerCase()}</p>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {detailUnits.map((unit, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{unit.itemName}</p>
                    <p className="text-xs text-slate-600">Serial: {unit.serial}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Kategori: {unit.category}</p>
                    <p className="text-xs text-slate-600">Cabang: {unit.branch}</p>
                    <p className="text-xs text-slate-600">Lokasi: {unit.location}</p>
                    <p className="text-xs text-slate-600">Pengguna: {unit.assignedTo}</p>
                    {unit.condition_note && <p className="text-xs text-slate-600">Catatan: {unit.condition_note}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
