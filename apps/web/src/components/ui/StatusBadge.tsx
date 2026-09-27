type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-800',
    MATCHED: 'bg-blue-100 text-blue-800',
    DRIVER_ARRIVED: 'bg-indigo-100 text-indigo-800',
    STARTED: 'bg-violet-100 text-violet-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    ONLINE: 'bg-green-100 text-green-800',
    OFFLINE: 'bg-slate-200 text-slate-700'
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] ?? 'bg-slate-100 text-slate-700'}`}>{status}</span>;
}
