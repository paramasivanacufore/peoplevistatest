// import React, { useState, useEffect } from "react";
// import LocationAutocomplete from "../Common/LocationAutocomplete";
// import { branchAPI, companyAPI } from "../../utils/registrationForms/api";
// import { toast } from "react-hot-toast";
// import {
//   validateFormField,
//   validateForm,
// } from "../../utils/validation/validations";
// import { XMarkIcon } from "@heroicons/react/24/outline";

// import * as classes from "../../formClasses";
// const TOTAL_STEPS = 3;

// const INITIAL_FORM = {
//   company_id: "",
//   branch_name: "",
//   email: "",
//   phone_number: "",
//   status_id: 1,
//   address: "",
//   postal_code: "",
//   country: "",
//   state: "",
//   city: "",
//   address_type: "Branch",
//   isGlobal: true,
//   parent_branch_id: null,
//   country_code: "",
//   state_code: "",
// };

// const BranchFormModal = ({ isOpen, onClose, branchId = null, onSuccess }) => {
//   const isEdit = Boolean(branchId);
//   const [activeStep, setActiveStep] = useState(1);
//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const [companies, setCompanies] = useState([]);
//   const [allBranches, setAllBranches] = useState([]);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;

//     setActiveStep(1);
//     setFormData(INITIAL_FORM);
//     setFieldErrors({});
//     setLoading(false);

//     companyAPI.getAll().then(setCompanies);
//     branchAPI.getAll().then(setAllBranches);

//     if (branchId) {
//       setLoading(true);
//       branchAPI
//         .getById(branchId)
//         .then((branch) => {
//           console.log("ggggggggggggg" + JSON.stringify(branch));
//           setFormData({
//             company_id: branch.company_id || "",
//             branch_name: branch.branch_name || "",
//             isGlobal: branch.is_global === 1,
//             parent_branch_id: branch.parent_branch_id || null,
//             email: branch.email || "",
//             phone_number: branch.phone_number || "",
//             status_id: branch.status_id || 1,
//             address: branch.address || "",
//             postal_code: branch.postal_code || "",
//             country: branch.country || "",
//             state: branch.state || "",
//             city: branch.city || "",
//             address_type: "Branch",
//             country_code: branch.country_code || "",
//             state_code: branch.state_code || "",
//           });
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [isOpen, branchId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => {
//       const updated = { ...prev, [name]: value };
//       setFieldErrors((err) => ({
//         ...err,
//         [name]: validateFormField(name, value, updated),
//       }));
//       return updated;
//     });
//   };

//   const handleNext = () => {
//     const stepFields =
//       activeStep === 1
//         ? ["company_id", "branch_name"]
//         : activeStep === 2
//         ? ["email", "phone_number"]
//         : ["address", "country", "state", "city"];

//     const errors = {};
//     stepFields.forEach((f) => {
//       const err = validateFormField(f, formData[f], formData);
//       if (err) errors[f] = err;
//     });

//     if (!formData.isGlobal && activeStep === 1 && !formData.parent_branch_id) {
//       errors.parent_branch_id = "Parent branch is required";
//     }

//     setFieldErrors(errors);

//     if (Object.keys(errors).length > 0) {
//       toast.error("Please fix errors before continuing");
//       return;
//     }

//     setActiveStep((s) => Math.min(s + 1, TOTAL_STEPS));
//   };

//   const handlePrevious = () => setActiveStep((s) => Math.max(s - 1, 1));

//   const handleSubmit = async () => {
//     const validation = validateForm(formData);
//     setFieldErrors(validation.errors);

//     if (!validation.isValid) {
//       toast.error("Please fix validation errors");
//       return;
//     }

//     setLoading(true);
//     try {
//       const submitData = new FormData();
//       Object.entries({
//         company_id: Number(formData.company_id),
//         branch_name: formData.branch_name,
//         email: formData.email || "",
//         phone_number: formData.phone_number || "",
//         status_id: formData.status_id,
//         address: formData.address || "",
//         postal_code: formData.postal_code || "",
//         country: formData.country || "",
//         state: formData.state || "",
//         city: formData.city || "",
//         address_type: "Branch",
//         is_global: formData.isGlobal ? 1 : 0,
//         parent_branch_id: formData.isGlobal
//           ? null
//           : Number(formData.parent_branch_id || 0),
//       }).forEach(
//         ([key, value]) => value !== null && submitData.append(key, value)
//       );

//       if (isEdit) {
//         await branchAPI.update(branchId, submitData);
//         toast.success("Branch updated successfully");
//       } else {
//         await branchAPI.create(submitData);
//         toast.success("Branch created successfully");
//       }

//       onSuccess?.();
//       onClose();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || "Failed to save branch");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const renderError = (field) =>
//     fieldErrors[field] ? (
//       <p className={classes.errorText}>{fieldErrors[field]}</p>
//     ) : null;

//   return (
//     <>
//       <div className={classes.overlay} onClick={onClose} />
//       <div className={classes.drawer}>
//         {/* Header */}
//         <div className={classes.header}>
//           <div>
//             <h2 className={classes.headerTitle}>
//               {isEdit ? "Edit Branch" : "Create Branch"}
//             </h2>
//             <p className={classes.headerSubTitle}>
//               STEP {activeStep} OF {TOTAL_STEPS}
//             </p>
//           </div>
//           <button onClick={onClose} className={classes.closeButton}>
//             <XMarkIcon className="w-6 h-6 text-[#011748]" />
//           </button>
//         </div>

//         {/* Progress Bar */}
//         <div className={classes.progressBarOuter}>
//           <div
//             className={classes.progressBarInner}
//             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
//           />
//         </div>

//         {/* Form Body */}
//         <div className={classes.body}>
//           {activeStep === 1 && (
//             <>
//               <p className={classes.sectionTitle}>Basic Information</p>
//               <div className="flex flex-col gap-2">
//                 <label className={classes.fieldLabel}>Company *</label>
//                 <select
//                   name="company_id"
//                   value={formData.company_id}
//                   onChange={handleChange}
//                   disabled={isEdit}
//                   className={classes.selectClass}
//                 >
//                   <option value="">Select Company</option>
//                   {companies.map((c) => (
//                     <option key={c.company_id} value={c.company_id}>
//                       {c.company_name}
//                     </option>
//                   ))}
//                 </select>
//                 {renderError("company_id")}
//               </div>

//               <div className="flex flex-col">
//                 <label className={classes.fieldLabel}>Branch Type *</label>
//                 <div className={classes.radioGroup}>
//                   <label className={classes.radioLabel}>
//                     <input
//                       type="radio"
//                       name="branch_type"
//                       checked={formData.isGlobal}
//                       onChange={() =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           isGlobal: true,
//                           parent_branch_id: null,
//                         }))
//                       }
//                     />{" "}
//                     Main Branch
//                   </label>
//                   <label className={classes.radioLabel}>
//                     <input
//                       type="radio"
//                       name="branch_type"
//                       checked={!formData.isGlobal}
//                       onChange={() =>
//                         setFormData((prev) => ({ ...prev, isGlobal: false }))
//                       }
//                     />{" "}
//                     Sub-Branch
//                   </label>
//                 </div>
//               </div>

//               {!formData.isGlobal && (
//                 <div className="flex flex-col gap-2">
//                   <label className={classes.fieldLabel}>Parent Branch *</label>
//                   <select
//                     name="parent_branch_id"
//                     value={formData.parent_branch_id || ""}
//                     onChange={handleChange}
//                     className={classes.selectClass}
//                   >
//                     <option value="">Select Parent Branch</option>
//                     {allBranches
//                       .filter((b) => b.is_global === 1)
//                       .map((b) => (
//                         <option key={b.branch_id} value={b.branch_id}>
//                           {b.branch_name}
//                         </option>
//                       ))}
//                   </select>
//                   {renderError("parent_branch_id")}
//                 </div>
//               )}

//               <div className="flex flex-col gap-2">
//                 <label className={classes.fieldLabel}>Branch Name *</label>
//                 <input
//                   name="branch_name"
//                   value={formData.branch_name}
//                   onChange={handleChange}
//                   className={classes.inputClass}
//                 />
//                 {renderError("branch_name")}
//               </div>
//             </>
//           )}

//           {/* STEP 2 */}
//           {activeStep === 2 && (
//             <>
//               <p className={classes.sectionTitle}>Contact Details</p>
//               <div className="flex flex-col gap-2">
//                 <label className={classes.fieldLabel}>Email *</label>
//                 <input
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className={classes.inputClass}
//                 />
//                 {renderError("email")}
//               </div>
//               <div className="flex flex-col gap-2">
//                 <label className={classes.fieldLabel}>Phone Number *</label>
//                 <input
//                   name="phone_number"
//                   value={formData.phone_number}
//                   onChange={handleChange}
//                   className={classes.inputClass}
//                 />
//                 {renderError("phone_number")}
//               </div>
//             </>
//           )}

//           {/* STEP 3 */}
//           {activeStep === 3 && (
//             <>
//               <p className={classes.sectionTitle}>Address Details</p>
//               <div className="flex flex-col gap-2">
//                 <label className={classes.fieldLabel}>Address *</label>
//                 <input
//                   name="address"
//                   value={formData.address}
//                   onChange={handleChange}
//                   className={classes.inputClass}
//                 />
//                 {renderError("address")}
//               </div>

//               <LocationAutocomplete
//                 type="country"
//                 value={formData.country}
//                 label="Country *"
//                 onSelect={(val) =>
//                   setFormData((p) => ({
//                     ...p,
//                     country: val.label,
//                     country_code: val.isoCode,
//                     state: "",
//                     city: "",
//                   }))
//                 }
//               />
//               {renderError("country")}

//               <LocationAutocomplete
//                 type="state"
//                 value={formData.state}
//                 label="State *"
//                 countryCode={formData.country_code}
//                 onSelect={(val) =>
//                   setFormData((p) => ({
//                     ...p,
//                     state: val.label,
//                     state_code: val.isoCode,
//                     city: "",
//                   }))
//                 }
//               />
//               {renderError("state")}

//               <LocationAutocomplete
//                 type="city"
//                 value={formData.city}
//                 label="City *"
//                 countryCode={formData.country_code}
//                 stateCode={formData.state_code}
//                 onSelect={(val) =>
//                   setFormData((p) => ({ ...p, city: val.label }))
//                 }
//               />
//               {renderError("city")}
//             </>
//           )}
//         </div>

//         {/* Footer */}
//         <div className={classes.footer}>
//           <button
//             onClick={activeStep === 1 ? onClose : handlePrevious}
//             className={classes.buttonSecondary}
//           >
//             Back
//           </button>

//           {activeStep < TOTAL_STEPS ? (
//             <button onClick={handleNext} className={classes.buttonPrimary}>
//               Next Step
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className={classes.buttonPrimary}
//             >
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default BranchFormModal;
import React, { useState, useEffect } from "react";
import LocationAutocomplete from "../Common/LocationAutocomplete";
import { branchAPI, companyAPI } from "../../utils/registrationForms/api";
import { toast } from "react-hot-toast";
import {
  validateFormField,
  validateForm,
} from "../../utils/validation/validations";
import { XMarkIcon } from "@heroicons/react/24/outline";

import * as classes from "../../formClasses";
const TOTAL_STEPS = 3;

const INITIAL_FORM = {
  company_id: "",
  branch_name: "",
  email: "",
  phone_number: "",
  status_id: 1,
  address: "",
  postal_code: "",
  country: "",
  state: "",
  city: "",
  address_type: "Branch",
  isGlobal: true,
  parent_branch_id: null,
  country_code: "",
  state_code: "",
};

const BranchFormModal = ({ isOpen, onClose, branchId = null, onSuccess }) => {
  const isEdit = Boolean(branchId);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [companies, setCompanies] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setActiveStep(1);
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setLoading(false);

    companyAPI.getAll().then(setCompanies);
    branchAPI.getAll().then(setAllBranches);

    if (branchId) {
      setLoading(true);
      branchAPI
        .getById(branchId)
        .then((branch) => {
          setFormData({
            company_id: branch.company_id || "",
            branch_name: branch.branch_name || "",
            isGlobal: branch.is_global === 1,
            parent_branch_id: branch.parent_branch_id || null,
            email: branch.email || "",
            phone_number: branch.phone_number || "",
            status_id: branch.status_id || 1,
            address: branch.address || "",
            postal_code: branch.postal_code || "",
            country: branch.country || "",
            state: branch.state || "",
            city: branch.city || "",
            address_type: "Branch",
            country_code: branch.country_code || "",
            state_code: branch.state_code || "",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, branchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      setFieldErrors((err) => ({
        ...err,
        [name]: validateFormField(name, value, updated),
      }));
      return updated;
    });
  };

  const handleBranchTypeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      isGlobal: value === "main",
      parent_branch_id: value === "main" ? null : prev.parent_branch_id,
    }));
  };

  const handleNext = () => {
    const stepFields =
      activeStep === 1
        ? ["company_id", "branch_name"]
        : activeStep === 2
        ? ["email", "phone_number"]
        : ["address", "country", "state", "city"];

    const errors = {};
    stepFields.forEach((f) => {
      const err = validateFormField(f, formData[f], formData);
      if (err) errors[f] = err;
    });

    if (!formData.isGlobal && activeStep === 1 && !formData.parent_branch_id) {
      errors.parent_branch_id = "Parent branch is required";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix errors before continuing");
      return;
    }

    setActiveStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handlePrevious = () => setActiveStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    const validation = validateForm(formData);
    setFieldErrors(validation.errors);

    if (!validation.isValid) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.entries({
        company_id: Number(formData.company_id),
        branch_name: formData.branch_name,
        email: formData.email || "",
        phone_number: formData.phone_number || "",
        status_id: formData.status_id,
        address: formData.address || "",
        postal_code: formData.postal_code || "",
        country: formData.country || "",
        state: formData.state || "",
        city: formData.city || "",
        address_type: "Branch",
        is_global: formData.isGlobal ? 1 : 0,
        parent_branch_id: formData.isGlobal
          ? null
          : Number(formData.parent_branch_id || 0),
      }).forEach(
        ([key, value]) => value !== null && submitData.append(key, value)
      );

      if (isEdit) {
        await branchAPI.update(branchId, submitData);
        toast.success("Branch updated successfully");
      } else {
        await branchAPI.create(submitData);
        toast.success("Branch created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save branch");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderError = (field) =>
    fieldErrors[field] ? (
      <p className={classes.errorText}>{fieldErrors[field]}</p>
    ) : null;

  return (
    <>
      <div className={classes.overlay} onClick={onClose} />
      <div className={classes.drawer}>
        {/* Header */}
        <div className={classes.header}>
          <div>
            <h2 className={classes.headerTitle}>
              {isEdit ? "Edit Branch" : "Create Branch"}
            </h2>
            <p className={classes.headerSubTitle}>
              STEP {activeStep} OF {TOTAL_STEPS}
            </p>
          </div>
          <button onClick={onClose} className={classes.closeButton}>
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
        <div className={classes.progressBarOuter}>
          <div
            className={classes.progressBarInner}
            style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className={classes.body}>
          {activeStep === 1 && (
            <>
              <p className={classes.sectionTitle}>Basic Information</p>
              <div className="flex flex-col gap-2">
                <label className={classes.fieldLabel}>Company *</label>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  disabled={isEdit}
                  className={classes.selectClass}
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
                {renderError("company_id")}
              </div>

              <div className="flex flex-col gap-2">
                <label className={classes.fieldLabel}>Branch Type *</label>
                <select
                  name="branch_type"
                  value={formData.isGlobal ? "main" : "sub"}
                  onChange={handleBranchTypeChange}
                  className={classes.selectClass}
                >
                  <option value="main">Main Branch</option>
                  <option value="sub">Sub-Branch</option>
                </select>
              </div>

              {!formData.isGlobal && (
                <div className="flex flex-col gap-2">
                  <label className={classes.fieldLabel}>Parent Branch *</label>
                  <select
                    name="parent_branch_id"
                    value={formData.parent_branch_id || ""}
                    onChange={handleChange}
                    className={classes.selectClass}
                  >
                    <option value="">Select Parent Branch</option>
                    {allBranches
                      .filter((b) => b.is_global === 1)
                      .map((b) => (
                        <option key={b.branch_id} value={b.branch_id}>
                          {b.branch_name}
                        </option>
                      ))}
                  </select>
                  {renderError("parent_branch_id")}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className={classes.fieldLabel}>Branch Name *</label>
                <input
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleChange}
                  className={classes.inputClass}
                />
                {renderError("branch_name")}
              </div>
            </>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <>
              <p className={classes.sectionTitle}>Contact Details</p>
              <div className="flex flex-col gap-2">
                <label className={classes.fieldLabel}>Email *</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={classes.inputClass}
                />
                {renderError("email")}
              </div>
              <div className="flex flex-col gap-2">
                <label className={classes.fieldLabel}>Phone Number *</label>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={classes.inputClass}
                />
                {renderError("phone_number")}
              </div>
            </>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <>
              <p className={classes.sectionTitle}>Address Details</p>
              <div className="flex flex-col gap-2">
                <label className={classes.fieldLabel}>Address *</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={classes.inputClass}
                />
                {renderError("address")}
              </div>

              <LocationAutocomplete
                type="country"
                value={formData.country}
                label="Country *"
                onSelect={(val) =>
                  setFormData((p) => ({
                    ...p,
                    country: val.label,
                    country_code: val.isoCode,
                    state: "",
                    city: "",
                  }))
                }
              />
              {renderError("country")}

              <LocationAutocomplete
                type="state"
                value={formData.state}
                label="State *"
                countryCode={formData.country_code}
                onSelect={(val) =>
                  setFormData((p) => ({
                    ...p,
                    state: val.label,
                    state_code: val.isoCode,
                    city: "",
                  }))
                }
              />
              {renderError("state")}

              <LocationAutocomplete
                type="city"
                value={formData.city}
                label="City *"
                countryCode={formData.country_code}
                stateCode={formData.state_code}
                onSelect={(val) =>
                  setFormData((p) => ({ ...p, city: val.label }))
                }
              />
              {renderError("city")}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={classes.footer}>
          <button
            onClick={activeStep === 1 ? onClose : handlePrevious}
            className={classes.buttonSecondary}
          >
            Back
          </button>

          {activeStep < TOTAL_STEPS ? (
            <button onClick={handleNext} className={classes.buttonPrimary}>
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={classes.buttonPrimary}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BranchFormModal;
