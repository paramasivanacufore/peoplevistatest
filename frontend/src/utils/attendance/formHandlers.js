/**
 * Form handler utilities for attendance module
 * Used for leave requests, regularization, and other attendance forms
 */

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 * @param {Function} onSubmit - Submit handler function
 */
export const handleFormSubmit = (event, onSubmit) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  onSubmit(data);
};

/**
 * Handle input change
 * @param {Function} setState - State setter function
 * @param {string} field - Field name
 * @returns {Function} - Change handler
 */
export const handleInputChange = (setState, field) => {
  return (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    
    setState(prev => ({
      ...prev,
      [field]: value
    }));
  };
};

/**
 * Validate attendance form fields
 * @param {object} fields - Form fields object
 * @param {object} validationRules - Validation rules
 * @returns {object} - Validation errors
 */
export const validateForm = (fields, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = fields[field];
    
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = rules.message || `${field} is required`;
    }
    
    if (rules.minLength && value && value.length < rules.minLength) {
      errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`;
    }
    
    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors[field] = rules.message || `${field} must be at most ${rules.maxLength} characters`;
    }
    
    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} format is invalid`;
    }
    
    // Date validation
    if (rules.dateRange && value) {
      const date = new Date(value);
      if (rules.dateRange.min && date < new Date(rules.dateRange.min)) {
        errors[field] = rules.message || `${field} must be after ${rules.dateRange.min}`;
      }
      if (rules.dateRange.max && date > new Date(rules.dateRange.max)) {
        errors[field] = rules.message || `${field} must be before ${rules.dateRange.max}`;
      }
    }
  });
  
  return errors;
};

/**
 * Validate date range (for leave requests)
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string|null} - Error message or null
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return null;
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) {
    return 'End date must be after start date';
  }
  
  return null;
};

