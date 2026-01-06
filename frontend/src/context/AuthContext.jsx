import React, { createContext, useState, useEffect, useContext } from "react";
import { apiRequest } from "../utils/apiUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [roleLevels, setRoleLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStorage = (rememberMe) => (rememberMe ? localStorage : sessionStorage);

  const clearAllStorage = () => {
    sessionStorage.removeItem("session_id");
    localStorage.removeItem("session_id");
    localStorage.removeItem("remember_me");

    localStorage.removeItem("user_id");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("position_name");
  };

  /* -------------------- PERMISSION FETCH -------------------- */
  const fetchPermissions = async (currentUser) => {
    const uid = currentUser?.user_id || user?.user_id;
    if (!uid) return;

    try {
      const response = await apiRequest(`/auth/permissions?employee_id=${uid}`, {
        method: "GET",
      });

      // Transform permissions for Sidebar
      const modulesObj = {};
      Object.values(response?.permissions || {}).forEach((m) => {
        modulesObj[m.module_key] = {
          ...m,
          permissions: m.permissions.filter((p) => p.allowed === 1 && p.show_in_menu === 1),
        };
      });

      setPermissions(modulesObj);
      setRoleLevels(response?.role_levels || []);
    } catch (err) {
      console.error("Permission fetch error:", err);
      setPermissions({});
      setRoleLevels([]);
    }
  };

  /* -------------------- AUTH CHECK -------------------- */
  const checkAuth = async () => {
    try {
      const rememberMe = localStorage.getItem("remember_me") === "true";
      const sessionId = rememberMe
        ? localStorage.getItem("session_id") || sessionStorage.getItem("session_id")
        : sessionStorage.getItem("session_id") || localStorage.getItem("session_id");

      if (!sessionId) {
        setUser(null);
        setPermissions({});
        setRoleLevels([]);
        setLoading(false);
        return;
      }

      const response = await apiRequest("/auth/check-auth", { method: "GET" });

      if (!response?.user_id) throw new Error("Invalid auth response");

      // Persist required fields
      localStorage.setItem("user_id", response.user_id.toString());
      localStorage.setItem("first_name", response.first_name || "");
      localStorage.setItem("last_name", response.last_name || "");
      localStorage.setItem("position_name", response.position_name || "");

      if (rememberMe) {
        localStorage.setItem("session_id", sessionId);
        sessionStorage.removeItem("session_id");
      } else {
        sessionStorage.setItem("session_id", sessionId);
        localStorage.removeItem("session_id");
      }

      setUser(response);

      // Fetch permissions using freshly fetched user
      await fetchPermissions(response);
    } catch (err) {
      console.error("Auth check failed:", err);
      clearAllStorage();
      setUser(null);
      setPermissions({});
      setRoleLevels([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- LOGIN -------------------- */
  const login = (userData, sessionId, rememberMe = false) =>
    new Promise(async (resolve) => {
      if (userData && sessionId) {
        clearAllStorage();

        const storage = getStorage(rememberMe);
        storage.setItem("session_id", sessionId);
        localStorage.setItem("remember_me", rememberMe ? "true" : "false");

        localStorage.setItem("user_id", userData.user_id?.toString() || "");
        localStorage.setItem("first_name", userData.first_name || "");
        localStorage.setItem("last_name", userData.last_name || "");
        localStorage.setItem("position_name", userData.position_name || "");

        setUser(userData);

        // Fetch permissions using the current user
        await fetchPermissions(userData);
      }
      resolve();
    });

  /* -------------------- LOGOUT -------------------- */
  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout API failed:", err);
    } finally {
      clearAllStorage();
      setUser(null);
      setPermissions({});
      setRoleLevels([]);
    }
  };

  /* -------------------- INIT -------------------- */
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        roleLevels,
        loading,
        login,
        logout,
        checkAuth,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
