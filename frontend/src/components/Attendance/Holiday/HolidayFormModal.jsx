import React, { useState, useEffect } from "react";
import { holidayAPI } from "../../../utils/apiUtils";
import { toast } from "react-hot-toast";
import {
  overlay,
  drawer,
  header,
  headerTitle,
  headerSubTitle,
  closeButton,
  body,
  fieldLabel,
  inputClass,
  selectClass,
  buttonPrimary,
  buttonSecondary,
  footer,
  errorText,
} from "../../../formClasses";

const HolidayFormModal = ({ isOpen, onClose, holidayId = null, onSuccess }) => {
  const isEdit = Boolean(holidayId);
  const [formData, setFormData] = useState({
    holiday_name: "",
    holiday_date: "",
    holiday_type: "Public",
    branch_id: null,
    description: "",
    status_id: 1,
  });

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await holidayAPI.getBranches();
        setBranches([
          { branch_id: null, name: "All Branches" },
          ...branchesData,
        ]);
      } catch (err) {
        console.error("Error loading branches:", err);
        toast.error("Failed to load branches");
      }
    };
    if (isOpen) {
      loadBranches();
    }
  }, [isOpen]);

  // Load holiday for edit
  useEffect(() => {
    if (isEdit && holidayId && isOpen) {
      const loadHoliday = async () => {
        try {
          setLoading(true);
          const holiday = await holidayAPI.getHolidayById(holidayId);
          setFormData({
            holiday_name: holiday.holiday_name || "",
            holiday_date: holiday.holiday_date
              ? holiday.holiday_date.split("T")[0]
              : "",
            holiday_type: holiday.holiday_type || "Public",
            branch_id: holiday.branch_id || null,
            description: holiday.description || "",
            status_id: holiday.status_id !== undefined ? holiday.status_id : 1,
          });
        } catch (err) {
          const errorMessage = err?.response?.data?.detail || err?.message || "Failed to load holiday data";
          setError(errorMessage);
          toast.error(errorMessage);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadHoliday();
    }
  }, [holidayId, isEdit, isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        holiday_name: "",
        holiday_date: "",
        holiday_type: "Public",
        branch_id: null,
        description: "",
        status_id: 1,
      });
      setFieldErrors({});
      setHasSubmitted(false);
      setError(null);
    }
  }, [isOpen]);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleBranchChange = (e) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value);
    setFormData((prev) => ({ ...prev, branch_id: value }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Basic validation for holiday fields
    const newErrors = {};
    if (!formData.holiday_name || !formData.holiday_name.trim()) {
      newErrors.holiday_name = "Holiday name is required";
    }
    if (!formData.holiday_date) {
      newErrors.holiday_date = "Holiday date is required";
    }
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    try {
      const formattedData = {
        holiday_name: formData.holiday_name.trim(),
        holiday_date: formData.holiday_date,
        holiday_type: formData.holiday_type,
        branch_id: formData.branch_id,
        description: formData.description.trim(),
        status_id: formData.status_id,
      };

      if (isEdit) {
        await holidayAPI.updateHoliday(holidayId, formattedData);
      } else {
        await holidayAPI.createHoliday(formattedData);
      }

      toast.success(
        isEdit ? "Holiday updated successfully" : "Holiday created successfully"
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to save holiday";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={overlay}>
      <div className={drawer}>
        {/* Header */}
        <div className={header}>
          <div>
            <h2 className={headerTitle}>
              {isEdit ? "Edit Holiday" : "Create Holiday"}
            </h2>
            <p className={headerSubTitle}>Manage holiday details</p>
          </div>
          <button onClick={onClose} className={closeButton}>
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className={body}>
          {error && <p className={errorText}>{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Holiday Name */}
            <div>
              <label className={fieldLabel}>Holiday Name *</label>
              <input
                type="text"
                name="holiday_name"
                value={formData.holiday_name}
                onChange={handleChange}
                className={
                  inputClass +
                  (fieldErrors.holiday_name ? " border-red-500" : "")
                }
              />
              {fieldErrors.holiday_name && (
                <p className={errorText}>{fieldErrors.holiday_name}</p>
              )}
            </div>

            {/* Holiday Date and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>Holiday Date *</label>
                <input
                  type="date"
                  name="holiday_date"
                  value={formData.holiday_date}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.holiday_date ? " border-red-500" : "")
                  }
                />
                {fieldErrors.holiday_date && (
                  <p className={errorText}>{fieldErrors.holiday_date}</p>
                )}
              </div>

              <div>
                <label className={fieldLabel}>Holiday Type *</label>
                <select
                  name="holiday_type"
                  value={formData.holiday_type}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="Public">Public Holiday</option>
                  <option value="Restricted">Restricted Holiday</option>
                </select>
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className={fieldLabel}>Applicable Branch</label>
              <select
                name="branch_id"
                value={formData.branch_id || ""}
                onChange={handleBranchChange}
                className={selectClass}
              >
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id || ""}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select "All Branches" for company-wide holidays
              </p>
            </div>

            {/* Description */}
            <div>
              <label className={fieldLabel}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={
                  inputClass +
                  (fieldErrors.description ? " border-red-500" : "")
                }
                placeholder="Enter holiday description"
              />
              {fieldErrors.description && (
                <p className={errorText}>{fieldErrors.description}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="status_id"
                name="status_id"
                checked={formData.status_id === 1}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    status_id: e.target.checked ? 1 : 2,
                  }));
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="status_id" className="text-sm text-gray-700">
                Active (Holiday will be applicable)
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={footer}>
          <button
            type="button"
            onClick={onClose}
            className={buttonSecondary}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={
              buttonPrimary +
              " disabled:opacity-50 disabled:cursor-not-allowed"
            }
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Holiday"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayFormModal;
