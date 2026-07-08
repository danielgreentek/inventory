'use client';
import { Suspense, FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/auth-context';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await api.post('/api/reset-password', { token, email, password, password_confirmation: passwordConfirmation });
      setSuccess('Password berhasil direset! Silakan login dengan password baru.');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal mereset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">Link Tidak Valid</h1>
        <p className="mt-3 text-sm text-slate-500">Tautan reset password tidak valid atau sudah kadaluarsa.</p>
        <button onClick={() => router.push('/forgot-password')}
          className="mt-6 w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
          Kirim Ulang Reset Password
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">Reset Password</h1>
        <p className="mt-3 text-sm text-slate-500">Masukkan password baru untuk akun <strong className="text-slate-700">{email}</strong></p>
      </div>

      {success && <div className="mb-4 rounded-3xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
      {error && <div className="mb-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Password Baru</span>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Lock size={18} className="text-slate-400" />
            <input value={password} onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'} required minLength={8}
              className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Konfirmasi Password</span>
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Lock size={18} className="text-slate-400" />
            <input value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
              type={showConfirm ? 'text' : 'password'} required minLength={8}
              className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-slate-600">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button type="submit" disabled={isSubmitting}
          className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Menyimpan...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
