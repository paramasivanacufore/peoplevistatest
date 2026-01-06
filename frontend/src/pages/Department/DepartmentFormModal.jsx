import React, { useState, useEffect } from "react";
import {
  departmentAPI,
  companyAPI,
  branchAPI,
} from "../../utils/registrationForms/api";
import { toast } from "react-hot-toast";
import Select from "react-select";
import * as classes from "../../formClasses";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  validateForm,
  validateFormField,
} from "../../utils/validation/validations";

const DepartmentFormModal = ({
  isOpen,
  onClose,
  departmentId = null,
  onSuccess,
}) => {
  const isEdit = Boolean(departmentId);
  const TOTAL_STEPS = 2;
  const [activeStep, setActiveStep] = useState(1);

  /* ---------------- STATE ---------------- */
  const [formData, setFormData] = useState({
    company_id: "",
    department_name: "",
    short_code: "",
    description: "",
    department_type: "",
    parent_department_id: null,
    status_id: 1,
  });

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [parentDepartments, setParentDepartments] = useState([]);

  const [departmentType, setDepartmentType] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);

  const [branchMappings, setBranchMappings] = useState([
    { main_branch_id: null, sub_branch_ids: [] },
  ]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [branchFieldErrors, setBranchFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({
      ...p,
      [name]: validateFormField(name, value, { ...formData, [name]: value }),
    }));
  };

  const handleNext = () => {
    const validation = validateForm(formData, branchMappings);
    if (!validation.isValid && activeStep === 1) {
      setFieldErrors(validation.errors);
      toast.error("Please fix validation errors before proceeding");
      return;
    }
    setActiveStep((p) => Math.min(p + 1, TOTAL_STEPS));
  };

  const handlePrevious = () => {
    if (activeStep > 1) setActiveStep((p) => p - 1);
    else onClose();
  };

  const addBranchMapping = () =>
    setBranchMappings((p) => [
      ...p,
      { main_branch_id: null, sub_branch_ids: [] },
    ]);

  const removeBranchMapping = (index) =>
    setBranchMappings((p) => p.filter((_, i) => i !== index));

  const handleMainBranchChange = (index, selected) => {
    setBranchMappings((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              main_branch_id: selected?.value || null,
              sub_branch_ids: [],
            }
          : row
      )
    );
  };

  const handleSubBranchChange = (index, selectedOptions) => {
    setBranchMappings((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, sub_branch_ids: selectedOptions.map((o) => o.value) }
          : row
      )
    );
  };

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    if (!isOpen) return;
    companyAPI.getAll().then(setCompanies);
  }, [isOpen]);

  useEffect(() => {
    if (!formData.company_id) return;
    branchAPI.getByCompany(formData.company_id).then(setBranches);
    departmentAPI
      .getMainDepartments(formData.company_id)
      .then(setParentDepartments);
  }, [formData.company_id]);

  /* ---------------- EDIT LOAD ---------------- */
  useEffect(() => {
    if (!isEdit || !departmentId || !isOpen) return;

    const loadDepartment = async () => {
      setLoading(true);
      try {
        const dept = await departmentAPI.getById(departmentId);

        setFormData({
          company_id: dept.company_id,
          department_name: dept.department_name,
          short_code: dept.short_code,
          description: dept.description,
          department_type: dept.is_global ? "main" : "sub",
          parent_department_id: dept.parent_department_id || null,
          status_id: dept.status_id,
        });

        setDepartmentType(dept.is_global ? "main" : "sub");

        if (dept.parent_department_id) {
          setSelectedParent({
            value: dept.parent_department_id,
            label: dept.parent_department_name,
          });
        }

        window.__EDIT_BRANCH_IDS__ = dept.branch_ids || [];
      } finally {
        setLoading(false);
      }
    };

    loadDepartment();
  }, [departmentId, isEdit, isOpen]);

  /* ---------------- BUILD BRANCH MAPPINGS AFTER BRANCHES LOAD ---------------- */
  useEffect(() => {
    if (!isEdit || !branches.length || !window.__EDIT_BRANCH_IDS__) return;

    const deptBranchIds = window.__EDIT_BRANCH_IDS__;
    const mappings = [];

    const mainBranches = branches.filter((b) => b.is_global === 1);

    mainBranches.forEach((main) => {
      const subIds = branches
        .filter(
          (b) =>
            b.parent_branch_id === main.branch_id &&
            deptBranchIds.includes(b.branch_id)
        )
        .map((b) => b.branch_id);

      if (deptBranchIds.includes(main.branch_id) || subIds.length) {
        mappings.push({
          main_branch_id: main.branch_id,
          sub_branch_ids: subIds,
        });
      }
    });

    setBranchMappings(
      mappings.length
        ? mappings
        : [{ main_branch_id: null, sub_branch_ids: [] }]
    );
    delete window.__EDIT_BRANCH_IDS__;
  }, [branches, isEdit]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    const validation = validateForm(formData, branchMappings);
    setFieldErrors(validation.errors);
    setBranchFieldErrors(validation.branchErrors);

    if (!validation.isValid) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      fd.append("company_id", formData.company_id);
      fd.append("department_name", formData.department_name);
      fd.append("status_id", 1);
      fd.append("is_global", departmentType === "main" ? "1" : "0");

      if (formData.short_code) fd.append("short_code", formData.short_code);
      if (formData.description) fd.append("description", formData.description);

      const branchIds = [];
      branchMappings.forEach((r) => {
        if (r.main_branch_id) branchIds.push(r.main_branch_id);
        if (r.sub_branch_ids?.length) branchIds.push(...r.sub_branch_ids);
      });
      fd.append("branch_ids", JSON.stringify([...new Set(branchIds)]));

      if (departmentType === "sub")
        fd.append("parent_department_id", selectedParent?.value);

      isEdit
        ? await departmentAPI.update(departmentId, fd)
        : departmentType === "main"
        ? await departmentAPI.createMain(fd)
        : await departmentAPI.createSub(fd);

      toast.success(isEdit ? "Updated successfully" : "Created successfully");
      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const mainBranchOptions = branches
    .filter((b) => b.is_global === 1)
    .map((b) => ({
      value: b.branch_id,
      label: b.branch_name,
    }));

  const subBranchOptions = branches
    .filter((b) => b.is_global === 0)
    .map((b) => ({
      value: b.branch_id,
      label: b.branch_name,
      parent_branch_id: b.parent_branch_id,
    }));

  return (
    <div className={classes.overlay}>
      <div className={classes.drawer}>
        {/* HEADER */}
        <div className={classes.header}>
          <div>
            <h2 className={classes.headerTitle}>
              {isEdit ? "Edit Department" : "Create Department"}
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

        {/* PROGRESS */}
        <div className={classes.progressBarOuter}>
          <div
            className={classes.progressBarInner}
            style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* BODY */}
        <div className={classes.body}>
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-4">
              <p className={classes.sectionTitle}>Basic Information</p>

              <div>
                <label className={classes.fieldLabel}>Department Name *</label>
                <input
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleChange}
                  className={classes.inputClass}
                />
                {fieldErrors.department_name && (
                  <p className={classes.errorText}>
                    {fieldErrors.department_name}
                  </p>
                )}
              </div>

              {/* <div>
                <label className={classes.fieldLabel}>Department Type *</label>
                <div className={classes.radioGroup}>
                  <label className={classes.radioLabel}>
                    <input
                      type="radio"
                      checked={departmentType === "main"}
                      onChange={() => setDepartmentType("main")}
                    />{" "}
                    Main Department
                  </label>
                  <label className={classes.radioLabel}>
                    <input
                      type="radio"
                      checked={departmentType === "sub"}
                      onChange={() => setDepartmentType("sub")}
                    />{" "}
                    Sub Department
                  </label>
                </div>
              </div> */}
              <div>
                <label className={classes.fieldLabel}>Department Type *</label>
                <select
                  name="department_type"
                  value={departmentType}
                  onChange={(e) => setDepartmentType(e.target.value)}
                  className={classes.selectClass}
                >
                  <option value="">Select Department Type</option>
                  <option value="main">Main Department</option>
                  <option value="sub">Sub Department</option>
                </select>
                {fieldErrors.department_type && (
                  <p className={classes.errorText}>
                    {fieldErrors.department_type}
                  </p>
                )}
              </div>

              {departmentType === "sub" && (
                <div>
                  <label className={classes.fieldLabel}>
                    Parent Department *
                  </label>
                  <Select
                    options={parentDepartments.map((d) => ({
                      value: d.department_id,
                      label: d.department_name,
                    }))}
                    value={selectedParent}
                    onChange={(val) => {
                      setSelectedParent(val);
                      setFormData((p) => ({
                        ...p,
                        parent_department_id: val?.value || null,
                      }));
                    }}
                  />
                </div>
              )}

              <div>
                <label className={classes.fieldLabel}>Short Code</label>
                <input
                  name="short_code"
                  value={formData.short_code}
                  onChange={handleChange}
                  className={classes.inputClass}
                />
              </div>

              <div>
                <label className={classes.fieldLabel}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={classes.inputClass}
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-4">
              <p className={classes.sectionTitle}>Company & Branch</p>

              <div>
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
                {fieldErrors.company_id && (
                  <p className={classes.errorText}>{fieldErrors.company_id}</p>
                )}
              </div>

              {branchMappings.map((row, index) => (
                <div key={index} className="flex flex-col gap-3 mt-4">
                  <div>
                    <label className={classes.fieldLabel}>Main Branch *</label>
                    <Select
                      options={mainBranchOptions}
                      value={
                        mainBranchOptions.find(
                          (o) => o.value === row.main_branch_id
                        ) || null
                      }
                      onChange={(opt) => handleMainBranchChange(index, opt)}
                    />
                    {branchFieldErrors?.[index]?.main_branch_id && (
                      <p className={classes.errorText}>
                        {branchFieldErrors[index].main_branch_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={classes.fieldLabel}>Sub Branches</label>
                    <Select
                      isMulti
                      options={subBranchOptions.filter(
                        (s) =>
                          Number(s.parent_branch_id) ===
                          Number(row.main_branch_id)
                      )}
                      value={subBranchOptions.filter((o) =>
                        row.sub_branch_ids.includes(o.value)
                      )}
                      onChange={(opts) => handleSubBranchChange(index, opts)}
                      isDisabled={!row.main_branch_id}
                    />
                  </div>

                  {!isEdit && branchMappings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBranchMapping(index)}
                      className="text-red-600 text-sm self-end"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {/* <button type="button" onClick={addBranchMapping} className="text-blue-600 text-sm mt-2">+ Add another</button> */}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={classes.footer}>
          <button onClick={handlePrevious} className={classes.buttonSecondary}>
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
              className={
                classes.buttonPrimary +
                " disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentFormModal;

// // import React, { useState, useEffect } from "react";
// // import LocationAutocomplete from "../../components/Common/LocationAutocomplete";
// // import {
// //   departmentAPI,
// //   companyAPI,
// //   branchAPI,
// // } from "../../utils/registrationForms/api";
// // import { toast } from "react-hot-toast";
// // import {
// //   validateFormField,
// //   validateForm,
// // } from "../../utils/validation/validations";
// // import Select from "react-select";
// // import { Country, State } from "country-state-city";

// // const DepartmentFormModal = ({
// //   isOpen,
// //   onClose,
// //   departmentId = null,
// //   onSuccess,
// // }) => {
// //   const isEdit = Boolean(departmentId);
// //   const [activeTab, setActiveTab] = useState(1);

// //   const [formData, setFormData] = useState({
// //     company_id: "",
// //     branch_id: "",
// //     department_name: "",
// //     short_code: "",
// //     description: "",
// //     status_id: 1,

// //     department_type: "",
// //     branch_scope: "",
// //     parent_department_id: "",
// //   });

// //   // Location codes for cascading dropdowns
// //   const [countryCode, setCountryCode] = useState("");
// //   const [stateCode, setStateCode] = useState("");

// //   const [companies, setCompanies] = useState([]);
// //   const [branches, setBranches] = useState([]);
// //   const [parentDepartments, setParentDepartments] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const [hasSubmitted, setHasSubmitted] = useState(false);

// //   // Department type and related state
// //   const [departmentType, setDepartmentType] = useState("");
// //   const [selectedBranches, setSelectedBranches] = useState([]);
// //   const [selectedBranch, setSelectedBranch] = useState(null);
// //   const [selectedParent, setSelectedParent] = useState(null);
// //   // ADD ONLY – do not remove existing states
// //   const [branchType, setBranchType] = useState(""); // "main" | "sub"
// //   const [filteredBranches, setFilteredBranches] = useState([]);
// //   const [branchMappings, setBranchMappings] = useState([
// //     {
// //       main_branch_id: null,
// //       sub_branch_ids: [],
// //     },
// //   ]);
// //   const addBranchMapping = () => {
// //     setBranchMappings((prev) => [
// //       ...prev,
// //       { main_branch_id: null, sub_branch_ids: [] },
// //     ]);
// //   };

// //   const removeBranchMapping = (index) => {
// //     setBranchMappings((prev) => prev.filter((_, i) => i !== index));
// //   };

// //   // NEW – Branch Scope UI
// //   // "main" | "sub" | "both"
// //   const [branchScope, setBranchScope] = useState("");
// //   // Selected branches (already exists but clarified)
// //   const [selectedMainBranches, setSelectedMainBranches] = useState([]);
// //   const [selectedSubBranches, setSelectedSubBranches] = useState([]);
// //   const hasSelectedBranches =
// //     selectedMainBranches.length > 0 ||
// //     selectedSubBranches.length > 0 ||
// //     selectedBranches.length > 0;

// //   const hasSelectedAnyBranch =
// //     selectedMainBranches.length > 0 || selectedSubBranches.length > 0;
// //   const handleMainBranchChange = (index, selected) => {
// //     setBranchMappings((prev) =>
// //       prev.map((row, i) =>
// //         i === index
// //           ? {
// //               ...row,
// //               main_branch_id: selected?.value || null,
// //               sub_branch_ids: [], // reset sub branches
// //             }
// //           : row
// //       )
// //     );
// //   };
// //   useEffect(() => {
// //     if (!isEdit || !departmentId || !isOpen) return;

// //     const loadDepartment = async () => {
// //       try {
// //         setLoading(true);

// //         // 1️⃣ Fetch department
// //         const department = await departmentAPI.getById(departmentId);

// //         // 2️⃣ Fetch all branches
// //         const allBranches = await branchAPI.getAll();

// //         // 3️⃣ Set basic form data
// //         setFormData({
// //           company_id: department.company_id || "",
// //           department_name: department.department_name || "",
// //           short_code: department.short_code || "",
// //           description: department.description || "",
// //           status_id: department.status_id || 1,
// //           department_type: department.is_global ? "main" : "sub",
// //         });

// //         setDepartmentType(department.is_global ? "main" : "sub");

// //         // 4️⃣ Build branchMappings
// //         const mappings = [];

// //         if (department.is_global) {
// //           // MAIN DEPARTMENT
// //           mappings.push({
// //             main_branch_id: department.branch_ids[0], // first as main
// //             sub_branch_ids: department.branch_ids.slice(1), // rest as subs
// //           });
// //         } else {
// //           // SUB DEPARTMENT
// //           const mainBranches = allBranches.filter(
// //             (b) => b.parent_branch_id === null
// //           );

// //           mainBranches.forEach((main) => {
// //             const subIds = allBranches
// //               .filter(
// //                 (b) =>
// //                   b.parent_branch_id === main.branch_id &&
// //                   department.branch_ids.includes(b.branch_id)
// //               )
// //               .map((b) => b.branch_id);

// //             if (
// //               department.branch_ids.includes(main.branch_id) ||
// //               subIds.length > 0
// //             ) {
// //               mappings.push({
// //                 main_branch_id: main.branch_id,
// //                 sub_branch_ids: subIds,
// //               });
// //             }
// //           });
// //         }

// //         setBranchMappings(
// //           mappings.length
// //             ? mappings
// //             : [{ main_branch_id: null, sub_branch_ids: [] }]
// //         );

// //         // 5️⃣ Parent department (only for sub)
// //         if (department.parent_department_id) {
// //           setSelectedParent({
// //             value: department.parent_department_id,
// //             label: department.parent_department_name || "Parent Dept",
// //           });
// //         }
// //       } catch (err) {
// //         console.error("Failed to load department:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadDepartment();
// //   }, [departmentId, isEdit, isOpen]);

// //   const handleBranchScopeSelect = (scope) => {
// //     setBranchScope(scope);

// //     setFormData((prev) => ({
// //       ...prev,
// //       branch_scope: scope,
// //     }));

// //     setSelectedMainBranches([]);
// //     setSelectedSubBranches([]);
// //   };
// //   const handleSubBranchChange = (index, selectedOptions) => {
// //     setBranchMappings((prev) =>
// //       prev.map((row, i) =>
// //         i === index
// //           ? {
// //               ...row,
// //               sub_branch_ids: selectedOptions.map((o) => o.value),
// //             }
// //           : row
// //       )
// //     );
// //   };
// //   const selectedMainBranchIds = branchMappings
// //     .map((m) => m.main_branch_id)
// //     .filter(Boolean);

// //   const getMainBranchOptionsForRow = (rowIndex) => {
// //     return branches
// //       .filter((b) => b.is_global === 1)
// //       .filter((b) => {
// //         // allow current row's selected value
// //         const currentSelected = branchMappings[rowIndex]?.main_branch_id;
// //         if (currentSelected === b.branch_id) return true;

// //         // exclude already selected in other rows
// //         return !selectedMainBranchIds.includes(b.branch_id);
// //       })
// //       .map((b) => ({
// //         value: b.branch_id,
// //         label: b.branch_name,
// //       }));
// //   };

// //   const departmentTypeOptions = [
// //     { value: "main", label: "Main Department" },
// //     { value: "sub", label: "Sub Department" },
// //   ];

// //   // Create branch options for Select component
// //   const branchOptions = branches.map((branch) => ({
// //     value: branch.branch_id,
// //     label: branch.branch_name || branch.name,
// //   }));

// //   useEffect(() => {
// //     if (!formData.company_id || !branchType) {
// //       setFilteredBranches([]);
// //       return;
// //     }

// //     const filtered = branches.filter(
// //       (b) =>
// //         b.company_id === Number(formData.company_id) &&
// //         (branchType === "main" ? b.is_global === 1 : b.is_global === 0)
// //     );

// //     setFilteredBranches(
// //       filtered.map((b) => ({
// //         value: b.branch_id,
// //         label: b.branch_name,
// //       }))
// //     );
// //   }, [formData.company_id, branchType, branches]);

// //   // Fetch companies for the dropdown
// //   useEffect(() => {
// //     if (isOpen) {
// //       const fetchCompanies = async () => {
// //         try {
// //           const data = await companyAPI.getAll();
// //           setCompanies(data);
// //         } catch (err) {
// //           console.error("Failed to fetch companies:", err);
// //           toast.error("Failed to load companies for selection.");
// //         }
// //       };
// //       fetchCompanies();
// //     }
// //   }, [isOpen]);

// //   // Fetch branches when company is selected
// //   useEffect(() => {
// //     if (formData.company_id) {
// //       const fetchBranches = async () => {
// //         try {
// //           const data = await branchAPI.getByCompany(formData.company_id);

// //           setBranches(data);

// //           if (data.length === 0) {
// //             toast.info("No branches found for the selected company.");
// //           }
// //         } catch (err) {
// //           console.error("Failed to fetch branches:", err);
// //           toast.error("Failed to load branches for selection.");
// //         }
// //       };

// //       fetchBranches();
// //     } else {
// //       setBranches([]);
// //     }
// //   }, [formData.company_id]);

// //   // Fetch parent departments when company is selected
// //   useEffect(() => {
// //     if (formData.company_id) {
// //       const fetchParentDepartments = async () => {
// //         try {
// //           const data = await departmentAPI.getMainDepartments(
// //             formData.company_id
// //           );
// //           setParentDepartments(data);
// //           console.log("Parent departments fetched:", data);
// //         } catch (err) {
// //           console.error("Failed to fetch parent departments:", err);
// //         }
// //       };
// //       fetchParentDepartments();
// //     } else {
// //       console.log("No company selected, clearing parent departments");
// //       setParentDepartments([]);
// //     }
// //   }, [formData.company_id]);

// //   // Reset form when modal opens/closes
// //   useEffect(() => {
// //     if (!isOpen) {
// //       // Reset all form state when modal closes
// //       setFormData({
// //         company_id: "",
// //         branch_id: "",
// //         department_name: "",
// //         short_code: "",
// //         description: "",
// //         status_id: 1,
// //       });
// //       setDepartmentType("");
// //       setSelectedBranches([]);
// //       setSelectedBranch(null);
// //       setSelectedParent(null);
// //       setFieldErrors({});
// //       setError(null);
// //       setHasSubmitted(false);
// //       setCountryCode("");
// //       setStateCode("");
// //     }
// //   }, [isOpen]);

// //   useEffect(() => {
// //     if (departmentType === "sub" && formData.company_id) {
// //       const fetchParentDepartments = async () => {
// //         try {
// //           const data = await departmentAPI.getMainDepartments(
// //             formData.company_id
// //           );
// //           setParentDepartments(data);
// //         } catch (err) {
// //           console.error("Failed to fetch parent depts after type change:", err);
// //         }
// //       };

// //       fetchParentDepartments();
// //     }
// //   }, [departmentType, formData.company_id]);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({
// //       ...prev,
// //       [name]: value,
// //     }));

// //     // Dynamic validation - validate field on every change
// //     const fieldError = validateFormField(name, value);
// //     setFieldErrors((prev) => ({
// //       ...prev,
// //       [name]: fieldError,
// //     }));
// //   };

// //   // Handle city selection

// //   // Tab navigation - removed since we only have one tab now

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError(null);
// //     setHasSubmitted(true);

// //     const validation = validateForm(formData);
// //     setFieldErrors(validation.errors);
// //     console.log("validres", validation);
// //     console.log("SUBMIT STARTED");
// //     console.log("formData:", formData);
// //     console.log("department_type:", formData.department_type);
// //     console.log("branch_scope:", formData.branch_scope);

// //     if (!validation.isValid) {
// //       toast.error("Please fix the validation errors");
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const submitData = new FormData();

// //       // ---------- REQUIRED ----------
// //       if (!formData.company_id || !formData.department_name) {
// //         toast.error("Company and department name are required");
// //         return;
// //       }

// //       submitData.append("company_id", formData.company_id);
// //       submitData.append("department_name", formData.department_name);
// //       submitData.append("status_id", formData.status_id ?? 1);

// //       // ---------- OPTIONAL ----------
// //       if (formData.short_code?.trim())
// //         submitData.append("short_code", formData.short_code.trim());
// //       if (formData.description?.trim())
// //         submitData.append("description", formData.description.trim());

// //       // ---------- DEPARTMENT TYPE ----------
// //       const departmentType = formData.department_type ?? "main";
// //       submitData.append("is_global", departmentType === "main" ? "1" : "0");

// //       // ---------- BRANCH RESOLUTION ----------
// //       let branchIds = [];

// //       branchMappings?.forEach((row) => {
// //         if (row.main_branch_id) branchIds.push(row.main_branch_id);
// //         if (row.sub_branch_ids?.length) branchIds.push(...row.sub_branch_ids);
// //       });

// //       // remove duplicates
// //       branchIds = [...new Set(branchIds)];

// //       if (!branchIds.length) {
// //         toast.error("Please select at least one branch");
// //         return;
// //       }

// //       submitData.append("branch_ids", JSON.stringify(branchIds));

// //       // ---------- SUB DEPARTMENT ----------
// //       if (departmentType === "sub") {
// //         const parentDeptId =
// //           selectedParent?.value || formData.parent_department_id;
// //         if (!parentDeptId) {
// //           toast.error("Parent department is required");
// //           return;
// //         }
// //         submitData.append("parent_department_id", parentDeptId);
// //       }

// //       // ---------- API CALL ----------
// //       if (isEdit) {
// //         await departmentAPI.update(departmentId, submitData);
// //         toast.success("Department updated successfully");
// //       } else {
// //         if (departmentType === "main") {
// //           await departmentAPI.createMain(submitData);
// //         } else {
// //           await departmentAPI.createSub(submitData);
// //         }
// //         toast.success("Department created successfully");
// //       }

// //       // ---------- SUCCESS ----------
// //       onSuccess?.();
// //       onClose();
// //     } catch (err) {
// //       console.error("FULL ERROR:", err);

// //       // Better error message from backend response if available
// //       const errorMsg =
// //         err?.response?.data?.detail ||
// //         err?.message ||
// //         "Failed to save department";

// //       toast.error(errorMsg);
// //       setError(errorMsg);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (!isOpen) return null;

// //   // Derived branch lists (no API change)
// //   const mainBranchOptions = branches
// //     .filter((b) => b.is_global === 1)
// //     .map((b) => ({
// //       value: b.branch_id,
// //       label: b.branch_name,
// //     }));

// //   const subBranchOptions = branches
// //     .filter((b) => b.is_global === 0)
// //     .map((b) => ({
// //       value: b.branch_id,
// //       label: b.branch_name,
// //       parent_branch_id: b.parent_branch_id,
// //     }));

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
// //       {/* Wrapper to allow close button overflow */}
// //       <div className="relative w-full" style={{ maxWidth: "700px" }}>
// //         {/* Close Button */}
// //         <button
// //           onClick={onClose}
// //           className="absolute z-10 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:opacity-90"
// //           style={{
// //             top: "-15px",
// //             right: "-15px",
// //             backgroundColor: "#680723",
// //             border: "3px solid white",
// //             boxShadow: "0 4px 12px rgba(104, 7, 35, 0.4)",
// //           }}
// //           type="button"
// //         >
// //           <svg
// //             className="w-4 h-4"
// //             fill="none"
// //             stroke="currentColor"
// //             viewBox="0 0 24 24"
// //             strokeWidth="2.5"
// //           >
// //             <path
// //               strokeLinecap="round"
// //               strokeLinejoin="round"
// //               d="M6 18L18 6M6 6l12 12"
// //             />
// //           </svg>
// //         </button>

// //         {/* Modal Content */}
// //         <div
// //           className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
// //           style={{ maxHeight: "90vh" }}
// //         >
// //           {/* Tab Navigation */}
// //           <div className="flex items-center justify-center pt-8 pb-4 px-8 bg-white">
// //             <div className="flex flex-col items-center">
// //               <div
// //                 className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
// //                 style={{
// //                   backgroundColor: "#036472",
// //                   boxShadow: "0 4px 12px rgba(3, 100, 114, 0.4)",
// //                 }}
// //               >
// //                 1
// //               </div>
// //               <span
// //                 className="mt-2 text-xs font-medium"
// //                 style={{ color: "#036472" }}
// //               >
// //                 Department Details
// //               </span>
// //             </div>
// //           </div>

// //           {/* Form Content */}
// //           <div
// //             className="px-8 py-6 overflow-y-auto flex-1"
// //             style={{ maxHeight: "calc(90vh - 200px)" }}
// //           >
// //             {error && (
// //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
// //                 {error}
// //               </div>
// //             )}

// //             <form onSubmit={handleSubmit} className="space-y-5">
// //               {/* Company */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                   Company *
// //                 </label>
// //                 <select
// //                   name="company_id"
// //                   value={formData.company_id}
// //                   onChange={(e) => {
// //                     handleChange(e);
// //                     setDepartmentType("");
// //                     setSelectedParent(null);
// //                     setSelectedBranches([]);
// //                   }}
// //                   disabled={isEdit} // disabled in edit
// //                   className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
// //                     fieldErrors.company_id
// //                       ? "border-red-500 focus:ring-red-500"
// //                       : "border-gray-300 focus:ring-blue-500"
// //                   }`}
// //                 >
// //                   <option value="">-Select Company-</option>
// //                   {companies
// //                     .sort((a, b) =>
// //                       a.company_name.localeCompare(b.company_name)
// //                     )
// //                     .map((company) => (
// //                       <option
// //                         key={company.company_id}
// //                         value={company.company_id}
// //                       >
// //                         {company.company_name}
// //                       </option>
// //                     ))}
// //                 </select>
// //                 {fieldErrors.company_id && (
// //                   <p className="mt-1 text-sm text-red-600">
// //                     {fieldErrors.company_id}
// //                   </p>
// //                 )}
// //               </div>

// //               {formData.company_id && (
// //                 <div className="mt-6">
// //                   <label className="block text-sm font-semibold text-gray-800 mb-4">
// //                     Branch Selection *
// //                   </label>

// //                   {branchMappings.map((row, index) => (
// //                     <div
// //                       key={index}
// //                       className="border rounded-xl p-4 mb-4 bg-gray-50"
// //                     >
// //                       {/* MAIN BRANCH */}
// //                       <label className="block text-sm font-medium text-gray-700 mb-2">
// //                         Main Branch *
// //                       </label>
// //                       <Select
// //                         options={getMainBranchOptionsForRow(index)}
// //                         value={getMainBranchOptionsForRow(index).find(
// //                           (o) => o.value === row.main_branch_id
// //                         )}
// //                         onChange={(opt) => handleMainBranchChange(index, opt)}
// //                         placeholder="Select main branch"
// //                         // isDisabled={isEdit} // disabled in edit
// //                       />

// //                       {/* SUB BRANCHES */}
// //                       <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
// //                         Sub Branches
// //                       </label>
// //                       <Select
// //                         isMulti
// //                         options={subBranchOptions.filter(
// //                           (s) =>
// //                             Number(s.parent_branch_id) ===
// //                             Number(row.main_branch_id)
// //                         )}
// //                         value={subBranchOptions.filter((o) =>
// //                           row.sub_branch_ids.includes(o.value)
// //                         )}
// //                         onChange={(opts) => handleSubBranchChange(index, opts)}
// //                         isDisabled={!row.main_branch_id} // disabled in edit
// //                         placeholder="Select sub branches"
// //                       />

// //                       {/* ACTIONS */}
// //                       <div className="flex justify-between mt-4">
// //                         {index === branchMappings.length - 1 && !isEdit && (
// //                           <button
// //                             type="button"
// //                             onClick={addBranchMapping}
// //                             className="text-blue-600 text-sm font-medium"
// //                           >
// //                             + Add another
// //                           </button>
// //                         )}
// //                         {branchMappings.length > 1 && !isEdit && (
// //                           <button
// //                             type="button"
// //                             onClick={() => removeBranchMapping(index)}
// //                             className="text-red-600 text-sm font-medium"
// //                           >
// //                             Remove
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}

// //               {/* Department Type */}
// //               {!loading &&
// //                 formData.company_id &&
// //                 branchMappings.some((row) => row.main_branch_id) && (
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Department Type *
// //                     </label>
// //                     <div className="flex items-center space-x-4">
// //                       {departmentTypeOptions.map((option) => (
// //                         <label key={option.value} className="flex items-center">
// //                           <input
// //                             type="radio"
// //                             name="departmentType"
// //                             value={option.value}
// //                             checked={departmentType === option.value}
// //                             disabled={isEdit && departmentType === "main"}
// //                             onChange={(e) => {
// //                               const value = e.target.value;
// //                               setDepartmentType(value);
// //                               setFormData((prev) => ({
// //                                 ...prev,
// //                                 department_type: value,
// //                               }));
// //                             }}
// //                             className="form-radio h-4 w-4 text-blue-500 disabled:opacity-50"
// //                           />
// //                           <span className="ml-2 text-sm text-gray-700">
// //                             {option.label}
// //                           </span>
// //                         </label>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}

// //               {/* Fields based on Department Type */}
// //               {!loading && departmentType === "main" && (
// //                 <>
// //                   {/* Department Name */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Department Name *
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="department_name"
// //                       value={formData.department_name}
// //                       onChange={handleChange}
// //                       placeholder="Enter department name"
// //                       className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
// //                         fieldErrors.department_name
// //                           ? "border-red-500 focus:ring-red-500"
// //                           : "border-gray-300 focus:ring-blue-500"
// //                       }`}
// //                       // disabled={isEdit} // disabled in edit
// //                     />
// //                     {fieldErrors.department_name && (
// //                       <p className="mt-1 text-sm text-red-600">
// //                         {fieldErrors.department_name}
// //                       </p>
// //                     )}
// //                   </div>

// //                   {/* Short Code & Description */}
// //                   {(hasSelectedAnyBranch || departmentType) && (
// //                     <>
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-2">
// //                           Short Code
// //                         </label>
// //                         <input
// //                           type="text"
// //                           name="short_code"
// //                           value={formData.short_code}
// //                           onChange={handleChange}
// //                           placeholder="Enter short code"
// //                           className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
// //                         />
// //                       </div>

// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-2">
// //                           Description
// //                         </label>
// //                         <textarea
// //                           name="description"
// //                           value={formData.description}
// //                           onChange={handleChange}
// //                           rows={3}
// //                           placeholder="Enter department description"
// //                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                         />
// //                       </div>
// //                     </>
// //                   )}
// //                 </>
// //               )}

// //               {departmentType === "sub" && (
// //                 <>
// //                   {/* Department Name */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Department Name *
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="department_name"
// //                       value={formData.department_name}
// //                       onChange={handleChange}
// //                       placeholder="Enter department name"
// //                       className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
// //                         fieldErrors.department_name
// //                           ? "border-red-500 focus:ring-red-500"
// //                           : "border-gray-300 focus:ring-blue-500"
// //                       }`}
// //                       // disabled={isEdit} // disabled in edit
// //                     />
// //                     {fieldErrors.department_name && (
// //                       <p className="mt-1 text-sm text-red-600">
// //                         {fieldErrors.department_name}
// //                       </p>
// //                     )}
// //                   </div>

// //                   {/* Parent Department */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Parent Department *
// //                     </label>
// //                     <Select
// //                       options={parentDepartments.map((dept) => ({
// //                         value: dept.department_id,
// //                         label: dept.department_name || dept.name,
// //                       }))}
// //                       value={selectedParent}
// //                       onChange={setSelectedParent}
// //                       placeholder="Select parent department"
// //                       className="basic-single"
// //                       classNamePrefix="select"
// //                       isDisabled={
// //                         isEdit ||
// //                         !formData.company_id ||
// //                         parentDepartments.length === 0
// //                       } // disabled in edit
// //                     />
// //                   </div>

// //                   {/* Short Code */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Short Code
// //                     </label>
// //                     <input
// //                       type="text"
// //                       name="short_code"
// //                       value={formData.short_code}
// //                       onChange={handleChange}
// //                       placeholder="Enter short code"
// //                       className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
// //                         fieldErrors.short_code
// //                           ? "border-red-500 focus:ring-red-500"
// //                           : "border-gray-300 focus:ring-blue-500"
// //                       }`}
// //                     />
// //                   </div>

// //                   {/* Description */}
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       Description
// //                     </label>
// //                     <textarea
// //                       name="description"
// //                       value={formData.description}
// //                       onChange={handleChange}
// //                       rows={3}
// //                       placeholder="Enter department description"
// //                       className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                     />
// //                   </div>
// //                 </>
// //               )}
// //             </form>
// //           </div>

// //           {/* Bottom Buttons */}
// //           <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
// //             {/* Clear */}
// //             <button
// //               type="button"
// //               onClick={() => {
// //                 setFormData({
// //                   company_id: "",
// //                   branch_id: "",
// //                   department_name: "",
// //                   short_code: "",
// //                   description: "",
// //                   status_id: 1,
// //                 });
// //                 setSelectedBranches([]);
// //                 setSelectedBranch(null);
// //                 setSelectedParent(null);
// //                 setFieldErrors({});
// //               }}
// //               className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md transition-colors font-medium"
// //             >
// //               Clear
// //             </button>

// //             {/* Submit */}
// //             <div className="flex gap-3 justify-end">
// //               <button
// //                 type="button"
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //                 className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
// //               >
// //                 {loading
// //                   ? "Saving..."
// //                   : isEdit
// //                   ? "Update Department"
// //                   : "Save Changes"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DepartmentFormModal;

// // import React, { useState, useEffect } from "react";
// // import LocationAutocomplete from "../../components/Common/LocationAutocomplete";
// // import {
// //   departmentAPI,
// //   companyAPI,
// //   branchAPI,
// // } from "../../utils/registrationForms/api";
// // import { toast } from "react-hot-toast";
// // import {
// //   validateFormField,
// //   validateForm,
// // } from "../../utils/validation/validations";
// // import Select from "react-select";
// // import { Country, State } from "country-state-city";
// // import * as classes from "../../formClasses";

// // const DepartmentFormModal = ({
// //   isOpen,
// //   onClose,
// //   departmentId = null,
// //   onSuccess,
// // }) => {
// //   const isEdit = Boolean(departmentId);
// //   const [activeTab, setActiveTab] = useState(1);

// //   const [formData, setFormData] = useState({
// //     company_id: "",
// //     branch_id: "",
// //     department_name: "",
// //     short_code: "",
// //     description: "",
// //     status_id: 1,
// //     department_type: "",
// //     branch_scope: "",
// //     parent_department_id: "",
// //   });

// //   const [countryCode, setCountryCode] = useState("");
// //   const [stateCode, setStateCode] = useState("");

// //   const [companies, setCompanies] = useState([]);
// //   const [branches, setBranches] = useState([]);
// //   const [parentDepartments, setParentDepartments] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const [hasSubmitted, setHasSubmitted] = useState(false);

// //   const [departmentType, setDepartmentType] = useState("");
// //   const [selectedBranches, setSelectedBranches] = useState([]);
// //   const [selectedBranch, setSelectedBranch] = useState(null);
// //   const [selectedParent, setSelectedParent] = useState(null);

// //   const [branchType, setBranchType] = useState("");
// //   const [filteredBranches, setFilteredBranches] = useState([]);
// //   const [branchMappings, setBranchMappings] = useState([
// //     { main_branch_id: null, sub_branch_ids: [] },
// //   ]);

// //   const addBranchMapping = () => {
// //     setBranchMappings((prev) => [
// //       ...prev,
// //       { main_branch_id: null, sub_branch_ids: [] },
// //     ]);
// //   };

// //   const removeBranchMapping = (index) => {
// //     setBranchMappings((prev) => prev.filter((_, i) => i !== index));
// //   };

// //   const [branchScope, setBranchScope] = useState("");
// //   const [selectedMainBranches, setSelectedMainBranches] = useState([]);
// //   const [selectedSubBranches, setSelectedSubBranches] = useState([]);

// //   const hasSelectedBranches =
// //     selectedMainBranches.length > 0 ||
// //     selectedSubBranches.length > 0 ||
// //     selectedBranches.length > 0;

// //   const hasSelectedAnyBranch =
// //     selectedMainBranches.length > 0 || selectedSubBranches.length > 0;

// //   const handleMainBranchChange = (index, selected) => {
// //     setBranchMappings((prev) =>
// //       prev.map((row, i) =>
// //         i === index
// //           ? { ...row, main_branch_id: selected?.value || null, sub_branch_ids: [] }
// //           : row
// //       )
// //     );
// //   };

// //   useEffect(() => {
// //     if (!isEdit || !departmentId || !isOpen) return;

// //     const loadDepartment = async () => {
// //       try {
// //         setLoading(true);
// //         const department = await departmentAPI.getById(departmentId);
// //         const allBranches = await branchAPI.getAll();

// //         setFormData({
// //           company_id: department.company_id || "",
// //           department_name: department.department_name || "",
// //           short_code: department.short_code || "",
// //           description: department.description || "",
// //           status_id: department.status_id || 1,
// //           department_type: department.is_global ? "main" : "sub",
// //         });

// //         setDepartmentType(department.is_global ? "main" : "sub");

// //         const mappings = [];
// //         if (department.is_global) {
// //           mappings.push({
// //             main_branch_id: department.branch_ids[0],
// //             sub_branch_ids: department.branch_ids.slice(1),
// //           });
// //         } else {
// //           const mainBranches = allBranches.filter((b) => b.parent_branch_id === null);
// //           mainBranches.forEach((main) => {
// //             const subIds = allBranches
// //               .filter(
// //                 (b) =>
// //                   b.parent_branch_id === main.branch_id &&
// //                   department.branch_ids.includes(b.branch_id)
// //               )
// //               .map((b) => b.branch_id);
// //             if (department.branch_ids.includes(main.branch_id) || subIds.length > 0) {
// //               mappings.push({ main_branch_id: main.branch_id, sub_branch_ids: subIds });
// //             }
// //           });
// //         }

// //         setBranchMappings(mappings.length ? mappings : [{ main_branch_id: null, sub_branch_ids: [] }]);

// //         if (department.parent_department_id) {
// //           setSelectedParent({
// //             value: department.parent_department_id,
// //             label: department.parent_department_name || "Parent Dept",
// //           });
// //         }
// //       } catch (err) {
// //         console.error("Failed to load department:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadDepartment();
// //   }, [departmentId, isEdit, isOpen]);

// //   const handleBranchScopeSelect = (scope) => {
// //     setBranchScope(scope);
// //     setFormData((prev) => ({ ...prev, branch_scope: scope }));
// //     setSelectedMainBranches([]);
// //     setSelectedSubBranches([]);
// //   };

// //   const handleSubBranchChange = (index, selectedOptions) => {
// //     setBranchMappings((prev) =>
// //       prev.map((row, i) =>
// //         i === index ? { ...row, sub_branch_ids: selectedOptions.map((o) => o.value) } : row
// //       )
// //     );
// //   };

// //   const selectedMainBranchIds = branchMappings.map((m) => m.main_branch_id).filter(Boolean);

// //   const getMainBranchOptionsForRow = (rowIndex) => {
// //     return branches
// //       .filter((b) => b.is_global === 1)
// //       .filter((b) => {
// //         const currentSelected = branchMappings[rowIndex]?.main_branch_id;
// //         if (currentSelected === b.branch_id) return true;
// //         return !selectedMainBranchIds.includes(b.branch_id);
// //       })
// //       .map((b) => ({ value: b.branch_id, label: b.branch_name }));
// //   };

// //   const departmentTypeOptions = [
// //     { value: "main", label: "Main Department" },
// //     { value: "sub", label: "Sub Department" },
// //   ];

// //   const branchOptions = branches.map((branch) => ({
// //     value: branch.branch_id,
// //     label: branch.branch_name || branch.name,
// //   }));

// //   useEffect(() => {
// //     if (!formData.company_id || !branchType) {
// //       setFilteredBranches([]);
// //       return;
// //     }

// //     const filtered = branches.filter(
// //       (b) =>
// //         b.company_id === Number(formData.company_id) &&
// //         (branchType === "main" ? b.is_global === 1 : b.is_global === 0)
// //     );

// //     setFilteredBranches(
// //       filtered.map((b) => ({ value: b.branch_id, label: b.branch_name }))
// //     );
// //   }, [formData.company_id, branchType, branches]);

// //   useEffect(() => {
// //     if (isOpen) {
// //       const fetchCompanies = async () => {
// //         try {
// //           const data = await companyAPI.getAll();
// //           setCompanies(data);
// //         } catch (err) {
// //           console.error("Failed to fetch companies:", err);
// //           toast.error("Failed to load companies for selection.");
// //         }
// //       };
// //       fetchCompanies();
// //     }
// //   }, [isOpen]);

// //   useEffect(() => {
// //     if (formData.company_id) {
// //       const fetchBranches = async () => {
// //         try {
// //           const data = await branchAPI.getByCompany(formData.company_id);
// //           setBranches(data);
// //           if (data.length === 0) toast.info("No branches found for the selected company.");
// //         } catch (err) {
// //           console.error("Failed to fetch branches:", err);
// //           toast.error("Failed to load branches for selection.");
// //         }
// //       };
// //       fetchBranches();
// //     } else setBranches([]);
// //   }, [formData.company_id]);

// //   useEffect(() => {
// //     if (formData.company_id) {
// //       const fetchParentDepartments = async () => {
// //         try {
// //           const data = await departmentAPI.getMainDepartments(formData.company_id);
// //           setParentDepartments(data);
// //         } catch (err) {
// //           console.error("Failed to fetch parent departments:", err);
// //         }
// //       };
// //       fetchParentDepartments();
// //     } else setParentDepartments([]);
// //   }, [formData.company_id]);

// //   useEffect(() => {
// //     if (!isOpen) {
// //       setFormData({
// //         company_id: "",
// //         branch_id: "",
// //         department_name: "",
// //         short_code: "",
// //         description: "",
// //         status_id: 1,
// //       });
// //       setDepartmentType("");
// //       setSelectedBranches([]);
// //       setSelectedBranch(null);
// //       setSelectedParent(null);
// //       setFieldErrors({});
// //       setError(null);
// //       setHasSubmitted(false);
// //       setCountryCode("");
// //       setStateCode("");
// //     }
// //   }, [isOpen]);

// //   useEffect(() => {
// //     if (departmentType === "sub" && formData.company_id) {
// //       const fetchParentDepartments = async () => {
// //         try {
// //           const data = await departmentAPI.getMainDepartments(formData.company_id);
// //           setParentDepartments(data);
// //         } catch (err) {
// //           console.error("Failed to fetch parent depts after type change:", err);
// //         }
// //       };
// //       fetchParentDepartments();
// //     }
// //   }, [departmentType, formData.company_id]);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({ ...prev, [name]: value }));
// //     const fieldError = validateFormField(name, value);
// //     setFieldErrors((prev) => ({ ...prev, [name]: fieldError }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError(null);
// //     setHasSubmitted(true);

// //     const validation = validateForm(formData);
// //     setFieldErrors(validation.errors);

// //     if (!validation.isValid) {
// //       toast.error("Please fix the validation errors");
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const submitData = new FormData();

// //       if (!formData.company_id || !formData.department_name) {
// //         toast.error("Company and department name are required");
// //         return;
// //       }

// //       submitData.append("company_id", formData.company_id);
// //       submitData.append("department_name", formData.department_name);
// //       submitData.append("status_id", formData.status_id ?? 1);

// //       if (formData.short_code?.trim()) submitData.append("short_code", formData.short_code.trim());
// //       if (formData.description?.trim()) submitData.append("description", formData.description.trim());

// //       const departmentType = formData.department_type ?? "main";
// //       submitData.append("is_global", departmentType === "main" ? "1" : "0");

// //       let branchIds = [];
// //       branchMappings?.forEach((row) => {
// //         if (row.main_branch_id) branchIds.push(row.main_branch_id);
// //         if (row.sub_branch_ids?.length) branchIds.push(...row.sub_branch_ids);
// //       });
// //       branchIds = [...new Set(branchIds)];

// //       if (!branchIds.length) {
// //         toast.error("Please select at least one branch");
// //         return;
// //       }
// //       submitData.append("branch_ids", JSON.stringify(branchIds));

// //       if (departmentType === "sub") {
// //         const parentDeptId = selectedParent?.value || formData.parent_department_id;
// //         if (!parentDeptId) {
// //           toast.error("Parent department is required");
// //           return;
// //         }
// //         submitData.append("parent_department_id", parentDeptId);
// //       }

// //       if (isEdit) {
// //         await departmentAPI.update(departmentId, submitData);
// //         toast.success("Department updated successfully");
// //       } else {
// //         if (departmentType === "main") {
// //           await departmentAPI.createMain(submitData);
// //         } else {
// //           await departmentAPI.createSub(submitData);
// //         }
// //         toast.success("Department created successfully");
// //       }

// //       onSuccess?.();
// //       onClose();
// //     } catch (err) {
// //       console.error("FULL ERROR:", err);
// //       const errorMsg = err?.response?.data?.detail || err?.message || "Failed to save department";
// //       toast.error(errorMsg);
// //       setError(errorMsg);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (!isOpen) return null;

// //   const mainBranchOptions = branches
// //     .filter((b) => b.is_global === 1)
// //     .map((b) => ({ value: b.branch_id, label: b.branch_name }));

// //   const subBranchOptions = branches
// //     .filter((b) => b.is_global === 0)
// //     .map((b) => ({
// //       value: b.branch_id,
// //       label: b.branch_name,
// //       parent_branch_id: b.parent_branch_id,
// //     }));

// //   return (
// //     <div className={classes.overlay}>
// //       <div className={classes.drawer}>
// //         <div className={classes.header}>
// //           <div>
// //             <h2 className={classes.headerTitle}>Department Form</h2>
// //             <p className={classes.headerSubTitle}>Fill department details</p>
// //           </div>
// //           <button onClick={onClose} className={classes.closeButton} type="button">
// //             <svg
// //               className="w-4 h-4"
// //               fill="none"
// //               stroke="currentColor"
// //               viewBox="0 0 24 24"
// //               strokeWidth="2.5"
// //             >
// //               <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
// //             </svg>
// //           </button>
// //         </div>

// //         <div className={classes.body}>
// //           {error && <p className={classes.errorText}>{error}</p>}

// //           <form onSubmit={handleSubmit} className="flex flex-col gap-4">
// //             {/* Company */}
// //             <div>
// //               <label className={classes.fieldLabel}>Company *</label>
// //               <select
// //                 name="company_id"
// //                 value={formData.company_id}
// //                 onChange={(e) => {
// //                   handleChange(e);
// //                   setDepartmentType("");
// //                   setSelectedParent(null);
// //                   setSelectedBranches([]);
// //                 }}
// //                 disabled={isEdit}
// //                 className={classes.selectClass}
// //               >
// //                 <option value="">-Select Company-</option>
// //                 {companies
// //                   .sort((a, b) => a.company_name.localeCompare(b.company_name))
// //                   .map((company) => (
// //                     <option key={company.company_id} value={company.company_id}>
// //                       {company.company_name}
// //                     </option>
// //                   ))}
// //               </select>
// //               {fieldErrors.company_id && <p className={classes.errorText}>{fieldErrors.company_id}</p>}
// //             </div>

// //             {/* Branch Mappings */}
// //             {formData.company_id && (
// //               <div>
// //                 {branchMappings.map((row, index) => (
// //                   <div key={index} className="border rounded-xl p-4 mb-4 bg-gray-50">
// //                     <label className={classes.fieldLabel}>Main Branch *</label>
// //                     <Select
// //                       options={getMainBranchOptionsForRow(index)}
// //                       value={getMainBranchOptionsForRow(index).find(
// //                         (o) => o.value === row.main_branch_id
// //                       )}
// //                       onChange={(opt) => handleMainBranchChange(index, opt)}
// //                       placeholder="Select main branch"
// //                     />

// //                     <label className={classes.fieldLabel}>Sub Branches</label>
// //                     <Select
// //                       isMulti
// //                       options={subBranchOptions.filter(
// //                         (s) => Number(s.parent_branch_id) === Number(row.main_branch_id)
// //                       )}
// //                       value={subBranchOptions.filter((o) => row.sub_branch_ids.includes(o.value))}
// //                       onChange={(opts) => handleSubBranchChange(index, opts)}
// //                       isDisabled={!row.main_branch_id}
// //                       placeholder="Select sub branches"
// //                     />

// //                     <div className="flex justify-between mt-4">
// //                       {index === branchMappings.length - 1 && !isEdit && (
// //                         <button type="button" onClick={addBranchMapping} className="text-blue-600 text-sm font-medium">
// //                           + Add another
// //                         </button>
// //                       )}
// //                       {branchMappings.length > 1 && !isEdit && (
// //                         <button type="button" onClick={() => removeBranchMapping(index)} className="text-red-600 text-sm font-medium">
// //                           Remove
// //                         </button>
// //                       )}
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}

// //             {/* Department Type */}
// //             {!loading && formData.company_id && branchMappings.some((row) => row.main_branch_id) && (
// //               <div>
// //                 <label className={classes.fieldLabel}>Department Type *</label>
// //                 <div className={classes.radioGroup}>
// //                   {departmentTypeOptions.map((option) => (
// //                     <label key={option.value} className={classes.radioLabel}>
// //                       <input
// //                         type="radio"
// //                         name="departmentType"
// //                         value={option.value}
// //                         checked={departmentType === option.value}
// //                         disabled={isEdit && departmentType === "main"}
// //                         onChange={(e) => {
// //                           const value = e.target.value;
// //                           setDepartmentType(value);
// //                           setFormData((prev) => ({ ...prev, department_type: value }));
// //                         }}
// //                         className="form-radio h-4 w-4 text-blue-500 disabled:opacity-50"
// //                       />
// //                       {option.label}
// //                     </label>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Department Fields */}
// //             {(departmentType === "main" || departmentType === "sub") && (
// //               <>
// //                 <div>
// //                   <label className={classes.fieldLabel}>Department Name *</label>
// //                   <input
// //                     type="text"
// //                     name="department_name"
// //                     value={formData.department_name}
// //                     onChange={handleChange}
// //                     placeholder="Enter department name"
// //                     className={classes.inputClass}
// //                   />
// //                   {fieldErrors.department_name && <p className={classes.errorText}>{fieldErrors.department_name}</p>}
// //                 </div>

// //                 {departmentType === "sub" && (
// //                   <div>
// //                     <label className={classes.fieldLabel}>Parent Department *</label>
// //                     <Select
// //                       options={parentDepartments.map((dept) => ({
// //                         value: dept.department_id,
// //                         label: dept.department_name || dept.name,
// //                       }))}
// //                       value={selectedParent}
// //                       onChange={setSelectedParent}
// //                       placeholder="Select parent department"
// //                       isDisabled={isEdit || !formData.company_id || parentDepartments.length === 0}
// //                     />
// //                   </div>
// //                 )}

// //                 <div>
// //                   <label className={classes.fieldLabel}>Short Code</label>
// //                   <input
// //                     type="text"
// //                     name="short_code"
// //                     value={formData.short_code}
// //                     onChange={handleChange}
// //                     placeholder="Optional short code"
// //                     className={classes.inputClass}
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className={classes.fieldLabel}>Description</label>
// //                   <textarea
// //                     name="description"
// //                     value={formData.description}
// //                     onChange={handleChange}
// //                     placeholder="Optional description"
// //                     className={classes.inputClass}
// //                     rows={3}
// //                   />
// //                 </div>
// //               </>
// //             )}

// //             {/* Footer Buttons */}
// //             <div className={classes.footer}>
// //               <button type="button" onClick={onClose} className={classes.buttonSecondary}>
// //                 Cancel
// //               </button>
// //               <button type="submit" className={classes.buttonPrimary} disabled={loading}>
// //                 {loading ? "Saving..." : isEdit ? "Update" : "Save"}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DepartmentFormModal;
// // import React, { useState, useEffect } from "react";
// // import {
// //   departmentAPI,
// //   companyAPI,
// //   branchAPI,
// // } from "../../utils/registrationForms/api";
// // import { toast } from "react-hot-toast";
// // import {
// //   validateFormField,
// //   validateForm,
// // } from "../../utils/validation/validations";
// // import Select from "react-select";
// // import * as classes from "../../formClasses";
// // import { XMarkIcon } from "@heroicons/react/24/outline";

// // const TOTAL_STEPS = 2;

// // const DepartmentFormModal = ({
// //   isOpen,
// //   onClose,
// //   departmentId = null,
// //   onSuccess,
// // }) => {
// //   const isEdit = Boolean(departmentId);
// //   const [activeStep, setActiveStep] = useState(1);

// //   /* ---------------- STATE ---------------- */
// //   const [formData, setFormData] = useState({
// //     company_id: "",
// //     department_name: "",
// //     short_code: "",
// //     description: "",
// //     department_type: "",
// //     status_id: 1,
// //   });

// //   const [companies, setCompanies] = useState([]);
// //   const [branches, setBranches] = useState([]);
// //   const [parentDepartments, setParentDepartments] = useState([]);

// //   const [departmentType, setDepartmentType] = useState("");
// //   const [selectedParent, setSelectedParent] = useState(null);

// //   const [branchMappings, setBranchMappings] = useState([
// //     { main_branch_id: null, sub_branch_ids: [] },
// //   ]);

// //   const [loading, setLoading] = useState(false);
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const [error, setError] = useState(null);

// //   /* ---------------- HANDLERS ---------------- */
// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((p) => ({ ...p, [name]: value }));
// //     setFieldErrors((p) => ({ ...p, [name]: validateFormField(name, value) }));
// //   };

// //   const handleNext = () => setActiveStep((p) => Math.min(p + 1, TOTAL_STEPS));
// //   const handlePrevious = () => setActiveStep((p) => Math.max(p - 1, 1));

// //   const addBranchMapping = () =>
// //     setBranchMappings((p) => [
// //       ...p,
// //       { main_branch_id: null, sub_branch_ids: [] },
// //     ]);

// //   const removeBranchMapping = (index) =>
// //     setBranchMappings((p) => p.filter((_, i) => i !== index));

// //   const handleMainBranchChange = (index, selected) => {
// //     setBranchMappings((prev) =>
// //       prev.map((row, i) =>
// //         i === index
// //           ? {
// //               ...row,
// //               main_branch_id: selected?.value || null,
// //               sub_branch_ids: [],
// //             }
// //           : row
// //       )
// //     );
// //   };

// //   const handleSubBranchChange = (index, selectedOptions) => {
// //     setBranchMappings((prev) =>
// //       prev.map((row, i) =>
// //         i === index
// //           ? { ...row, sub_branch_ids: selectedOptions.map((o) => o.value) }
// //           : row
// //       )
// //     );
// //   };

// //   /* ---------------- FETCH ---------------- */
// //   useEffect(() => {
// //     if (!isOpen) return;
// //     companyAPI.getAll().then(setCompanies);
// //   }, [isOpen]);

// //   useEffect(() => {
// //     if (!formData.company_id) return;

// //     branchAPI.getByCompany(formData.company_id).then(setBranches);
// //     departmentAPI
// //       .getMainDepartments(formData.company_id)
// //       .then(setParentDepartments);
// //   }, [formData.company_id]);

// //   /* ---------------- EDIT LOAD ---------------- */
// //   useEffect(() => {
// //     if (!isEdit || !departmentId || !isOpen) return;

// //     const loadDepartment = async () => {
// //       setLoading(true);
// //       try {
// //         const dept = await departmentAPI.getById(departmentId);

// //         setFormData({
// //           company_id: dept.company_id,
// //           department_name: dept.department_name,
// //           short_code: dept.short_code,
// //           description: dept.description,
// //           department_type: dept.is_global ? "main" : "sub",
// //           status_id: dept.status_id,
// //         });

// //         setDepartmentType(dept.is_global ? "main" : "sub");

// //         if (dept.parent_department_id) {
// //           setSelectedParent({
// //             value: dept.parent_department_id,
// //             label: dept.parent_department_name,
// //           });
// //         }
// //         // store branch ids temporarily
// //         window.__EDIT_BRANCH_IDS__ = dept.branch_ids || [];
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadDepartment();
// //   }, [departmentId, isEdit, isOpen]);

// //   /* ---------------- BUILD BRANCH MAPPINGS AFTER BRANCHES LOAD ---------------- */
// //   useEffect(() => {
// //     if (!isEdit || !branches.length || !window.__EDIT_BRANCH_IDS__) return;

// //     const deptBranchIds = window.__EDIT_BRANCH_IDS__;
// //     const mappings = [];

// //     const mainBranches = branches.filter((b) => b.is_global === 1);

// //     mainBranches.forEach((main) => {
// //       const subIds = branches
// //         .filter(
// //           (b) =>
// //             b.parent_branch_id === main.branch_id &&
// //             deptBranchIds.includes(b.branch_id)
// //         )
// //         .map((b) => b.branch_id);

// //       if (deptBranchIds.includes(main.branch_id) || subIds.length) {
// //         mappings.push({
// //           main_branch_id: main.branch_id,
// //           sub_branch_ids: subIds,
// //         });
// //       }
// //     });

// //     setBranchMappings(
// //       mappings.length
// //         ? mappings
// //         : [{ main_branch_id: null, sub_branch_ids: [] }]
// //     );

// //     delete window.__EDIT_BRANCH_IDS__;
// //   }, [branches, isEdit]);

// //   /* ---------------- SUBMIT ---------------- */
// //   const handleSubmit = async () => {
// //     const validation = validateForm(formData);
// //     setFieldErrors(validation.errors);

// //     if (!validation.isValid) {
// //       toast.error("Please fix validation errors");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const fd = new FormData();

// //       fd.append("company_id", formData.company_id);
// //       fd.append("department_name", formData.department_name);
// //       fd.append("status_id", 1);
// //       fd.append("is_global", departmentType === "main" ? "1" : "0");

// //       if (formData.short_code) fd.append("short_code", formData.short_code);
// //       if (formData.description) fd.append("description", formData.description);

// //       let branchIds = [];
// //       branchMappings.forEach((r) => {
// //         if (r.main_branch_id) branchIds.push(r.main_branch_id);
// //         if (r.sub_branch_ids?.length) branchIds.push(...r.sub_branch_ids);
// //       });
// //       fd.append("branch_ids", JSON.stringify([...new Set(branchIds)]));

// //       if (departmentType === "sub") {
// //         fd.append("parent_department_id", selectedParent?.value);
// //       }

// //       isEdit
// //         ? await departmentAPI.update(departmentId, fd)
// //         : departmentType === "main"
// //         ? await departmentAPI.createMain(fd)
// //         : await departmentAPI.createSub(fd);

// //       toast.success(isEdit ? "Updated successfully" : "Created successfully");
// //       onSuccess?.();
// //       onClose();
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (!isOpen) return null;

// //   const mainBranchOptions = branches
// //     .filter((b) => b.is_global === 1)
// //     .map((b) => ({ value: b.branch_id, label: b.branch_name }));

// //   const subBranchOptions = branches
// //     .filter((b) => b.is_global === 0)
// //     .map((b) => ({
// //       value: b.branch_id,
// //       label: b.branch_name,
// //       parent_branch_id: b.parent_branch_id,
// //     }));

// //   return (
// //     <>
// //       <div className={classes.overlay} onClick={onClose} />
// //       <div className={classes.drawer}>
// //         {/* HEADER */}
// //         <div className={classes.header}>
// //           <div>
// //             <h2 className={classes.headerTitle}>
// //               {isEdit ? "Edit Department" : "Create Department"}
// //             </h2>
// //             <p className={classes.headerSubTitle}>
// //               STEP {activeStep} OF {TOTAL_STEPS}
// //             </p>
// //           </div>
// //           <button onClick={onClose} className={classes.closeButton}>
// //             <XMarkIcon className="w-6 h-6 text-[#011748]" />
// //           </button>
// //         </div>

// //         {/* PROGRESS */}
// //         <div className={classes.progressBarOuter}>
// //           <div
// //             className={classes.progressBarInner}
// //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// //           />
// //         </div>

// //         {/* BODY */}
// //         <div className={classes.body}>
// //           {/* STEP 1 */}
// //           {activeStep === 1 && (
// //             <>
// //               <p className={classes.sectionTitle}>Basic Information</p>

// //               <label className={classes.fieldLabel}>Department Name *</label>
// //               <input
// //                 name="department_name"
// //                 value={formData.department_name}
// //                 onChange={handleChange}
// //                 className={classes.inputClass}
// //               />

// //               <label className={classes.fieldLabel}>Department Type *</label>
// //               <div className={classes.radioGroup}>
// //                 <label className={classes.radioLabel}>
// //                   <input
// //                     type="radio"
// //                     checked={departmentType === "main"}
// //                     onChange={() => setDepartmentType("main")}
// //                   />
// //                   Main Department
// //                 </label>
// //                 <label className={classes.radioLabel}>
// //                   <input
// //                     type="radio"
// //                     checked={departmentType === "sub"}
// //                     onChange={() => setDepartmentType("sub")}
// //                   />
// //                   Sub Department
// //                 </label>
// //               </div>

// //               {departmentType === "sub" && (
// //                 <>
// //                   <label className={classes.fieldLabel}>
// //                     Parent Department *
// //                   </label>
// //                   <Select
// //                     options={parentDepartments.map((d) => ({
// //                       value: d.department_id,
// //                       label: d.department_name,
// //                     }))}
// //                     value={selectedParent}
// //                     onChange={setSelectedParent}
// //                   />
// //                 </>
// //               )}

// //               <label className={classes.fieldLabel}>Short Code</label>
// //               <input
// //                 name="short_code"
// //                 value={formData.short_code}
// //                 onChange={handleChange}
// //                 className={classes.inputClass}
// //               />

// //               <label className={classes.fieldLabel}>Description</label>
// //               <input
// //                 name="description"
// //                 value={formData.description}
// //                 onChange={handleChange}
// //                 className={classes.inputClass}
// //               />
// //             </>
// //           )}

// //           {/* STEP 2 */}
// //           {activeStep === 2 && (
// //             <>
// //               <p className={classes.sectionTitle}>Company & Branch </p>

// //               <label className={classes.fieldLabel}>Company *</label>
// //               <select
// //                 name="company_id"
// //                 value={formData.company_id}
// //                 onChange={handleChange}
// //                 disabled={isEdit}
// //                 className={classes.selectClass}
// //               >
// //                 <option value="">Select Company</option>
// //                 {companies.map((c) => (
// //                   <option key={c.company_id} value={c.company_id}>
// //                     {c.company_name}
// //                   </option>
// //                 ))}
// //               </select>

// //               {branchMappings.map((row, index) => (
// //                 <div key={index} className="flex flex-col gap-3 mt-4">
// //                   <div className="flex flex-col gap-2">
// //                     <label className={classes.fieldLabel}>Main Branch *</label>
// //                     <Select
// //                       options={mainBranchOptions}
// //                       value={
// //                         mainBranchOptions.find(
// //                           (o) => o.value === row.main_branch_id
// //                         ) || null
// //                       }
// //                       onChange={(opt) => handleMainBranchChange(index, opt)}
// //                     />
// //                   </div>

// //                   <div className="flex flex-col gap-2">
// //                     <label className={classes.fieldLabel}>Sub Branches</label>
// //                     <Select
// //                       isMulti
// //                       options={subBranchOptions.filter(
// //                         (s) =>
// //                           Number(s.parent_branch_id) ===
// //                           Number(row.main_branch_id)
// //                       )}
// //                       value={subBranchOptions.filter((o) =>
// //                         row.sub_branch_ids.includes(o.value)
// //                       )}
// //                       onChange={(opts) => handleSubBranchChange(index, opts)}
// //                       isDisabled={!row.main_branch_id}
// //                     />
// //                   </div>

// //                   {!isEdit && branchMappings.length > 1 && (
// //                     <button
// //                       type="button"
// //                       onClick={() => removeBranchMapping(index)}
// //                       className="text-red-600 text-sm self-end"
// //                     >
// //                       Remove
// //                     </button>
// //                   )}
// //                 </div>
// //               ))}

// //               {!isEdit && (
// //                 <button
// //                   type="button"
// //                   onClick={addBranchMapping}
// //                   className="text-blue-600 text-sm mt-2"
// //                 >
// //                   + Add another
// //                 </button>
// //               )}
// //             </>
// //           )}
// //         </div>

// //         {/* FOOTER */}
// //         <div className={classes.footer}>
// //           <button
// //             onClick={activeStep === 1 ? onClose : handlePrevious}
// //             className={classes.buttonSecondary}
// //           >
// //             Back
// //           </button>

// //           {activeStep < TOTAL_STEPS ? (
// //             <button onClick={handleNext} className={classes.buttonPrimary}>
// //               Next Step
// //             </button>
// //           ) : (
// //             <button
// //               onClick={handleSubmit}
// //               disabled={loading}
// //               className={classes.buttonPrimary}
// //             >
// //               {loading ? "Saving..." : "Save Changes"}
// //             </button>
// //           )}
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default DepartmentFormModal;
// // DepartmentFormModal.js
// import React, { useState, useEffect } from "react";
// import { departmentAPI, companyAPI, branchAPI } from "../../utils/registrationForms/api";
// import { toast } from "react-hot-toast";
// import Select from "react-select";
// import * as classes from "../../formClasses";
// import { XMarkIcon } from "@heroicons/react/24/outline";
// import { validateForm, validateFormField } from "../../utils/validation/validations";

// const TOTAL_STEPS = 2;

// const DepartmentFormModal = ({ isOpen, onClose, departmentId = null, onSuccess }) => {
//   const isEdit = Boolean(departmentId);
//   const [activeStep, setActiveStep] = useState(1);

//   /* ---------------- STATE ---------------- */
//   const [formData, setFormData] = useState({
//     company_id: "",
//     department_name: "",
//     short_code: "",
//     description: "",
//     department_type: "",
//     parent_department_id: null,
//     status_id: 1,
//   });

//   const [companies, setCompanies] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [parentDepartments, setParentDepartments] = useState([]);

//   const [departmentType, setDepartmentType] = useState("");
//   const [selectedParent, setSelectedParent] = useState(null);

//   const [branchMappings, setBranchMappings] = useState([{ main_branch_id: null, sub_branch_ids: [] }]);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [branchFieldErrors, setBranchFieldErrors] = useState([]);
//   const [loading, setLoading] = useState(false);

//   /* ---------------- HANDLERS ---------------- */
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//     setFieldErrors((p) => ({
//       ...p,
//       [name]: validateFormField(name, value, { ...formData, [name]: value }),
//     }));
//   };

//   const handleNext = () => setActiveStep((p) => Math.min(p + 1, TOTAL_STEPS));
//   const handlePrevious = () => setActiveStep((p) => Math.max(p - 1, 1));

//   const addBranchMapping = () =>
//     setBranchMappings((p) => [...p, { main_branch_id: null, sub_branch_ids: [] }]);

//   const removeBranchMapping = (index) =>
//     setBranchMappings((p) => p.filter((_, i) => i !== index));

//   const handleMainBranchChange = (index, selected) => {
//     setBranchMappings((prev) =>
//       prev.map((row, i) =>
//         i === index ? { ...row, main_branch_id: selected?.value || null, sub_branch_ids: [] } : row
//       )
//     );
//   };

//   const handleSubBranchChange = (index, selectedOptions) => {
//     setBranchMappings((prev) =>
//       prev.map((row, i) =>
//         i === index ? { ...row, sub_branch_ids: selectedOptions.map((o) => o.value) } : row
//       )
//     );
//   };

//   /* ---------------- FETCH ---------------- */
//   useEffect(() => {
//     if (!isOpen) return;
//     companyAPI.getAll().then(setCompanies);
//   }, [isOpen]);

//   useEffect(() => {
//     if (!formData.company_id) return;
//     branchAPI.getByCompany(formData.company_id).then(setBranches);
//     departmentAPI.getMainDepartments(formData.company_id).then(setParentDepartments);
//   }, [formData.company_id]);

//   /* ---------------- EDIT LOAD ---------------- */
//   useEffect(() => {
//     if (!isEdit || !departmentId || !isOpen) return;

//     const loadDepartment = async () => {
//       setLoading(true);
//       try {
//         const dept = await departmentAPI.getById(departmentId);

//         setFormData({
//           company_id: dept.company_id,
//           department_name: dept.department_name,
//           short_code: dept.short_code,
//           description: dept.description,
//           department_type: dept.is_global ? "main" : "sub",
//           parent_department_id: dept.parent_department_id || null,
//           status_id: dept.status_id,
//         });

//         setDepartmentType(dept.is_global ? "main" : "sub");

//         if (dept.parent_department_id) {
//           setSelectedParent({
//             value: dept.parent_department_id,
//             label: dept.parent_department_name,
//           });
//         }

//         window.__EDIT_BRANCH_IDS__ = dept.branch_ids || [];
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDepartment();
//   }, [departmentId, isEdit, isOpen]);

//   /* ---------------- BUILD BRANCH MAPPINGS AFTER BRANCHES LOAD ---------------- */
//   useEffect(() => {
//     if (!isEdit || !branches.length || !window.__EDIT_BRANCH_IDS__) return;

//     const deptBranchIds = window.__EDIT_BRANCH_IDS__;
//     const mappings = [];

//     const mainBranches = branches.filter((b) => b.is_global === 1);

//     mainBranches.forEach((main) => {
//       const subIds = branches
//         .filter((b) => b.parent_branch_id === main.branch_id && deptBranchIds.includes(b.branch_id))
//         .map((b) => b.branch_id);

//       if (deptBranchIds.includes(main.branch_id) || subIds.length) {
//         mappings.push({
//           main_branch_id: main.branch_id,
//           sub_branch_ids: subIds,
//         });
//       }
//     });

//     setBranchMappings(mappings.length ? mappings : [{ main_branch_id: null, sub_branch_ids: [] }]);
//     delete window.__EDIT_BRANCH_IDS__;
//   }, [branches, isEdit]);

//   /* ---------------- SUBMIT ---------------- */
//   const handleSubmit = async () => {
//     const validation = validateForm(formData, branchMappings);
//     setFieldErrors(validation.errors);
//     setBranchFieldErrors(validation.branchErrors);

//     if (!validation.isValid) {
//       toast.error("Please fix validation errors");
//       return;
//     }

//     setLoading(true);
//     try {
//       const fd = new FormData();

//       fd.append("company_id", formData.company_id);
//       fd.append("department_name", formData.department_name);
//       fd.append("status_id", 1);
//       fd.append("is_global", departmentType === "main" ? "1" : "0");

//       if (formData.short_code) fd.append("short_code", formData.short_code);
//       if (formData.description) fd.append("description", formData.description);

//       const branchIds = [];
//       branchMappings.forEach((r) => {
//         if (r.main_branch_id) branchIds.push(r.main_branch_id);
//         if (r.sub_branch_ids?.length) branchIds.push(...r.sub_branch_ids);
//       });
//       fd.append("branch_ids", JSON.stringify([...new Set(branchIds)]));

//       if (departmentType === "sub") fd.append("parent_department_id", selectedParent?.value);

//       isEdit
//         ? await departmentAPI.update(departmentId, fd)
//         : departmentType === "main"
//         ? await departmentAPI.createMain(fd)
//         : await departmentAPI.createSub(fd);

//       toast.success(isEdit ? "Updated successfully" : "Created successfully");
//       onSuccess?.();
//       onClose();
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   const mainBranchOptions = branches.filter((b) => b.is_global === 1).map((b) => ({
//     value: b.branch_id,
//     label: b.branch_name,
//   }));

//   const subBranchOptions = branches.filter((b) => b.is_global === 0).map((b) => ({
//     value: b.branch_id,
//     label: b.branch_name,
//     parent_branch_id: b.parent_branch_id,
//   }));

//   return (
//     <>
//       <div className={classes.overlay} onClick={onClose} />
//       <div className={classes.drawer}>
//         {/* HEADER */}
//         <div className={classes.header}>
//           <div>
//             <h2 className={classes.headerTitle}>{isEdit ? "Edit Department" : "Create Department"}</h2>
//             <p className={classes.headerSubTitle}>STEP {activeStep} OF {TOTAL_STEPS}</p>
//           </div>
//           <button onClick={onClose} className={classes.closeButton}>
//             <XMarkIcon className="w-6 h-6 text-[#011748]" />
//           </button>
//         </div>

//         {/* PROGRESS */}
//         <div className={classes.progressBarOuter}>
//           <div className={classes.progressBarInner} style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }} />
//         </div>

//         {/* BODY */}
//         <div className={classes.body}>
//           {activeStep === 1 && (
//             <>
//               <p className={classes.sectionTitle}>Basic Information</p>

//               <label className={classes.fieldLabel}>Department Name *</label>
//               <input
//                 name="department_name"
//                 value={formData.department_name}
//                 onChange={handleChange}
//                 className={classes.inputClass}
//               />
//               {fieldErrors.department_name && <p className={classes.errorText}>{fieldErrors.department_name}</p>}

//               <label className={classes.fieldLabel}>Department Type *</label>
//               <div className={classes.radioGroup}>
//                 <label className={classes.radioLabel}>
//                   <input
//                     type="radio"
//                     checked={departmentType === "main"}
//                     onChange={() => setDepartmentType("main")}
//                   /> Main Department
//                 </label>
//                 <label className={classes.radioLabel}>
//                   <input
//                     type="radio"
//                     checked={departmentType === "sub"}
//                     onChange={() => setDepartmentType("sub")}
//                   /> Sub Department
//                 </label>
//               </div>
//               {fieldErrors.department_type && <p className={classes.errorText}>{fieldErrors.department_type}</p>}

//               {departmentType === "sub" && (
//                 <>
//                   <label className={classes.fieldLabel}>Parent Department *</label>
//                   <Select
//                     options={parentDepartments.map((d) => ({ value: d.department_id, label: d.department_name }))}
//                     value={selectedParent}
//                     onChange={(val) => {
//                       setSelectedParent(val);
//                       setFormData((p) => ({ ...p, parent_department_id: val?.value || null }));
//                     }}
//                   />
//                   {fieldErrors.parent_department_id && <p className={classes.errorText}>{fieldErrors.parent_department_id}</p>}
//                 </>
//               )}

//               <label className={classes.fieldLabel}>Short Code</label>
//               <input
//                 name="short_code"
//                 value={formData.short_code}
//                 onChange={handleChange}
//                 className={classes.inputClass}
//               />

//               <label className={classes.fieldLabel}>Description</label>
//               <input
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 className={classes.inputClass}
//               />
//             </>
//           )}

//           {activeStep === 2 && (
//             <>
//               <p className={classes.sectionTitle}>Company & Branch</p>

//               <label className={classes.fieldLabel}>Company *</label>
//               <select
//                 name="company_id"
//                 value={formData.company_id}
//                 onChange={handleChange}
//                 disabled={isEdit}
//                 className={classes.selectClass}
//               >
//                 <option value="">Select Company</option>
//                 {companies.map((c) => (
//                   <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
//                 ))}
//               </select>
//               {fieldErrors.company_id && <p className={classes.errorText}>{fieldErrors.company_id}</p>}

//               {branchMappings.map((row, index) => (
//                 <div key={index} className="flex flex-col gap-3 mt-4">
//                   <div className="flex flex-col gap-1">
//                     <label className={classes.fieldLabel}>Main Branch *</label>
//                     <Select
//                       options={mainBranchOptions}
//                       value={mainBranchOptions.find((o) => o.value === row.main_branch_id) || null}
//                       onChange={(opt) => handleMainBranchChange(index, opt)}
//                     />
//                     {branchFieldErrors?.[index]?.main_branch_id && (
//                       <p className={classes.errorText}>{branchFieldErrors[index].main_branch_id}</p>
//                     )}
//                   </div>

//                   <div className="flex flex-col gap-1">
//                     <label className={classes.fieldLabel}>Sub Branches</label>
//                     <Select
//                       isMulti
//                       options={subBranchOptions.filter((s) => Number(s.parent_branch_id) === Number(row.main_branch_id))}
//                       value={subBranchOptions.filter((o) => row.sub_branch_ids.includes(o.value))}
//                       onChange={(opts) => handleSubBranchChange(index, opts)}
//                       isDisabled={!row.main_branch_id}
//                     />
//                   </div>

//                   {!isEdit && branchMappings.length > 1 && (
//                     <button type="button" onClick={() => removeBranchMapping(index)} className="text-red-600 text-sm self-end">
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}

//               {/* {!isEdit && (
//                 <button type="button" onClick={addBranchMapping} className="text-blue-600 text-sm mt-2">
//                   + Add another
//                 </button>
//               )} */}
//             </>
//           )}
//         </div>

//         {/* FOOTER */}
//         <div className={classes.footer}>
//           <button onClick={activeStep === 1 ? onClose : handlePrevious} className={classes.buttonSecondary}>
//             Back
//           </button>
//           {activeStep < TOTAL_STEPS ? (
//             <button onClick={handleNext} className={classes.buttonPrimary}>Next Step</button>
//           ) : (
//             <button onClick={handleSubmit} disabled={loading} className={classes.buttonPrimary}>
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default DepartmentFormModal;
