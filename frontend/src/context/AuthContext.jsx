import React, { createContext, useState, useContext, useEffect } from 'react';
import { api, setRefreshTokenHandler } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user data including role
  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me/');
      console.log('User data from API:', response.data); // Debug log
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      logout();
      setLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (!refresh) return null;
      
      const { data } = await api.post('/token/refresh/', { refresh });
      localStorage.setItem('access', data.access);
      return data.access;
    } catch (error) {
      logout();
      return null;
    }
  };

  // Register refresh token handler with API client
  useEffect(() => {
    setRefreshTokenHandler(refreshToken);
  }, []);

  // Initialize - check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user data including role
  // const fetchUserData = async () => {
  //   try {
  //     const response = await api.get('/users/me');
  //     setUser(response.data);
  //     setLoading(false);
  //   } catch (err) {
  //     console.error('Error fetching user data:', err);
  //     logout(); // Token might be invalid/expired
  //     setLoading(false);
  //   }
  // };

  const login = async (username, password) => {
    try {
      setError(null);
      const { data } = await api.post('/users/token/', { username, password });
      
      // Store tokens
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      
      // Fetch user data
      await fetchUserData();
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  // Check if user has required permissions
  // const hasRole = (requiredRoles) => {
  //   if (!user) return false;
  //   return requiredRoles.includes(user.role);
  // };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};