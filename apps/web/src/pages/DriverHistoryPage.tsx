import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { driverApi } from '../services/driverApi';

export function DriverHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const response = await driverApi.history();
        setHistory(response.history || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load driver history.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState message="Loading ride history..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <Card title="Driver history">
      {history.length ? (
        <div className="space-y-3">
          {history.map((pool) => (
            <div key={pool.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-800">Bullet</div>
                <StatusBadge status={pool.status} />
              </div>
              <div className="mt-2 text-sm text-slate-600">{pool.poolMemberships?.length ?? 0} members</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No driver history yet." />
      )}
    </Card>
  );
}
