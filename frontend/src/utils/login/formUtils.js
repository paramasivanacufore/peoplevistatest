// Form validation utilities for login
export const validateEmail = (email) => {
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validateEmailWithDetails = (email) => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email address is required'
    };
  }

  // Check for @ symbol
  if (!email.includes('@')) {
    return {
      isValid: false,
      error: 'Email address must contain @ symbol'
    };
  }

  // Check for domain part
  const parts = email.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Email address must have exactly one @ symbol'
    };
  }

  const [localPart, domainPart] = parts;

  // Check local part (before @)
  if (!localPart || localPart.length === 0) {
    return {
      isValid: false,
      error: 'Email address must have a username before @'
    };
  }

  // Check domain part (after @)
  if (!domainPart || domainPart.length === 0) {
    return {
      isValid: false,
      error: 'Email address must have a domain after @'
    };
  }

  // Check for domain extension (.com, .org, etc.)
  if (!domainPart.includes('.')) {
    return {
      isValid: false,
      error: 'Email address must have a domain extension (like .com, .org)'
    };
  }

  // Check if domain extension is at least 2 characters
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return {
      isValid: false,
      error: 'Domain extension must be at least 2 characters (like .com, .org)'
    };
  }

  // Final comprehensive validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

export const validatePassword = (password) => {
  const minLength = /.{8,16}/;
  const upperCase = /[A-Z]/;
  const lowerCase = /[a-z]/;
  const number = /[0-9]/;
  const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  const errors = [];
  
  if (!minLength.test(password)) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!upperCase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!lowerCase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!number.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!specialChar.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateOTP = (otp) => {
  if (!otp || otp.length !== 6) {
    return 'Please enter a valid 6-digit OTP';
  }
  if (!/^\d{6}$/.test(otp)) {
    return 'OTP must contain only numbers';
  }
  return null;
};
