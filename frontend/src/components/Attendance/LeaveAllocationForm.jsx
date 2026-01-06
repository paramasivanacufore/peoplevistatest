import React, { useState, useEffect } from 'react';
import { FiX, FiSettings } from 'react-icons/fi';
import { leaveAllocationAPI, formatRuleForAPI, getAllocationPeriodOptions } from '../../utils/leaveAllocation/apiUtils';

const LeaveAllocationForm = ({ isOpen, onClose, rule, onSave }) => {
  const [formData, setFormData] = useState({
    leave_type_id: '',
    allocation_period: 'Yearly',
    days_allocated: '',
    carry_forward: false,
    max_carry_forward_days: '0',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(false);

  // Load leave types on component mount
  useEffect(() => {
    const loadLeaveTypes = async () => {
      setLeaveTypesLoading(true);
      try {
        const leaveTypesData = await leaveAllocationAPI.getLeaveTypes();
        setLeaveTypes(leaveTypesData);
      } catch (error) {
        console.error('Error loading leave types:', error);
        setErrors({ leave_types: 'Failed to load leave types' });
      } finally {
        setLeaveTypesLoading(false);
      }
    };

    if (isOpen) {
      loadLeaveTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (rule) {
      setFormData({
        leave_type_id: rule.leave_type_id?.toString() || '',
        allocation_period: rule.allocation_period || 'Yearly',
        days_allocated: rule.days_allocated?.toString() || '',
        carry_forward: rule.carry_forward || false,
        max_carry_forward_days: rule.max_carry_forward_days?.toString() || '0',
        is_active: rule.is_active !== undefined ? rule.is_active : true
      });
    } else {
      resetForm();
    }
  }, [rule, isOpen]);

  const resetForm = () => {
    setFormData({
      leave_type_id: '',
      allocation_period: 'Yearly',
      days_allocated: '',
      carry_forward: false,
      max_carry_forward_days: '0',
      is_active: true
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === 'checkbox' ? checked : value;
    
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
      case 'leave_type_id':
        if (!value || value === '') {
          return 'Leave type is required';
        }
        return '';
      
      case 'allocation_period':
        if (!value || value === '') {
          return 'Allocation period is required';
        }
        return '';
      
      case 'days_allocated':
        if (!value || value === '') {
          return 'Days allocated is required';
        }
        const days = parseFloat(value);
        if (isNaN(days) || days < 0) {
          return 'Days allocated must be a valid positive number';
        }
        if (days > 365) {
          return 'Days allocated cannot exceed 365 days';
        }
        if (days % 0.5 !== 0) {
          return 'Days allocated must be in increments of 0.5 (half days)';
        }
        return '';
      
      case 'max_carry_forward_days':
        if (currentFormData.carry_forward) {
          if (!value || value === '') {
            return 'Max carry forward days is required when carry forward is enabled';
          }
          const maxDays = parseFloat(value);
          if (isNaN(maxDays) || maxDays < 0) {
            return 'Max carry forward days must be a valid positive number';
          }
          if (maxDays > 365) {
            return 'Max carry forward days cannot exceed 365 days';
          }
          // Check if max carry forward is less than or equal to days allocated
          const allocatedDays = parseFloat(currentFormData.days_allocated);
          if (!isNaN(allocatedDays) && maxDays > allocatedDays) {
            return 'Max carry forward days cannot exceed days allocated';
          }
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
      const formattedData = formatRuleForAPI(formData);
      
      let savedRule;
      if (rule && rule.rule_id) {
        // Update existing rule
        savedRule = await leaveAllocationAPI.updateRule(rule.rule_id, formattedData);
      } else {
        // Create new rule
        savedRule = await leaveAllocationAPI.createRule(formattedData);
      }
      
      console.log('Leave allocation rule saved successfully:', savedRule);
      onSave(savedRule);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving leave allocation rule:', error);
      
      // Parse and improve error message for duplicate rule
      let errorMessage = error.message || 'Failed to save leave allocation rule. Please try again.';
      
      if (errorMessage.includes('Rule already exists')) {
        const leaveTypeName = leaveTypes.find(lt => lt.leave_type_id === parseInt(formData.leave_type_id))?.leave_type_name || 'this leave type';
        errorMessage = `A rule already exists for "${leaveTypeName}" with allocation period "${formData.allocation_period}". Please choose a different combination or edit the existing rule.`;
      }
      
      setErrors({ submit: errorMessage });
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
            <FiSettings className="text-blue-600 w-5 h-5" />
            {rule ? 'Edit Leave Allocation Rule' : 'Add New Leave Allocation Rule'}
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
          {/* Leave Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leave_type_id"
              value={formData.leave_type_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.leave_type_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={leaveTypesLoading}
            >
              <option value="">Select leave type</option>
              {leaveTypesLoading ? (
                <option value="">Loading leave types...</option>
              ) : (
                leaveTypes.map(leaveType => (
                  <option key={leaveType.leave_type_id} value={leaveType.leave_type_id}>
                    {leaveType.leave_type_name}
                  </option>
                ))
              )}
            </select>
            {errors.leave_type_id && (
              <p className="mt-1 text-sm text-red-600">{errors.leave_type_id}</p>
            )}
          </div>

          {/* Allocation Period and Days Allocated Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Allocation Period */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Allocation Period <span className="text-red-500">*</span>
              </label>
              <select
                name="allocation_period"
                value={formData.allocation_period}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.allocation_period ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {getAllocationPeriodOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.allocation_period && (
                <p className="mt-1 text-sm text-red-600">{errors.allocation_period}</p>
              )}
            </div>

            {/* Days Allocated */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Days Allocated <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="days_allocated"
                value={formData.days_allocated}
                onChange={handleChange}
                placeholder="Enter number of days"
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.days_allocated ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.days_allocated && (
                <p className="mt-1 text-sm text-red-600">{errors.days_allocated}</p>
              )}
            </div>
          </div>

          {/* Carry Forward Options */}
          <div className="space-y-3">
            {/* Carry Forward Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="carry_forward"
                name="carry_forward"
                checked={formData.carry_forward}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="carry_forward" className="text-xs font-medium text-gray-700">
                Allow carry forward to next period
              </label>
            </div>

            {/* Max Carry Forward Days */}
            {formData.carry_forward && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Max Carry Forward Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="max_carry_forward_days"
                  value={formData.max_carry_forward_days}
                  onChange={handleChange}
                  placeholder="Enter maximum days to carry forward"
                  min="0"
                  step="0.5"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.max_carry_forward_days ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.max_carry_forward_days && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_carry_forward_days}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of days that can be carried forward to the next period
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-xs font-medium text-gray-700">
              Active (Rule will be applicable)
            </label>
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

export default LeaveAllocationForm;

