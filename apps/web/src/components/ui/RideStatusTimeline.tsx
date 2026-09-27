const statusOrder = ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED'];

type RideStatusTimelineProps = {
  status: string;
};

export function RideStatusTimeline({ status }: RideStatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="space-y-3">
      {statusOrder.map((item, index) => {
        const isCurrent = status === item;
        const isPast = currentIndex >= index;

        return (
          <div key={item} className="flex items-center gap-3">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isCancelled ? 'bg-red-500 text-white' : isCurrent ? 'bg-brand-600 text-white' : isPast ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {index + 1}
            </div>
            <div className={`text-sm font-medium ${isCurrent ? 'text-brand-700' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
              {item}
            </div>
          </div>
        );
      })}
      {isCancelled ? <div className="rounded bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">CANCELLED</div> : null}
    </div>
  );
}
