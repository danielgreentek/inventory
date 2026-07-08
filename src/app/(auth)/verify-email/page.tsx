'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    const hash = searchParams.get('hash');

    if (!id || !hash) {
      setStatus('error');
      setMessage('Link verifikasi tidak valid.');
      return;
    }

    fetch(`/api/email/verify/${id}/${hash}`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus('success');
        setMessage(data.message || 'Email berhasil diverifikasi!');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Gagal memverifikasi email. Link mungkin sudah kadaluarsa.');
      });
  }, [searchParams]);

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60 text-center">
      {status === 'loading' && (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">Memverifikasi...</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">Email Terverifikasi!</h1>
          <p className="mt-3 text-sm text-green-700">{message}</p>
          <button onClick={() => router.push('/login')}
            className="mt-8 w-full rounded-3xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
            Login Sekarang
          </button>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <XCircle size={32} className="text-rose-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">Verifikasi Gagal</h1>
          <p className="mt-3 text-sm text-rose-700">{message}</p>
          <button onClick={() => router.push('/login')}
            className="mt-8 w-full rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            Kembali ke Login
          </button>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
