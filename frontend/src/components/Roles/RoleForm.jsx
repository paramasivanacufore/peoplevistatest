import React, { useState, useEffect } from 'react';
import { FiX, FiUser } from 'react-icons/fi';
import { moduleRegistrationAPI } from '../../utils/moduleRegistration/apiUtils';
import { toast } from 'react-toastify';

const RoleForm = ({ isOpen, onClose, role, onSave }) => {
  const [formData, setFormData] = useState({
    role_name: '',
    role_level: 1,
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingRoles, setExistingRoles] = useState([]);

  // Load existing roles for uniqueness check
  useEffect(() => {
    const loadExistingRoles = async () => {
      try {
        const rolesData = await moduleRegistrationAPI.getAllRoles();
        setExistingRoles(rolesData || []);
      } catch (error) {
        console.error('Error loading existing roles:', error);
      }
    };

    if (isOpen) {
      loadExistingRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (role) {
      setFormData({
        role_name: role.role_name || '',
        role_level: role.role_level || 1,
        description: role.description || ''
      });
    } else {
      resetForm();
    }
  }, [role, isOpen]);

  const resetForm = () => {
    setFormData({
      role_name: '',
      role_level: 1,
      description: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const processedValue = name === 'role_level' ? parseInt(value) || 1 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Real-time validation
    const fieldError = validateField(name, processedValue);
    setErrors(prev => ({ 
      ...prev, 
      [name]: fieldError || '',
      submit: '' 
    }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'role_name':
        if (!value || !value.trim()) {
          return 'Role name is required';
        }
        if (value.trim().length < 2) {
          return 'Role name must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'Role name must be less than 50 characters';
        }
        // Check for invalid characters
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(value.trim())) {
          return 'Role name can only contain letters, numbers, spaces, hyphens, and underscores';
        }
        // Check for duplicate
        const duplicateRole = existingRoles.find(
          r => r.role_name.toLowerCase() === value.trim().toLowerCase() &&
               (!role || r.role_id !== role.role_id)
        );
        if (duplicateRole) {
          return 'Role name already exists';
        }
        return '';
      
      case 'role_level':
        const level = parseInt(value);
        if (isNaN(level) || level < 1 || level > 10) {
          return 'Role level must be between 1 and 10';
        }
        return '';
      
      case 'description':
        if (value && value.length > 500) {
          return 'Description must be less than 500 characters';
        }
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate role name
    if (!formData.role_name.trim()) {
      newErrors.role_name = 'Role name is required';
    } else if (formData.role_name.trim().length < 2) {
      newErrors.role_name = 'Role name must be at least 2 characters';
    } else if (formData.role_name.trim().length > 50) {
      newErrors.role_name = 'Role name must be less than 50 characters';
    } else {
      // Check for duplicate role name (excluding current role if editing)
      const duplicateRole = existingRoles.find(
        r => r.role_name.toLowerCase() === formData.role_name.trim().toLowerCase() &&
             (!role || r.role_id !== role.role_id)
      );
      if (duplicateRole) {
        newErrors.role_name = 'Role name already exists';
      }
    }

    // Validate role level
    if (!formData.role_level || formData.role_level < 1 || formData.role_level > 10) {
      newErrors.role_level = 'Role level must be between 1 and 10';
    }

    // Description is optional, but validate length if provided
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
      const roleData = {
        role_name: formData.role_name.trim(),
        role_level: formData.role_level,
        description: formData.description.trim() || null
      };

      let result;
      if (role && role.role_id) {
        // Update existing role
        result = await moduleRegistrationAPI.updateRole(role.role_id, roleData);
        toast.success(result.message || 'Role updated successfully!');
      } else {
        // Create new role
        result = await moduleRegistrationAPI.createRole(roleData);
        toast.success(result.message || 'Role created successfully!');
      }
      
      resetForm();
      onClose();
      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error('Error saving role:', error);
      
      // Handle API validation errors
      if (error.message && error.message.includes('already exists')) {
        setErrors({ 
          submit: '',
          role_name: 'Role name already exists.'
        });
      } else {
        setErrors(prev => ({ 
          ...prev, 
          submit: error.message || `Failed to ${role && role.role_id ? 'update' : 'create'} role. Please try again.` 
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
            <FiUser className="text-blue-600 w-5 h-5" />
            {role ? 'Edit Role' : 'Add New Role'}
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
          {/* Role Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              placeholder="e.g., Manager, HR, Employee"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.role_name && (
              <p className="mt-1 text-sm text-red-600">{errors.role_name}</p>
            )}
          </div>

          {/* Role Level */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Role Level <span className="text-red-500">*</span>
              <span className="text-gray-500 font-normal ml-2">(1 = Highest, 10 = Lowest)</span>
            </label>
            <input
              type="number"
              name="role_level"
              value={formData.role_level}
              onChange={handleChange}
              min="1"
              max="10"
              placeholder="Enter role level (1-10)"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role_level ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.role_level && (
              <p className="mt-1 text-sm text-red-600">{errors.role_level}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers indicate higher authority. For example: Super Admin = 1, Admin = 2, Manager = 3, etc.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter role description (optional)"
              rows={4}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
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
                  {role ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                role ? 'Update Role' : 'Create Role'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;

