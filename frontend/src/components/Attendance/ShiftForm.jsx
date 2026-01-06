import React, { useState, useEffect } from 'react';
import { FiX, FiClock } from 'react-icons/fi';
import { shiftAPI, formatShiftForAPI } from '../../utils/shift/apiUtils';

const ShiftForm = ({ isOpen, onClose, shift, onSave }) => {
  const [formData, setFormData] = useState({
    shift_name: '',
    start_time: '',
    end_time: '',
    break_duration: 0,
    grace_time_minutes: 0,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or shift changes
  useEffect(() => {
    if (shift) {
      setFormData({
        shift_name: shift.shift_name || '',
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        break_duration: shift.break_duration || 0,
        grace_time_minutes: shift.grace_time_minutes || 0,
        is_active: shift.is_active !== undefined ? shift.is_active : true
      });
    } else {
      resetForm();
    }
  }, [shift, isOpen]);

  const resetForm = () => {
    setFormData({
      shift_name: '',
      start_time: '',
      end_time: '',
      break_duration: 0,
      grace_time_minutes: 0,
      is_active: true
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === 'checkbox' ? checked : 
                          (type === 'number' ? (value === '' ? '' : parseInt(value) || 0) : value);
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Real-time validation - use updated formData
    const updatedFormData = { ...formData, [name]: processedValue };
    const fieldError = validateField(name, processedValue, updatedFormData);
    setErrors(prev => ({ 
      ...prev, 
      [name]: fieldError || '',
      submit: '' 
    }));
  };

  const validateField = (name, value, currentFormData = formData) => {
    switch (name) {
      case 'shift_name':
        if (!value || !value.trim()) {
          return 'Shift name is required';
        }
        if (value.trim().length < 2) {
          return 'Shift name must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'Shift name must be less than 50 characters';
        }
        return '';
      
      case 'start_time':
        if (!value) {
          return 'Start time is required';
        }
        const endTime = currentFormData.end_time;
        if (endTime && value >= endTime) {
          return 'Start time must be before end time';
        }
        // Check if shift duration is reasonable (at least 4 hours)
        if (endTime) {
          const start = new Date(`2000-01-01T${value}`);
          const end = new Date(`2000-01-01T${endTime}`);
          const diffHours = (end - start) / (1000 * 60 * 60);
          if (diffHours < 4) {
            return 'Shift duration must be at least 4 hours';
          }
        }
        return '';
      
      case 'end_time':
        if (!value) {
          return 'End time is required';
        }
        const startTime = currentFormData.start_time;
        if (startTime && startTime >= value) {
          return 'End time must be after start time';
        }
        // Check if shift duration is reasonable (at least 4 hours)
        if (startTime) {
          const start = new Date(`2000-01-01T${startTime}`);
          const end = new Date(`2000-01-01T${value}`);
          const diffHours = (end - start) / (1000 * 60 * 60);
          if (diffHours < 4) {
            return 'Shift duration must be at least 4 hours';
          }
        }
        return '';
      
      case 'break_duration':
        const breakDuration = parseInt(value);
        if (isNaN(breakDuration) || breakDuration < 0) {
          return 'Break duration cannot be negative';
        }
        if (breakDuration > 480) {
          return 'Break duration cannot exceed 8 hours (480 minutes)';
        }
        return '';
      
      case 'grace_time_minutes':
        const graceTime = parseInt(value);
        if (isNaN(graceTime) || graceTime < 0) {
          return 'Grace time cannot be negative';
        }
        if (graceTime > 120) {
          return 'Grace time cannot exceed 2 hours (120 minutes)';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'is_active') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const formattedData = formatShiftForAPI(formData);
      
      let savedShift;
      if (shift && shift.shift_id) {
        // Update existing shift
        savedShift = await shiftAPI.updateShift(shift.shift_id, formattedData);
      } else {
        // Create new shift
        savedShift = await shiftAPI.createShift(formattedData);
      }
      
      console.log('Shift saved successfully:', savedShift);
      onSave(savedShift);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving shift:', error);
      setErrors({ submit: error.message || 'Failed to save shift. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiClock className="text-blue-600 w-5 h-5" />
            {shift ? 'Edit Shift' : 'Add New Shift'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Shift Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Shift Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shift_name"
              value={formData.shift_name}
              onChange={handleChange}
              placeholder="Enter name of the shift"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.shift_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.shift_name && (
              <p className="mt-1 text-sm text-red-600">{errors.shift_name}</p>
            )}
          </div>

          {/* Time Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.start_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.start_time && (
                <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Break Duration and Grace Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Break Duration */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                name="break_duration"
                value={formData.break_duration}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.break_duration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.break_duration && (
                <p className="mt-1 text-sm text-red-600">{errors.break_duration}</p>
              )}
            </div>

            {/* Grace Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Grace Time (minutes)
              </label>
              <input
                type="number"
                name="grace_time_minutes"
                value={formData.grace_time_minutes}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.grace_time_minutes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.grace_time_minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.grace_time_minutes}</p>
              )}
            </div>
          </div>


          {/* Active Status */}
          <div className="flex items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 text-xs font-medium text-gray-700">
                Active (Shift will be applicable)
              </label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                shift ? 'Update Shift' : 'Create Shift'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftForm;
