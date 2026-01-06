import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useLocation } from "react-router-dom";

export const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user, setPermissions } = useAuth();
  const [permissions, setLocalPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

const fetchPermissions = async () => {
  if (!user?.user_id) return; // wait until user is set

  try {
    const res = await fetch(
      `http://localhost:8000/auth/permissions?employee_id=${user.user_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch permissions");
    }

    const data = await res.json();
    setLocalPermissions(data.permissions || []);

    // optional: update AuthContext permissions too
    setPermissions?.(data.permissions || []);
  } catch (err) {
    console.error("Failed to fetch permissions", err);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchPermissions();
  }, [location.pathname, user]);

  const value = {
    permissions,
    loading,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
