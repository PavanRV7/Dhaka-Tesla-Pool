import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { authApi } from '../services/authApi';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('Nusrat');
  const [email, setEmail] = useState('nusrat@example.com');
  const [password, setPassword] = useState('DemoPass123!');
  const [role, setRole] = useState<'PASSENGER' | 'DRIVER'>('PASSENGER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.register({ name, email, password, role });
      localStorage.setItem('dtp_token', response.token);
      localStorage.setItem('dtp_user', JSON.stringify(response.user));
      navigate(role === 'DRIVER' ? '/driver/dashboard' : '/passenger/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">Create account</h2>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Input label="Full name" value={name} onChange={setName} placeholder="Nusrat" />
        <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="name@example.com" />
        <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 8 characters" />
        <Select label="Role" value={role} onChange={(next) => setRole(next as 'PASSENGER' | 'DRIVER')} options={[{ label: 'Passenger', value: 'PASSENGER' }, { label: 'Driver', value: 'DRIVER' }]} />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-medium text-brand-700">Sign in</Link>
      </p>
    </div>
  );
}
