import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    const newToken = res.data.access_token;
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const meRes = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    setUser(meRes.data);
    return meRes.data;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}