import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("wtb_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.needsTwoFactor) {
      return { needsTwoFactor: true, userId: data.userId };
    }
    localStorage.setItem("wtb_token", data.token);
    localStorage.setItem("wtb_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const verifyTwoFactorLogin = async (userId, token) => {
    const { data } = await api.post("/auth/verify-2fa-login", {
      userId,
      token,
    });
    localStorage.setItem("wtb_token", data.token);
    localStorage.setItem("wtb_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("wtb_token");
    localStorage.removeItem("wtb_user");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/users/dashboard");
      const updated = { ...user, ...data.user };
      localStorage.setItem("wtb_user", JSON.stringify(updated));
      setUser(updated);
      return data;
    } catch (err) {
      // silent — dashboard route handles its own errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        verifyTwoFactorLogin,
        logout,
        refreshUser,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
