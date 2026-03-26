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
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const tempPassword = localStorage.getItem('isTempPassword');

        if (token && userData) {
          // Validate token and user data
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser && parsedUser.role) {
            setUser(parsedUser);
            
            if (tempPassword) {
              setIsTempPassword(JSON.parse(tempPassword));
            }
            
            // Set API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // Invalid user data, clear it
            throw new Error('Invalid user data');
          }
        }
      } catch (e) {
        console.error("Error parsing user data", e);
        // Clear corrupted data only if it's actually corrupted
        try {
          const token = localStorage.getItem('token');
          const userData = localStorage.getItem('user');
          
          if (token && userData) {
            // Try to parse again, if it fails then clear
            JSON.parse(userData);
          }
        } catch {
          // Only clear if data is actually corrupted
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isTempPassword');
          setUser(null);
          setIsTempPassword(false);
        }
      } finally {
        setLoading(false);
      }
    };

    // Add delay for mobile to ensure localStorage is ready
    const timer = setTimeout(initializeAuth, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userData, isTempPassword } = response.data;

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
