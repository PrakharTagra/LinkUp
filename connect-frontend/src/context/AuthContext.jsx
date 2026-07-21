import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, updateUserProfile } from "../services/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }

      if (token) {
        try {
          const data = await getCurrentUser();
          const resolvedUser = data.user || data;
          setUser(resolvedUser);
          localStorage.setItem("user", JSON.stringify(resolvedUser));
        } catch (err) {
          console.error("Auth initialization failed", err);
          const status = err?.response?.status;

          // Only clear session when token is invalid/expired.
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 🔐 Login
  const login = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ✏️ Update user
  const updateUser = async (updatedData) => {
    try {
      const data = await updateUserProfile(updatedData);
      const resolvedUser = data.user || data;
      setUser(resolvedUser);
      localStorage.setItem("user", JSON.stringify(resolvedUser));
      return data;
    } catch (err) {
      console.error("Profile update failed", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}


// Custom Hook
export function useAuth() {
  return useContext(AuthContext);
}