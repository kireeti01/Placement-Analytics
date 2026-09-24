import axios from 'axios';
import toast from 'react-hot-toast';

// API Base URL
const getBaseUrl = () => {
  // 1. If running in the browser on Render, direct traffic to production backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://campusplacement-backend.onrender.com/api';
  }

  let envUrl = import.meta.env.VITE_API_URL;

  // 2. If no environment variable, fallback to localhost
  if (!envUrl || envUrl.trim() === '' || envUrl === '/') {
    return 'http://localhost:5000/api';
  }

  envUrl = envUrl.trim();

  // 3. If protocol is missing, prepend https://
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
    envUrl = 'https://' + envUrl;
  }

  // 4. Ensure it ends with /api
  if (envUrl.endsWith('/api')) {
    return envUrl;
  }
  return envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
};

const API_URL = getBaseUrl();
console.log('🔗 API Base URL configured:', API_URL);


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname === '/' || window.location.pathname === '/login';
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('collegeId');
        localStorage.removeItem('collegeName');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  contactSuperAdmin: (data) => api.post('/auth/contact-super-admin', data),
};

// College APIs
export const collegeAPI = {
  getAll: () => api.get('/colleges'),
  getById: (id) => api.get('/colleges/' + id),
  create: (data) => api.post('/colleges', data),
  update: (id, data) => api.put('/colleges/' + id, data),
  delete: (id) => api.delete('/colleges/' + id),
  register: (data) => api.post('/colleges/register', data),
  approve: (id) => api.put('/colleges/approve/' + id),
  reject: (id) => api.put('/colleges/reject/' + id),
  getRequests: () => api.get('/colleges/requests'),
  getPendingRequests: () => api.get('/colleges/requests/pending'),
  getAdminAccounts: () => api.get('/colleges/admins'),
  createAdminAccount: (data) => api.post('/colleges/admins', data),
  resetAdminPassword: (id, newPassword) => api.put('/colleges/admins/' + id + '/reset-password', { newPassword }),
  deleteAdminAccount: (id) => api.delete('/colleges/admins/' + id),
};

// Student APIs
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get('/students/' + id),
  create: (data) => api.post('/students', data),
  bulkCreate: (students) => api.post('/students/bulk', { students }),
  update: (id, data) => api.put('/students/' + id, data),
  delete: (id) => api.delete('/students/' + id),
  getStats: () => api.get('/students/stats'),
  getByCollege: (collegeId) => api.get('/students/college/' + collegeId),
};

// Placement APIs
export const placementAPI = {
  getAll: (params) => api.get('/placements', { params }),
  getStats: () => api.get('/placements/stats'),
  create: (data) => api.post('/placements', data),
  update: (id, data) => api.put('/placements/' + id, data),
  delete: (id) => api.delete('/placements/' + id),
};

// Company APIs
export const companyAPI = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get('/companies/' + id),
  getStats: () => api.get('/companies/stats'),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put('/companies/' + id, data),
  delete: (id) => api.delete('/companies/' + id),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
  getTrends: () => api.get('/dashboard/trends'),
};

export default api;