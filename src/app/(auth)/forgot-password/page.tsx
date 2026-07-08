'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { api } from '@/lib/auth-context';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await api.post('/forgot-password', { email });
      setSuccess('Tautan reset password telah dikirim ke email Anda.');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim email reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-950">Lupa Password</h1>
          <p className="mt-3 text-sm text-slate-500">Masukkan email Anda untuk mendapatkan tautan reset password.</p>
        </div>

        {success && <p className="mb-4 rounded-3xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}
        {error && <p className="mb-4 rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Mail size={18} className="text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full border-none bg-transparent text-sm text-slate-900 outline-none" />
            </div>
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Mengirim...' : 'Kirim Tautan Reset'}
          </button>
        </form>

        <button onClick={() => router.push('/login')} className="mt-4 w-full rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}
