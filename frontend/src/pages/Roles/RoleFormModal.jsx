import React, { useState, useEffect } from "react";
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
} from "../../formClasses";

const roleAPI = {
  getById: async (roleId) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/roles/${roleId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch role");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  },

  checkRoleLevelExists: async (roleLevel, excludeRoleId = null) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const queryParams = excludeRoleId
        ? `?exclude_role_id=${excludeRoleId}`
        : "";
      const response = await fetch(
        `${backendUrl}/api/roles/check-level/${roleLevel}${queryParams}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check role level");
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking role level:", error);
      throw error;
    }
  },

  create: async (formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/roles/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create role");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },

  update: async (roleId, formData) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/roles/${roleId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update role");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  },
};

const RoleFormModal = ({ isOpen, onClose, roleId, onSuccess }) => {
  const isEdit = Boolean(roleId);
  const [formData, setFormData] = useState({
    role_name: "",
    role_level: "",
    description: "",
    status_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingRoleLevel, setCheckingRoleLevel] = useState(false);

  // Fetch role data if editing
  useEffect(() => {
    if (isOpen && isEdit && roleId) {
      fetchRoleData();
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, roleId, isEdit]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setFieldErrors({});
      setHasSubmitted(false);
      setError(null);
    }
  }, [isOpen]);

  const fetchRoleData = async () => {
    try {
      setLoading(true);
      const data = await roleAPI.getById(roleId);
      setFormData({
        role_name: data.role_name || "",
        role_level: data.role_level || "",
        description: data.description || "",
        status_id: data.status_id || 1,
      });
    } catch (err) {
      setError("Failed to load role data");
      toast.error("Error loading role data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      role_name: "",
      role_level: "",
      description: "",
      status_id: 1,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error on field change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;

    // Simple validation
    const newErrors = {};
    if (name === "role_name" && !value.trim()) {
      newErrors.role_name = "Role name is required";
    }
    if (name === "role_level" && !value) {
      newErrors.role_level = "Role level is required";
    }
    if (name === "role_level" && value && isNaN(value)) {
      newErrors.role_level = "Role level must be a number";
    }

    // Check if role level already exists
    if (name === "role_level" && value && !isNaN(value)) {
      try {
        setCheckingRoleLevel(true);
        const exists = await roleAPI.checkRoleLevelExists(
          Number(value),
          isEdit ? roleId : null
        );
        if (exists) {
          newErrors.role_level = "This role level already exists";
        }
      } catch (err) {
        console.error("Error checking role level:", err);
      } finally {
        setCheckingRoleLevel(false);
      }
    }

    setFieldErrors((prev) => ({ ...prev, ...newErrors }));
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.role_name.trim()) {
      newErrors.role_name = "Role name is required";
    }
    if (!formData.role_level) {
      newErrors.role_level = "Role level is required";
    }
    if (formData.role_level && isNaN(formData.role_level)) {
      newErrors.role_level = "Role level must be a number";
    }

    // Check if role level already exists
    if (formData.role_level && !isNaN(formData.role_level)) {
      try {
        const exists = await roleAPI.checkRoleLevelExists(
          Number(formData.role_level),
          isEdit ? roleId : null
        );
        if (exists) {
          newErrors.role_level = "This role level already exists";
        }
      } catch (err) {
        console.error("Error checking role level:", err);
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setHasSubmitted(true);

    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        role_name: formData.role_name,
        role_level: Number(formData.role_level),
        description: formData.description,
        status_id: formData.status_id,
      };

      if (isEdit) {
        await roleAPI.update(roleId, submitData);
        toast.success("Role updated successfully");
      } else {
        await roleAPI.create(submitData);
        toast.success("Role created successfully");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={overlay} onClick={onClose} />

      {/* Drawer */}
      <div className={drawer}>
        {/* Header */}
        <div className={header}>
          <div>
            <h2 className={headerTitle}>
              {isEdit ? "Edit Role" : "Create New Role"}
            </h2>
            <p className={headerSubTitle}>
              {isEdit ? "Update role details" : "Add a new role to the system"}
            </p>
          </div>
          <button
            onClick={onClose}
            className={closeButton}
            type="button"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-600 transition-colors duration-200 group-hover:text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className={errorText}>{error}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={body}>
          {/* Role Name */}
          <div>
            <label className={fieldLabel}>
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter role name"
              className={`${inputClass} ${
                fieldErrors.role_name
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              required
            />
            {fieldErrors.role_name && (
              <p className={errorText}>{fieldErrors.role_name}</p>
            )}
          </div>

          {/* Role Level */}
          <div>
            <label className={fieldLabel}>
              Role Level <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="role_level"
                value={formData.role_level}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter role level (numeric)"
                className={`${inputClass} ${
                  fieldErrors.role_level
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
                required
              />
              {checkingRoleLevel && (
                <span className="absolute right-3 top-3 text-gray-500 text-sm">
                  Checking...
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Higher number = higher privilege level
            </p>
            {fieldErrors.role_level && (
              <p className={errorText}>{fieldErrors.role_level}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={fieldLabel}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter role description (optional)"
              rows="4"
              className={inputClass}
            />
          </div>

          {/* Status
          <div>
            <label className={fieldLabel}>
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status_id"
              value={formData.status_id}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="1">Active</option>
              <option value="3">Archived</option>
            </select>
          </div> */}
        </form>

        {/* Footer */}
        <div className={footer}>
          <button
            type="button"
            onClick={onClose}
            className={buttonSecondary}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={buttonPrimary}
          >
            {loading ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
          </button>
        </div>
      </div>
    </>
  );
};

export default RoleFormModal;
