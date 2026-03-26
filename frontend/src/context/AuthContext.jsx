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
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const initializeAuth = () => {
      try {
        // Check localStorage availability
        if (typeof localStorage === 'undefined') {
          console.warn('localStorage not available');
          setLoading(false);
          return;
        }

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
            
            console.log('User authenticated:', parsedUser.role);
          } else {
            // Invalid user data, clear it
            throw new Error('Invalid user data');
          }
        } else {
          console.log('No authentication data found');
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
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isTempPassword');
          } catch (clearError) {
            console.error('Error clearing localStorage:', clearError);
          }
          setUser(null);
          setIsTempPassword(false);
        }
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    // Add delay for mobile to ensure localStorage is ready
    const timer = setTimeout(initializeAuth, 300); // Increased delay for mobile
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      const { token, user: userData, isTempPassword } = response.data;

      // Validate response data
      if (!token || !userData) {
        throw new Error('Invalid login response');
      }

      // Store in localStorage with error handling
      try {
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
        
        console.log('User logged in successfully:', userData.role);
        
        return { success: true, isTempPassword };
      } catch (storageError) {
        console.error('Error storing login data:', storageError);
        throw new Error('Failed to store login data');
      }
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
      // Clear localStorage with error handling
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isTempPassword');
      } catch (clearError) {
        console.error('Error clearing localStorage:', clearError);
      }
      
      // Clear API headers
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsTempPassword(false);
      
      console.log('User logged out');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isTempPassword,
    authChecked
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
