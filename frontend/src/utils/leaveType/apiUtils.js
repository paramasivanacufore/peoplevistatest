const API_BASE_URL = `${import.meta.env.VITE_API_local_Backend_URL}/api`;
// API utility functions for leave type management
export const leaveTypeAPI = {
  // Get all leave types with optional filters
  getAllLeaveTypes: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.activeOnly !== undefined) {
        queryParams.append('active_only', filters.activeOnly);
      }
      
      const url = `${API_BASE_URL}/leave-types${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch leave types');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  },

  // Get a specific leave type by ID
  getLeaveTypeById: async (leaveTypeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-types/${leaveTypeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch leave type');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave type:', error);
      throw error;
    }
  },

  // Create a new leave type
  createLeaveType: async (leaveTypeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-types/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveTypeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create leave type');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating leave type:', error);
      throw error;
    }
  },

  // Update an existing leave type
  updateLeaveType: async (leaveTypeId, leaveTypeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-types/${leaveTypeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveTypeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update leave type');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating leave type:', error);
      throw error;
    }
  },

  // Delete a leave type (soft delete by default)
  deleteLeaveType: async (leaveTypeId, permanent = false) => {
    try {
      const queryParams = new URLSearchParams();
      if (permanent) {
        queryParams.append('permanent', 'true');
      }
      
      const url = `${API_BASE_URL}/leave-types/${leaveTypeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete leave type');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting leave type:', error);
      throw error;
    }
  },
};

// Helper function to format leave type data for API
export const formatLeaveTypeForAPI = (leaveTypeData) => {
  return {
    leave_type_name: leaveTypeData.leave_type_name?.trim() || '',
    description: leaveTypeData.description?.trim() || null,
    is_active: leaveTypeData.is_active !== undefined ? leaveTypeData.is_active : false  // Default to false (inactive)
  };
};

