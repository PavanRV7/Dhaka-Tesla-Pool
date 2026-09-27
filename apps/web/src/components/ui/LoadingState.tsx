export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{message}</div>;
}
