// API utility functions for login
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || data.message || 'Request failed');
    }

    return { data, response };
  } catch (error) {
    throw error;
  }
};

// Login API
export const loginUser = async (formData, recaptchaToken) => {
  const backendUrl = import.meta.env.VITE_API_local_Backend_URL || 'http://localhost:8000';
  return apiRequest(`${backendUrl}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      ...formData,
      recaptcha_token: recaptchaToken
    })
  });
};

// Forgot Password API
export const sendForgotPasswordOTP = async (email) => {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

// Verify OTP API
export const verifyOTP = async (email, otp) => {
  return apiRequest('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
};

// Reset Password API
export const resetPassword = async (email, otp, newPassword) => {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword
    })
  });
};

// Resend OTP API
export const resendOTP = async (email) => {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};
