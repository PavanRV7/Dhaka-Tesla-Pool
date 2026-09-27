import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { areaApi } from '../services/areaApi';
import { rideApi } from '../services/rideApi';
import type { Area } from '../types/api';

export function PassengerRequestPage() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [pickupAreaId, setPickupAreaId] = useState('');
  const [destinationAreaId, setDestinationAreaId] = useState('');
  const [seatsRequested, setSeatsRequested] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [estimate, setEstimate] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void areaApi.list().then((response) => setAreas(response.areas || [])).catch(() => setError('Unable to load areas.'));
  }, []);

  const handleEstimate = async () => {
    if (!pickupAreaId || !destinationAreaId) {
      setError('Choose both pickup and destination.');
      return;
    }
    try {
      setError('');
      const response = await rideApi.estimate({
        pickupAreaId: Number(pickupAreaId),
        destinationAreaId: Number(destinationAreaId),
        seatsRequested: Number(seatsRequested)
      });
      setEstimate(response.estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to estimate fare.');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await rideApi.create({
        pickupAreaId: Number(pickupAreaId),
        destinationAreaId: Number(destinationAreaId),
        seatsRequested: Number(seatsRequested),
        paymentMethod: paymentMethod as 'CASH' | 'TESLAPAY_WALLET'
      });
      navigate(`/passenger/rides/${response.ride.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ride request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Request a Tesla ride">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Pickup area"
            value={pickupAreaId}
            onChange={setPickupAreaId}
            options={[{ label: 'Select area', value: '' }, ...areas.map((area) => ({ label: area.name, value: String(area.id) }))]}
          />
          <Select
            label="Destination area"
            value={destinationAreaId}
            onChange={setDestinationAreaId}
            options={[{ label: 'Select area', value: '' }, ...areas.map((area) => ({ label: area.name, value: String(area.id) }))]}
          />
          <Input label="Seats" value={seatsRequested} onChange={setSeatsRequested} type="number" />
          <Select label="Payment method" value={paymentMethod} onChange={setPaymentMethod} options={[{ label: 'Cash', value: 'CASH' }, { label: 'TeslaPay Wallet', value: 'TESLAPAY_WALLET' }]} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={handleEstimate}>Estimate Fare</Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || !pickupAreaId || !destinationAreaId}>Submit request</Button>
        </div>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}

        {estimate ? (
          <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
            <div className="font-semibold">Estimated fare</div>
            <div className="mt-1">Solo: ৳{(estimate.soloFarePaisa / 100).toFixed(2)}</div>
            <div className="mt-1">Expected pooled: ৳{(estimate.pooledFarePaisa / 100).toFixed(2)}</div>
            <div className="mt-1">Distance: {estimate.distanceKm} km</div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
