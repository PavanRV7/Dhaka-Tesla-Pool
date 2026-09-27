import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../services/authApi';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('nusrat@example.com');
  const [password, setPassword] = useState('DemoPass123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('dtp_token', response.token);
      localStorage.setItem('dtp_user', JSON.stringify(response.user));
      navigate(response.user.role === 'DRIVER' ? '/driver/dashboard' : '/passenger/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
      <p className="mt-2 text-sm text-slate-600">Use the demo credentials to explore the MVP.</p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="name@example.com" />
        <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Need an account? <Link to="/register" className="font-medium text-brand-700">Create one</Link>
      </p>
    </div>
  );
}
