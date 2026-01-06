const API_BASE_URL = `${import.meta.env.VITE_API_local_Backend_URL}/api`;

// API utility functions for leave request management
export const leaveRequestAPI = {
  // Get all leave requests with optional filters
  getAllLeaveRequests: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.employee_id !== undefined) {
        queryParams.append('employee_id', filters.employee_id);
      }
      if (filters.requested_to !== undefined) {
        queryParams.append('requested_to', filters.requested_to);
      }
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      if (filters.leave_type_id !== undefined) {
        queryParams.append('leave_type_id', filters.leave_type_id);
      }
      
      const url = `${API_BASE_URL}/leave-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch leave requests');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  },

  // Get a specific leave request by ID
  getLeaveRequestById: async (leaveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests/${leaveId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave request:', error);
      throw error;
    }
  },

  // Create a new leave request
  createLeaveRequest: async (leaveRequestData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveRequestData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  },

  // Update an existing leave request
  updateLeaveRequest: async (leaveId, leaveRequestData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveRequestData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw error;
    }
  },

  // Approve a leave request
  approveLeaveRequest: async (leaveId, approvedBy, comments = null) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('approved_by', approvedBy);
      if (comments) {
        queryParams.append('comments', comments);
      }
      
      const url = `${API_BASE_URL}/leave-requests/${leaveId}/approve?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to approve leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  },

  // Reject a leave request
  rejectLeaveRequest: async (leaveId, approvedBy, comments = null) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('approved_by', approvedBy);
      if (comments) {
        queryParams.append('comments', comments);
      }
      
      const url = `${API_BASE_URL}/leave-requests/${leaveId}/reject?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reject leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  },

  // Cancel a leave request
  cancelLeaveRequest: async (leaveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests/${leaveId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      throw error;
    }
  },

  // Delete a leave request
  deleteLeaveRequest: async (leaveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-requests/${leaveId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete leave request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw error;
    }
  },
};

// Helper function to format leave request data for API
export const formatLeaveRequestForAPI = (leaveRequestData) => {
  return {
    employee_id: leaveRequestData.employee_id,
    leave_type_id: leaveRequestData.leave_type_id,
    requested_to: leaveRequestData.requested_to,
    start_date: leaveRequestData.start_date,
    end_date: leaveRequestData.end_date,
    request_date: leaveRequestData.request_date || new Date().toISOString().split('T')[0],
    comments: leaveRequestData.comments?.trim() || null,
  };
};


