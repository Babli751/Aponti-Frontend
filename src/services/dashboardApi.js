// API service for dashboard and profile data
// This file contains API call functions that will be used when backend is implemented

const API_BASE_URL =
  (typeof window !== 'undefined' && window.API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  '/api/v1';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token =
    localStorage.getItem('business_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// User Dashboard API calls
export const dashboardApi = {
  // Get upcoming appointments for user
  getUpcomingAppointments: async () => {
    return apiRequest('/appointments/upcoming');
  },

  // Get past appointments for user
  getPastAppointments: async () => {
    return apiRequest('/appointments/past');
  },

  // Get favorite barbers for user
  getFavoriteBarbers: async () => {
    return apiRequest('/barbers/favorites');
  },

  // Cancel an appointment
  cancelAppointment: async (appointmentId) => {
    return apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
  },

  // Add/remove barber from favorites
  toggleFavoriteBarber: async (barberId) => {
    return apiRequest(`/barbers/${barberId}/favorite`, {
      method: 'POST',
    });
  },
};

// Business Dashboard API calls
export const businessApi = {
  // Get business profile data
 getBusinessProfile: async () => {
   try {
     console.log("Fetching business profile...");
     const response = await apiRequest('/business/profile');
     console.log("Business profile response:", response);
     return response;
   } catch (error) {
     console.error("Error fetching business profile:", error);
     throw error;
   }
 },

  // Get business stats and analytics
  getBusinessStats: async () => {
    return apiRequest('/business/stats');
  },

  // Get upcoming appointments for business
  getUpcomingAppointments: async () => {
    return apiRequest('/business/appointments/upcoming');
  },

  // Get recent activity for business
  getRecentActivity: async () => {
    return apiRequest('/business/activity/recent');
  },

  // Update business profile
   updateBusinessProfile: async (profileData) => {
     return apiRequest('/business/profile', {
       method: 'PUT',
       body: JSON.stringify(profileData),
     });
   },

  // Add a new service
  addService: async (serviceData) => {
    return apiRequest('/business/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  // Update existing service
  updateService: async (serviceId, serviceData) => {
    return apiRequest(`/business/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  },

  // Delete a service
  deleteService: async (serviceId) => {
    return apiRequest(`/business/services/${serviceId}`, {
      method: 'DELETE',
    });
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    return apiRequest(`/business/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// User Profile API calls
export const profileApi = {
  // Get complete user profile
  getUserProfile: async () => {
    return apiRequest('/user/profile');
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Upload profile avatar
  uploadAvatar: async (formData) => {
    return apiRequest('/user/avatar', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  // Get user stats (appointments, favorites, etc.)
  getUserStats: async () => {
    return apiRequest('/user/stats');
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    return apiRequest('/user/notifications', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

// Placeholder functions that return empty data (for development without backend)
export const mockApi = {
  // Mock functions that return empty data - used when backend is not ready
  getUpcomingAppointments: () => Promise.resolve([]),
  getPastAppointments: () => Promise.resolve([]),
  getFavoriteBarbers: () => Promise.resolve([]),
  getBusinessProfile: () => Promise.resolve({
    name: '',
    owner: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    rating: 0,
    reviewCount: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    services: []
  }),
  getBusinessStats: () => Promise.resolve({
    totalBookings: 0,
    monthlyRevenue: 0,
    rating: 0,
    activeServices: 0
  }),
  getRecentActivity: () => Promise.resolve([]),
  getUserProfile: () => Promise.resolve({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    memberSince: new Date().getFullYear(),
    totalAppointments: 0,
    favoriteBarbers: 0
  }),
  getUserStats: () => Promise.resolve({
    totalAppointments: 0,
    favoriteBarbers: 0,
    memberSince: new Date().getFullYear()
  })
};

export default {
  dashboardApi,
  businessApi,
  profileApi,
  mockApi
};
