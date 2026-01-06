// import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_local_Backend_URL;

// if (!API_BASE_URL) {
//   console.warn('VITE_API_BASE_URL or VITE_API_local_Backend_URL is not set in .env file');
// }

// // Create axios instance with default configuration
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000, // 10 seconds timeout
// });

// // Request interceptor for logging
// apiClient.interceptors.request.use(
//   (config) => {
//     console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
//     return config;
//   },
//   (error) => {
//     console.error('[API Request Error]', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response) {
//       // Server responded with error status
//       console.error(`[API Error] ${error.response.status} ${error.response.statusText}:`, error.response.data);
//       throw new Error(
//         error.response.data?.message || 
//         `API Error: ${error.response.status} ${error.response.statusText}`
//       );
//     } else if (error.request) {
//       // Request was made but no response received
//       console.error('[API Error] No response received:', error.request);
//       throw new Error('Network error: No response from server');
//     } else {
//       // Something else happened
//       console.error('[API Error]', error.message);
//       throw error;
//     }
//   }
// );

// /**
//  * Generic API request function using axios
//  * @param {string} endpoint - API endpoint (e.g., '/api/attendance/leave-requests/pending')
//  * @param {object} options - Axios request options (method, data, params, etc.)
//  * @returns {Promise} - Response data
//  */
// export const apiRequest = async (endpoint, options = {}) => {
//   try {
//     if (!API_BASE_URL) {
//       const errorMsg = 'API_BASE_URL is not configured. Please set VITE_API_BASE_URL or VITE_API_local_Backend_URL in your .env file';
//       console.error(errorMsg);
//       throw new Error(errorMsg);
//     }
    
//     const response = await apiClient.request({
//       url: endpoint,
//       ...options,
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error('[API Request Error]', {
//       endpoint,
//       url: API_BASE_URL ? `${API_BASE_URL}${endpoint}` : 'N/A',
//       error: error.message
//     });
//     throw error;
//   }
// };

// // ==================== PENDING REQUESTS APIs ====================

// /**
//  * Get pending leave requests
//  * @param {object} params - Query parameters (page, limit, etc.)
//  * @returns {Promise<array>} - Array of pending leave requests
//  */
// export const getPendingLeaveRequests = async (params = {}) => {
//   const response = await apiRequest('/api/attendance/leave-requests/pending', {
//     method: 'GET',
//     params,
//   });
//   return response.data;
// };

// /**
//  * Get pending regularization requests
//  * @param {object} params - Query parameters (page, limit, etc.)
//  * @returns {Promise<array>} - Array of pending regularization requests
//  */
// export const getPendingRegularizationRequests = async (params = {}) => {
//   const response = await apiRequest('/api/attendance/regularization-requests/pending', {
//     method: 'GET',
//     params,
//   });
//   return response.data;
// };

// /**
//  * Get pending compensatory requests
//  * @param {object} params - Query parameters (page, limit, etc.)
//  * @returns {Promise<array>} - Array of pending compensatory requests
//  */
// export const getPendingCompensatoryRequests = async (params = {}) => {
//   const response = await apiRequest('/api/attendance/compensatory-requests/pending', {
//     method: 'GET',
//     params,
//   });
//   return response.data;
// };



import axios from "axios";

// ======================== BASE URL ==========================
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_local_Backend_URL ||
  "http://localhost:8000";

if (!API_BASE_URL) {
  console.warn(
    "VITE_API_BASE_URL or VITE_API_local_Backend_URL is not set in .env file"
  );
}

// ======================== AXIOS CLIENT ==========================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  // Removed withCredentials - no longer using cookies
});

// Request interceptor to add Authorization header with session_id
apiClient.interceptors.request.use(
  (config) => {
    // Get session_id from localStorage (remember me) or sessionStorage (regular session)
    const sessionId = localStorage.getItem('session_id') || sessionStorage.getItem('session_id');
    
    // Add Authorization header if session_id exists
    if (sessionId) {
      config.headers.Authorization = `Session ${sessionId}`;
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - clear session and redirect to login
      if (error.response.status === 401) {
        // Clear session_id from both storages
        sessionStorage.removeItem('session_id');
        localStorage.removeItem('session_id');
        // Clear only the 4 required fields from localStorage
        localStorage.removeItem('user_id');
        localStorage.removeItem('first_name');
        localStorage.removeItem('last_name');
        localStorage.removeItem('position_name');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      console.error(`[API Error] ${error.response.status}:`, error.response.data);
      throw new Error(
        error.response.data?.message ||
          `API Error: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      console.error("[API Error] No response from server");
      throw new Error("Network Error: Server not reachable");
    } else {
      throw error;
    }
  }
);

// ======================== GENERIC REQUEST ==========================
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await apiClient.request({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    console.error("[API Request Error]", {
      endpoint,
      url: API_BASE_URL + endpoint,
      error: error.message,
    });
    throw error;
  }
};

// ======================== ATTENDANCE APIs ==========================
export const attendanceAPI = {
  getTeamAttendance: (params = {}) =>
    apiClient.get("/api/attendance/team", { params }),

  getDepartments: () => apiClient.get("/api/attendance/departments"),

  getShifts: () => apiClient.get("/api/attendance/shifts"),

  getEmployeeAttendance: (employeeId, params = {}) =>
    apiClient.get(`/api/attendance/employee/${employeeId}`, { params }),

  getRegularizationRequests: (employeeId, params = {}) =>
    apiClient.get(`/api/attendance/regularization/${employeeId}`, { params }),

  getLeaveSummary: (employeeId, params = {}) =>
    apiClient.get(`/api/attendance/leave-summary/${employeeId}`, { params }),

  getLeaveBalance: (employeeId, params = {}) =>
    apiClient.get(`/api/attendance/leave-balance/${employeeId}`, { params }),

  getLeaveRequests: (employeeId, params = {}) =>
    apiClient.get(`/api/attendance/leave-requests/${employeeId}`, { params }),
};

// ======================== PENDING REQUESTS ==========================
export const pendingRequestsAPI = {
  getPendingLeaveRequests: (params = {}) =>
    apiRequest("/api/attendance/leave-requests/pending", { method: "GET", params }),

  getPendingRegularizationRequests: (params = {}) =>
    apiRequest("/api/attendance/regularization-requests/pending", {
      method: "GET",
      params,
    }),

  getPendingCompensatoryRequests: (params = {}) =>
    apiRequest("/api/attendance/compensatory-requests/pending", {
      method: "GET",
      params,
    }),
};

// ======================== EMPLOYEE APIs ==========================
export const employeeAPI = {
  getAllEmployees: (params = {}) =>
    apiRequest("/api/employees", { method: "GET", params }),

  getEmployeeById: (employeeId) =>
    apiRequest(`/api/employees/${employeeId}`, { method: "GET" }),

  createEmployee: (data) =>
    apiRequest("/api/employees", { method: "POST", data }),

  updateEmployee: (employeeId, data) =>
    apiRequest(`/api/employees/${employeeId}`, { method: "PUT", data }),

  deleteEmployee: (employeeId) =>
    apiRequest(`/api/employees/${employeeId}`, { method: "DELETE" }),
};

// ======================== LEAVE APIs ==========================
export const leaveAPI = {
  applyLeave: (data) =>
    apiRequest("/api/attendance/leave-requests", { method: "POST", data }),

  approveLeave: (leaveId, data) =>
    apiRequest(`/api/attendance/leave-requests/${leaveId}/approve`, {
      method: "PUT",
      data,
    }),

  rejectLeave: (leaveId, data) =>
    apiRequest(`/api/attendance/leave-requests/${leaveId}/reject`, {
      method: "PUT",
      data,
    }),
};

// ======================== DASHBOARD APIs ==========================
export const dashboardAPI = {
  getAttendanceSummary: () =>
    apiRequest("/api/dashboard/attendance-summary", { method: "GET" }),

  getLeaveSummary: () =>
    apiRequest("/api/dashboard/leave-summary", { method: "GET" }),

  getPerformanceSummary: () =>
    apiRequest("/api/dashboard/performance-summary", { method: "GET" }),
};

// ======================== HOLIDAY APIs ==========================
export const holidayAPI = {
  // Get all holidays with optional filters
  getAllHolidays: (filters = {}) => {
    const params = {};
    if (filters.activeOnly !== undefined) {
      params.active_only = filters.activeOnly;
    }
    if (filters.branchId !== undefined && filters.branchId !== null) {
      params.branch_id = filters.branchId;
    }
    if (filters.year !== undefined && filters.year !== null) {
      params.year = filters.year;
    }
    return apiRequest("/api/holidays", { method: "GET", params });
  },

  // Get a specific holiday by ID
  getHolidayById: (holidayId) =>
    apiRequest(`/api/holidays/${holidayId}`, { method: "GET" }),

  // Create a new holiday
  createHoliday: (holidayData) =>
    apiRequest("/api/holidays", { method: "POST", data: holidayData }),

  // Update a holiday
  updateHoliday: (holidayId, holidayData) =>
    apiRequest(`/api/holidays/${holidayId}`, { method: "PUT", data: holidayData }),

  // Delete a holiday
  deleteHoliday: (holidayId, permanent = false) => {
    const params = permanent ? { permanent: "true" } : {};
    return apiRequest(`/api/holidays/${holidayId}`, { method: "DELETE", params });
  },

  // Get all branches
  getBranches: () =>
    apiRequest("/api/holidays/branches/list", { method: "GET" }),
};

// ======================== BIOMETRIC DEVICE APIs ==========================
export const biometricDeviceAPI = {
  // Get all biometric devices
  getAllDevices: (activeOnly = false) =>
    apiRequest("/api/biometric-devices", {
      method: "GET",
      params: { active_only: activeOnly },
    }),

  // Get device by ID
  getDeviceById: (deviceId) =>
    apiRequest(`/api/biometric-devices/${deviceId}`, { method: "GET" }),

  // Create a new device
  createDevice: (deviceData) =>
    apiRequest("/api/biometric-devices", { method: "POST", data: deviceData }),

  // Update a device
  updateDevice: (deviceId, deviceData) =>
    apiRequest(`/api/biometric-devices/${deviceId}`, {
      method: "PUT",
      data: deviceData,
    }),

  // Delete a device
  deleteDevice: (deviceId) =>
    apiRequest(`/api/biometric-devices/${deviceId}`, { method: "DELETE" }),
};

// ======================== EXPORT DEFAULT ==========================
export default apiClient;
