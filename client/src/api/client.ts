import axios from 'axios';

const API_URL = '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: { username: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  deleteUser: (id: string) => api.delete(`/auth/users/${id}`),
  updateUser: (id: string, data: { username?: string; email?: string; role?: string }) =>
    api.put(`/auth/users/${id}`, data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getLoginLogs: () => api.get('/auth/login-logs'),
};

export const assetsApi = {
  getAll: (params?: Record<string, any>) => api.get('/assets', { params }),
  getOne: (id: string) => api.get(`/assets/${id}`),
  create: (data: any) => api.post('/assets', data),
  update: (id: string, data: any) => api.put(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
  search: (q: string) => api.get('/assets/search', { params: { q } }),
  assign: (id: string, data: { assignedTo: string; notes?: string }) => 
    api.put(`/assets/${id}/assign`, data),
  unassign: (id: string, data: { reason?: string }) => 
    api.put(`/assets/${id}/unassign`, data),
  getExpiringWarranty: (days?: number) => api.get('/assets/warranty/expiring', { params: { days } }),
  getRecent: (limit?: number) => api.get('/assets', { params: { limit, sort: '-createdAt' } }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getByType: () => api.get('/dashboard/by-type'),
  getByDepartment: () => api.get('/dashboard/by-department'),
  getByFloor: () => api.get('/dashboard/by-floor'),
  getByOS: () => api.get('/dashboard/by-os'),
  getByAccess: () => api.get('/dashboard/by-access'),
  getByRAM: () => api.get('/dashboard/by-ram'),
  getByProcessor: () => api.get('/dashboard/by-processor'),
  getIncomplete: () => api.get('/dashboard/incomplete'),
  getAlerts: () => api.get('/dashboard/alerts'),
};

export const importApi = {
  uploadCSV: (file: FormData) =>
    api.post('/import/csv', file, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPreview: () => api.get('/import/preview'),
};

export const reportsApi = {
  exportCSV: () => api.get('/reports/csv', { responseType: 'blob' }),
  exportJSON: () => api.get('/reports/json', { responseType: 'blob' }),
  getActivity: () => api.get('/reports/activity'),
};

export const maintenanceApi = {
  getAll: (params?: Record<string, any>) => api.get('/maintenance', { params }),
  create: (data: any) => api.post('/maintenance', data),
  dustClean: (data: { assetSL?: string; floor?: string }) => api.post('/maintenance/dust-clean', data),
  peripheral: (data: {
    assetSL: string;
    peripheralType: string;
    oldPeripheral: string;
    newPeripheral: string;
    description: string;
    cost?: number;
  }) => api.post('/maintenance/peripheral', data),
  getSchedule: () => api.get('/maintenance/schedule'),
  getByAsset: (assetSL: string) => api.get(`/maintenance/by-asset/${assetSL}`),
  getUpcoming: (days?: number) => api.get('/maintenance/upcoming', { params: { days } }),
};

export const partsApi = {
  getAll: (params?: Record<string, any>) => api.get('/parts', { params }),
  getOne: (id: string) => api.get(`/parts/${id}`),
  create: (data: any) => api.post('/parts', data),
  update: (id: string, data: any) => api.put(`/parts/${id}`, data),
  delete: (id: string) => api.delete(`/parts/${id}`),
  getByAsset: (assetSL: string) => api.get(`/parts/by-asset/${assetSL}`),
  getByComponent: (componentType: string) => api.get(`/parts/by-component/${componentType}`),
  reset: () => api.post('/parts/reset'),
};

export const stockApi = {
  getAll: (params?: { department?: string; itemType?: string }) => api.get('/stock', { params }),
  getTotals: () => api.get('/stock/totals'),
  getSummary: () => api.get('/stock/summary'),
  create: (data: any) => api.post('/stock', data),
  update: (id: string, data: any) => api.put(`/stock/${id}`, data),
  delete: (id: string) => api.delete(`/stock/${id}`),
  distribute: (data: { stockId: string; department: string; quantity: number }) => 
    api.post('/stock/distribute', data),
  transfer: (data: { fromDepartment: string; toDepartment: string; itemType: string; quantity: number }) => 
    api.post('/stock/transfer', data),
  consume: (data: { stockId: string; assetSL: string; quantity: number }) => 
    api.post('/stock/consume', data),
};

export const prtgLiveApi = {
  getSensors: (params?: Record<string, any>) => api.get('/prtg/sensors', { params })
};

const noAuthApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const prtgApi = {
  getSensors: (params?: Record<string, any>) => noAuthApi.get('/api/v1/prtg/sensors', { params }),
  getDevices: (params?: Record<string, any>) => noAuthApi.get('/api/v1/prtg/devices', { params }),
  getOverview: () => noAuthApi.get('/api/v1/prtg/overview')
};

export default api;
