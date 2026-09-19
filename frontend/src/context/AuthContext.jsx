import React, { createContext, useContext, useState, useEffect } from "react";
import { api, getAuthToken, setAuthToken, removeAuthToken } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api
        .getMe()
        .then((userData) => setUser(userData))
        .catch(() => {
          removeAuthToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, full_name) => {
    const data = await api.register(email, password, full_name);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const loginDemo = async () => {
    try {
      return await login("student@university.edu", "password123");
    } catch (e) {
      // If demo user does not exist yet, register it
      return await register("student@university.edu", "password123", "Alex Student");
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);