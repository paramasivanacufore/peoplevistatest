import React, { useState, useEffect } from "react";
import { biometricDeviceAPI } from "../../../utils/apiUtils";
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

const BiometricDeviceFormModal = ({
  isOpen,
  onClose,
  deviceId = null,
  onSuccess,
}) => {
  const isEdit = Boolean(deviceId);
  const [formData, setFormData] = useState({
    device_id: "",
    device_ip: "",
    device_serial_number: "",
    device_name: "",
    location: "",
    status_id: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load device for edit
  useEffect(() => {
    if (isEdit && deviceId && isOpen) {
      const loadDevice = async () => {
        try {
          setLoading(true);
          const device = await biometricDeviceAPI.getDeviceById(deviceId);
          setFormData({
            device_id: device.device_id || "",
            device_ip: device.device_ip || "",
            device_serial_number: device.device_serial_number || "",
            device_name: device.device_name || "",
            location: device.location || "",
            status_id:
              device.status_id !== undefined ? device.status_id : 1,
          });
        } catch (err) {
          const errorMessage = err?.response?.data?.detail || err?.message || "Failed to load device data";
          setError(errorMessage);
          toast.error(errorMessage);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadDevice();
    }
  }, [deviceId, isEdit, isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        device_id: "",
        device_ip: "",
        device_serial_number: "",
        device_name: "",
        location: "",
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

    // Real-time validation
    const fieldError = validateField(name, processedValue);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (fieldError) next[name] = fieldError;
      else delete next[name];
      return next;
    });
  };

  const validateField = (name, value) => {
    switch (name) {
      case "device_id":
        if (!value || !value.trim()) {
          return "Device ID is required";
        }
        return "";

      case "device_name":
        if (!value || !value.trim()) {
          return "Device name is required";
        }
        return "";

      case "device_ip":
        if (!value || !value.trim()) {
          return "IP address is required";
        }
        return "";

      case "device_serial_number":
        if (!value || !value.trim()) {
          return "Serial number is required";
        }
        return "";

      case "location":
        if (!value || !value.trim()) {
          return "Location is required";
        }
        return "";

      default:
        return "";
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "status_id") {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    try {
      const formattedData = {
        device_id: formData.device_id.trim(),
        device_ip: formData.device_ip.trim(),
        device_serial_number: formData.device_serial_number.trim(),
        device_name: formData.device_name.trim(),
        location: formData.location.trim(),
        status_id: formData.status_id,
      };

      if (isEdit) {
        await biometricDeviceAPI.updateDevice(deviceId, formattedData);
      } else {
        await biometricDeviceAPI.createDevice(formattedData);
      }

      toast.success(
        isEdit ? "Device updated successfully" : "Device created successfully"
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to save device";
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
              {isEdit ? "Edit Device" : "Create Device"}
            </h2>
            <p className={headerSubTitle}>Manage biometric device details</p>
          </div>
          <button onClick={onClose} className={closeButton}>
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className={body}>
          {error && <p className={errorText}>{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Device ID */}
            <div>
              <label className={fieldLabel}>Device ID *</label>
              <input
                type="text"
                name="device_id"
                value={formData.device_id}
                onChange={handleChange}
                disabled={isEdit}
                className={
                  inputClass +
                  (fieldErrors.device_id ? " border-red-500" : "") +
                  (isEdit ? " bg-gray-100 cursor-not-allowed" : "")
                }
                placeholder="Enter device ID"
              />
              {fieldErrors.device_id && (
                <p className={errorText}>{fieldErrors.device_id}</p>
              )}
            </div>

            {/* Device Name */}
            <div>
              <label className={fieldLabel}>Device Name *</label>
              <input
                type="text"
                name="device_name"
                value={formData.device_name}
                onChange={handleChange}
                className={
                  inputClass +
                  (fieldErrors.device_name ? " border-red-500" : "")
                }
                placeholder="Enter device name"
              />
              {fieldErrors.device_name && (
                <p className={errorText}>{fieldErrors.device_name}</p>
              )}
            </div>

            {/* Device IP and Serial Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel}>IP Address *</label>
                <input
                  type="text"
                  name="device_ip"
                  value={formData.device_ip}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.device_ip ? " border-red-500" : "")
                  }
                  placeholder="192.168.1.100"
                />
                {fieldErrors.device_ip && (
                  <p className={errorText}>{fieldErrors.device_ip}</p>
                )}
              </div>

              <div>
                <label className={fieldLabel}>Serial Number *</label>
                <input
                  type="text"
                  name="device_serial_number"
                  value={formData.device_serial_number}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.device_serial_number ? " border-red-500" : "")
                  }
                  placeholder="Enter serial number"
                />
                {fieldErrors.device_serial_number && (
                  <p className={errorText}>
                    {fieldErrors.device_serial_number}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={fieldLabel}>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={
                  inputClass + (fieldErrors.location ? " border-red-500" : "")
                }
                placeholder="Enter device location"
              />
              {fieldErrors.location && (
                <p className={errorText}>{fieldErrors.location}</p>
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
                Active (Device will be operational)
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
              ? "Update Device"
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BiometricDeviceFormModal;

