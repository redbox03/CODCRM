import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: '', user: null });
  },
}));
