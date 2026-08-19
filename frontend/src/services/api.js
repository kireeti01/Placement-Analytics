import axios from 'axios';
import toast from 'react-hot-toast';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    // Return response for all 2xx status codes
    return response;
  },
  (error) => {
    // Only handle errors (4xx, 5xx)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('collegeId');
      localStorage.removeItem('collegeName');
      window.location.href = '/';
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
  getAll: () => api.get('/placements'),
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
  getStats: () => api.get('/dashboard/stats'),
  getTrends: () => api.get('/dashboard/trends'),
};

export default api;