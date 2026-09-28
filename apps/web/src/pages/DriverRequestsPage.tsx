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
    const [acceptError, setAcceptError] = useState('');


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

    const handleAccept = async (requestId: number) => {
        try {
            setAcceptError('');
            await driverApi.acceptRide(requestId);
            await fetchRequests();
        } catch (err) {
            setAcceptError(
                err instanceof Error
                    ? err.message
                    : 'Unable to accept this ride request.'
                );
            }
        };


    useEffect(() => { void fetchRequests(); }, []);


    if (loading) return <LoadingState message="Loading compatible ride requests..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <Card title="Compatible requests">
        {acceptError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {acceptError}
            </div>
        ) : null}

        {requests.length ? (
            <div className="space-y-3">
            {requests.map((request) => (
                <div
                key={request.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                <div>
                    <div className="font-semibold text-slate-800">
                    {request.passenger?.name ?? 'Passenger'}
                    </div>

                    <div className="text-sm text-slate-600">
                    {request.pickupArea?.name ?? 'Pickup'} →{' '}
                    {request.destinationArea?.name ?? 'Destination'}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                    Seats: {request.seatsRequested}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge status={request.status} />

                    <Button onClick={() => void handleAccept(request.id)}>
                    Accept
                    </Button>
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

