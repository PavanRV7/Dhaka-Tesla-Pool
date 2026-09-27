export function FareDisplay({ amountPaisa }: { amountPaisa: number }) {
  const bdt = (amountPaisa / 100).toFixed(2);
  return <span className="font-semibold text-slate-800">৳{bdt}</span>;
}
