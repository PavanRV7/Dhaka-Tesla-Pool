import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { SeatIndicator } from '../components/ui/SeatIndicator';
import { StatusBadge } from '../components/ui/StatusBadge';
import { driverApi } from '../services/driverApi';

export function DriverDashboardPage() {
  const [online, setOnline] = useState(false);
  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const poolResponse = await driverApi.currentPool();
      setPool(poolResponse.pool);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load driver dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const toggleStatus = async () => {
    try {
      const nextValue = !online;
      await driverApi.setStatus(nextValue);
      setOnline(nextValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update driver status.');
    }
  };

  if (loading) return <LoadingState message="Loading driver dashboard..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <Card title="Driver dashboard">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">Driver</div>
            <div className="text-2xl font-bold text-slate-800">Jashim</div>
          </div>
          <div>
            <StatusBadge status={online ? 'ONLINE' : 'OFFLINE'} />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={toggleStatus} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">{online ? 'Go offline' : 'Go online'}</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Vehicle</div>
            <div className="font-semibold text-slate-800">Bullet</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Vehicle type</div>
            <div className="font-semibold text-slate-800">Tesla</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Capacity</div>
            <div className="font-semibold text-slate-800">3 seats</div>
          </div>
        </div>
      </Card>

      <Card title="Current pool">
        {pool ? (
          <>
            <div className="mb-3 text-sm text-slate-600">Pool status: {pool.status}</div>
            <SeatIndicator occupied={pool.poolMemberships?.length ?? 0} capacity={3} />
          </>
        ) : (
          <EmptyState message="No active pool yet." />
        )}
      </Card>
    </div>
  );
}
