import React, { useState, useEffect } from 'react';
import { FiX, FiBriefcase } from 'react-icons/fi';
import { positionAPI, formatPositionForAPI } from '../../utils/position/apiUtils';
import { validatePositionName } from '../../utils/validation/validations';
 
const PositionForm = ({ isOpen, onClose, position, onSave }) => {
  const [formData, setFormData] = useState({
    position_name: '',
    status_id: 1  // 1 = Active, 2 = Inactive
  });
 
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingPositions, setExistingPositions] = useState([]);
 
  // Load existing positions for uniqueness check
  useEffect(() => {
    const loadExistingPositions = async () => {
      try {
        const response = await positionAPI.getAllPositions();
        setExistingPositions(response.positions || []);
      } catch (error) {
        console.error('Error loading existing positions:', error);
      }
    };
 
    if (isOpen) {
      loadExistingPositions();
    }
  }, [isOpen]);
 
  useEffect(() => {
    if (position) {
      setFormData({
        position_name: position.position_name || '',
        status_id: position.status_id !== undefined ? position.status_id : 1
      });
    } else {
      resetForm();
    }
  }, [position, isOpen]);
 
  const resetForm = () => {
    setFormData({
      position_name: '',
      status_id: 1
    });
    setErrors({});
  };
 
  const handleChange = (e) => {
    const { name, value, type } = e.target;
   
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
   
    // Real-time dynamic validation for position name
    if (name === 'position_name') {
      const error = validatePositionName(value, existingPositions, position);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
   
    // Clear submit error when user starts typing after a failed submit
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };
 
  const validateForm = () => {
    const newErrors = {};
 
    // Validate position name
    const nameError = validatePositionName(formData.position_name, existingPositions, position);
    if (nameError) {
      newErrors.position_name = nameError;
    }
 
    // Set errors - this will persist until user fixes them
    setErrors(prev => ({ ...newErrors, submit: prev.submit || '' }));
   
    // Return true only if there are no field errors
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    // Run full validation - errors will persist until fixed
    const isValid = validateForm();
   
    if (!isValid) {
      // Validation failed, errors are set and will persist
      return;
    }
 
    setLoading(true);
   
    // Clear any submit errors before attempting save
    setErrors(prev => ({ ...prev, submit: '' }));
   
    try {
      const formattedData = formatPositionForAPI(formData);
     
      let savedPosition;
      if (position && position.position_id) {
        // Update existing position
        savedPosition = await positionAPI.updatePosition(position.position_id, formattedData);
      } else {
        // Create new position
        savedPosition = await positionAPI.createPosition(formattedData);
      }
     
      console.log('Position saved successfully:', savedPosition);
     
      // Only reset and close if save was successful
      resetForm();
      onClose();
      onSave(savedPosition);
    } catch (error) {
      console.error('Error saving position:', error);
     
      // Handle API validation errors
      if (error.message && error.message.includes('already exists')) {
        setErrors({
          submit: '',
          position_name: 'Position name already exists.'
        });
      } else {
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to save position. Please try again.'
        }));
      }
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
            <FiBriefcase className="text-blue-600 w-5 h-5" />
            {position ? 'Edit Position' : 'Add New Position'}
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
          {/* Position Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Position Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="position_name"
              value={formData.position_name}
              onChange={handleChange}
              placeholder="Enter position name (e.g., Software Engineer)"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.position_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.position_name && (
              <p className="mt-1 text-sm text-red-600">{errors.position_name}</p>
            )}
          </div>
 
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status_id"
              value={formData.status_id}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
            </select>
          </div>
 
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
 
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default PositionForm;