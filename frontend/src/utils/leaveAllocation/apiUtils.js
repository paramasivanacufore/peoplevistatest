const API_BASE_URL = 'http://localhost:8000/api';

// API utility functions for leave allocation rules management
export const leaveAllocationAPI = {
  // Get all leave allocation rules with optional filters
  getAllRules: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.activeOnly !== undefined) {
        queryParams.append('active_only', filters.activeOnly);
      }
      if (filters.leaveTypeId !== undefined && filters.leaveTypeId !== null) {
        queryParams.append('leave_type_id', filters.leaveTypeId);
      }
      
      const url = `${API_BASE_URL}/leave-allocation-rules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch leave allocation rules');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave allocation rules:', error);
      throw error;
    }
  },

  // Get a specific rule by ID
  getRuleById: async (ruleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-allocation-rules/${ruleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch leave allocation rule');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leave allocation rule:', error);
      throw error;
    }
  },

  // Create a new leave allocation rule
  createRule: async (ruleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-allocation-rules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create leave allocation rule');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating leave allocation rule:', error);
      throw error;
    }
  },

  // Update an existing leave allocation rule
  updateRule: async (ruleId, ruleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-allocation-rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update leave allocation rule');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating leave allocation rule:', error);
      throw error;
    }
  },

  // Delete a leave allocation rule
  deleteRule: async (ruleId, permanent = false) => {
    try {
      const queryParams = new URLSearchParams();
      if (permanent) {
        queryParams.append('permanent', 'true');
      }
      
      const url = `${API_BASE_URL}/leave-allocation-rules/${ruleId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete leave allocation rule');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting leave allocation rule:', error);
      throw error;
    }
  },

  // Get all leave types
  getLeaveTypes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-allocation-rules/leave-types/list`, {
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
};

// Utility functions for formatting data
export const formatRuleForAPI = (formData) => {
  return {
    leave_type_id: parseInt(formData.leave_type_id),
    allocation_period: formData.allocation_period,
    days_allocated: parseFloat(formData.days_allocated),
    carry_forward: formData.carry_forward,
    max_carry_forward_days: parseFloat(formData.max_carry_forward_days) || 0,
    is_active: formData.is_active
  };
};

export const formatRuleFromAPI = (ruleData) => {
  return {
    ...ruleData,
    days_allocated: ruleData.days_allocated.toString(),
    max_carry_forward_days: ruleData.max_carry_forward_days.toString()
  };
};

// Helper function to get allocation period options
export const getAllocationPeriodOptions = () => [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Half-Yearly', label: 'Half-Yearly' },
  { value: 'Yearly', label: 'Yearly' }
];

// Helper function to format allocation period for display
export const formatAllocationPeriod = (period) => {
  const periodMap = {
    'Monthly': 'Monthly',
    'Quarterly': 'Quarterly',
    'Half-Yearly': 'Half-Yearly',
    'Yearly': 'Yearly'
  };
  return periodMap[period] || period;
};

