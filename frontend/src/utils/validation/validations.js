// Validation utility functions for forms

/**
 * Validates leave type name
 * @param {string} value - The leave type name to validate
 * @param {Array} existingLeaveTypes - Array of existing leave types for uniqueness check
 * @param {Object} currentLeaveType - Current leave type being edited (for uniqueness check)
 * @returns {string|null} - Error message or null if valid
 */
export const validateLeaveTypeName = (
  value,
  existingLeaveTypes = [],
  currentLeaveType = null
) => {
  // Required validation
  if (!value || value.trim() === "") {
    return "Leave type name is required.";
  }

  // No leading/trailing spaces validation
  if (value !== value.trim()) {
    return "Leave type name cannot start or end with a space.";
  }

  // Length validation (min 3, max 50)
  if (value.length < 3) {
    return "Leave type name must be at least 3 characters long.";
  }
  if (value.length > 50) {
    return "Leave type name must not exceed 50 characters.";
  }

  // Format validation - only letters (A-Z, a-z) and spaces
  const lettersAndSpacesPattern = /^[A-Za-z\s]+$/;
  if (!lettersAndSpacesPattern.test(value)) {
    return "Leave type name can only contain letters and spaces.";
  }

  // Uniqueness validation
  if (existingLeaveTypes.length > 0) {
    const trimmedValue = value.trim();
    const duplicate = existingLeaveTypes.find(
      (lt) =>
        lt.leave_type_name &&
        lt.leave_type_name.toLowerCase() === trimmedValue.toLowerCase() &&
        (!currentLeaveType ||
          lt.leave_type_id !== currentLeaveType.leave_type_id)
    );

    if (duplicate) {
      return "Leave type name already exists.";
    }
  }

  return null;
};

/**
 * Validates leave type description
 * @param {string} value - The description to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateLeaveTypeDescription = (value) => {
  // Required validation
  if (!value || value.trim() === "") {
    return "Description is required.";
  }

  // Max length validation (500 characters)
  if (value.length > 500) {
    return "Description must not exceed 500 characters.";
  }

  return null;
};

/**
 * Generic validation helper for required fields
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required.`;
  }
  return null;
};

/**
 * Generic validation helper for minimum length
 * @param {string} value - The value to validate
 * @param {number} minLength - Minimum length required
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long.`;
  }
  return null;
};

/**
 * Generic validation helper for maximum length
 * @param {string} value - The value to validate
 * @param {number} maxLength - Maximum length allowed
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters.`;
  }
  return null;
};

/**
 * Generic validation helper for trimming spaces
 * @param {string} value - The value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateNoLeadingTrailingSpaces = (value, fieldName) => {
  if (value && value !== value.trim()) {
    return `${fieldName} cannot start or end with a space.`;
  }
  return null;
};

/**
 * Validates position name
 * @param {string} value - The position name to validate
 * @param {Array} existingPositions - Array of existing positions for uniqueness check
 * @param {Object} currentPosition - Current position being edited (for uniqueness check)
 * @returns {string|null} - Error message or null if valid
 */
export const validatePositionName = (
  value,
  existingPositions = [],
  currentPosition = null
) => {
  // Required validation
  if (!value || value.trim() === "") {
    return "Position name is required.";
  }

  // No leading/trailing spaces validation
  if (value !== value.trim()) {
    return "Position name cannot start or end with a space.";
  }

  // Length validation (min 3, max 100)
  if (value.length < 3) {
    return "Position name must be at least 3 characters long.";
  }
  if (value.length > 100) {
    return "Position name must not exceed 100 characters.";
  }

  // Format validation - only letters (A-Z, a-z) and spaces, no numbers or special characters
  const lettersAndSpacesPattern = /^[A-Za-z\s]+$/;
  if (!lettersAndSpacesPattern.test(value)) {
    return "Position name can only contain letters and spaces. Numbers and special characters are not allowed.";
  }

  // Uniqueness validation
  if (existingPositions.length > 0) {
    const trimmedValue = value.trim();
    const duplicate = existingPositions.find(
      (p) =>
        p.position_name &&
        p.position_name.toLowerCase() === trimmedValue.toLowerCase() &&
        (!currentPosition || p.position_id !== currentPosition.position_id)
    );

    if (duplicate) {
      return "Position name already exists.";
    }
  }

  return null;
};

/**
 * Validates email address
 * @param {string} value - The email address to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateEmail = (value) => {
  // Required validation
  if (!value || value.trim() === "") {
    return "Email address is required.";
  }

  // No leading/trailing spaces validation
  if (value !== value.trim()) {
    return "Email address cannot start or end with a space.";
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return "Please enter a valid email address.";
  }

  // Length validation (max 255 characters)
  if (value.trim().length > 255) {
    return "Email address must not exceed 255 characters.";
  }

  return null;
};

/**
 * Validates password for login
 * @param {string} value - The password to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateLoginPassword = (value) => {
  // Required validation
  if (!value || !value.trim()) {
    return "Password is required.";
  }

  // No spaces validation
  if (value.includes(" ")) {
    return "Password cannot contain spaces.";
  }

  // Minimum length validation
  if (value.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  // Maximum length validation
  if (value.length > 16) {
    return "Password must not exceed 16 characters.";
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(value)) {
    return "Password must contain at least one lowercase letter.";
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter.";
  }

  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    return "Password must contain at least one special character.";
  }

  return null;
};

/**
 * Validates a single form field based on field name and value
 * @param {string} fieldName - The name of the field to validate
 * @param {*} value - The value to validate
 * @param {Object} formData - Optional: The entire form data object for context-dependent validation
 * @returns {string|null} - Error message or null if valid
 */
export const validateFormField = (fieldName, value, formData = {}) => {
  // Skip validation if field is not part of current form data
  if (!(fieldName in formData)) return null;

  // Handle null, undefined, or empty string
  const isEmpty = value === null || value === undefined || value === "";

  // Required field validations
  const requiredFields = {
    // Company fields
    company_name: "Company name is required",
    registration_no: "Registration number is required",
    email: "Email is required",
    phone_number: "Phone number is required",

    industry_type: "Industry type is required",
    address_line1: "Address line 1 is required",
    phone_extension: "Phone Extension required",
    country: "Country is required",
    company_id: "Company Selection is required",

    // Branch fields
    branch_name: "Branch name is required",

    // Department fields
    department_name: "Department name is required",

    // Employee fields
    first_name: "First name is required",
    address: "Address is required",
    country: "Country is required",
    state: "State is required",
    city: "City is required",

    last_name: "Last name is required",
    personal_email: "Personal email is required",
    personal_phone: "Personal phone is required",
    emp_code: "Employee code is required",
    joining_date: "Joining date is required",
    work_email: "Work email is required",
    basic_salary: "Basic salary is required",
    bank_name: "Bank name is required",
    account_holder_name: "Account holder name is required",
    account_number: "Account number is required",
    ifsc_swift_code: "IFSC/SWIFT code is required",
    pan_tax_id: "PAN/Tax ID is required",
    payment_mode: "Payment mode is required",
    permanent_address_line1: "Permanent address line 1 is required",
    permanent_country: "Permanent country is required",
    permanent_state: "Permanent state is required",
    permanent_city: "Permanent city is required",
    permanent_postal_code: "Permanent postal code is required",
    gender: "Gender is required",
    date_of_birth: "Date of birth is required",
    employment_type: "Employment type is required",
    system_access_role_id: "System access role ID is required",
    // Note: username and password are required only when creating (handled in validateForm)
  };

  // Check if field is required
  if (requiredFields[fieldName] && isEmpty) {
    return requiredFields[fieldName];
  }

  // Skip further validation if value is empty and field is not required
  if (isEmpty && !requiredFields[fieldName]) {
    return null;
  }

  // Email validation
  if (fieldName.includes("email") || fieldName === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value === "string" && !emailRegex.test(value.trim())) {
      return "Please enter a valid email address";
    }
    if (typeof value === "string" && value.trim().length > 255) {
      return "Email address must not exceed 255 characters";
    }
  }

  // Phone number validation (strict numeric, no alphabets)
  if (
    fieldName === "phone_number" ||
    fieldName === "personal_phone" ||
    fieldName === "work_phone"
  ) {
    if (typeof value === "string") {
      if (!/^[0-9]{10}$/.test(value)) {
        return "Phone number must be exactly 10 digits";
      }
    }
  }

  if (fieldName === "phone_prefix") {
    if (!/^[0-9]{1,4}$/.test(value)) {
      return "Prefix must be 1–4 digits";
    }
  }

  if (fieldName === "short_code") {
    if (typeof value === "string") {
      if (!/^[A-Za-z]{1,3}$/.test(value)) {
        return "Short code must be 1 to 3 letters (A-Z)";
      }
    }
  }

  // Phone number validation (only for actual phone number fields)
  if (
    fieldName === "phone_number" ||
    fieldName === "personal_phone" ||
    fieldName === "work_phone"
  ) {
    if (typeof value === "string") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value.replace(/\D/g, ""))) {
        return "Phone number must be 10 digits";
      }
    }
  }

  // Username validation
  if (fieldName === "username" && value) {
    const trimmedValue = value.trim();
    if (trimmedValue.length < 3)
      return "Username must be at least 3 characters long";
    if (trimmedValue.length > 50)
      return "Username must not exceed 50 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedValue))
      return "Username can only contain letters, numbers, and underscores";
  }

  // Password validation
  if (fieldName === "password" && value) {
    if (value.length < 8) return "Password must be at least 8 characters long";
    if (value.length > 128) return "Password must not exceed 128 characters";
    if (!/[A-Z]/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/\d/.test(value)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
      return "Password must contain at least one special character";
  }

  // Website URL validation
  if (fieldName === "website_url" && value) {
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (
      typeof value === "string" &&
      value.trim() &&
      !urlRegex.test(value.trim())
    ) {
      return "Please enter a valid website URL";
    }
  }

  // File validation
  if (
    fieldName === "logo" ||
    fieldName.includes("_photo") ||
    fieldName.includes("_file")
  ) {
    if (value instanceof File) {
      const maxSize = 2 * 1024 * 1024;
      if (value.size > maxSize) return "File size must be less than 2MB";
      if (
        (fieldName === "logo" || fieldName.includes("_photo")) &&
        !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          value.type
        )
      ) {
        return "File must be an image (JPEG, JPG, PNG, or GIF)";
      }
    }
  }

  // Text validations
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (fieldName === "company_name") {
      // Required
      if (!trimmedValue) {
        return "Company name is required";
      }

      // Length check
      if (trimmedValue.length < 2 || trimmedValue.length > 100) {
        return "Company name must be between 2 and 100 characters";
      }

      // Disallow underscore explicitly
      if (/_/.test(trimmedValue)) {
        return "Company name cannot contain underscores (_)";
      }

      // Must contain at least one letter (not only numbers)
      if (!/[a-zA-Z]/.test(trimmedValue)) {
        return "Company name must contain at least one letter";
      }

      // Allowed characters only
      // Letters, numbers, spaces, . & ' -
      if (!/^[A-Za-z0-9 .&'-]+$/.test(trimmedValue)) {
        return "Company name can only contain letters, numbers";
      }
    }

    if (fieldName === "branch_name") {
      if (trimmedValue.length < 3)
        return "Branch name must be at least 2 characters";
      if (trimmedValue.length > 100)
        return "Branch name must not exceed 100 characters";
    }

    if (fieldName === "department_name") {
      if (trimmedValue.length < 2)
        return "Department name must be at least 2 characters";
      if (trimmedValue.length > 100)
        return "Department name must not exceed 100 characters";
    }

    if (fieldName === "first_name" || fieldName === "last_name") {
      if (trimmedValue.length < 2)
        return `${fieldName.replace("_", " ")} must be at least 2 characters`;
      if (trimmedValue.length > 50)
        return `${fieldName.replace("_", " ")} must not exceed 50 characters`;
    }

    if (fieldName === "registration_no") {
      if (trimmedValue.length < 3)
        return "Registration number must be at least 3 characters";
      if (trimmedValue.length > 50)
        return "Registration number must not exceed 50 characters";
    }

    if (fieldName.includes("address_line1")) {
      if (trimmedValue.length < 5)
        return "Address line 1 must be at least 5 characters";
      if (trimmedValue.length > 200)
        return "Address line 1 must not exceed 200 characters";
    }
  }

  // Number validations
  if (
    typeof value === "number" ||
    (typeof value === "string" && !isNaN(value) && value !== "")
  ) {
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (
      ["basic_salary", "allowances", "bonuses", "deductions"].includes(
        fieldName
      )
    ) {
      if (numValue < 0) return "Amount cannot be negative";
      if (fieldName === "basic_salary" && numValue === 0)
        return "Basic salary must be greater than 0";
    }
  }

  // Date validations
  if (
    fieldName.includes("date") ||
    fieldName === "joining_date" ||
    fieldName === "date_of_birth"
  ) {
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) return "Please enter a valid date";
      if (fieldName === "date_of_birth" && date > new Date())
        return "Date of birth cannot be in the future";
      if (fieldName === "joining_date") {
        const fiftyYearsAgo = new Date();
        fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
        if (date < fiftyYearsAgo)
          return "Joining date cannot be more than 50 years ago";
      }
    }
  }

  return null;
};

/**
 * Validates an entire form object
 * @param {Object} formData - The form data object to validate
 * @param {boolean} isEdit - Optional: Whether this is an edit operation (some fields may not be required on edit)
 * @returns {Object} - Object with isValid boolean and errors object
 */
export const validateForm = (formData, isEdit = false) => {
  const errors = {};

  // Dynamically pick fields based on what exists in formData
  const fieldsToValidate = Object.keys(formData);

  fieldsToValidate.forEach((fieldName) => {
    const value = formData[fieldName];
    const error = validateFormField(fieldName, value, formData);

    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
