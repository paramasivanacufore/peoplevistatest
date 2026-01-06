// Error handling utilities for login
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  // Extract error message from different error formats
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.detail) {
    errorMessage = error.response.data.detail;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return errorMessage;
};

export const categorizeError = (errorMessage) => {
  const message = errorMessage.toLowerCase();
  
  // Debug: Log the actual error message
  console.log('Error message from backend:', errorMessage);
  
  // Email/User-related errors (check these first)
  if (message.includes('user not found') ||
      message.includes('email') ||
      message.includes('username') ||
      message.includes('invalid email') ||
      message.includes('user does not exist') ||
      message.includes('no user found') ||
      message.includes('account not found') ||
      message.includes('user not exist') ||
      message.includes('invalid user')) {
    return {
      type: 'login',
      message: 'Invalid email address. Please check your email and try again.'
    };
  }
  
  // Password-related errors
  if (message.includes('password') || 
      message.includes('incorrect password') ||
      message.includes('wrong password') ||
      message.includes('invalid password')) {
    return {
      type: 'password',
      message: 'Invalid password. Please check your password and try again.'
    };
  }
  
  // Generic "invalid credentials" - we'll default to password error for now
  // but this should ideally be handled by the backend with more specific errors
  if (message.includes('invalid credentials') ||
      message.includes('authentication failed') ||
      message.includes('login failed')) {
    // For now, we'll show a generic error that covers both cases
    return {
      type: 'general',
      message: 'Invalid email or password. Please check your credentials and try again.'
    };
  }
  
  // OTP-related errors
  if (message.includes('otp') ||
      message.includes('verification') ||
      message.includes('invalid code') ||
      message.includes('expired')) {
    return {
      type: 'otp',
      message: 'Invalid or expired OTP. Please try again.'
    };
  }
  
  // Network/Connection errors
  if (message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.'
    };
  }
  
  // Default error
  return {
    type: 'general',
    message: errorMessage
  };
};

export const setFieldError = (setErrors, fieldType, message) => {
  setErrors(prev => ({
    ...prev,
    [fieldType]: message
  }));
};

export const clearFieldError = (setErrors, fieldType) => {
  setErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[fieldType];
    return newErrors;
  });
};

export const clearAllErrors = (setErrors) => {
  setErrors({});
};
