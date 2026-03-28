import { create } from 'zustand';
import { api } from '../api/client';

export const useOrdersStore = create((set, get) => ({
  orders: [],
  selectedOrder: null,
  orderHistory: null,
  loading: false,
  async fetchOrders() {
    set({ loading: true });
    const { data } = await api.get('/orders');
    set({ orders: data, loading: false });
  },
  async selectOrder(order) {
    set({ selectedOrder: order });
    const { data } = await api.get(`/orders/${order.id}/history`);
    set({ orderHistory: data });
  },
  async updateWorkflow(orderId, status, notes) {
    await api.patch(`/orders/${orderId}/workflow`, { status, notes });
    await get().fetchOrders();
  },
  async schedule(orderId, scheduleAt) {
    await api.patch(`/orders/${orderId}/schedule`, { scheduleAt });
    await get().fetchOrders();
  },
  async addUpsell(orderId, description, amount) {
    await api.post(`/orders/${orderId}/upsell`, { description, amount: Number(amount) });
    await get().selectOrder(get().selectedOrder);
  },
}));
