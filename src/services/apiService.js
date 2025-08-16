import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// Get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,  // Include cookies for session authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
      localStorage.setItem('lastActivity', Date.now().toString());
      return config;
  },
  (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }
    
    // Handle specific error cases
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Log the specific endpoint that failed
      console.warn(`🔒 401 Unauthorized on ${originalRequest?.url}. Checking if user should be logged out...`);
      
      // Don't auto-logout for analytics endpoints - they might need time to establish session
      const isAnalyticsEndpoint = originalRequest?.url?.includes('/api/analytics/');
      if (isAnalyticsEndpoint) {
        console.warn('⏳ Analytics endpoint failed - not auto-logging out, might be session timing issue');
        // Just reject the promise without auto-logout for analytics
        return Promise.reject(error);
      }
      
      // For other endpoints, redirect to login on 401
      console.warn('🚪 Auto-logging out due to 401 on non-analytics endpoint');
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.',
      });
    }
    
    // Handle specific HTTP errors
    const status = error.response.status;
    const errorMessage = error.response.data?.message || error.message;
    
    switch (status) {
      case 400:
        toast.error(errorMessage || 'Bad request. Please check your input.');
        break;
      case 403:
        toast.error('Access denied. You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (status >= 500) {
          toast.error('Server error. Please try again later.');
        }
    }
    
    return Promise.reject(error);
  }
);

// API Service object
export const apiService = {
  login: async (credentials) => {
      try {
          const response = await api.post('/api/auth/login/', credentials);
          return response.data;
      } catch (error) {
          console.error('Login error:', error);
          throw error;
      }
  },

  logout: async () => {
    try {
        await api.post('/api/auth/logout/');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
},

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/api/auth/verify/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/api/auth/refresh/', {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // User profile endpoints
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/auth/profile/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/api/auth/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Dashboard endpoints
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/dashboard/analytics/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Call history endpoints
  getCallHistory: async (params = {}) => {
    try {
      const response = await api.get('/api/call-history/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshCallHistory: async () => {
    try {
      const response = await api.post('/api/refresh-history/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  syncCallHistory: async () => {
    try {
      const response = await api.post('/api/sync-call-history/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadAudio: async (conversationId) => {
    try {
      const response = await api.get(`/api/download-audio/${conversationId}/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Contact management endpoints
  uploadCSV: async (file, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  listContactFiles: async () => {
    try {
      const response = await api.get('/api/contact-files/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getContactsByFile: async (fileId) => {
    try {
      const response = await api.get(`/api/contact-files/${fileId}/contacts/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addContact: async (contactData) => {
    try {
      const response = await api.post('/api/contacts/', contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addContactToFile: async (fileId, contactData) => {
    try {
      const response = await api.post(`/api/contact-files/${fileId}/contacts/add/`, contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateContact: async (contactId, contactData) => {
    try {
      const response = await api.put(`/api/contacts/${contactId}/update/`, contactData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteContact: async (contactId) => {
    try {
      const response = await api.delete(`/api/contacts/${contactId}/delete/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createManualContactFile: async (name) => {
    try {
      const response = await api.post('/api/contact-files/manual/', { name });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteContactFile: async (fileId) => {
    try {
      const response = await api.delete(`/api/contact-files/${fileId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exportContactsToCSV: async (fileId) => {
    try {
      const response = await api.post(`/api/contact-files/${fileId}/export/`, {}, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agent management endpoints
  getAgents: async () => {
    try {
      const response = await api.get('/api/agents/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createAgent: async (agentData) => {
    try {
      const response = await api.post('/api/create-agent/', agentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAgentDetails: async (agentId) => {
    try {
      const response = await api.get(`/api/agents/${agentId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAgent: async (agentId, agentData) => {
    try {
      const response = await api.put(`/api/agents/${agentId}/`, agentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAgent: async (agentId) => {
    try {
      const response = await api.delete(`/api/agents/${agentId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Voice endpoints - PRIVACY: Abstract service names
  getVoices: async () => {
    try {
      const response = await api.get('/api/voices/');
      return response.data;
    } catch (error) {
      // Abstract error messages to hide third-party services
      const message = error.response?.data?.message || 'Voice service temporarily unavailable';
      throw new Error(message);
    }
  },

  // Voice preview system - NEW FEATURE
  generateVoiceSample: async (sampleData) => {
    try {
      const response = await api.post('/api/voices/preview/', sampleData);
      return response.data;
    } catch (error) {
      // Abstract error messages to hide third-party services
      const message = error.response?.data?.message || 'Voice preview service temporarily unavailable';
      throw new Error(message);
    }
  },

  getVoiceDetails: async (voiceId) => {
    try {
      const response = await api.get(`/api/voices/${voiceId}/details/`);
      return response.data;
    } catch (error) {
      // Abstract error messages to hide third-party services
      const message = error.response?.data?.message || 'Voice details service temporarily unavailable';
      throw new Error(message);
    }
  },

  // Call management endpoints
  startCall: async (callData) => {
    try {
      const response = await api.post('/api/calls/start/', callData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  callAll: async (params = {}) => {
    try {
      const response = await api.post('/api/call-all/', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  callAllFromFile: async (params = {}) => {
    try {
      const response = await api.post('/api/call-all-from-file/', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // New endpoint for starting calls without waiting for completion
  startCallsFromFile: async (params = {}) => {
    try {
      const response = await api.post('/api/start-calls-from-file/', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // New endpoint for getting current call status
  getCurrentCallStatus: async (callSessionId) => {
    try {
      const response = await api.get(`/api/call-status/${callSessionId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // New endpoint for stopping active call session
  stopCallSession: async (callSessionId) => {
    try {
      const response = await api.delete(`/api/call-status/${callSessionId}/stop/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCallStatus: async (callId) => {
    try {
      const response = await api.get(`/api/calls/${callId}/status/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Phone number management - PRIVACY: Abstract service names
  getPhoneNumbers: async () => {
    try {
      // FIXED: Use correct endpoint for phone selection (not purchased numbers management)
      const response = await api.get('/api/phone-numbers/');
      return response.data;
    } catch (error) {
      // Abstract error messages to hide third-party services
      const message = error.response?.data?.message || 'Phone service temporarily unavailable';
      throw new Error(message);
    }
  },

  // Get purchased phone numbers for management/display purposes
  getPurchasedNumbers: async () => {
    try {
      const response = await api.get('/api/phone-numbers/purchased/');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Phone service temporarily unavailable';
      throw new Error(message);
    }
  },

  searchAvailableNumbers: async (params = {}) => {
    try {
      const response = await api.get('/api/phone-numbers/available/', { params });
      return response.data;
    } catch (error) {
      // Abstract error messages to hide third-party services
      const message = error.response?.data?.message || 'Phone search service temporarily unavailable';
      throw new Error(message);
    }
  },

  purchasePhoneNumber: async (purchaseData) => {
    try {
      const response = await api.post('/api/phone-numbers/purchase/', purchaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  releasePhoneNumber: async (phoneNumberSid) => {
    try {
      const response = await api.delete(`/api/phone-numbers/${phoneNumberSid}/release/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePhoneNumberInScript: async (phoneNumberId) => {
    try {
      const response = await api.post('/api/update-phone-number/', {
        phone_number_id: phoneNumberId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subscription endpoints
  getSubscriptionDetails: async () => {
    try {
      const response = await api.get('/api/subscription/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkLimits: async () => {
    try {
      const response = await api.get('/api/check-limits/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Testing endpoints
  testApiKey: async () => {
    try {
      const response = await api.get('/api/test-api-key/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File management endpoints
  listFiles: async () => {
    try {
      const response = await api.get('/api/files/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  viewCSV: async (filename) => {
    try {
      const response = await api.get(`/api/files/${filename}/view/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteFile: async (filename) => {
    try {
      const response = await api.delete(`/api/files/${filename}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ============================================================================
  // SCHEDULED CALLS API ENDPOINTS
  // ============================================================================
  
  // Schedule calls for future execution
  scheduleCall: async (scheduleData) => {
    try {
      // Use longer timeout for scheduling calls as batch processing might take time
      const response = await api.post('/api/scheduled-calls/', scheduleData, {
        timeout: 120000, // 2 minutes timeout for scheduling
      });
      return response.data;
    } catch (error) {
      // Provide more specific error messages for scheduling
      if (error.code === 'ECONNABORTED') {
        throw new Error('Scheduling is taking longer than expected. Your batch may still be processing. Please check the scheduled calls list in a few moments.');
      }
      throw error;
    }
  },

  // List all scheduled calls for the user
  listScheduledCalls: async () => {
    try {
      const response = await api.get('/api/scheduled-calls/list/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get detailed information about a specific scheduled call
  getScheduledCallDetails: async (scheduleId) => {
    try {
      const response = await api.get(`/api/scheduled-calls/${scheduleId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a scheduled call (reschedule, update notes, etc.)
  updateScheduledCall: async (scheduleId, updateData) => {
    try {
      const response = await api.put(`/api/scheduled-calls/${scheduleId}/update/`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel a scheduled call
  cancelScheduledCall: async (scheduleId) => {
    try {
      const response = await api.delete(`/api/scheduled-calls/${scheduleId}/cancel/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Manually execute a scheduled call (for testing or immediate execution)
  executeScheduledCall: async (scheduleId) => {
    try {
      const response = await api.post(`/api/scheduled-calls/${scheduleId}/execute/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ============================================================================
  // NOTIFICATION API ENDPOINTS
  // ============================================================================
  
  // Get user notifications with filtering
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/api/notifications/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark a specific notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.post(`/api/notifications/${notificationId}/read/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    try {
      const response = await api.post('/api/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete/archive a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}/delete/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new notification (admin/system use)
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/api/notifications/create/', notificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check system and generate relevant notifications
  checkSystemNotifications: async () => {
    try {
      const response = await api.post('/api/notifications/check-system/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ============================================================================
  // PRIVACY-COMPLIANT USER DATA ENDPOINTS
  // ============================================================================
  
  // Get user statistics from OUR database (not external services)
  getUserStatistics: async () => {
    try {
      const response = await api.get('/api/user-call-statistics/');
      return response.data;
    } catch (error) {
      throw new Error('Unable to load user statistics from CallGenie database');
    }
  },
  
  // Trigger data sync from external services
  syncUserData: async () => {
    try {
      const response = await api.post('/api/sync-user-data/');
      return response.data;
    } catch (error) {
      throw new Error('Unable to sync user data in CallGenie system');
    }
  },

  // ============================================================================
  // AGENT TEMPLATE API ENDPOINTS (Used in Agents.jsx)
  // ============================================================================
  
  // List all available agent templates with filtering
  listAgentTemplates: async (params = {}) => {
    try {
      const response = await api.get('/api/agent-templates/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get template categories with counts
  getTemplateCategories: async () => {
    try {
      const response = await api.get('/api/agent-templates/categories/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create an agent from a template
  createAgentFromTemplate: async (templateId, customizations = {}) => {
    try {
      const response = await api.post(`/api/agent-templates/${templateId}/create-agent/`, {
        template_id: templateId,
        customizations: customizations
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  toast.error(message);
  return message;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default api;
