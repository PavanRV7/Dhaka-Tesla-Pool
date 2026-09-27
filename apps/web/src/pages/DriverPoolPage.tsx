import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { PoolMemberList } from '../components/ui/PoolMemberList';
import { SeatIndicator } from '../components/ui/SeatIndicator';
import { StatusBadge } from '../components/ui/StatusBadge';
import { driverApi } from '../services/driverApi';

export function DriverPoolPage() {
  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPool = async () => {
    try {
      setLoading(true);
      const response = await driverApi.currentPool();
      setPool(response.pool);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load pool.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchPool(); }, []);

  if (loading) return <LoadingState message="Loading current pool..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <Card title="Current Tesla pool">
      {pool ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-800">Bullet</div>
              <div className="text-sm text-slate-500">Tesla • 3 seats</div>
            </div>
            <StatusBadge status={pool.status} />
          </div>
          <SeatIndicator occupied={pool.poolMemberships?.length ?? 0} capacity={3} />
          <PoolMemberList members={pool.poolMemberships ?? []} />
          <div className="flex flex-wrap gap-3">
            <button onClick={async () => { await driverApi.markArrival(pool.id); await fetchPool(); }} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">Mark Arrival</button>
            <button onClick={async () => { await driverApi.startPool(pool.id); await fetchPool(); }} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white">Start Trip</button>
            <button onClick={async () => { await driverApi.completePool(pool.id); await fetchPool(); }} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Complete Trip</button>
          </div>
        </div>
      ) : (
        <EmptyState message="No current pool available." />
      )}
    </Card>
  );
}
