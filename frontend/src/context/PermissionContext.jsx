// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
// } from "react";
// import { useLocation } from "react-router-dom";
// import { permissionAPI } from "../utils/permissions/apiUtils";
// import { useAuth } from "./AuthContext";

// const PermissionContext = createContext();

// export const usePermissions = () => {
//   const context = useContext(PermissionContext);
//   if (!context) {
//     throw new Error("usePermissions must be used within a PermissionProvider");
//   }
//   return context;
// };

// export const PermissionProvider1 = ({ children }) => {
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const location = useLocation();

//   const previousLocationRef = useRef("");

//   const [permissions, setPermissions] = useState({
//     roleLevel: 5,
//     departments: [],
//     modules: {},
//     roleInfo: {
//       role_level: 5,
//       department: "Unknown",
//       name: "Unknown User",
//       email: "",
//     },
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // -----------------------------------------------------------
//   // Fetch permissions from backend
//   // -----------------------------------------------------------
//   const loadUserPermissions = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!user || !user.employee_id) {
//         throw new Error("No user data available from AuthContext");
//       }

//       const employeeId = user.employee_id;
//       console.log("📡 Fetching permissions for employee:", employeeId);

//       const response = await permissionAPI.getUserPermissions(employeeId);

//       if (!response.success) {
//         throw new Error("Failed to load user permissions");
//       }

//       const apiPermissions = response.data.permissions || {};

//       console.log("✅ Permissions received:", apiPermissions);
//       const modules = Object.values(apiPermissions).reduce((acc, mod) => {
//         acc[mod.module_key] = mod; // Use module_key as the key
//         return acc;
//       }, {});

//       // Safe transform
//       const transformedPermissions = {
//         roleLevel: user.role_levels?.[0] || 5,
//         departments: [],
//         modules: modules, // <--- FIXED
//         roleInfo: {
//           role_level: user.role_levels?.[0] || 5,
//           department: "Super Admin",
//           name: `${user.first_name} ${user.last_name}`,
//           email: user.email,
//         },
//       };

//       setPermissions(transformedPermissions);
//     } catch (err) {
//       console.error("❌ Error loading permissions:", err);
//       setError(err.message);

//       // fallback permissions
//       setPermissions({
//         roleLevel: 5,
//         departments: [],
//         modules: {},
//         roleInfo: {
//           role_level: 5,
//           department: "Unknown",
//           name: "Unknown User",
//           email: "",
//         },
//       });
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   // -----------------------------------------------------------
//   // Permission helpers
//   // -----------------------------------------------------------
//   const canAccessModule = (moduleKey, permissionType = "view") => {
//     if (permissions.roleLevel <= 2) return true; // super admin + admin

//     const module = permissions.modules[moduleKey];
//     if (!module) return false;

//     for (const permKey in module.permissions) {
//       const perm = module.permissions[permKey];
//       if (perm.permission_types?.includes(permissionType)) return true;
//     }

//     return false;
//   };

//   const hasPermissionKey = (
//     moduleKey,
//     permissionKey,
//     permissionType = "view"
//   ) => {
//     if (permissions.roleLevel <= 2) return true;

//     const module = permissions.modules[moduleKey];
//     if (!module) return false;

//     const perm = module.permissions[permissionKey];
//     return perm?.permission_types?.includes(permissionType) || false;
//   };

//   const canAccessAttendanceAdmin = () => {
//     if (permissions.roleLevel <= 2) return true;
//     return hasPermissionKey(
//       "pv_attendance",
//       "attendance_admin_operations",
//       "view"
//     );
//   };

//   const isSuperAdmin = () => permissions.roleLevel === 1;
//   const isAdmin = () => permissions.roleLevel <= 2;
//   const isHRManager = () => permissions.roleLevel <= 3;
//   const isEmployee = () => permissions.roleLevel >= 4;

//   // -----------------------------------------------------------
//   // Fetch permissions after login
//   // -----------------------------------------------------------
//   useEffect(() => {
//     if (authLoading) return;

//     if (isAuthenticated && user) {
//       console.log("🔄 Fetching initial permissions after authentication...");
//       loadUserPermissions();
//       previousLocationRef.current = location.pathname;
//     } else {
//       setLoading(false);
//     }
//   }, [isAuthenticated, user, authLoading, loadUserPermissions]);

//   // -----------------------------------------------------------
//   // Refresh permissions on every route change
//   // -----------------------------------------------------------
//   useEffect(() => {
//     if (authLoading || !isAuthenticated || !user) return;

//     const publicRoutes = ["/login", "/forgot-password", "/"];
//     if (publicRoutes.includes(location.pathname)) return;

//     if (previousLocationRef.current !== location.pathname) {
//       console.log(
//         "🔄 Route changed → refreshing permissions:",
//         location.pathname
//       );
//       previousLocationRef.current = location.pathname;
//       loadUserPermissions();
//     }
//   }, [
//     location.pathname,
//     isAuthenticated,
//     user,
//     authLoading,
//     loadUserPermissions,
//   ]);

//   // -----------------------------------------------------------
//   // Manual refresh / clear functions
//   // -----------------------------------------------------------
//   const clearPermissions = () => {
//     setPermissions({
//       roleLevel: 5,
//       departments: [],
//       modules: {},
//       roleInfo: {
//         role_level: 5,
//         department: "Unknown",
//         name: "Unknown User",
//         email: "",
//       },
//     });
//     loadUserPermissions();
//   };

//   const refreshPermissions = () => {
//     console.log("🔁 Manual refresh called");
//     loadUserPermissions();
//   };

//   return (
//     <PermissionContext.Provider
//       value={{
//         permissions,
//         loading,
//         error,
//         canAccessModule,
//         hasPermissionKey,
//         canAccessAttendanceAdmin,
//         isSuperAdmin,
//         isAdmin,
//         isHRManager,
//         isEmployee,
//         refreshPermissions,
//         clearPermissions,
//       }}
//     >
//       {children}
//     </PermissionContext.Provider>
//   );
// };
