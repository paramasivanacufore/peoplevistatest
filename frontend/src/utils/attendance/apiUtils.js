import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_local_Backend_URL;

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL or VITE_API_local_Backend_URL is not set in .env file');
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`[API Error] ${error.response.status} ${error.response.statusText}:`, error.response.data);
      throw new Error(
        error.response.data?.message || 
        `API Error: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API Error] No response received:', error.request);
      throw new Error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('[API Error]', error.message);
      throw error;
    }
  }
);

/**
 * Generic API request function using axios
 * @param {string} endpoint - API endpoint (e.g., '/api/attendance/dashboard/overview')
 * @param {object} options - Axios request options (method, data, params, etc.)
 * @returns {Promise} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    if (!API_BASE_URL) {
      const errorMsg = 'API_BASE_URL is not configured. Please set VITE_API_BASE_URL or VITE_API_local_Backend_URL in your .env file';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const response = await apiClient.request({
      url: endpoint,
      ...options,
    });
    
    return response.data;
  } catch (error) {
    console.error('[API Request Error]', {
      endpoint,
      url: API_BASE_URL ? `${API_BASE_URL}${endpoint}` : 'N/A',
      error: error.message
    });
    throw error;
  }
};

// ==================== ATTENDANCE DASHBOARD APIs ====================

/**
 * Get dashboard overview data
 * @returns {Promise<object>} - Dashboard overview statistics
 */
export const getDashboardOverview = async () => {
  const response = await apiRequest('/api/attendance/dashboard/overview');
  // Response structure: { success: true, data: {...} }
  return response.data || {};
};

/**
 * Get holidays data
 * @param {number|null} year - Optional year filter
 * @returns {Promise<array>} - Array of holidays
 */
export const getHolidays = async (year = null) => {
  const params = year ? { year } : {};
  const response = await apiRequest('/api/attendance/dashboard/holidays', {
    method: 'GET',
    params,
  });
  // Response structure: { success: true, data: [...] }
  return response.data || [];
};

/**
 * Get employees with attendance data
 * @param {object} params - Query parameters (page, limit, search, date, department_id)
 * @returns {Promise<object>} - Paginated employees with attendance data
 */
export const getEmployeesWithAttendance = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees', {
    method: 'GET',
    params,
  });
  // Response structure: { success: true, data: { employees: [], total: 0, ... } }
  return response.data || {};
};

/**
 * Get all departments
 * @returns {Promise<array>} - Array of departments
 */
export const getDepartments = async () => {
  const response = await apiRequest('/api/attendance/dashboard/departments', {
    method: 'GET',
  });
  // Response structure: { success: true, data: [departments] }
  return response.data || [];
};

/**
 * Export all employees with attendance data (no pagination limit)
 * @param {object} params - Query parameters (search, date, department_id)
 * @returns {Promise<object>} - All employees with attendance data
 */
export const exportEmployeesWithAttendance = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees/export', {
    method: 'GET',
    params,
  });
  // Response structure: { success: true, data: { employees: [], total: 0, ... } }
  return response.data || {};
};

/**
 * Export all present employees today (no pagination limit)
 * @param {object} params - Query parameters (search, department_ids, shift_ids)
 * @returns {Promise<object>} - All present employees today
 */
export const exportPresentEmployeesToday = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees/present-today/export', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Export all employees on leave today (no pagination limit)
 * @param {object} params - Query parameters (search, department_ids, shift_ids)
 * @returns {Promise<object>} - All employees on leave today
 */
export const exportOnLeaveEmployeesToday = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees/on-leave-today/export', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Export all absent employees today (no pagination limit)
 * @param {object} params - Query parameters (search, department_ids, shift_ids)
 * @returns {Promise<object>} - All absent employees today
 */
export const exportAbsentEmployeesToday = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees/absent-today/export', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Export all leave requests (no pagination limit)
 * @param {object} params - Query parameters (search, status, department_id, manager_id)
 * @returns {Promise<object>} - All leave requests
 */
export const exportLeaveRequests = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/leave-requests/export', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Export all regularization requests (no pagination limit)
 * @param {object} params - Query parameters (search, department_id, manager_id)
 * @returns {Promise<object>} - All regularization requests
 */
export const exportRegularizationRequests = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/regularization-requests/export', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Export all compensatory requests (no pagination limit)
 * @param {object} params - Query parameters (search, department_id)
 * @returns {Promise<object>} - All compensatory requests
 */
export const exportCompensatoryRequests = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/compensatory-requests/export', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Get employees who are present today
 * @param {object} params - Query parameters (page, limit, search, department_id)
 * @returns {Promise<object>} - Paginated present employees
 */
export const getPresentEmployeesToday = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees/present-today', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Get employees who are on leave today
 * @param {object} params - Query parameters (page, limit, search, department_id)
 * @returns {Promise<object>} - Paginated employees on leave
 */
export const getOnLeaveEmployeesToday = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees/on-leave-today', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Get employees who are absent today
 * @param {object} params - Query parameters (page, limit, search, department_id)
 * @returns {Promise<object>} - Paginated absent employees
 */
export const getAbsentEmployeesToday = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/employees/absent-today', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Get leave requests
 * @param {object} params - Query parameters (page, limit, search, status, department_id)
 * @returns {Promise<object>} - Paginated leave requests
 */
export const getLeaveRequests = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/leave-requests', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Approve a leave request
 * @param {number} leaveId - Leave request ID
 * @param {number} approvedBy - Employee ID of the approver
 * @param {string} comments - Optional comments
 * @returns {Promise<object>} - Approval result
 */
export const approveLeaveRequest = async (leaveId, approvedBy, comments = null) => {
  const response = await apiRequest(`/api/attendance/dashboard/leave-requests/${leaveId}/approve`, {
    method: 'POST',
    data: {
      approved_by: approvedBy,
      comments: comments
    },
  });
  return response.data || {};
};

/**
 * Reject a leave request
 * @param {number} leaveId - Leave request ID
 * @param {number} rejectedBy - Employee ID of the rejector
 * @param {string} comments - Optional comments
 * @returns {Promise<object>} - Rejection result
 */
export const rejectLeaveRequest = async (leaveId, rejectedBy, comments = null) => {
  const response = await apiRequest(`/api/attendance/dashboard/leave-requests/${leaveId}/reject`, {
    method: 'POST',
    data: {
      approved_by: rejectedBy,
      comments: comments
    },
  });
  return response.data || {};
};

/**
 * Get regularization requests
 * @param {object} params - Query parameters (page, limit, search, department_id)
 * @returns {Promise<object>} - Paginated regularization requests
 */
export const getRegularizationRequests = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/regularization-requests', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Approve a regularization request
 * @param {number} requestId - Regularization request ID
 * @param {number} approvedBy - Employee ID of the approver
 * @param {string} comments - Optional comments
 * @returns {Promise<object>} - Approval result
 */
export const approveRegularizationRequest = async (requestId, approvedBy, comments = null) => {
  const response = await apiRequest(`/api/attendance/dashboard/regularization-requests/${requestId}/approve`, {
    method: 'POST',
    data: {
      approved_by: approvedBy,
      comments: comments
    },
  });
  return response.data || {};
};

/**
 * Reject a regularization request
 * @param {number} requestId - Regularization request ID
 * @param {number} rejectedBy - Employee ID of the rejector
 * @param {string} comments - Optional comments
 * @returns {Promise<object>} - Rejection result
 */
export const rejectRegularizationRequest = async (requestId, rejectedBy, comments = null) => {
  const response = await apiRequest(`/api/attendance/dashboard/regularization-requests/${requestId}/reject`, {
    method: 'POST',
    data: {
      approved_by: rejectedBy,
      comments: comments
    },
  });
  return response.data || {};
};

/**
 * Get compensatory requests
 * @param {object} params - Query parameters (page, limit, search, department_id)
 * @returns {Promise<object>} - Paginated compensatory requests
 */
export const getCompensatoryRequests = async (params = {}) => {
  const response = await apiRequest('/api/attendance/dashboard/compensatory-requests', {
    method: 'GET',
    params,
  });
  return response.data || {};
};

/**
 * Approve a compensatory request
 * @param {number} leaveId - Compensatory leave request ID
 * @param {number} approvedBy - Employee ID of the approver
 * @param {string} comments - Optional comments
 * @returns {Promise<object>} - Approval result
 */
export const approveCompensatoryRequest = async (leaveId, approvedBy, comments = null) => {
  const response = await apiRequest(`/api/attendance/dashboard/compensatory-requests/${leaveId}/approve`, {
    method: 'POST',
    data: {
      approved_by: approvedBy,
      comments: comments
    },
  });
  return response.data || {};
};

/**
 * Reject a compensatory request
 * @param {number} leaveId - Compensatory leave request ID
 * @param {number} rejectedBy - Employee ID of the rejector
 * @param {string} comments - Optional comments
 * @returns {Promise<object>} - Rejection result
 */
export const rejectCompensatoryRequest = async (leaveId, rejectedBy, comments = null) => {
  const response = await apiRequest(`/api/attendance/dashboard/compensatory-requests/${leaveId}/reject`, {
    method: 'POST',
    data: {
      approved_by: rejectedBy,
      comments: comments
    },
  });
  return response.data || {};
};

// ==================== TEAM MEMBER VIEW APIs ====================

/**
 * Get team attendance data
 * @param {object} params - Query parameters (date, department_id, status, search, page, page_size, etc.)
 * @returns {Promise<object>} - Team attendance data with pagination
 */
export const getTeamAttendance = async (params = {}) => {
  const response = await apiRequest('/api/attendance/team', {
    method: 'GET',
    params,
  });
  return response || {};
};

/**
 * Get employee attendance data
 * @param {number} employeeId - Employee ID
 * @param {object} params - Query parameters (start_date, end_date, page, page_size)
 * @returns {Promise<object>} - Employee attendance data with pagination and summary
 */
export const getEmployeeAttendance = async (employeeId, params = {}) => {
  const response = await apiRequest(`/api/attendance/employee/${employeeId}`, {
    method: 'GET',
    params,
  });
  return response || {};
};

/**
 * Get regularization requests for an employee (team member view)
 * @param {number} employeeId - Employee ID
 * @param {object} params - Query parameters (start_date, end_date, page, page_size)
 * @returns {Promise<object>} - Regularization requests data with pagination
 */
export const getEmployeeRegularizationRequests = async (employeeId, params = {}) => {
  const response = await apiRequest(`/api/attendance/regularization/${employeeId}`, {
    method: 'GET',
    params,
  });
  return response || {};
};

/**
 * Get leave summary for an employee
 * @param {number} employeeId - Employee ID
 * @param {object} params - Query parameters (year, start_date, end_date)
 * @returns {Promise<object>} - Leave summary data
 */
export const getLeaveSummary = async (employeeId, params = {}) => {
  const response = await apiRequest(`/api/attendance/leave-summary/${employeeId}`, {
    method: 'GET',
    params,
  });
  return response || {};
};

/**
 * Get leave balance for an employee
 * @param {number} employeeId - Employee ID
 * @param {object} params - Query parameters (year)
 * @returns {Promise<object>} - Leave balance data
 */
export const getLeaveBalance = async (employeeId, params = {}) => {
  const response = await apiRequest(`/api/attendance/leave-balance/${employeeId}`, {
    method: 'GET',
    params,
  });
  return response || {};
};

/**
 * Get leave requests for an employee (team member view)
 * @param {number} employeeId - Employee ID
 * @param {object} params - Query parameters (start_date, end_date, page, page_size)
 * @returns {Promise<object>} - Leave requests data with pagination
 */
export const getEmployeeLeaveRequests = async (employeeId, params = {}) => {
  const response = await apiRequest(`/api/attendance/leave-requests/${employeeId}`, {
    method: 'GET',
    params,
  });
  return response || {};
};

/**
 * Get all departments (team member view - different endpoint)
 * @returns {Promise<array>} - Array of departments
 */
export const getTeamDepartments = async () => {
  const response = await apiRequest('/api/attendance/departments', {
    method: 'GET',
  });
  return response || [];
};

/**
 * Get all shifts
 * @returns {Promise<array>} - Array of shifts
 */
export const getShifts = async () => {
  const response = await apiRequest('/api/attendance/shifts', {
    method: 'GET',
  });
  return response || [];
};


