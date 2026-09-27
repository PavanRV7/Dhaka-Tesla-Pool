import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { driverApi } from '../services/driverApi';

export function DriverRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await driverApi.requests();
      setRequests(response.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch driver requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchRequests(); }, []);

  if (loading) return <LoadingState message="Loading compatible ride requests..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <Card title="Compatible requests">
      {requests.length ? (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <div className="font-semibold text-slate-800">{request.passenger?.name ?? 'Passenger'}</div>
                <div className="text-sm text-slate-600">{request.pickupArea?.name ?? 'Pickup'} → {request.destinationArea?.name ?? 'Destination'}</div>
                <div className="mt-1 text-xs text-slate-500">Seats: {request.seatsRequested}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={request.status} />
                <Button onClick={async () => { await driverApi.acceptRide(request.id); await fetchRequests(); }}>Accept</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No compatible ride requests right now." />
      )}
    </Card>
  );
}
