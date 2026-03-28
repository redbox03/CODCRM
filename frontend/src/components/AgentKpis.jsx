import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function AgentKpis() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    api.get('/agents/kpis').then((res) => setKpis(res.data));
  }, []);

  if (!kpis) return <div className="rounded-xl bg-white p-4 shadow-sm">Loading KPIs...</div>;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard label="Confirmed" value={kpis.confirmed} />
      <KpiCard label="Delivered" value={kpis.delivered} />
      <KpiCard label="Upsells" value={kpis.upsells} />
      <KpiCard label="Earnings" value={`${kpis.earningsMad} MAD`} />
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
