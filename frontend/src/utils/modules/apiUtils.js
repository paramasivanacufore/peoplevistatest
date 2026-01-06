// API utilities for modules
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const defaultOptions = (opts = {}) => ({
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  ...opts,
});

export const apiRequest = async (url, options = {}) => {
  const opts = defaultOptions(options);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || data.message || 'Request failed');
  return data;
};

export const getAllModules = async () => {
      const backendUrl = import.meta.env.VITE_API_local_Backend_URL || 'http://localhost:8000';
  return apiRequest(`${backendUrl}/modules/get`, { method: 'GET' });
};

export const getModuleById = async (moduleId) => {
  return apiRequest(`${API_BASE}/modules/${moduleId}`, { method: 'GET' });
};

export default {
  getAllModules,
  getModuleById,
};
