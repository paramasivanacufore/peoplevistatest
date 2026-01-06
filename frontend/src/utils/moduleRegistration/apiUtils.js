const API_BASE_URL = "http://localhost:8000/api";

// API utility functions for module registration
export const moduleRegistrationAPI = {
  // ===========================
  //  Register New Module (MAIN)
  // ===========================
  registerModule: async (moduleData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/module-registration/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(moduleData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to register module");
      }

      return await response.json();
    } catch (error) {
      console.error("Error registering module:", error);
      throw error;
    }
  },

  // ===========================
  //  Get All Roles
  // ===========================
  getAllRoles: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/module-registration/roles`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch roles");
      }

      const result = await response.json();
      console.log("API response for roles:", result);

      // Backend returns { data: [...] }
      if (Array.isArray(result)) {
        return result;
      } else if (Array.isArray(result.data)) {
        return result.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      return [];
    }
  },

  // ===========================
  //  Create New Role
  // ===========================
  createRole: async (roleData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/module-registration/roles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(roleData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create role");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },

  // ===========================
  //  Get All Modules
  // ===========================
  getAllModules: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/module-registration/modules`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch modules");
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw error;
    }
  },

  // ===========================
  //  Get Module By ID
  // ===========================
  getModuleById: async (moduleId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/module-registration/modules/${moduleId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch module");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching module:", error);
      throw error;
    }
  },

  // ===========================
  //  Update Module
  // ===========================
  updateModule: async (moduleId, updateData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/module-registration/modules/${moduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update module");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating module:", error);
      throw error;
    }
  },

  // ===========================
  //  Delete Module
  // ===========================
  deleteModule: async (moduleId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/module-registration/modules/${moduleId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete module");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting module:", error);
      throw error;
    }
  },
};

export const formatModuleForAPI = (formData) => {
  return {
    module_key: formData.module_key,
    name: formData.name,
    description: formData.description || null,
    status_id: formData.status_id || 1,
    permissions: formData.permissions.flatMap((perm) => 
      perm.permission_type.map((type) => ({
        permission_key: `${formData.module_key}.${type}`,
        permission_type: [type],
        description: perm.permission_description || null
      }))
    ),
  };
};


// Helper function to format module data for API
// export const formatModuleForAPI = (formData) => {
//   return {
//     module_key: formData.module_key,
//     name: formData.name,
//     description: formData.description || null,
//     status_id: formData.status_id || 1,
//     permissions: formData.permissions.map((perm) => ({
//       permission_key: perm.permission_key,
//       permission_type:
//         Array.isArray(perm.permission_type) && perm.permission_type.length > 0
//           ? perm.permission_type
//           : ["view"],
//       description: perm.permission_description || null
//     })),
//     // role_assignments: perm.role_assignments?.map((role) => ({
//       //   role_id: role.role_id,
//       //   allowed: role.allowed !== false,
//       //   description: role.description || null,
//       // })) || [],
//       // scopes: perm.scopes?.map((scope) => ({
//       //   scope_type: scope.scope_type,
//       //   branch_id: scope.branch_id || null,
//       //   department_id: scope.department_id || null,
//       //   emp_id: scope.emp_id || null,
//       //   description: scope.description || null,
//       // })) || []
//   };
// };


