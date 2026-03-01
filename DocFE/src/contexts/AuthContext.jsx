import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('sv_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
  const res = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Vital for receiving the JWT HttpOnly cookie

    body: JSON.stringify({ 
      username: identifier, 
      password 
    }), 
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // If dual-lookup is active, this error only triggers if neither 
    // username nor email match
    throw new Error(err.message || 'Invalid email/name or password');
  }

  const data = await res.json(); // Receives UserInfoResponse (id, username, email, roles)
  setUser(data);
  localStorage.setItem('sv_user', JSON.stringify(data));
  return data;
};

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: name, 
        email, 
        password, 
        roles: null 
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Signup failed');
    }

    // Now that the BE supports email login, pass the email here
    return await login(email, password); 
  };

  const logout = () => {
    localStorage.removeItem('sv_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;