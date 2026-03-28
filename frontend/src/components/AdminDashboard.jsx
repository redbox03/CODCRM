import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get('/admin/metrics').then((res) => setMetrics(res.data));
  }, []);

  if (!metrics) return <div className="rounded-xl bg-white p-4 shadow-sm">Loading admin metrics...</div>;

  const cards = [
    ['Revenue', `${metrics.totalRevenue.toFixed(2)} MAD`],
    ['Orders', metrics.orders],
    ['Confirmation Rate', `${metrics.confirmationRate.toFixed(1)}%`],
    ['Delivery Rate', `${metrics.deliveryRate.toFixed(1)}%`],
    ['Profit', `${metrics.profit.toFixed(2)} MAD`],
    ['Ad Spend', `${metrics.adsSpend.toFixed(2)} MAD`],
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
