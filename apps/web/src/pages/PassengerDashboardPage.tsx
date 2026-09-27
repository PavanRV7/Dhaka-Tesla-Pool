import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingState } from '../components/ui/LoadingState';
import { RideStatusTimeline } from '../components/ui/RideStatusTimeline';
import { StatusBadge } from '../components/ui/StatusBadge';
import { rideApi } from '../services/rideApi';
import type { Ride } from '../types/api';

export function PassengerDashboardPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await rideApi.list();
      setRides(response.rides || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load rides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchRides(); }, []);

  const activeRide = rides.find((ride) => !['COMPLETED', 'CANCELLED'].includes(ride.status));

  if (loading) return <LoadingState message="Loading your rides..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <Card title="Passenger dashboard">
        <p className="text-slate-600">Welcome back. You can request rides, monitor your trip, and review your pool status here.</p>
      </Card>

      {activeRide ? (
        <Card title="Current ride">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">Trip #{activeRide.id}</div>
              <div className="text-xl font-semibold text-slate-800">{activeRide.pickupArea?.name ?? 'Pickup'} → {activeRide.destinationArea?.name ?? 'Destination'}</div>
            </div>
            <StatusBadge status={activeRide.status} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-slate-500">Status</div>
              <div className="font-medium text-slate-700">{activeRide.status}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Fare</div>
              <div className="font-medium text-slate-700">৳{((activeRide.finalFarePaisa || activeRide.estimatedFarePaisa) / 100).toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-5">
            <RideStatusTimeline status={activeRide.status} />
          </div>
          <div className="mt-4 flex gap-3">
            <Link to={`/passenger/rides/${activeRide.id}`}>
              <Button variant="secondary">View details</Button>
            </Link>
            {['REQUESTED', 'MATCHED'].includes(activeRide.status) ? (
              <Button variant="danger" onClick={async () => { await rideApi.cancel(activeRide.id); await fetchRides(); }}>Cancel ride</Button>
            ) : null}
          </div>
        </Card>
      ) : (
        <EmptyState message="You don't have an active ride." />
      )}

      <Card title="Ride history">
        {rides.length ? (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div key={ride.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <div className="font-medium text-slate-800">{ride.pickupArea?.name ?? 'Pickup'} → {ride.destinationArea?.name ?? 'Destination'}</div>
                  <div className="text-xs text-slate-500">{new Date(ride.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={ride.status} />
                  <Link to={`/passenger/rides/${ride.id}`}>Details</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No ride history yet." />
        )}
      </Card>
    </div>
  );
}
