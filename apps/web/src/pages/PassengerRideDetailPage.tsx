import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { RideStatusTimeline } from '../components/ui/RideStatusTimeline';
import { StatusBadge } from '../components/ui/StatusBadge';
import { rideApi } from '../services/rideApi';
import type { Ride } from '../types/api';

export function PassengerRideDetailPage() {
  const { id } = useParams();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRide = async () => {
    try {
      const response = await rideApi.detail(Number(id));
      setRide(response.ride);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load ride detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchRide(); }, [id]);

  if (loading) return <LoadingState message="Loading ride details..." />;
  if (error) return <ErrorState message={error} />;
  if (!ride) return <ErrorState message="Ride not found." />;

  return (
    <div className="space-y-6">
      <Card title="Ride details">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Ride #{ride.id}</div>
            <div className="text-2xl font-semibold text-slate-800">{ride.pickupArea?.name ?? 'Pickup'} → {ride.destinationArea?.name ?? 'Destination'}</div>
          </div>
          <StatusBadge status={ride.status} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-slate-500">Payment</div>
            <div className="font-medium text-slate-800">{ride.paymentMethod}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Fare</div>
            <div className="font-medium text-slate-800">৳{((ride.finalFarePaisa || ride.estimatedFarePaisa) / 100).toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <Card title="Status timeline">
        <RideStatusTimeline status={ride.status} />
      </Card>

      {['REQUESTED', 'MATCHED'].includes(ride.status) ? (
        <Button variant="danger" onClick={async () => { await rideApi.cancel(Number(id)); await fetchRide(); }}>Cancel ride</Button>
      ) : null}
    </div>
  );
}
