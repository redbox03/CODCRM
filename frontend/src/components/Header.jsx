import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';

export function Header() {
  const { user, logout } = useAuthStore();

  const toggleWorking = async () => {
    if (user.role !== 'AGENT') return;
    const { data } = await api.post('/agents/working-toggle');
    localStorage.setItem('user', JSON.stringify({ ...user, isWorking: data.isWorking }));
    window.location.reload();
  };

  return (
    <header className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <div>
        <h1 className="text-xl font-bold">COD CRM Morocco</h1>
        <p className="text-sm text-slate-500">Welcome {user.name} ({user.role})</p>
      </div>
      <div className="flex gap-2">
        {user.role === 'AGENT' && (
          <button onClick={toggleWorking} className="rounded bg-emerald-500 px-3 py-2 text-white">
            {user.isWorking ? 'Stop Working' : 'Start Working'}
          </button>
        )}
        <button onClick={logout} className="rounded bg-slate-900 px-3 py-2 text-white">Logout</button>
      </div>
    </header>
  );
}
