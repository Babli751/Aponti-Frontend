import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { debug } from '../utils/debug';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Make authentication site-specific to avoid conflicts between main site and appoint site
  const sitePrefix = window.location.pathname.startsWith('/appoint') ? 'appoint_' : '';

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(`${sitePrefix}isAuthenticated`) === 'true';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(`${sitePrefix}user`);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      debug.log('AuthContext login attempt:', { email, password });
      const response = await authAPI.login(email, password);
      debug.log('AuthContext login response:', response);

      // Store the access token
      localStorage.setItem(`${sitePrefix}access_token`, response.access_token);
      localStorage.setItem(`${sitePrefix}isAuthenticated`, 'true');

      // Get user profile data
      const userProfile = await authAPI.getProfile();

      // Allow both regular users and barbers to login through this context
      debug.log('User profile loaded:', { is_barber: userProfile.is_barber, email: userProfile.email });

      const userData = {
        id: userProfile.id,
        email: userProfile.email,
        name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email,
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        phone_number: userProfile.phone_number || '',
        avatar: userProfile.avatar || null, // Only set avatar if it actually exists
        isActive: userProfile.is_active,
        memberSince: userProfile.created_at ? new Date(userProfile.created_at).getFullYear().toString() : '2024',
        totalAppointments: userProfile.total_appointments || 0,
        favoriteBarbers: userProfile.favorite_barbers_count || 0,
        phone: userProfile.phone || '',
        birthDate: userProfile.birth_date || '',
        address: userProfile.address || ''
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem(`${sitePrefix}user`, JSON.stringify(userData));

      debug.log('AuthContext login success, userData:', userData);
      return userData;
    } catch (error) {
      debug.error('AuthContext login error:', error);
      throw error;
    }
  };

  const register = async (email, password, firstName = '', lastName = '') => {
    try {
      const response = await authAPI.register(email, password, firstName, lastName);
      debug.log('AuthContext register success:', response);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(`${sitePrefix}isAuthenticated`);
    localStorage.removeItem(`${sitePrefix}user`);
    localStorage.removeItem(`${sitePrefix}access_token`);
  };

  const updateUser = async (userData) => {
    try {
      console.log('🔄 Updating user with data:', userData);
      const updatedProfile = await authAPI.updateProfile(userData);
      console.log('✅ API response:', updatedProfile);

      const newUserData = {
        ...user,
        ...updatedProfile,
        first_name: updatedProfile.first_name || userData.first_name || user?.first_name || '',
        last_name: updatedProfile.last_name || userData.last_name || user?.last_name || '',
        firstName: updatedProfile.first_name || userData.first_name || user?.first_name || '',
        lastName: updatedProfile.last_name || userData.last_name || user?.last_name || '',
        phone_number: updatedProfile.phone_number || userData.phone_number || user?.phone_number || '',
        name: `${updatedProfile.first_name || userData.first_name || ''} ${updatedProfile.last_name || userData.last_name || ''}`.trim() || updatedProfile.email || user?.email
      };

      console.log('💾 Saving user data:', newUserData);
      setUser(newUserData);
      localStorage.setItem(`${sitePrefix}user`, JSON.stringify(newUserData));

      return newUserData;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Sync authentication state with localStorage
    localStorage.setItem(`${sitePrefix}isAuthenticated`, isAuthenticated.toString());
    if (user) {
      localStorage.setItem(`${sitePrefix}user`, JSON.stringify(user));
    }
  }, [isAuthenticated, user, sitePrefix]);

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    setAuth: setIsAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
