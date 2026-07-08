'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Search, Trash2, Plus } from 'lucide-react';
import { useInventory } from '@/lib/inventory-context';
import { useUI } from '@/lib/ui-context';
import { Badge } from '@/components/Badge';
import { PageLoader } from '@/components/Loading';
import { Modal } from '@/components/Modal';
import type { InventoryStatus, InventoryUnit, InventoryCategory } from '@/types';

const statusOptions: InventoryStatus[] = ['Aktif', 'Maintenance', 'Rusak'];

export default function InventoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { items, isLoading, updateItem } = useInventory();
  const { setToastMessage } = useUI();
  const item = items.find((itemData) => itemData.id === id);

  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<InventoryCategory>('Laptop');
  const [itemBrand, setItemBrand] = useState('');
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [unitSearch, setUnitSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingUnitHistory, setEditingUnitHistory] = useState<string | null>(null);
  const [addUnitCount, setAddUnitCount] = useState(1);
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);

  useEffect(() => {
    if (item) {
      setItemName(item.item_name);
      setItemCategory(item.category);
      setItemBrand(item.brand);
      setUnits(item.units);
    }
  }, [item]);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) =>
      [unit.serial, unit.location, unit.assignedTo, unit.condition, unit.status]
        .some((value) => String(value || '').toLowerCase().includes(unitSearch.toLowerCase()))
    );
  }, [units, unitSearch]);

  const computeStatusAndNote = (action: string) => {
    const map: Record<string, { status: InventoryStatus; condition_note: string }> = {
      Diperiksa: { status: 'Aktif', condition_note: 'Diperiksa' },
      Diperbaiki: { status: 'Aktif', condition_note: '' },
      Maintenance: { status: 'Maintenance', condition_note: 'Dalam perbaikan' },
      Rusak: { status: 'Rusak', condition_note: 'Dilaporkan rusak' },
      Lainnya: { status: 'Rusak', condition_note: 'Untuk info lebih lanjut ke admin' },
    };
    return map[action] || { status: 'Aktif', condition_note: '' };
  };

  const applyUnitAction = (serial: string, action: string) => {
    const unit = units.find((u) => u.serial === serial);
    if (!unit) return;
    if (!confirm(`Yakin akan menerapkan aksi '${action}' pada unit ${serial}?`)) return;

    const { status, condition_note } = computeStatusAndNote(action);
    const newRecord = { id: `hist-${Date.now()}`, date: new Date().toISOString().slice(0, 10), action, note: `Status diubah menjadi ${action} oleh admin.` };

    const next = units.map((u) => u.serial === serial ? { ...u, status, condition_note, history: [...(u.history || []), newRecord] } : u);
    setUnits(next);
    if (item) updateItem({ ...item, units: next, quantity: next.length });
    setToastMessage(`Aksi '${action}' diterapkan pada unit ${serial}.`);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateItem({ ...item, item_name: itemName, category: itemCategory, brand: itemBrand, quantity: units.length, units });
    setIsSaving(false);
    setToastMessage(`Perubahan untuk ${itemName} berhasil disimpan.`);
  };

  if (isLoading) return <PageLoader message="Memuat detail inventaris..." />;
  if (!item) return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-lg font-semibold text-slate-950">Inventaris tidak ditemukan</p>
      <button onClick={() => router.push('/inventory')} className="mt-6 rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white">Kembali ke Inventaris</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <button onClick={() => router.push('/inventory')} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          <ArrowLeft size={16} /> Kembali
        </button>
        <span className="text-2xl font-semibold text-slate-950">{item.item_name}</span>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-700">
            <p className="text-xs">Total unit</p>
            <p className="text-lg font-semibold">{units.length}</p>
          </div>
          <button onClick={() => setShowAddUnitForm(!showAddUnitForm)} className="rounded-3xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Tambah Unit</button>
        </div>
      </div>

      {showAddUnitForm && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Jumlah unit:</span>
            <input type="number" min={1} value={addUnitCount} onChange={(e) => setAddUnitCount(Math.max(1, Number(e.target.value)))} className="w-20 rounded-3xl border px-3 py-2 text-sm" />
            <button onClick={() => {
              const today = new Date().toISOString().slice(0, 10);
              const newUnits = Array.from({ length: addUnitCount }, (_, i) => ({
                serial: `${item.item_name}-${String(units.length + i + 1).padStart(3, '0')}`,
                status: 'Aktif' as InventoryStatus,
                location: item.branch,
                assignedTo: '-',
                condition: 'Aktif',
                condition_note: 'Unit baru',
                production_date: today,
                history: [],
              }));
              const next = [...units, ...newUnits];
              setUnits(next);
              if (item) updateItem({ ...item, units: next, quantity: next.length });
              setShowAddUnitForm(false);
              setToastMessage(`${addUnitCount} unit ditambahkan.`);
            }} className="rounded-3xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Tambah</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Barang</label>
            <input value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Kategori</label>
            <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value as InventoryCategory)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              {['Laptop', 'Computer', 'Printer', 'Networking', 'CCTV', 'Peripheral', 'Multimedia'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Brand</label>
            <input value={itemBrand} onChange={(e) => setItemBrand(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Cabang</label>
            <input value={item.branch} disabled className="w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none" />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <Search size={16} className="text-slate-400" />
            <input value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)} placeholder="Cari unit..." className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none" />
          </div>
          {filteredUnits.map((unit) => (
            <div key={unit.serial} className="mb-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Serial unit</p>
                  <p className="text-lg font-semibold text-slate-950">{unit.serial}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => applyUnitAction(unit.serial, 'Maintenance')} className="rounded-3xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">Maintenance</button>
                  <button type="button" onClick={() => applyUnitAction(unit.serial, 'Rusak')} className="rounded-3xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">Rusak</button>
                  <button type="button" onClick={() => applyUnitAction(unit.serial, 'Diperbaiki')} className="rounded-3xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Aktif</button>
                  <button type="button" onClick={() => {
                    const next = units.filter((u) => u.serial !== unit.serial);
                    setUnits(next);
                    if (item) updateItem({ ...item, units: next, quantity: next.length });
                    setToastMessage(`Unit ${unit.serial} berhasil dihapus.`);
                  }} className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Hapus</button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select value={unit.status} onChange={(e) => {
                    const next = units.map((u) => u.serial === unit.serial ? { ...u, status: e.target.value as InventoryStatus } : u);
                    setUnits(next);
                    if (item) updateItem({ ...item, units: next, quantity: next.length });
                  }} className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Lokasi</label>
                  <input value={unit.location} onChange={(e) => {
                    const next = units.map((u) => u.serial === unit.serial ? { ...u, location: e.target.value } : u);
                    setUnits(next);
                    if (item) updateItem({ ...item, units: next, quantity: next.length });
                  }} className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Pemakai</label>
                  <input value={unit.assignedTo} onChange={(e) => {
                    const next = units.map((u) => u.serial === unit.serial ? { ...u, assignedTo: e.target.value } : u);
                    setUnits(next);
                    if (item) updateItem({ ...item, units: next, quantity: next.length });
                  }} className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Kondisi</label>
                  <input value={unit.condition || ''} onChange={(e) => {
                    const next = units.map((u) => u.serial === unit.serial ? { ...u, condition: e.target.value } : u);
                    setUnits(next);
                    if (item) updateItem({ ...item, units: next, quantity: next.length });
                  }} className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Catatan kondisi</label>
                  <input value={unit.condition_note || ''} onChange={(e) => {
                    const next = units.map((u) => u.serial === unit.serial ? { ...u, condition_note: e.target.value } : u);
                    setUnits(next);
                    if (item) updateItem({ ...item, units: next, quantity: next.length });
                  }} className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Catatan kondisi..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Tanggal produksi</label>
                  <input type="date" value={unit.production_date || ''} onChange={(e) => {
                    const next = units.map((u) => u.serial === unit.serial ? { ...u, production_date: e.target.value } : u);
                    setUnits(next);
                    if (item) updateItem({ ...item, units: next, quantity: next.length });
                  }} className="mt-1 w-full rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              {unit.history && unit.history.length > 0 && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Riwayat ({unit.history.length})</p>
                  <div className="max-h-32 space-y-2 overflow-y-auto">
                    {unit.history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                        <span><Badge status={h.action} /> {h.note}</span>
                        <span className="text-slate-400">{h.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="submit" disabled={isSaving} className="rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
