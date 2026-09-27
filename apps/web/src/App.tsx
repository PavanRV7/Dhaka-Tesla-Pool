import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PassengerDashboardPage } from './pages/PassengerDashboardPage';
import { PassengerRequestPage } from './pages/PassengerRequestPage';
import { PassengerRideDetailPage } from './pages/PassengerRideDetailPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { DriverRequestsPage } from './pages/DriverRequestsPage';
import { DriverPoolPage } from './pages/DriverPoolPage';
import { DriverHistoryPage } from './pages/DriverHistoryPage';

const readUser = () => {
  const raw = localStorage.getItem('dtp_user');
  return raw ? JSON.parse(raw) : null;
};

const ProtectedRoute = ({ role, children }: { role?: 'PASSENGER' | 'DRIVER'; children: JSX.Element }) => {
  const user = readUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'DRIVER' ? '/driver/dashboard' : '/passenger/dashboard'} replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/passenger/dashboard" element={<ProtectedRoute role="PASSENGER"><PassengerDashboardPage /></ProtectedRoute>} />
          <Route path="/passenger/request" element={<ProtectedRoute role="PASSENGER"><PassengerRequestPage /></ProtectedRoute>} />
          <Route path="/passenger/rides/:id" element={<ProtectedRoute role="PASSENGER"><PassengerRideDetailPage /></ProtectedRoute>} />
          <Route path="/passenger/rides" element={<ProtectedRoute role="PASSENGER"><PassengerDashboardPage /></ProtectedRoute>} />

          <Route path="/driver/dashboard" element={<ProtectedRoute role="DRIVER"><DriverDashboardPage /></ProtectedRoute>} />
          <Route path="/driver/requests" element={<ProtectedRoute role="DRIVER"><DriverRequestsPage /></ProtectedRoute>} />
          <Route path="/driver/pool" element={<ProtectedRoute role="DRIVER"><DriverPoolPage /></ProtectedRoute>} />
          <Route path="/driver/history" element={<ProtectedRoute role="DRIVER"><DriverHistoryPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
