export function SeatIndicator({ occupied, capacity }: { occupied: number; capacity: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: capacity }).map((_, index) => (
        <div key={index} className={`h-3 w-3 rounded-full ${index < occupied ? 'bg-brand-600' : 'bg-slate-200'}`} />
      ))}
      <span className="text-sm text-slate-600">{occupied} / {capacity} occupied</span>
    </div>
  );
}
