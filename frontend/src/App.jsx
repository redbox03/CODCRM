import { useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { useAuthStore } from './store/authStore';
import { Header } from './components/Header';
import { OrderTable } from './components/OrderTable';
import { RightPanelHistory } from './components/RightPanelHistory';
import { useOrdersStore } from './store/ordersStore';
import { AdminDashboard } from './components/AdminDashboard';
import { AgentKpis } from './components/AgentKpis';

export default function App() {
  const { token, user } = useAuthStore();
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token, fetchOrders]);

  if (!token) return <LoginForm />;

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <Header />
      <section className="mb-4">{user.role === 'ADMIN' ? <AdminDashboard /> : <AgentKpis />}</section>
      <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <OrderTable />
        <RightPanelHistory />
      </section>
    </main>
  );
}
