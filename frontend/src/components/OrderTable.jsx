import dayjs from 'dayjs';
import { useOrdersStore } from '../store/ordersStore';

const workflowStatuses = ['CONFIRMED', 'CANCELLED', 'CALL_LATER', 'NO_ANSWER_1', 'NO_ANSWER_2', 'NO_ANSWER_3', 'VOICEMAIL'];

export function OrderTable() {
  const { orders, selectOrder, updateWorkflow, schedule } = useOrdersStore();

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Orders</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{order.customerName} - {order.city}</p>
                <p className="text-sm text-slate-500">{order.product} | {Number(order.price).toFixed(2)} MAD | {order.status}</p>
                {order.scheduledAt && <p className="text-xs text-amber-600">Scheduled: {dayjs(order.scheduledAt).format('YYYY-MM-DD HH:mm')}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={order.callLink} className="rounded bg-sky-500 px-2 py-1 text-xs text-white">Call</a>
                <a href={order.whatsappLink} target="_blank" rel="noreferrer" className="rounded bg-green-500 px-2 py-1 text-xs text-white">WhatsApp</a>
                <button className="rounded bg-slate-200 px-2 py-1 text-xs" onClick={() => selectOrder(order)}>History</button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {workflowStatuses.map((status) => (
                <button key={status} onClick={() => updateWorkflow(order.id, status)} className="rounded bg-indigo-100 px-2 py-1 text-xs">
                  {status}
                </button>
              ))}
              <input
                type="datetime-local"
                className="rounded border px-2 py-1 text-xs"
                onChange={(e) => schedule(order.id, e.target.value)}
                title="Schedule callback"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
