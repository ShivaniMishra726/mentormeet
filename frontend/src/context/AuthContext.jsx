import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await axiosClient.get('/auth/me');
          setUser(res.data);
        } catch (e) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const newToken = res.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);

    const meRes = await axiosClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    setUser(meRes.data);
    return meRes.data;
  };

  const register = async (name, email, password, role, extra = {}) => {
    await axiosClient.post('/auth/register', {
      full_name: name,
      email,
      password,
      role,
      ...extra,
    });
    // Backend doesn't log the user in automatically on register, so do it here
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
