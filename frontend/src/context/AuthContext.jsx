import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTempPassword, setIsTempPassword] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const tempPassword = localStorage.getItem('isTempPassword');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (tempPassword) {
          setIsTempPassword(JSON.parse(tempPassword));
        }
        
        // Set API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Validate token format and user data
        if (!parsedUser.role || (token.startsWith('Bearer') && token.length < 20) || (!token.startsWith('Bearer') && token.length < 10)) {
          throw new Error('Invalid authentication data');
        }
      }
    } catch (e) {
      console.error("Error parsing user data", e);
      // Clear corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isTempPassword');
      setUser(null);
      setIsTempPassword(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userData, isTempPassword } = response.data;

      // Validate response data
      if (!token || !userData) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (isTempPassword) {
        localStorage.setItem('isTempPassword', JSON.stringify(true));
        setIsTempPassword(true);
      } else {
        localStorage.removeItem('isTempPassword');
        setIsTempPassword(false);
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true, isTempPassword };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isTempPassword');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsTempPassword(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isTempPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
