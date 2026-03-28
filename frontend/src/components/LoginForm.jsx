import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export function LoginForm() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('admin@codcrm.ma');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">COD CRM Login</h1>
      <input className="mb-3 w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="mb-3 w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      <button className="w-full rounded bg-indigo-600 py-2 font-semibold text-white">Sign in</button>
    </form>
  );
}
