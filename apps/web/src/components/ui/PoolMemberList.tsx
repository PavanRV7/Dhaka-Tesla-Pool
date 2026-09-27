type PoolMember = {
  passenger?: { name?: string };
  name?: string;
  farePaisa?: number;
  pickupArea?: { name?: string };
  destinationArea?: { name?: string };
};

export function PoolMemberList({ members }: { members: PoolMember[] }) {
  if (!members.length) {
    return <div className="text-sm text-slate-500">No passengers yet.</div>;
  }

  return (
    <ul className="space-y-3">
      {members.map((member, index) => (
        <li key={index} className="rounded-lg border border-slate-200 p-3">
          <div className="font-semibold text-slate-800">{member.passenger?.name ?? member.name}</div>
          <div className="text-sm text-slate-600">{member.pickupArea?.name ?? 'Pickup'} → {member.destinationArea?.name ?? 'Destination'}</div>
          {typeof member.farePaisa === 'number' ? <div className="mt-1 text-sm font-medium text-brand-700">৳{(member.farePaisa / 100).toFixed(2)}</div> : null}
        </li>
      ))}
    </ul>
  );
}
