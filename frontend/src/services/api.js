import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    
    // Only redirect on 401 if it's from a protected route (has token)
    // Don't redirect if it's from login/signup endpoints (wrong credentials)
    if (error.response?.status === 401) {
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');
      
      // Only redirect if it's a token authentication failure, not login credentials failure
      if (!isAuthEndpoint && error.config?.headers?.Authorization) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Handle unverified users trying to access protected routes
    if (error.response?.status === 403 && error.response?.data?.verified === false) {
      // Only clear token and redirect if accessing protected routes
      const isAuthEndpoint = requestUrl.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// LinkedIn API
export const linkedinAPI = {
  getAuthUrl: () => api.get('/linkedin/connect'),
  getStatus: () => api.get('/linkedin/status'),
  disconnect: () => api.delete('/linkedin/disconnect'),
};

// Topics API
export const topicsAPI = {
  create: (data) => api.post('/topics', data),
  getAll: () => api.get('/topics'),
  getOne: (id) => api.get(`/topics/${id}`),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
};

// Automation API
export const automationAPI = {
  getSettings: () => api.get('/automation/settings'),
  updateSettings: (data) => api.put('/automation/settings', data),
  getGeneratedPosts: () => api.get('/automation/posts'),
  getScheduledPosts: () => api.get('/automation/scheduled'),
  updatePost: (id, data) => api.put(`/automation/posts/${id}`, data),
  deletePost: (id) => api.delete(`/automation/posts/${id}`),
  getStats: () => api.get('/automation/stats'),
  testGenerate: () => api.post('/automation/test-generate'),
};

// Payment API
export const paymentAPI = {
  getCurrencies: () => api.get('/payment/currencies'),
  getPricing: (currencyCode) => api.get(`/payment/pricing/${currencyCode}`),
  getSubscription: () => api.get('/payment/subscription'),
  getPaymentHistory: () => api.get('/payment/history'),
  createPayment: (data) => api.post('/payment/create', data),
  upgradePlan: (data) => api.post('/payment/upgrade-plan', data),
  submitProof: (data) => api.post('/payment/submit-proof', data),
};

// Engagement API
export const engagementAPI = {
  updateEngagement: (postId, data) => api.put(`/engagement/${postId}`, data),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingPayments: () => api.get('/admin/pending-payments'),
  verifyPayment: (subscriptionId) => api.post(`/admin/verify-payment/${subscriptionId}`),
  rejectPayment: (subscriptionId, reason) => api.post(`/admin/reject-payment/${subscriptionId}`, { reason }),
  getAllUsers: () => api.get('/admin/users'),
  getAllSubscriptions: () => api.get('/admin/subscriptions'),
};

// Email Tracking API
export const emailTrackingAPI = {
  trackClick: (data) => api.post('/email-tracking/click', data),
  getAnalytics: () => api.get('/email-tracking/analytics'),
  getSummary: () => api.get('/email-tracking/summary'),
};

// Public API (No authentication required)
export const publicAPI = {
  getTopPosts: () => api.get('/public/top-posts'),
};

export default api;
