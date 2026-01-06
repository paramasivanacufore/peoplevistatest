

import React, { useState, useEffect } from "react";
import LocationAutocomplete from "../../components/Common/LocationAutocomplete";
import { companyAPI } from "../../utils/registrationForms/api";
import { toast } from "react-hot-toast";
import {
  validateForm,
  validateFormField,
} from "../../utils/validation/validations";

// Tailwind class names
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
  sectionTitle,
  buttonPrimary,
  buttonSecondary,
  footer,
  errorText,
  progressBarOuter,
  progressBarInner,
} from "../../formClasses";

const CompanyFormModal = ({ isOpen, onClose, companyId = null, onSuccess }) => {
  const isEdit = Boolean(companyId);
  const TOTAL_STEPS = 3; // Updated for 3 steps
  const [activeTab, setActiveTab] = useState(1);

  const [formData, setFormData] = useState({
    company_name: "",
    industry_type: "",
    website_url: "",
    email: "",
    phone_prefix: "",
    phone_number: "",
    phone_extension: "",
    logo_path: "",
    status_id: 1,
    address: "",
    postal_code: "",
    country: "",
    state: "",
    city: "",
  });

  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const industryOptions = [
    { value: "Technology", label: "Technology" },
    { value: "Finance", label: "Finance" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Education", label: "Education" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
    { value: "Consulting", label: "Consulting" },
    { value: "Hospitality", label: "Hospitality" },
    { value: "Construction", label: "Construction" },
    { value: "Transport", label: "Transport" },
    { value: "Energy", label: "Energy" },
    { value: "Telecommunications", label: "Telecommunications" },
    { value: "Real Estate", label: "Real Estate" },
  ];

  /* ================== Load company data for editing ================== */
  useEffect(() => {
    if (isEdit && companyId && isOpen) {
      const loadCompany = async () => {
        try {
          setLoading(true);
          const company = await companyAPI.getById(companyId);

          let address = "";
          let postal_code = "";
          let country = "";
          let state = "";
          let city = "";

          if (company.address) {
            try {
              if (typeof company.address === "string") {
                const trimmed = company.address.trim();
                if (trimmed.startsWith("{")) {
                  const parsed = JSON.parse(trimmed);
                  address = parsed.address_line1 || "";
                  postal_code = parsed.postal_code || "";
                  country = parsed.country || "";
                  state = parsed.state || "";
                  city = parsed.city || "";
                } else {
                  address = company.address;
                }
              } else if (typeof company.address === "object") {
                address = company.address.address_line1 || "";
                postal_code = company.address.postal_code || "";
                country = company.address.country || "";
                state = company.address.state || "";
                city = company.address.city || "";
              }
            } catch (parseErr) {
              if (typeof company.address === "string")
                address = company.address;
            }
          }

          if (!country && company.country) country = company.country;

          setFormData({
            company_name: company.company_name || "",
            industry_type: company.industry_type || "",
            website_url: company.website_url || "",
            email: company.email || "",
            phone_prefix: company.phone_prefix || "",
            phone_number: company.phone_number || "",
            phone_extension: company.phone_extension || "",
            logo_path: company.logo_path || "",
            status_id: company.status_id || 1,
            address,
            postal_code,
            country,
            state,
            city,
          });

          if (company.logo_path) {
            setLogoPreview(
              `${import.meta.env.VITE_API_BASE_URL}/${company.logo_path}`
            );
          }

          setCountryCode("");
          setStateCode("");
        } catch (err) {
          setError("Failed to load company data");
        } finally {
          setLoading(false);
        }
      };
      loadCompany();
    }
  }, [companyId, isEdit, isOpen]);

  /* ================= Reset on modal close ================= */
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(1);
      setFormData({
        company_name: "",
        industry_type: "",
        website_url: "",
        email: "",
        phone_prefix: "",
        phone_number: "",
        phone_extension: "",
        logo_path: "",
        status_id: 1,
        address: "",
        postal_code: "",
        country: "",
        state: "",
        city: "",
      });
      setCountryCode("");
      setStateCode("");
      setLogoFile(null);
      setLogoPreview(null);
      setFieldErrors({});
      setHasSubmitted(false);
      setError(null);
    }
  }, [isOpen]);

  /* ================= Handlers ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const fieldError = validateFormField(name, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (fieldError) next[name] = fieldError;
      else delete next[name];
      return next;
    });
  };

  const handleCountrySelect = (option) => {
    setCountryCode(option?.isoCode || "");
    setFormData((prev) => ({
      ...prev,
      country: option?.label || "",
      state: "",
      city: "",
    }));
    setStateCode("");
    const fieldError = validateFormField("country", option?.label || "");
    setFieldErrors((prev) => ({ ...prev, country: fieldError }));
  };

  const handleStateSelect = (option) => {
    setStateCode(option?.isoCode || "");
    setFormData((prev) => ({ ...prev, state: option?.label || "", city: "" }));
    const fieldError = validateFormField("state", option?.label || "");
    setFieldErrors((prev) => ({ ...prev, state: fieldError }));
  };

  const handleCitySelect = (option) => {
    setFormData((prev) => ({ ...prev, city: option?.label || "" }));
    const fieldError = validateFormField("city", option?.label || "");
    setFieldErrors((prev) => ({ ...prev, city: fieldError }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const logoError = validateFormField("logo", file);
    setFieldErrors((prev) => ({ ...prev, logo: logoError }));
    if (logoError) {
      toast.error(logoError);
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  /* ================= Step Navigation ================= */
  const handleNext = () => {
    const validation = validateForm(formData, { requireExtension: true });

    let stepFields = [];
    if (activeTab === 1) stepFields = ["company_name", "industry_type", "logo"];
    if (activeTab === 2) stepFields = ["email", "phone_number", "phone_extension"];
    if (activeTab === 3) stepFields = ["address", "country", "state", "city"];

    const stepErrors = Object.keys(validation.errors)
      .filter((k) => stepFields.includes(k))
      .reduce((acc, k) => ({ ...acc, [k]: validation.errors[k] }), {});

    if (Object.keys(stepErrors).length > 0) {
      setFieldErrors(stepErrors);
      toast.error("Please fix the errors before proceeding");
      return;
    }

    if (activeTab < TOTAL_STEPS) setActiveTab((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (activeTab > 1) setActiveTab((prev) => prev - 1);
    else onClose();
  };

  /* ================= Form Submit ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    const validation = validateForm(formData, { requireExtension: true });
    setFieldErrors(validation.errors);

    if (!validation.isValid) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      if (logoFile) submitData.append("logo", logoFile);

      let response;
      if (isEdit) response = await companyAPI.update(companyId, submitData);
      else response = await companyAPI.create(submitData);

      toast.success(
        isEdit ? "Company updated successfully" : "Company created successfully"
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      let errorMessage = "Failed to save company";
      if (err?.message) errorMessage = err.message;
      else if (err?.errors && typeof err.errors === "object") {
        errorMessage = Object.values(err.errors).filter(Boolean).join(", ");
      }

      toast.error(errorMessage);
      setError(errorMessage);

      if (err?.errors && typeof err.errors === "object") {
        setFieldErrors(err.errors);
      }
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
              {isEdit ? "Edit Company" : "Create Company"}
            </h2>
            <p className={headerSubTitle}>
              STEP {activeTab} OF {TOTAL_STEPS}
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

        {/* Progress Bar */}
        <div className={progressBarOuter}>
          <div
            className={progressBarInner}
            style={{ width: `${(activeTab / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className={body}>
          {error && <p className={errorText}>{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Step 1: Basic Info */}
            {activeTab === 1 && (
              
              <div className="flex flex-col gap-4">
                              <p className={sectionTitle}>Basic Information</p>
                
                {/* Company Name */}
                <div>
                  <label className={fieldLabel}>Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={inputClass + (fieldErrors.company_name ? " border-black-500" : "")}
                  />
                  {fieldErrors.company_name && <p className={errorText}>{fieldErrors.company_name}</p>}
                </div>

                {/* Industry Type */}
                <div>
                  <label className={fieldLabel}>Industry Type *</label>
                  <select
                    name="industry_type"
                    value={formData.industry_type}
                    onChange={handleChange}
                    className={selectClass + (fieldErrors.industry_type ? " border-black-500" : "")}
                  >
                    <option value="">-Select Industry-</option>
                    {industryOptions
                      .sort((a, b) => a.value.localeCompare(b.value))
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                  </select>
                  {fieldErrors.industry_type && <p className={errorText}>{fieldErrors.industry_type}</p>}
                </div>

                {/* Logo */}
                <div>
                  <label className={fieldLabel}>Company Logo</label>
                  <div className="flex items-center gap-3">
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                    <label
                      htmlFor="logo-upload"
                      className="w-full px-3 py-2 rounded-lg border border-[#01174833] text-gray-900 text-sm bg-[#f8fafc] cursor-pointer hover:border-[#011748] transition"
                    >
                      {logoFile ? logoFile.name : "Choose file"}
                    </label>
                  </div>

                  {logoPreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-cover rounded-md border border-gray-300" />
                      <button type="button" onClick={removeLogo} className="text-red-600 text-sm">Remove</button>
                    </div>
                  )}
                  {fieldErrors.logo && <p className={errorText}>{fieldErrors.logo}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {activeTab === 2 && (
              <div className="flex flex-col gap-4">
                {/* Email */}
                <div>
                                                <p className={sectionTitle}>Contact Information</p>

                  <label className={fieldLabel}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass + (fieldErrors.email ? " border-black-500" : "")}
                  />
                  {fieldErrors.email && <p className={errorText}>{fieldErrors.email}</p>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <div>
                    <label className={fieldLabel}>Phone Number *</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={inputClass + (fieldErrors.phone_number ? " border-black-500" : "")}
                    />
                    {fieldErrors.phone_number && <p className={errorText}>{fieldErrors.phone_number}</p>}
                  </div>

                  <div>
                    <label className={fieldLabel}>Phone Extension *</label>
                    <input
                      type="text"
                      name="phone_extension"
                      value={formData.phone_extension}
                      onChange={handleChange}
                      placeholder="Ext"
                      className={inputClass + (fieldErrors.phone_extension ? " border-black-500" : "")}
                    />
                    {fieldErrors.phone_extension && <p className={errorText}>{fieldErrors.phone_extension}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address Details */}
            {activeTab === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                <p className={sectionTitle}>Address Information</p>

                  <label className={fieldLabel}>Address Line</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter address"
                  />
                </div>

                <LocationAutocomplete
                  type="country"
                  value={formData.country}
                  onSelect={handleCountrySelect}
                  label="Country *"
                  error={fieldErrors.country}
                />
                <LocationAutocomplete
                  type="state"
                  value={formData.state}
                  onSelect={handleStateSelect}
                  countryCode={countryCode}
                  label="State *"
                  error={fieldErrors.state}
                  disabled={!countryCode}
                />
                <LocationAutocomplete
                  type="city"
                  value={formData.city}
                  onSelect={handleCitySelect}
                  countryCode={countryCode}
                  stateCode={stateCode}
                  label="City *"
                  error={fieldErrors.city}
                  disabled={!stateCode}
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className={footer}>
          <button type="button" onClick={handlePrevious} className={buttonSecondary}>
            Back
          </button>

          {activeTab !== TOTAL_STEPS ? (
            <button type="button" onClick={handleNext} className={buttonPrimary}>
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={buttonPrimary + " disabled:opacity-50 disabled:cursor-not-allowed"}
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Changes  "}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyFormModal;
