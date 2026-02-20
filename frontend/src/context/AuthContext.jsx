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
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const tempPassword = localStorage.getItem('isTempPassword');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      if (tempPassword) {
        setIsTempPassword(JSON.parse(tempPassword));
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
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
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isTempPassword');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsTempPassword(false);
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
