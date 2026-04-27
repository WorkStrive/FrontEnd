import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Attempt to fetch current user profile
          const response = await api.get('/api/v1/auth/me');
          const userData = response.data.data || response.data.user || response.data;
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          // If auth/me fails, try another common endpoint
          try {
             const res2 = await api.get('/api/v1/users/me');
             const userData2 = res2.data.data || res2.data.user || res2.data;
             setUser(userData2);
          } catch(e2) {
             console.error("Failed fallback to /users/me", e2);
             setUser({ token, email: 'user@example.com', name: 'Unknown User (Profile Fetch Failed)' }); 
          }
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    // The endpoint might be /api/auth/login or /login depending on backend
    const response = await api.post('/api/v1/auth/login', credentials);
    const { token, user: userData } = response.data;
    
    // Fallbacks if backend doesn't return nested objects:
    const finalToken = token || response.data.accessToken || response.data;
    const finalUser = userData || { email: credentials.email };

    localStorage.setItem('token', finalToken);
    setUser(finalUser);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    const { token, user: newUserData } = response.data;

    const finalToken = token || response.data.accessToken || response.data;
    const finalUser = newUserData || { email: userData.email };

    localStorage.setItem('token', finalToken);
    setUser(finalUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
