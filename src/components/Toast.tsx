'use client';
import { useUI } from '@/lib/ui-context';
import { CheckCircle } from 'lucide-react';

export function Toast() {
  const { toastMessage } = useUI();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 rounded-[2rem] bg-slate-950 px-6 py-4 text-sm font-medium text-white shadow-2xl backdrop-blur-sm">
        <CheckCircle size={18} className="text-emerald-400" />
        {toastMessage}
      </div>
    </div>
  );
}
