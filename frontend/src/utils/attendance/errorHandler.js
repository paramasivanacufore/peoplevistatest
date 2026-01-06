/**
 * Error handler utilities for attendance module
 */

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {object} - Error object with message and type
 */
export const handleApiError = (error, context = 'API') => {
  console.error(`${context} Error:`, error);
  
  if (error.message.includes('API_BASE_URL')) {
    return {
      message: 'API configuration error. Please check your environment variables.',
      type: 'configuration'
    };
  }
  
  if (error.message.includes('API Error')) {
    return {
      message: error.message,
      type: 'api'
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    type: 'unknown'
  };
};

/**
 * Format error message for display
 * @param {Error|object|string} error - Error object or string
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Show error notification (can be extended with toast library)
 * @param {string} message - Error message
 * @param {string} type - Error type
 */
export const showError = (message, type = 'error') => {
  // This can be extended with a toast notification library
  console.error(`[${type.toUpperCase()}] ${message}`);
  // Example: toast.error(message);
};

