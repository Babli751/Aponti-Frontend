import axios from 'axios';

// 1. BASE URL CONFIGURATION
const API_BASE_URL = window.API_BASE_URL || process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 2. REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // Check for site-specific tokens first, then fall back to general tokens
    const sitePrefix = window.location.pathname.startsWith('/appoint') ? 'appoint_' : '';
    const token = localStorage.getItem(`${sitePrefix}access_token`) ||
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('business_token') ||
                  localStorage.getItem('businessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear site-specific tokens
      const sitePrefix = window.location.pathname.startsWith('/appoint') ? 'appoint_' : '';
      localStorage.removeItem(`${sitePrefix}access_token`);
      localStorage.removeItem(`${sitePrefix}isAuthenticated`);
      localStorage.removeItem(`${sitePrefix}user`);

      // Also clear general tokens for backward compatibility
      localStorage.removeItem('access_token');
      localStorage.removeItem('business_token');
      localStorage.removeItem('businessToken');

      // Only redirect if we're not already on a login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/signin') &&
          !currentPath.includes('/signup') &&
          !currentPath.includes('/business-signup') &&
          !currentPath.includes('/business-dashboard')) {
        console.log('🔄 401 error detected, redirecting to /business-signup');
        window.location.href = '/business-signup';
      } else {
        console.log('🔄 401 error on login/dashboard page, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

// 4. AUTH API ENDPOINTS
export const authAPI = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/me', passwordData);
    return response.data;
  },

  socialLogin: async (provider, token) => {
    const response = await api.post('/auth/social-login', { provider, token });
    return response.data;
  },
};

// 5. USER API ENDPOINTS
export const userAPI = {
  getAppointments: async () => {
    const response = await api.get('/users/appointments/my');
    return response.data;
  },

  getFavoriteBarbers: async () => {
    const response = await api.get('/users/favorites');
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put('/users/me', settings);
    return response.data;
  },
};

// 6. PROFILE API ENDPOINTS
export const profileApi = {
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// 7. BARBER API ENDPOINTS
export const barberAPI = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  register: async (barberData) => {
    const response = await api.post('/auth/register', barberData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  getBarbers: async (filters = {}) => {
    const response = await api.get('/barbers', { params: filters });
    return response.data;
  },

  getBarberById: async (id) => {
    const response = await api.get(`/barbers/${id}`);
    return response.data;
  },

  bookAppointment: async (barberId, appointmentData) => {
    const response = await api.post(`/barbers/${barberId}/appointments`, appointmentData);
    return response.data;
  },
};

// 8. BUSINESS API ENDPOINTS
export const businessAPI = {
  signup: async (businessData) => {
    const response = await api.post('/businesses/signup', businessData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  login: async (email, password) => {
    console.log('🔐 Business login attempt:', { email, password: password ? '***' : 'EMPTY' });
    const response = await api.post('/businesses/login', {
      email: email,
      password: password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Business login success:', response.data);
    return response.data;
  },

  getBusinesses: async () => {
    const response = await api.get('/businesses/');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/businesses/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/businesses/profile', profileData);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/businesses/appointments');
    return response.data;
  },

  getActivity: async () => {
    const response = await api.get('/businesses/activity');
    return response.data;
  },

  getServices: async () => {
    const response = await api.get('/businesses/my-services');
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await api.post('/businesses/my-services', serviceData);
    return response.data;
  },

  deleteService: async (serviceId) => {
    const response = await api.delete(`/businesses/my-services/${serviceId}`);
    return response.data;
  },

  getNearbyBusinesses: async (lat, lon, radius = 10, category = null) => {
    const params = { lat, lon, radius };
    if (category) params.category = category;
    const response = await api.get('/businesses/nearby', { params });
    return response.data;
  },

  geocodeAddress: async (address, city, country) => {
    const response = await api.post('/businesses/geocode', { address, city, country });
    return response.data;
  }
};

// Extend existing barberAPI with additional methods
const extendedBarberAPI = {
  ...barberAPI,
  getBarberServices: async (barberId) => {
    const response = await api.get(`/barbers/${barberId}/services`);
    return response.data;
  },

  createBarberService: async (barberId, serviceData) => {
    const response = await api.post(`/barbers/${barberId}/services`, serviceData);
    return response.data;
  },

  deleteBarberService: async (barberId, serviceId) => {
    const response = await api.delete(`/barbers/${barberId}/services/${serviceId}`);
    return response.data;
  },

  updateBarberProfile: async (barberId, profileData) => {
    const response = await api.put(`/barbers/${barberId}/profile`, profileData);
    return response.data;
  },

  getBarberAppointments: async (barberId) => {
    const response = await api.get(`/bookings/barber-appointments/${barberId}`);
    return response.data;
  }
};

// Update the original barberAPI object instead of re-exporting
Object.assign(barberAPI, extendedBarberAPI);

// 10. BOOKING API ENDPOINTS
export const bookingAPI = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  },

  getCustomerBookings: async () => {
    const response = await api.get('/bookings/customer');
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/bookings/customer');
    return response.data;
  },

  getAvailableSlots: async (barberId, serviceId, date) => {
    const response = await api.get('/bookings/available-slots', {
      params: { barber_id: barberId, service_id: serviceId, date: date }
    });
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  updateBooking: async (bookingId, bookingData) => {
    const response = await api.put(`/bookings/${bookingId}`, bookingData);
    return response.data;
  }
};

// 11. SERVICES API ENDPOINTS
export const servicesAPI = {
  getServices: async (businessId = null) => {
    const params = businessId ? { business_id: businessId } : {};
    const response = await api.get('/services/', { params });
    return response.data;
  },

  deleteService: async (serviceId) => {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  }
};

// 12. DASHBOARD API ENDPOINTS
export const dashboardAPI = {
  getUserDashboard: async (userEmail) => {
    const response = await api.get(`/dashboard/${userEmail}`);
    return response.data;
  }
};

export default api;
