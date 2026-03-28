import { useState } from 'react';
import dayjs from 'dayjs';
import { useOrdersStore } from '../store/ordersStore';

export function RightPanelHistory() {
  const { orderHistory, selectedOrder, addUpsell } = useOrdersStore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  if (!selectedOrder || !orderHistory) {
    return <aside className="rounded-xl bg-white p-4 shadow-sm">Select order to view history</aside>;
  }

  return (
    <aside className="rounded-xl bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Order History Panel</h3>
      <p className="mb-3 text-sm text-slate-600">{selectedOrder.customerName} ({selectedOrder.phone})</p>

      <div className="mb-4">
        <h4 className="font-medium">Status timeline</h4>
        <ul className="list-disc pl-5 text-sm">
          {orderHistory.statusHistory.map((row) => (
            <li key={row.id}>{row.status} - {dayjs(row.changedAt).format('DD/MM HH:mm')}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="font-medium">Call attempts</h4>
        <ul className="list-disc pl-5 text-sm">
          {orderHistory.callAttempts.map((row) => (
            <li key={row.id}>Attempt {row.attemptNo}: {row.status}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium">Add upsell</h4>
        <input className="mb-2 w-full rounded border p-1 text-sm" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="mb-2 w-full rounded border p-1 text-sm" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button
          className="rounded bg-indigo-600 px-2 py-1 text-sm text-white"
          onClick={() => addUpsell(selectedOrder.id, description, amount)}
        >
          Save upsell
        </button>
      </div>
    </aside>
  );
}
