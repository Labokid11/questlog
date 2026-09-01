import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your deployed backend URL when running on a device.
// For local development with Expo Go on the same machine, use the LAN IP.
const API_BASE = 'http://localhost:3000';

let token = null;

export async function loadToken() {
  token = await AsyncStorage.getItem('ql_token');
  return token;
}

export async function setToken(t) {
  token = t;
  if (t) await AsyncStorage.setItem('ql_token', t);
  else await AsyncStorage.removeItem('ql_token');
}

export function getToken() {
  return token;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (b) => request('/auth/signup', { method: 'POST', body: b }),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  me: () => request('/auth/me'),
  onboarding: (b) => request('/auth/onboarding', { method: 'PUT', body: b }),
  games: () => request('/games'),
  addGame: (b) => request('/games', { method: 'POST', body: b }),
  updateGame: (id, b) => request(`/games/${id}`, { method: 'PUT', body: b }),
  deleteGame: (id) => request(`/games/${id}`, { method: 'DELETE' }),
  activities: () => request('/activities'),
  stats: () => request('/stats'),
  statsHeatmap: () => request('/stats/heatmap'),
  unlockPremium: (code) => request('/user/premium/unlock', { method: 'POST', body: { code } }),
  togglePremium: () => request('/user/premium/toggle', { method: 'POST' }),
  saveTheme: (theme) => request('/user/theme', { method: 'PUT', body: { theme } }),
  friendsLimit: () => request('/friends/limit'),
  adminUsers: () => request('/admin/users'),
  adminTogglePremium: (id) => request(`/admin/user/${id}/premium`, { method: 'POST' }),
  adminResetUser: (id) => request(`/admin/user/${id}/reset`, { method: 'POST' }),
  adminDeleteUser: (id) => request(`/admin/user/${id}`, { method: 'DELETE' }),
  adminAnalytics: () => request('/admin/analytics'),
};
