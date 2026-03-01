import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Points to http://localhost:9090/api from your .env
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // 1. Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('sv_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Logout function (Moved UP to prevent ReferenceErrors)
  const logout = () => {
    localStorage.removeItem('sv_user');
    setUser(null);
  };

  // 3. Login function
  const login = async (identifier, password) => {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Required for HttpOnly JWT cookies
      body: JSON.stringify({ 
        username: identifier, 
        password 
      }), 
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid email/name or password');
    }

    const data = await res.json();
    setUser(data);
    localStorage.setItem('sv_user', JSON.stringify(data));
    return data;
  };

  // 4. Signup function
  const signup = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: name,
        email,
        password,
        role: ["user"] // Matches Spring Boot backend expectations
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Signup failed');
    }

    // Auto-login after successful signup
    return await login(email, password); 
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;