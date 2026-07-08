'use client';
import { FormEvent, useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useUI } from '@/lib/ui-context';
import { api } from '@/lib/auth-context';
import type { UserRecord } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [formData, setFormData] = useState<Partial<UserRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { setToastMessage } = useUI();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const data = await api.get<any[]>('/api/users');
        setUsers(data as UserRecord[]);
      } catch { setToastMessage('Gagal memuat data pengguna.'); }
      setIsLoadingUsers(false);
    };
    loadUsers();
  }, [setToastMessage]);

  const filteredUsers = users.filter((user) => {
    const search = query.toLowerCase();
    return user.name?.toLowerCase().includes(search) || user.email?.toLowerCase().includes(search);
  });

  const handleAddUser = async () => {
    if (!formData.email || !formData.password) { setToastMessage('Email dan password harus diisi.'); return; }
    setIsSaving(true);
    try {
      await api.post('/api/register', { name: formData.name || formData.email?.split('@')[0], email: formData.email, password: formData.password, department: formData.department || 'Umum' });
      setToastMessage('Pengguna berhasil ditambahkan.');
      setShowAddModal(false);
      setFormData({});
      const data = await api.get<any[]>('/api/users');
      setUsers(data as UserRecord[]);
    } catch (err: any) { setToastMessage(err.message || 'Gagal menambahkan pengguna.'); }
    finally { setIsSaving(false); }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      if (formData.role) await api.put(`/api/users/${selectedUser.id}/role`, { role: formData.role });
      setToastMessage('Role berhasil diperbarui.');
      setShowEditModal(false);
      setSelectedUser(null);
      const data = await api.get<any[]>('/users');
      setUsers(data as UserRecord[]);
    } catch (err: any) { setToastMessage(err.message || 'Gagal.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-500">Kelola akun pengguna dan hak akses.</p>
        </div>
        <button onClick={() => { setFormData({}); setShowAddModal(true); }} className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          <UserPlus size={18} /> Tambah Pengguna
        </button>
      </div>

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari pengguna..." className="mb-4 w-full max-w-xs rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none" />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-slate-600">Nama</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Departemen</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">{isLoadingUsers ? 'Memuat...' : 'Tidak ada pengguna.'}</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role === 'admin' && <ShieldCheck size={12} />}
                      {user.role === 'admin' ? 'Admin' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.department || 'Umum'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedUser(user); setFormData({ role: user.role }); setShowEditModal(true); }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" title="Ubah Role"><Edit3 size={16} /></button>
                      <button onClick={async () => {
                        if (!confirm(`Hapus pengguna "${user.name}"?`)) return;
                        try { await api.delete(`/api/users/${user.id}`); setToastMessage('Pengguna dihapus.'); const d = await api.get<any[]>('/api/users'); setUsers(d as UserRecord[]); }
                        catch (err: any) { setToastMessage(err.message); }
                      }} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50" title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Pengguna Baru">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Nama</span>
            <input value={formData.name || ''} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email *</span>
            <input value={formData.email || ''} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} type="email" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password *</span>
            <input value={formData.password || ''} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} type="password" minLength={8} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Departemen</span>
            <input value={formData.department || ''} onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" />
          </label>
          <button onClick={handleAddUser} disabled={isSaving} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Menyimpan...' : 'Tambah'}
          </button>
        </div>
      </Modal>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Ubah Role Pengguna">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Mengubah role untuk <strong>{selectedUser?.name}</strong></p>
          <select value={formData.role || 'staff'} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as 'admin' | 'staff' }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleEditUser} disabled={isSaving} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
