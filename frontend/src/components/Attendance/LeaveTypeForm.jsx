import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import {
  overlay,
  drawer,
  header,
  headerTitle,
  headerSubTitle,
  closeButton,
  progressBarOuter,
  progressBarInner,
  body,
  sectionTitle,
  fieldLabel,
  inputClass,
  footer,
  buttonSecondary,
  buttonPrimary,
  errorText,
} from '../../formClasses';
import { Input, Textarea } from '../../components/Common/Formhandler/FormComponents';
import { leaveTypeAPI, formatLeaveTypeForAPI } from '../../utils/leaveType/apiUtils';
import { validateLeaveTypeName, validateLeaveTypeDescription } from '../../utils/validation/validations';

const LeaveTypeForm = ({ id, onClose }) => {
  const [formData, setFormData] = useState({
    leave_type_name: '',
    description: '',
    is_active: false,  // Default to false (unchecked) - inactive
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingLeaveTypes, setExistingLeaveTypes] = useState([]);

  /* ---------------- LOAD STATIC DATA ---------------- */
  useEffect(() => {
    const loadExistingLeaveTypes = async () => {
      try {
        const response = await leaveTypeAPI.getAllLeaveTypes();
        setExistingLeaveTypes(response.leave_types || response || []);
      } catch (error) {
        console.error('Error loading existing leave types:', error);
        toast.error('Failed to load leave types');
      }
    };
    loadExistingLeaveTypes();
  }, []);

  /* ---------------- LOAD LEAVE TYPE (EDIT) ---------------- */
  useEffect(() => {
    if (!id) return;
    const loadLeaveType = async () => {
      try {
        const leaveType = await leaveTypeAPI.getLeaveTypeById(id);
        if (leaveType) {
          setFormData({
            leave_type_name: leaveType.leave_type_name || '',
            description: leaveType.description || '',
            is_active: leaveType.is_active !== undefined ? leaveType.is_active : (leaveType.status_id === 1),  // Convert status_id to is_active
          });
        }
      } catch (error) {
        console.error('Error loading leave type:', error);
        toast.error('Failed to load leave type');
      }
    };
    loadLeaveType();
  }, [id]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === 'checkbox' ? checked : value;

    setFormData((p) => ({ ...p, [name]: processedValue }));
    setFieldErrors((p) => ({ ...p, [name]: null }));

    // Real-time validation
    if (name === 'leave_type_name') {
      const error = validateLeaveTypeName(value, existingLeaveTypes, id ? { leave_type_id: id } : null);
      if (error) {
        setFieldErrors((p) => ({ ...p, [name]: error }));
      }
    } else if (name === 'description') {
      const error = validateLeaveTypeDescription(value);
      if (error) {
        setFieldErrors((p) => ({ ...p, [name]: error }));
      }
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const errors = {};

    const nameError = validateLeaveTypeName(formData.leave_type_name, existingLeaveTypes, id ? { leave_type_id: id } : null);
    if (nameError) {
      errors.leave_type_name = nameError;
    }

    const descError = validateLeaveTypeDescription(formData.description);
    if (descError) {
      errors.description = descError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill all mandatory fields correctly.');
      return;
    }

    setLoading(true);
    try {
      const formattedData = formatLeaveTypeForAPI(formData);

      if (id) {
        await leaveTypeAPI.updateLeaveType(id, formattedData);
        toast.success('Leave type updated successfully');
      } else {
        await leaveTypeAPI.createLeaveType(formattedData);
        toast.success('Leave type created successfully');
      }
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save leave type';
      
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        setFieldErrors((p) => ({ ...p, leave_type_name: 'Leave type name already exists.' }));
        toast.error('Leave type name already exists');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={overlay} />
      <div className={drawer} onClick={(e) => e.stopPropagation()}>
        <div className={header}>
          <div>
            <h2 className={headerTitle}>
              {id ? 'Edit Leave Type' : 'Create Leave Type'}
            </h2>
            <p className={headerSubTitle}>
              Configure leave type settings
            </p>
          </div>
          <button onClick={onClose} className={closeButton}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className={progressBarOuter}>
          <div
            className={progressBarInner}
            style={{ width: '100%' }}
          />
        </div>

        <div className={body}>
          <div className="space-y-4">
            <h3 className={sectionTitle}>Leave Type Details</h3>

            <Input
              label="Leave Type Name *"
              name="leave_type_name"
              value={formData.leave_type_name}
              onChange={handleChange}
              placeholder="Enter leave type name"
              fieldErrors={fieldErrors}
              className={inputClass}
            />

            <Textarea
              label="Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter leave type description"
              rows={4}
              maxLength={500}
              fieldErrors={fieldErrors}
              className={inputClass}
            />
            {formData.description && (
              <div className="text-xs text-gray-500 text-right mt-[-0.5rem]">
                {formData.description.length}/500 characters
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />  
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active (Leave type will be available)
              </label>
            </div>
          </div>

          {/* FOOTER */}
          <div className={footer}>
            <button
              type="button"
              className={buttonSecondary}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveTypeForm;
