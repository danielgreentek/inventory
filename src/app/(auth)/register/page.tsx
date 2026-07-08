'use client';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { api } from '@/lib/auth-context';

const ALLOWED_EMAIL_DOMAIN = 'greentekindonesia.co.id';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const emailDomain = useMemo(() => {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : '';
  }, [email]);

  const emailAllowed = emailDomain === ALLOWED_EMAIL_DOMAIN;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post<{ message: string; email: string }>('/register', { name, email, password });
      router.push(`/email-sent?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Buat Akun Baru</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Greentek Inventory</h1>
        </div>
        {error && <div className="mb-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Nama</span>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" required placeholder="Nama lengkap" className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email kantor</span>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Mail size={18} className="text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            </div>
          </label>
          {email && !emailAllowed && (
            <p className="rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-700">Hanya email <strong>@{ALLOWED_EMAIL_DOMAIN}</strong> yang diizinkan.</p>
          )}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Lock size={18} className="text-slate-400" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8} className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Konfirmasi Password</span>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Lock size={18} className="text-slate-400" />
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required minLength={8} className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            </div>
          </label>
          <button type="submit" disabled={isSubmitting || !emailAllowed} className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
          </button>
          <button type="button" onClick={() => router.push('/login')} className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            Sudah punya akun? Login
          </button>
        </form>
      </div>
    </div>
  );
}
