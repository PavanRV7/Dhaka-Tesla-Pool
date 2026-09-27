import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('dtp_user') ?? 'null');

  const handleLogout = () => {
    localStorage.removeItem('dtp_token');
    localStorage.removeItem('dtp_user');
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-700">Dhaka Tesla Pool</Link>
        <div className="flex items-center gap-4 text-sm text-slate-700">
          {user?.role === 'DRIVER' ? (
            <>
              <Link to="/driver/dashboard">Driver</Link>
              <Link to="/driver/requests">Requests</Link>
              <Link to="/driver/pool">Pool</Link>
            </>
          ) : null}
          {user?.role === 'PASSENGER' ? (
            <>
              <Link to="/passenger/dashboard">Dashboard</Link>
              <Link to="/passenger/request">Request</Link>
              <Link to="/passenger/rides">Rides</Link>
            </>
          ) : null}
          {user ? (
            <button onClick={handleLogout} className="rounded bg-slate-100 px-3 py-1.5 font-medium text-slate-700">Logout</button>
          ) : (
            <Link to="/login" className="rounded bg-brand-600 px-3 py-1.5 font-medium text-white">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
