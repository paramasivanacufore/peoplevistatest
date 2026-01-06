/**
 * Form utility functions for attendance module
 */

/**
 * Reset form to initial values
 * @param {object} initialValues - Initial form values
 * @param {Function} setState - State setter function
 */
export const resetForm = (initialValues, setState) => {
  setState(initialValues);
};

/**
 * Get form data from form element
 * @param {HTMLFormElement} form - Form element
 * @returns {object} - Form data object
 */
export const getFormData = (form) => {
  const formData = new FormData(form);
  return Object.fromEntries(formData);
};

/**
 * Set form values
 * @param {HTMLFormElement} form - Form element
 * @param {object} values - Values to set
 */
export const setFormValues = (form, values) => {
  Object.keys(values).forEach(key => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = values[key];
      } else {
        input.value = values[key];
      }
    }
  });
};

/**
 * Check if form is valid
 * @param {HTMLFormElement} form - Form element
 * @returns {boolean} - True if form is valid
 */
export const isFormValid = (form) => {
  return form.checkValidity();
};

// ==================== DATE UTILITIES FOR ATTENDANCE ====================

/**
 * Format date for form input (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/**
 * Parse date from form input
 * @param {string} dateString - Date string from input
 * @returns {Date|null} - Parsed date or null
 */
export const parseDateFromInput = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format date for display (e.g., "Jan 15, 2025")
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Calculate days between two dates (for leave duration)
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} - Number of days
 */
export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

/**
 * Check if date is a weekend
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if weekend
 */
export const isWeekend = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date
 */
export const getTodayDate = () => {
  return formatDateForInput(new Date());
};

