import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="space-y-8 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-sky-500 p-8 text-white shadow-lg">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-sky-100">Dhaka Tesla Pool</p>
        <h1 className="text-4xl font-bold">Share a seat. Split the fare. Survive Dhaka traffic.</h1>
        <p className="mt-4 max-w-2xl text-sky-100">Ride-pooling for Banani, Gulshan, Mohakhali, and beyond with a simple Tesla-based shared pool flow.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link to="/login" className="rounded-md bg-white px-4 py-2 font-medium text-brand-700">Login</Link>
          <Link to="/register" className="rounded-md border border-white px-4 py-2 font-medium text-white">Create account</Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Passenger</h3>
          <p className="mt-2 text-sm text-slate-600">Request a ride, estimate fare, and track pool membership.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Driver</h3>
          <p className="mt-2 text-sm text-slate-600">Go online, review compatible requests, and manage theTesla pool.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Pool logic</h3>
          <p className="mt-2 text-sm text-slate-600">Matching and seat capacity are enforced server-side and protected by transactions.</p>
        </div>
      </div>
    </div>
  );
}
