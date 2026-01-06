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

const shiftAPI = {
  getById: async (id) => {
    const backendUrl = import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/api/shifts/${id}`, { method: "GET", credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch shift");
    return await res.json();
  },
  create: async (data) => {
    const backendUrl = import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/api/shifts/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create shift");
    }
    return await res.json();
  },
  update: async (id, data) => {
    const backendUrl = import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/api/shifts/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update shift");
    }
    return await res.json();
  },
};

const ShiftFormModal = ({ isOpen, onClose, shiftId, onSuccess }) => {
  const isEdit = Boolean(shiftId);
  const [formData, setFormData] = useState({
    shift_name: "",
    start_time: "",
    end_time: "",
    break_duration: 0,
    grace_time_minutes: 0,
    status_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen && isEdit && shiftId) fetchShift();
    if (isOpen && !isEdit) resetForm();
  }, [isOpen, shiftId]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setFieldErrors({});
      setError(null);
    }
  }, [isOpen]);

  const fetchShift = async () => {
    try {
      setLoading(true);
      const data = await shiftAPI.getById(shiftId);
      setFormData({
        shift_name: data.shift_name || "",
        start_time: data.start_time || "",
        end_time: data.end_time || "",
        break_duration: data.break_duration || 0,
        grace_time_minutes: data.grace_time_minutes || 0,
        status_id: data.status_id || 1,
      });
    } catch (err) {
      setError(err.message || "Failed to load shift");
      toast.error(err.message || "Failed to load shift");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      shift_name: "",
      start_time: "",
      end_time: "",
      break_duration: 0,
      grace_time_minutes: 0,
      status_id: 1,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.shift_name.trim()) errs.shift_name = "Shift name is required";
    if (!formData.start_time) errs.start_time = "Start time is required";
    if (!formData.end_time) errs.end_time = "End time is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    if (!validate()) {
      toast.error("Please fix the errors");
      return;
    }
    try {
      setLoading(true);
      const submit = {
        shift_name: formData.shift_name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_duration: Number(formData.break_duration || 0),
        grace_time_minutes: Number(formData.grace_time_minutes || 0),
        status_id: Number(formData.status_id || 1),
      };

      if (isEdit) {
        await shiftAPI.update(shiftId, submit);
        toast.success("Shift updated");
      } else {
        await shiftAPI.create(submit);
        toast.success("Shift created");
      }

      onSuccess && onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Save failed");
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
            <h2 className={headerTitle}>{isEdit ? "Edit Shift" : "Create Shift"}</h2>
            <p className={headerSubTitle}>{isEdit ? "Update shift details" : "Add a new shift"}</p>
          </div>
          <button onClick={onClose} className={closeButton} type="button" aria-label="Close">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"><p className={errorText}>{error}</p></div>}

        <form onSubmit={handleSubmit} className={body}>
          <div>
            <label className={fieldLabel}>Shift Name <span className="text-red-500">*</span></label>
            <input name="shift_name" value={formData.shift_name} onChange={handleChange} className={inputClass + (fieldErrors.shift_name ? " border-red-500" : "")} />
            {fieldErrors.shift_name && <p className={errorText}>{fieldErrors.shift_name}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Start Time <span className="text-red-500">*</span></label>
            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className={inputClass + (fieldErrors.start_time ? " border-red-500" : "")} />
            {fieldErrors.start_time && <p className={errorText}>{fieldErrors.start_time}</p>}
          </div>

          <div>
            <label className={fieldLabel}>End Time <span className="text-red-500">*</span></label>
            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className={inputClass + (fieldErrors.end_time ? " border-red-500" : "")} />
            {fieldErrors.end_time && <p className={errorText}>{fieldErrors.end_time}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Break Duration (minutes)</label>
            <input type="number" name="break_duration" value={formData.break_duration} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={fieldLabel}>Grace Time (minutes)</label>
            <input type="number" name="grace_time_minutes" value={formData.grace_time_minutes} onChange={handleChange} className={inputClass} />
          </div>

          {/* <div>
            <label className={fieldLabel}>Status</label>
            <select name="status_id" value={formData.status_id} onChange={handleChange} className={selectClass}>
              <option value={1}>Active</option>
              <option value={3}>Archived</option>
            </select>
          </div> */}
        </form>

        <div className={footer}>
          <button type="button" onClick={onClose} className={buttonSecondary} disabled={loading}>Cancel</button>
          <button type="button" onClick={handleSubmit} className={buttonPrimary} disabled={loading}>{loading ? "Saving..." : isEdit ? "Update Shift" : "Create Shift"}</button>
        </div>
      </div>
    </>
  );
};

export default ShiftFormModal;
