const API_BASE_URL = 'http://localhost:8000/api';

export const permissionAPI = {
  // Get user permissions
  getUserPermissions: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions/user/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user permissions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  // Check attendance admin access
  checkAttendanceAdminAccess: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions/user/${employeeId}/attendance-admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to check attendance admin access');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking attendance admin access:', error);
      throw error;
    }
  },

  // Check module access
  checkModuleAccess: async (employeeId, moduleKey, permissionType = 'view') => {
    try {
      const response = await fetch(`${API_BASE_URL}/permissions/user/${employeeId}/module/${moduleKey}?permission_type=${permissionType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to check module access');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking module access:', error);
      throw error;
    }
  }
};

// Note: These helper functions have been removed
// Use useAuth() hook in React components to get user data
// Use usePermissions() hook to get permissions and role level
// Example:
//   const { user } = useAuth();
//   const { permissions, isAdmin } = usePermissions();
