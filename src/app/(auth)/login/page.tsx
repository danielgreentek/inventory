'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();
  const { signIn, signingIn, user, isLoading } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin" />
          <p className="text-lg font-semibold text-slate-950">Memeriksa sesi Anda...</p>
          <p className="text-sm text-slate-500">Harap tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNeedsVerify(false);
    setResent(false);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err?.needs_verification) {
        setNeedsVerify(true);
        setError('Email belum diverifikasi. Silakan cek inbox email Anda.');
      } else {
        setError(err.message || 'Gagal login');
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/email/resend', { email });
      setResent(true);
    } catch {
      setError('Gagal mengirim ulang email verifikasi.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">PT. Greentek Elektrikal Indonesia</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Greentek Inventory</h1>
        </div>
        <form className="space-y-5" onSubmit={handleLogin}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Mail size={18} className="text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Lock size={18} className="text-slate-400" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            </div>
          </label>

          {error && (
            <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p>{error}</p>
              {needsVerify && !resent && (
                <button type="button" onClick={handleResend} disabled={resending} className="mt-2 text-sm font-semibold underline hover:text-rose-800">
                  {resending ? 'Mengirim...' : 'Kirim ulang email verifikasi'}
                </button>
              )}
              {resent && <p className="mt-2 text-green-700 font-semibold">Email verifikasi telah dikirim ulang!</p>}
            </div>
          )}

          <button type="submit" disabled={signingIn} className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
            {signingIn ? 'Memproses...' : 'Login'}
          </button>
          <button type="button" onClick={() => router.push('/register')} className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            Buat Akun Baru
          </button>
          <button type="button" onClick={() => router.push('/forgot-password')} className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            Lupa Password?
          </button>
        </form>
      </div>
    </div>
  );
}
