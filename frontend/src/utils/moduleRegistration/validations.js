// Validation utilities for Module Registration Form

export const validateModuleField = (name, value) => {
  switch (name) {
    case 'module_key':
      if (!value?.trim()) return 'Module key is required';
      if (value.trim().length < 2) return 'Module key must be at least 2 characters';
      if (value.trim().length > 100) return 'Module key must be less than 100 characters';
      if (!/^[a-z0-9_-]+$/.test(value.trim())) {
        return 'Module key can only contain lowercase letters, numbers, underscores, and hyphens';
      }
      return '';

    case 'name':
      if (!value?.trim()) return 'Module name is required';
      if (value.trim().length < 2) return 'Module name must be at least 2 characters';
      if (value.trim().length > 100) return 'Module name must be less than 100 characters';
      return '';

    case 'description':
      if (value?.trim().length > 500) return 'Description must be less than 500 characters';
      return '';

    default:
      return '';
  }
};

export const validatePermissionField = (field, value) => {
  switch (field) {
    case 'permission_key':
      if (!value?.trim()) return 'Permission key is required';
      if (value.trim().length < 2) return 'Permission key must be at least 2 characters';
      if (value.trim().length > 100) return 'Permission key must be less than 100 characters';
      if (!/^[a-z0-9._,\-\s]+$/.test(value.trim())) {
        return 'Permission key can only contain lowercase letters, numbers, underscores, and hyphens';
      }
      return '';

    case 'permission_description':
      if (value?.length > 500) return 'Permission description must be less than 500 characters';
      return '';

    default:
      return '';
  }
};

export const validateFormField = (fieldName, value, formData = {}) => {
  // Handle null, undefined, or empty string
  const isEmpty = value === null || value === undefined || value === '';
  
  // Required field validations
  const requiredFields = {
    // Company fields
    company_name: 'Company name is required',
    registration_no: 'Registration number is required',
    email: 'Email is required',
    phone_number: 'Phone number is required',
    
    // Branch fields
    branch_name: 'Branch name is required',
    
    // Department fields
    department_name: 'Department name is required',
    
    // Employee fields
    first_name: 'First name is required',
    last_name: 'Last name is required',
    personal_email: 'Personal email is required',
    personal_phone: 'Personal phone is required',
    emp_code: 'Employee code is required',
    joining_date: 'Joining date is required',
    work_email: 'Work email is required',
    basic_salary: 'Basic salary is required',
    bank_name: 'Bank name is required',
    account_holder_name: 'Account holder name is required',
    account_number: 'Account number is required',
    ifsc_swift_code: 'IFSC/SWIFT code is required',
    pan_tax_id: 'PAN/Tax ID is required',
    payment_mode: 'Payment mode is required',
    permanent_address_line1: 'Permanent address line 1 is required',
    permanent_country: 'Permanent country is required',
    permanent_state: 'Permanent state is required',
    permanent_city: 'Permanent city is required',
    permanent_postal_code: 'Permanent postal code is required',
    gender: 'Gender is required',
    date_of_birth: 'Date of birth is required',
    employment_type: 'Employment type is required',
    system_access_role_id: 'System access role ID is required'
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
  if (fieldName.includes('email') || fieldName === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value === 'string' && !emailRegex.test(value.trim())) {
      return 'Please enter a valid email address';
    }
    if (typeof value === 'string' && value.trim().length > 255) {
      return 'Email address must not exceed 255 characters';
    }
  }

  // Phone number validation
  if (fieldName.includes('phone') || fieldName === 'phone_number') {
    if (typeof value === 'string') {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value.replace(/\D/g, ''))) {
        return 'Phone number must be 10 digits';
      }
    }
  }

  // Username validation
  if (fieldName === 'username' && value) {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (trimmedValue.length < 3) {
        return 'Username must be at least 3 characters long';
      }
      if (trimmedValue.length > 50) {
        return 'Username must not exceed 50 characters';
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmedValue)) {
        return 'Username can only contain letters, numbers, and underscores';
      }
    }
  }

  // Password validation
  if (fieldName === 'password' && value) {
    if (typeof value === 'string') {
      if (value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (value.length > 128) {
        return 'Password must not exceed 128 characters';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/\d/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return 'Password must contain at least one special character';
      }
    }
  }

  // Website URL validation
  if (fieldName === 'website_url' && value) {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (typeof value === 'string' && value.trim() && !urlRegex.test(value.trim())) {
      return 'Please enter a valid website URL';
    }
  }

  // Logo/File validation
  if (fieldName === 'logo' || fieldName.includes('_photo') || fieldName.includes('_file')) {
    if (value instanceof File) {
      // Check file size (2MB limit for images)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (value.size > maxSize) {
        return 'File size must be less than 2MB';
      }
      // Check file type for images
      if (fieldName === 'logo' || fieldName.includes('_photo')) {
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(value.type)) {
          return 'File must be an image (JPEG, JPG, PNG, or GIF)';
        }
      }
    }
  }

  // Text length validations
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    
    // Company name
    if (fieldName === 'company_name') {
      if (trimmedValue.length < 2) {
        return 'Company name must be at least 2 characters';
      }
      if (trimmedValue.length > 100) {
        return 'Company name must not exceed 100 characters';
      }
    }
    
    // Branch name
    if (fieldName === 'branch_name') {
      if (trimmedValue.length < 2) {
        return 'Branch name must be at least 2 characters';
      }
      if (trimmedValue.length > 100) {
        return 'Branch name must not exceed 100 characters';
      }
    }
    
    // Department name
    if (fieldName === 'department_name') {
      if (trimmedValue.length < 2) {
        return 'Department name must be at least 2 characters';
      }
      if (trimmedValue.length > 100) {
        return 'Department name must not exceed 100 characters';
      }
    }
    
    // Name fields
    if (fieldName === 'first_name' || fieldName === 'last_name') {
      if (trimmedValue.length < 2) {
        return `${fieldName.replace('_', ' ')} must be at least 2 characters`;
      }
      if (trimmedValue.length > 50) {
        return `${fieldName.replace('_', ' ')} must not exceed 50 characters`;
      }
    }
    
    // Registration number
    if (fieldName === 'registration_no') {
      if (trimmedValue.length < 3) {
        return 'Registration number must be at least 3 characters';
      }
      if (trimmedValue.length > 50) {
        return 'Registration number must not exceed 50 characters';
      }
    }
    
    // Postal code
    if (fieldName.includes('postal_code') || fieldName.includes('zip_code')) {
      if (trimmedValue.length < 4) {
        return 'Postal code must be at least 4 characters';
      }
      if (trimmedValue.length > 10) {
        return 'Postal code must not exceed 10 characters';
      }
    }
    
    // Address fields
    if (fieldName.includes('address_line1')) {
      if (trimmedValue.length < 5) {
        return 'Address line 1 must be at least 5 characters';
      }
      if (trimmedValue.length > 200) {
        return 'Address line 1 must not exceed 200 characters';
      }
    }
  }

  // Number validations
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value) && value !== '')) {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Salary validations
    if (fieldName === 'basic_salary' || fieldName === 'allowances' || fieldName === 'bonuses' || fieldName === 'deductions') {
      if (numValue < 0) {
        return 'Amount cannot be negative';
      }
      if (fieldName === 'basic_salary' && numValue === 0) {
        return 'Basic salary must be greater than 0';
      }
    }
  }

  // Date validations
  if (fieldName.includes('date') || fieldName === 'joining_date' || fieldName === 'date_of_birth') {
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Please enter a valid date';
      }
      // Check if date of birth is not in the future
      if (fieldName === 'date_of_birth' && date > new Date()) {
        return 'Date of birth cannot be in the future';
      }
      // Check if joining date is not too far in the past (e.g., more than 50 years)
      if (fieldName === 'joining_date') {
        const fiftyYearsAgo = new Date();
        fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
        if (date < fiftyYearsAgo) {
          return 'Joining date cannot be more than 50 years ago';
        }
      }
    }
  }

  return null;
};

export const validateForm = (formData, isEdit = false) => {
  const errors = {};
  
  // Validate all fields in formData
  Object.keys(formData).forEach(fieldName => {
    const value = formData[fieldName];
    const error = validateFormField(fieldName, value, formData);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  // Username and password are required only when creating (not editing)
  if (!isEdit) {
    if (!formData.username || !formData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!formData.password || !formData.password.trim()) {
      errors.password = 'Password is required';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFormData = (formData) => {
  const newErrors = {};

  // Validate main module fields
  const moduleKeyError = validateModuleField("module_key", formData.module_key);
  if (moduleKeyError) newErrors.module_key = moduleKeyError;

  const nameError = validateModuleField("name", formData.name);
  if (nameError) newErrors.name = nameError;

  const descError = validateModuleField("description", formData.description);
  if (descError) newErrors.description = descError;

  // Validate permissions
  if (formData.permissions.length === 0) {
    newErrors.permissions = "At least one permission is required";
  }

  formData.permissions.forEach((perm, pIdx) => {
    const permissionTypes = Array.isArray(perm.permission_type)
      ? perm.permission_type
      : [];

    if (!permissionTypes || permissionTypes.length === 0) {
      newErrors[`permission_${pIdx}_type`] =
        "At least one permission type must be selected";
    }

    const keyError = validatePermissionField(
      "permission_key",
      perm.permission_key
    );
    if (keyError) newErrors[`permission_${pIdx}_key`] = keyError;

    const descError = validatePermissionField(
      "permission_description",
      perm.permission_description
    );
    if (descError) newErrors[`permission_${pIdx}_description`] = descError;

    /*
    ---------------------------------------------------
    ❌ ROLE-BASED VALIDATION (COMMENTED OUT AS REQUESTED)
    ---------------------------------------------------
    */

    /*
    if (perm.role_assignments.length === 0) {
      newErrors[`permission_${pIdx}_roles`] =
        "At least one role assignment is required";
    }

    perm.role_assignments.forEach((role, rIdx) => {
      if (!role.role_id) {
        newErrors[`permission_${pIdx}_role_${rIdx}`] = "Role is required";
      }
    });
    */

    /*
    ---------------------------------------------------
    ❌ PERMISSION SCOPE VALIDATION (COMMENTED OUT)
    ---------------------------------------------------
    */

    /*
    perm.scopes.forEach((scope, sIdx) => {
      if (scope.scope_type === "BRANCH" && !scope.branch_id) {
        newErrors[`permission_${pIdx}_scope_${sIdx}_branch`] =
          "Branch is required for BRANCH scope";
      }
      if (scope.scope_type === "DEPARTMENT" && !scope.department_id) {
        newErrors[`permission_${pIdx}_scope_${sIdx}_dept`] =
          "Department is required for DEPARTMENT scope";
      }
      if (scope.scope_type === "EMPLOYEE" && !scope.emp_id) {
        newErrors[`permission_${pIdx}_scope_${sIdx}_emp`] =
          "Employee is required for EMPLOYEE scope";
      }
    });
    */
  });

  return newErrors;
};

