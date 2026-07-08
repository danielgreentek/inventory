export function PageLoader({ message = 'Memuat...' }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">{message}</p>
      </div>
    </div>
  );
}
