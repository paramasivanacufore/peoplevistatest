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

const positionAPI = {
  getById: async (id) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/positions/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching position:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/positions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating position:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const backendUrl =
        import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/positions/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update position");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating position:", error);
      throw error;
    }
  },
};

const PositionFormModal = ({ isOpen, onClose, positionId, onSuccess }) => {
  const isEdit = Boolean(positionId);
  const [formData, setFormData] = useState({ position_name: "", status_id: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && isEdit && positionId) {
      fetchPositionData();
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, positionId, isEdit]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setFieldErrors({});
      setHasSubmitted(false);
      setError(null);
    }
  }, [isOpen]);

  const fetchPositionData = async () => {
    try {
      setLoading(true);
      const data = await positionAPI.getById(positionId);
      setFormData({
        position_name: data.position_name || "",
        status_id: data.status_id || 1,
      });
    } catch (err) {
      setError("Failed to load position data");
      toast.error("Error loading position data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ position_name: "", status_id: 1 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = {};
    if (name === "position_name" && !value.trim()) {
      newErrors.position_name = "Position name is required";
    }
    setFieldErrors((prev) => ({ ...prev, ...newErrors }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.position_name.trim())
      newErrors.position_name = "Position name is required";
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setHasSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        position_name: formData.position_name,
        status_id: formData.status_id,
      };

      if (isEdit) {
        await positionAPI.update(positionId, submitData);
        toast.success("Position updated successfully");
      } else {
        await positionAPI.create(submitData);
        toast.success("Position created successfully");
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
      <div className={overlay} onClick={onClose} />

      <div className={drawer}>
        <div className={header}>
          <div>
            <h2 className={headerTitle}>
              {isEdit ? "Edit Position" : "Create New Position"}
            </h2>
            <p className={headerSubTitle}>
              {isEdit
                ? "Update position details"
                : "Add a new position to the system"}
            </p>
          </div>
          <button
            onClick={onClose}
            className={closeButton}
            type="button"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-600"
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

        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className={errorText}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={body}>
          <div>
            <label className={fieldLabel}>
              Position Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="position_name"
              value={formData.position_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter position name"
              className={`${inputClass} ${
                fieldErrors.position_name
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              required
            />
            {fieldErrors.position_name && (
              <p className={errorText}>{fieldErrors.position_name}</p>
            )}
          </div>

          {/* <div>
            <label className={fieldLabel}>Status <span className="text-red-500">*</span></label>
            <select name="status_id" value={formData.status_id} onChange={handleChange} className={selectClass} required>
              <option value="1">Active</option>
              <option value="3">Archived</option>
            </select>
          </div> */}
        </form>

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
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Position"
              : "Create Position"}
          </button>
        </div>
      </div>
    </>
  );
};

export default PositionFormModal;
