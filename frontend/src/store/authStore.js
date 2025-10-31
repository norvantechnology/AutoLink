import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,

  // Login
  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ token, user, isAuthenticated: true });
      
      return response.data;
    } catch (error) {
      // Re-throw error so component can catch it
      throw error;
    }
  },

  // Signup - Don't authenticate yet (wait for email verification)
  signup: async (data) => {
    try {
      const response = await authAPI.signup(data);
      // Don't set token or isAuthenticated - user must verify email first
      return response.data;
    } catch (error) {
      // Re-throw error so component can catch it
      throw error;
    }
  },

  // Verify OTP and Login
  verifyOTP: async (data) => {
    try {
      const response = await authAPI.verifyOTP(data);
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Load user
  loadUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false });
        return;
      }

      const response = await authAPI.getMe();
      set({ 
        user: response.data.user, 
        isAuthenticated: true,
        loading: false 
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        loading: false 
      });
    }
  },
}));

export default useAuthStore;

