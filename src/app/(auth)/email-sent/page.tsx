'use client';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '@/lib/auth-context';
import { useState } from 'react';

function EmailSentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await api.post('/api/email/resend', { email });
      setResent(true);
    } catch {
      // silent
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <Mail size={32} className="text-brand-600" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-950">Cek Email Anda</h1>
      <p className="mt-3 text-sm text-slate-500">Kami telah mengirim link verifikasi ke:</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{email || 'email Anda'}</p>
      <p className="mt-4 text-sm text-slate-500">Klik link di email tersebut untuk mengaktifkan akun Anda.</p>

      {resent && <p className="mt-4 rounded-3xl bg-green-50 px-4 py-3 text-sm text-green-700">Email verifikasi telah dikirim ulang!</p>}

      <div className="mt-8 space-y-3">
        <button onClick={handleResend} disabled={resending}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
          {resending ? 'Mengirim...' : 'Kirim Ulang Email'}
        </button>
        <button onClick={() => router.push('/login')}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
          <ArrowLeft size={16} /> Kembali ke Login
        </button>
      </div>
    </div>
  );
}

export default function EmailSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
        </div>
      }>
        <EmailSentContent />
      </Suspense>
    </div>
  );
}
