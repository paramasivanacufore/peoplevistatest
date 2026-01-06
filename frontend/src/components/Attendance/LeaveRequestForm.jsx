import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar } from 'react-icons/fi';
import { leaveRequestAPI, formatLeaveRequestForAPI } from '../../utils/leaveRequest/apiUtils';
import { leaveTypeAPI } from '../../utils/leaveType/apiUtils';
import { useAuth } from '../../context/AuthContext';

const LeaveRequestForm = ({ isOpen, onClose, leaveRequest, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '',
    requested_to: '',
    start_date: '',
    end_date: '',
    request_date: new Date().toISOString().split('T')[0],
    comments: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]); // Placeholder - will need employees API
  const [loadingData, setLoadingData] = useState(true);

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingData(true);
      try {
        // Load leave types
        const leaveTypesResponse = await leaveTypeAPI.getAllLeaveTypes({ activeOnly: true });
        setLeaveTypes(leaveTypesResponse.leave_types || []);
        
        // TODO: Load employees from API when available
        // For now, set current user as default employee
        if (user && user.employee_id) {
          setFormData(prev => ({
            ...prev,
            employee_id: user.employee_id
          }));
        }
        
        // Placeholder employees - replace with actual API call
        // setEmployees(await employeesAPI.getAllEmployees());
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        employee_id: leaveRequest.employee_id || '',
        leave_type_id: leaveRequest.leave_type_id || '',
        requested_to: leaveRequest.requested_to || '',
        start_date: leaveRequest.start_date || '',
        end_date: leaveRequest.end_date || '',
        request_date: leaveRequest.request_date || new Date().toISOString().split('T')[0],
        comments: leaveRequest.comments || ''
      });
    } else {
      resetForm();
    }
  }, [leaveRequest, isOpen]);

  const resetForm = () => {
    setFormData({
      employee_id: user?.employee_id || '',
      leave_type_id: '',
      requested_to: '',
      start_date: '',
      end_date: '',
      request_date: new Date().toISOString().split('T')[0],
      comments: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Validate dates
    if (name === 'start_date' || name === 'end_date') {
      validateDates();
    }
  };

  const validateDates = () => {
    const newErrors = { ...errors };
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after or equal to start date';
      } else {
        delete newErrors.end_date;
      }
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }
    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Leave type is required';
    }
    if (!formData.requested_to) {
      newErrors.requested_to = 'Requested to (Manager/HR) is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after or equal to start date';
      }
    }
    if (!formData.request_date) {
      newErrors.request_date = 'Request date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      const formattedData = formatLeaveRequestForAPI(formData);
      
      let savedLeaveRequest;
      if (leaveRequest && leaveRequest.leave_id) {
        // Update existing leave request
        savedLeaveRequest = await leaveRequestAPI.updateLeaveRequest(leaveRequest.leave_id, formattedData);
      } else {
        // Create new leave request
        savedLeaveRequest = await leaveRequestAPI.createLeaveRequest(formattedData);
      }
      
      console.log('Leave request saved successfully:', savedLeaveRequest);
      
      resetForm();
      onClose();
      onSave(savedLeaveRequest);
    } catch (error) {
      console.error('Error saving leave request:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Failed to save leave request. Please try again.' 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    resetForm();
  };

  if (!isOpen) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiCalendar className="text-blue-600 w-5 h-5" />
            {leaveRequest ? 'Edit Leave Request' : 'Create Leave Request'}
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
          {/* Employee ID */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              placeholder="Enter employee ID"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employee_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!!leaveRequest} // Disable editing employee for existing requests
            />
            {errors.employee_id && (
              <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">TODO: Replace with employee dropdown when API is available</p>
          </div>

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
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((lt) => (
                <option key={lt.leave_type_id} value={lt.leave_type_id}>
                  {lt.leave_type_name}
                </option>
              ))}
            </select>
            {errors.leave_type_id && (
              <p className="mt-1 text-sm text-red-600">{errors.leave_type_id}</p>
            )}
          </div>

          {/* Requested To */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Requested To (Manager/HR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="requested_to"
              value={formData.requested_to}
              onChange={handleChange}
              placeholder="Enter manager/HR employee ID"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.requested_to ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.requested_to && (
              <p className="mt-1 text-sm text-red-600">{errors.requested_to}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">TODO: Replace with employee dropdown when API is available</p>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
          </div>

          {/* Request Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Request Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="request_date"
              value={formData.request_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.request_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.request_date && (
              <p className="mt-1 text-sm text-red-600">{errors.request_date}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Comments
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={3}
              placeholder="Enter any additional comments..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : leaveRequest ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;


