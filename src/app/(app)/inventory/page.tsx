'use client';
import { FormEvent, useMemo, useState, useEffect } from 'react';
import { Plus, Filter, Trash2, Edit3, Eye } from 'lucide-react';
import type { InventoryCategory, InventoryItem } from '@/types';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/Modal';
import { useUI } from '@/lib/ui-context';
import { useInventory } from '@/lib/inventory-context';

const categories: InventoryCategory[] = ['Laptop', 'Computer', 'Printer', 'Networking', 'CCTV', 'Peripheral', 'Multimedia'];
const branchOptions = ['Jakarta', 'Purwokerto', 'Semarang', 'Solo'];

export default function InventoryPage() {
  const router = useRouter();
  const { items, isLoading, addItem, deleteItem } = useInventory();
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const { searchQuery, setToastMessage } = useUI();
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('Laptop');
  const [newItemBranch, setNewItemBranch] = useState(branchOptions[0]);
  const [newItemBrand, setNewItemBrand] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = [item.item_name, item.item_code, item.brand].some((v) =>
        String(v || '').toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
      const matchesBranch = branchFilter ? item.branch === branchFilter : true;
      return matchesSearch && matchesCategory && matchesBranch;
    });
  }, [items, searchQuery, categoryFilter, branchFilter]);

  const generateItemCode = (itemName: string): string => {
    const prefix = itemName.trim().replace(/\s+/g, ' ');
    const existingCodes = items.filter((item) => typeof item.item_code === 'string' && item.item_code.startsWith(`${prefix}-`))
      .map((item) => { const s = item.item_code.slice(prefix.length + 1); return parseInt(s, 10) || 0; });
    const next = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    return `${prefix}-${String(next).padStart(3, '0')}`;
  };

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const itemName = newItemName.trim() || 'Asset Baru';
    const quantity = Math.max(1, Number(newItemQty) || 1);
    const itemCode = generateItemCode(itemName);
    const units = Array.from({ length: quantity }, (_, index) => ({
      serial: `${itemName}-${String(index + 1).padStart(3, '0')}`,
      status: 'Aktif' as const,
      location: 'Gudang IT',
      assignedTo: '-',
      condition: 'Aktif',
      condition_note: 'Unit baru, belum pernah digunakan',
      production_date: new Date().toISOString().slice(0, 10),
      history: [],
    }));

    addItem({
      id: `inv-${Date.now()}`,
      item_code: itemCode,
      item_name: itemName,
      category: newItemCategory,
      brand: newItemBrand || 'Generic',
      quantity,
      purchase_date: new Date().toISOString().slice(0, 10),
      branch: newItemBranch,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
      units,
      history: [],
    });

    setNewItemName(''); setNewItemCategory('Laptop'); setNewItemBranch('Jakarta Pusat'); setNewItemBrand(''); setNewItemQty(1);
    setShowAddModal(false);
    setToastMessage('Barang baru berhasil ditambahkan.');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Inventaris Greentek Elektrikal Indonesia</p>
          <h3 className="text-2xl font-semibold text-slate-950">Kelola Aset</h3>
        </div>
        <button onClick={() => setShowAddModal(true)} disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <Filter size={16} />
              <select className="bg-transparent text-sm outline-none" value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}>
                <option value="">Semua Cabang</option>
                {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <Filter size={16} />
              <select className="bg-transparent text-sm outline-none" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                <option value="">Semua Kategori</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr><th className="px-4 py-4">Nama Barang</th><th className="px-4 py-4">Kategori</th><th className="px-4 py-4">Brand</th><th className="px-4 py-4">Qty</th><th className="px-4 py-4">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4"><p className="font-semibold text-slate-950">{item.item_name}</p></td>
                  <td className="px-4 py-4 text-slate-600">{item.category}</td>
                  <td className="px-4 py-4 text-slate-600">{item.brand}</td>
                  <td className="px-4 py-4 font-semibold text-slate-950">{item.quantity}</td>
                  <td className="px-4 py-4">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => router.push(`/inventory/${item.id}`)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200" title="Detail"><Eye size={16} /></button>
                      <button onClick={() => router.push(`/inventory/${item.id}`)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200" title="Edit"><Edit3 size={16} /></button>
                      <button onClick={() => { setSelectedItem(item); setShowDeleteModal(true); }} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            <p className="text-lg font-semibold text-slate-900">Tidak ada item yang ditemukan</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p>{filteredItems.length} barang ditemukan</p>
          <div className="inline-flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50">Sebelumnya</button>
            <span>Halaman {page} dari {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50">Selanjutnya</button>
          </div>
        </div>
      </div>

      <Modal title="Tambah Barang Inventaris" open={showAddModal} onClose={() => setShowAddModal(false)}>
        <form className="space-y-5" onSubmit={handleAdd}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Barang</label>
            <input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" placeholder="Contoh: Router MikroTik" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Kategori</label>
            <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value as InventoryCategory)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Cabang</label>
            <select value={newItemBranch} onChange={(e) => setNewItemBranch(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
              {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Brand</label>
            <input value={newItemBrand} onChange={(e) => setNewItemBrand(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" placeholder="Contoh: Asus, Dell, HP" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Qty</label>
            <input type="number" min={1} value={newItemQty} onChange={(e) => setNewItemQty(Number(e.target.value))} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
          </div>
          <button type="submit" disabled={isSaving} className="rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {isSaving ? 'Menyimpan...' : 'Simpan Barang'}
          </button>
        </form>
      </Modal>

      <Modal title="Konfirmasi Hapus" open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-5">
          <p className="text-sm text-slate-600">Apakah Anda yakin ingin menghapus barang berikut?</p>
          <p className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">{selectedItem?.item_name}</p>
          <button onClick={() => { if (selectedItem) { deleteItem(selectedItem.id); setShowDeleteModal(false); setToastMessage(`Barang ${selectedItem.item_name} berhasil dihapus.`); } }} className="rounded-3xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">Hapus Sekarang</button>
        </div>
      </Modal>
    </div>
  );
}
