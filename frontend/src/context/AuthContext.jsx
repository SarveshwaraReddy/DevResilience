/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (token) {
      // Fetch user profile if token exists
      fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
    }
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.data.token);
      setUser(data.data);
      localStorage.setItem('token', data.data.token);
      navigate('/dashboard');
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const register = async (name, email, password, role, avatarData) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, avatar: avatarData })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.data.token);
      setUser(data.data);
      localStorage.setItem('token', data.data.token);
      navigate('/dashboard');
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Failed to update profile' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error updating profile' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
