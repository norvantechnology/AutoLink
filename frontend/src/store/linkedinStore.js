import { create } from 'zustand';
import { linkedinAPI } from '../services/api';

const useLinkedInStore = create((set) => ({
  connected: false,
  account: null,
  loading: true,

  // Check LinkedIn connection status
  checkStatus: async () => {
    try {
      const response = await linkedinAPI.getStatus();
      set({
        connected: response.data.connected,
        account: response.data.account,
        loading: false,
      });
    } catch (error) {
      console.error('[FRONTEND] Failed to check LinkedIn status:', error);
      set({ loading: false });
    }
  },

  // Get LinkedIn auth URL and redirect
  connect: async () => {
    try {
      const response = await linkedinAPI.getAuthUrl();
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to get LinkedIn auth URL:', error);
      throw error;
    }
  },

  // Disconnect LinkedIn account
  disconnect: async () => {
    try {
      const response = await linkedinAPI.disconnect();
      set({ connected: false, account: null });
    } catch (error) {
      console.error('[FRONTEND] Failed to disconnect LinkedIn:', error);
      throw error;
    }
  },
}));

export default useLinkedInStore;

