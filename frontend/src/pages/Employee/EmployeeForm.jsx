// // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
// // // // // // // // import {
// // // // // // // //   companyAPI,
// // // // // // // //   branchAPI,
// // // // // // // //   departmentAPI,
// // // // // // // //   positionsAPI,
// // // // // // // // } from "../../utils/registrationForms/api";
// // // // // // // // import { employeeAPI } from "../../utils/registrationForms/api";
// // // // // // // // import {
// // // // // // // //   Input,
// // // // // // // //   Textarea,
// // // // // // // //   Select,
// // // // // // // // } from "../../components/Common/Formhandler/FormComponents";
// // // // // // // // import { useNavigate } from "react-router-dom";
// // // // // // // // import { toast } from "react-hot-toast";
// // // // // // // // import { useParams } from "react-router-dom";
// // // // // // // // import DatePicker from "react-datepicker";
// // // // // // // // import "react-datepicker/dist/react-datepicker.css";
// // // // // // // // import { validateLoginPassword } from "../../utils/validation/validations";

// // // // // // // // const EmployeeForm = () => {
// // // // // // // //   const { id } = useParams(); // <-- If id exists → EDIT mode
// // // // // // // //   const [activeTab, setActiveTab] = useState("personal");
// // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // //   const [companies, setCompanies] = useState([]);
// // // // // // // //   const [branches, setBranches] = useState([]);
// // // // // // // //   const [departments, setDepartments] = useState([]);
// // // // // // // //   const [employees, setEmployees] = useState([]);
// // // // // // // //   const [positions, setPositions] = useState([]);
// // // // // // // //   const [fieldErrors, setFieldErrors] = useState({});
// // // // // // // //   const [canGoToEmployment, setCanGoToEmployment] = useState(false);
// // // // // // // //   const [canGoToSystem, setCanGoToSystem] = useState(false);
// // // // // // // //   const navigate = useNavigate();
// // // // // // // //   const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
// // // // // // // //   const seventyYearsAgo = new Date(
// // // // // // // //     new Date().setFullYear(new Date().getFullYear() - 70)
// // // // // // // //   )
// // // // // // // //     .toISOString()
// // // // // // // //     .split("T")[0];
// // // // // // // //   const [formData, setFormData] = useState({
// // // // // // // //     company_id: "",
// // // // // // // //     branch_id: "",
// // // // // // // //     department_id: "",
// // // // // // // //     reports_to: "",
// // // // // // // //     position_id: "",
// // // // // // // //     first_name: "",
// // // // // // // //     last_name: "",
// // // // // // // //     gender: "",
// // // // // // // //     dob: "",
// // // // // // // //     email: "",
// // // // // // // //     phone_number: "",
// // // // // // // //     address: "",
// // // // // // // //     hire_date: "",
// // // // // // // //     employment_type: "Full-time",
// // // // // // // //     username: "", // NEW
// // // // // // // //     password: "", // NEW
// // // // // // // //     confirm_password: "", // NEW
// // // // // // // //   });
// // // // // // // //   const [showPassword, setShowPassword] = useState(false);
// // // // // // // //   const togglePasswordVisibility = () => setShowPassword(!showPassword);

// // // // // // // //   const tabs = [
// // // // // // // //     { id: "personal", label: "Personal Info", icon: "👤" },
// // // // // // // //     { id: "employment", label: "Employment Info", icon: "💼" },
// // // // // // // //     { id: "system", label: "System Access", icon: "🔑" },
// // // // // // // //   ];

// // // // // // // //   useEffect(() => {
// // // // // // // //     if (!id) return; // create mode

// // // // // // // //     const fetchEmployee = async () => {
// // // // // // // //       try {
// // // // // // // //         const data = await employeeAPI.getById(id);
// // // // // // // //         if (data) {
// // // // // // // //           setFormData({
// // // // // // // //             ...data,
// // // // // // // //             password: "", // always empty
// // // // // // // //             confirm_password: "", // always empty
// // // // // // // //           });
// // // // // // // //           setCanGoToEmployment(true); // allow switching tab
// // // // // // // //         }
// // // // // // // //       } catch {
// // // // // // // //         toast.error("Failed to load employee details");
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     fetchEmployee();
// // // // // // // //   }, [id]);

// // // // // // // //   // ---------------------- Fetch Companies ----------------------
// // // // // // // //   useEffect(() => {
// // // // // // // //     const fetchCompanies = async () => {
// // // // // // // //       try {
// // // // // // // //         const res = await companyAPI.getAll();
// // // // // // // //         setCompanies(res ?? []);
// // // // // // // //       } catch {
// // // // // // // //         toast.error("Failed to load companies");
// // // // // // // //         setCompanies([]);
// // // // // // // //       }
// // // // // // // //     };
// // // // // // // //     fetchCompanies();
// // // // // // // //   }, []);

// // // // // // // //   // ---------------------- Fetch Employees ----------------------
// // // // // // // //   useEffect(() => {
// // // // // // // //     const fetchEmployees = async () => {
// // // // // // // //       try {
// // // // // // // //         setLoading(true);
// // // // // // // //         const data = await employeeAPI.getAll();
// // // // // // // //         setEmployees(data ?? []);
// // // // // // // //       } catch {
// // // // // // // //         toast.error("Failed to fetch employees");
// // // // // // // //       } finally {
// // // // // // // //         setLoading(false);
// // // // // // // //       }
// // // // // // // //     };
// // // // // // // //     fetchEmployees();
// // // // // // // //   }, []);

// // // // // // // //   // ---------------------- Fetch Positions ----------------------
// // // // // // // //   useEffect(() => {
// // // // // // // //     const fetchPositions = async () => {
// // // // // // // //       try {
// // // // // // // //         const data = await positionsAPI.getAll();
// // // // // // // //         setPositions(data ?? []);
// // // // // // // //       } catch {
// // // // // // // //         toast.error("Failed to load positions");
// // // // // // // //         setPositions([]);
// // // // // // // //       }
// // // // // // // //     };
// // // // // // // //     fetchPositions();
// // // // // // // //   }, []);

// // // // // // // //   // ---------------------- Fetch Branches on Company Change ----------------------
// // // // // // // //   useEffect(() => {
// // // // // // // //     if (!formData.company_id) return;

// // // // // // // //     const fetchBranches = async () => {
// // // // // // // //       try {
// // // // // // // //         const res = await branchAPI.getByCompany(formData.company_id);
// // // // // // // //         setBranches(res ?? []);
// // // // // // // //         setDepartments([]);
// // // // // // // //         setEmployees([]);
// // // // // // // //       } catch {
// // // // // // // //         toast.error("Failed to load branches");
// // // // // // // //         setBranches([]);
// // // // // // // //       }
// // // // // // // //     };
// // // // // // // //     fetchBranches();
// // // // // // // //   }, [formData.company_id]);

// // // // // // // //   // ---------------------- Fetch Departments on Branch Change ----------------------
// // // // // // // //   useEffect(() => {
// // // // // // // //     if (!formData.company_id || !formData.branch_id) return;

// // // // // // // //     const fetchDepartments = async () => {
// // // // // // // //       try {
// // // // // // // //         const res = await departmentAPI.getByBranch(
// // // // // // // //           formData.company_id,
// // // // // // // //           formData.branch_id
// // // // // // // //         );
// // // // // // // //         setDepartments(res ?? []);
// // // // // // // //       } catch {
// // // // // // // //         toast.error("Failed to load departments");
// // // // // // // //         setDepartments([]);
// // // // // // // //       }
// // // // // // // //     };
// // // // // // // //     fetchDepartments();
// // // // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // // // //   // ---------------------- Fetch Employees for Reports To ----------------------
// // // // // // // //   useEffect(() => {
// // // // // // // //     if (!formData.company_id || !formData.branch_id) {
// // // // // // // //       setEmployees([]);
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     const fetchEmployees = async () => {
// // // // // // // //       try {
// // // // // // // //         const res = await employeeAPI.getByCompanyAndBranch(
// // // // // // // //           formData.company_id,
// // // // // // // //           formData.branch_id
// // // // // // // //         );
// // // // // // // //         setEmployees(res ?? []);
// // // // // // // //       } catch {
// // // // // // // //         toast.error("Failed to load employees for Reports To");
// // // // // // // //         setEmployees([]);
// // // // // // // //       }
// // // // // // // //     };
// // // // // // // //     fetchEmployees();
// // // // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // // // //   const handleBack = () => {
// // // // // // // //     if (activeTab === "system") {
// // // // // // // //       setActiveTab("employment");
// // // // // // // //       setCanGoToSystem(false);
// // // // // // // //     } else if (activeTab === "employment") {
// // // // // // // //       setActiveTab("personal");
// // // // // // // //       setCanGoToEmployment(false);
// // // // // // // //     } else {
// // // // // // // //       navigate("/registration/employee_page");
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   // ---------------------- Handle Input Change ----------------------
// // // // // // // //   const handleChange = (e) => {
// // // // // // // //     const { name, value } = e.target;

// // // // // // // //     // Update form data
// // // // // // // //     if (name === "company_id") {
// // // // // // // //       setFormData({
// // // // // // // //         ...formData,
// // // // // // // //         company_id: value,
// // // // // // // //         branch_id: "",
// // // // // // // //         department_id: "",
// // // // // // // //         reports_to: "",
// // // // // // // //       });
// // // // // // // //     } else if (name === "branch_id") {
// // // // // // // //       setFormData({
// // // // // // // //         ...formData,
// // // // // // // //         branch_id: value,
// // // // // // // //         department_id: "",
// // // // // // // //         reports_to: "",
// // // // // // // //       });
// // // // // // // //     } else {
// // // // // // // //       setFormData({ ...formData, [name]: value });
// // // // // // // //     }

// // // // // // // //     // Clear error for the field as user types/selects
// // // // // // // //     if (fieldErrors[name]) {
// // // // // // // //       setFieldErrors((prevErrors) => {
// // // // // // // //         const updated = { ...prevErrors };
// // // // // // // //         delete updated[name];
// // // // // // // //         return updated;
// // // // // // // //       });
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   // ---------------------- Next Button ----------------------
// // // // // // // //   const handleNext = () => {
// // // // // // // //     const errors = {};

// // // // // // // //     // Name validation
// // // // // // // //     ["first_name", "last_name"].forEach((field) => {
// // // // // // // //       const value = formData[field].trim();
// // // // // // // //       if (!value) errors[field] = `${field.replace("_", " ")} is required`;
// // // // // // // //       else if (/[^a-zA-Z\s]/.test(value))
// // // // // // // //         errors[field] = `${field.replace("_", " ")} must contain only letters`;
// // // // // // // //     });

// // // // // // // //     // Gender
// // // // // // // //     if (!formData.gender) errors.gender = "Gender is required";

// // // // // // // //     // Email validation – improved
// // // // // // // //     if (!formData.email) {
// // // // // // // //       errors.email = "Email is required";
// // // // // // // //     } else {
// // // // // // // //       // Email must have:  something@something.domain(2–10 letters)
// // // // // // // //       const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,10}$/;
// // // // // // // //       if (!emailRegex.test(formData.email)) {
// // // // // // // //         errors.email = "Email is invalid";
// // // // // // // //       }
// // // // // // // //     }

// // // // // // // //     // DOB
// // // // // // // //     if (!formData.dob) errors.dob = "Dob is required";

// // // // // // // //     // Phone number (Required + digits only 7–15)
// // // // // // // //     if (!formData.phone_number) {
// // // // // // // //       errors.phone_number = "Phone number is required";
// // // // // // // //     } else if (!/^\d{10}$/.test(formData.phone_number)) {
// // // // // // // //       errors.phone_number = "Phone number must be exactly 10 digits";
// // // // // // // //     }

// // // // // // // //     setFieldErrors(errors);

// // // // // // // //     if (Object.keys(errors).length === 0) {
// // // // // // // //       setActiveTab("employment");
// // // // // // // //       setCanGoToEmployment(true);
// // // // // // // //     } else {
// // // // // // // //       toast.error("Please fix the errors in Personal Info");
// // // // // // // //       setCanGoToEmployment(false);
// // // // // // // //     }
// // // // // // // //   };
// // // // // // // //  const handleNextToSystem = () => {
// // // // // // // //   const errors = {};

// // // // // // // //   const fieldLabels = {
// // // // // // // //     company_id: "Company",
// // // // // // // //     branch_id: "Branch",
// // // // // // // //     department_id: "Department",
// // // // // // // //     position_id: "Position",
// // // // // // // //     reports_to: "Reports To",
// // // // // // // //   };

// // // // // // // //   Object.keys(fieldLabels).forEach((field) => {
// // // // // // // //     if (!formData[field]) {
// // // // // // // //       errors[field] = `${fieldLabels[field]} is required`;
// // // // // // // //     }
// // // // // // // //   });

// // // // // // // //   setFieldErrors(errors);

// // // // // // // //   if (Object.keys(errors).length === 0) {
// // // // // // // //     setActiveTab("system");
// // // // // // // //     setCanGoToSystem(true);
// // // // // // // //   } else {
// // // // // // // //     toast.error("Please fix the errors in Employment Info");
// // // // // // // //     setCanGoToSystem(false);
// // // // // // // //   }
// // // // // // // // };

// // // // // // // //   // ---------------------- Submit ----------------------
// // // // // // // //   const handleSubmit = async (e) => {
// // // // // // // //     e.preventDefault();

// // // // // // // //     let errors = {};

// // // // // // // //     // ---------------------- Personal Info Validation ----------------------
// // // // // // // //     ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // // // // // // //       (field) => {
// // // // // // // //         const value = formData[field]?.trim();
// // // // // // // //         if (!value) {
// // // // // // // //           errors[field] = `${field.replace("_", " ")} is required`;
// // // // // // // //         } else {
// // // // // // // //           if (
// // // // // // // //             (field === "first_name" || field === "last_name") &&
// // // // // // // //             /[^a-zA-Z ]/.test(value)
// // // // // // // //           ) {
// // // // // // // //             errors[field] = `${field.replace(
// // // // // // // //               "_",
// // // // // // // //               " "
// // // // // // // //             )} must contain only letters`;
// // // // // // // //           }
// // // // // // // //           if (
// // // // // // // //             field === "email" &&
// // // // // // // //             !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,10}$/.test(value)
// // // // // // // //           ) {
// // // // // // // //             errors[field] = "Email is invalid";
// // // // // // // //           }
// // // // // // // //           if (field === "phone_number" && !/^\d{10}$/.test(value)) {
// // // // // // // //             errors[field] = "Phone number must be exactly 10 digits";
// // // // // // // //           }
// // // // // // // //         }
// // // // // // // //       }
// // // // // // // //     );

// // // // // // // //     // ---------------------- Employment Info Validation ----------------------
// // // // // // // //     ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // // // // // // //       (field) => {
// // // // // // // //         if (!formData[field]) {
// // // // // // // //           errors[field] = `${field.replace("_", " ")} is required`;
// // // // // // // //         }
// // // // // // // //       }
// // // // // // // //     );

// // // // // // // //     // ---------------------- System Access Validation ----------------------
// // // // // // // //     if (!id) {
// // // // // // // //       // CREATE → Username & Password required
// // // // // // // //       if (!formData.username?.trim()) errors.username = "Username is required";

// // // // // // // //       const passwordError = validateLoginPassword(formData.password);
// // // // // // // //       if (passwordError) errors.password = passwordError;

// // // // // // // //       if (formData.password !== formData.confirm_password) {
// // // // // // // //         errors.confirm_password = "Passwords do not match";
// // // // // // // //       }
// // // // // // // //     } else {
// // // // // // // //       // UPDATE → Password optional
// // // // // // // //       if (formData.password?.trim()) {
// // // // // // // //         const passwordError = validateLoginPassword(formData.password);
// // // // // // // //         if (passwordError) errors.password = passwordError;

// // // // // // // //         if (formData.password !== formData.confirm_password) {
// // // // // // // //           errors.confirm_password = "Passwords do not match";
// // // // // // // //         }
// // // // // // // //       }
// // // // // // // //     }

// // // // // // // //     setFieldErrors(errors);

// // // // // // // //     if (Object.keys(errors).length > 0) {
// // // // // // // //       return toast.error("Please fix all errors before submitting");
// // // // // // // //     }

// // // // // // // //     setLoading(true);

// // // // // // // //     try {
// // // // // // // //       if (id) {
// // // // // // // //         // UPDATE
// // // // // // // //         await employeeAPI.update(id, formData);
// // // // // // // //         toast.success("Employee updated successfully!");
// // // // // // // //         navigate("/registration/employee_page");
// // // // // // // //       } else {
// // // // // // // //         // CREATE
// // // // // // // //         await employeeAPI.create(formData);
// // // // // // // //         toast.success("Employee created successfully!");
// // // // // // // //         navigate("/registration/employee_page");
// // // // // // // //       }
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error(err);
// // // // // // // //       toast.error(
// // // // // // // //         id ? "Failed to update employee" : "Failed to create employee"
// // // // // // // //       );
// // // // // // // //     } finally {
// // // // // // // //       setLoading(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   // ---------------------- Render ----------------------
// // // // // // // //   return (
// // // // // // // //     <DashboardLayout pageTitle="Employee Form">
// // // // // // // //       <div className="p-6 mx-10">
// // // // // // // //         <h1 className="text-3xl font-bold mb-6">
// // // // // // // //           {id ? "Update Employee" : "Create Employee"}
// // // // // // // //         </h1>

// // // // // // // //         {/* Tabs */}
// // // // // // // //         <div className="flex space-x-3 mb-6">
// // // // // // // //           {tabs.map((tab) => {
// // // // // // // //             const isDisabled =
// // // // // // // //               (tab.id === "employment" && !canGoToEmployment) ||
// // // // // // // //               (tab.id === "system" && !canGoToSystem);

// // // // // // // //             return (
// // // // // // // //               <button
// // // // // // // //                 key={tab.id}
// // // // // // // //                 onClick={() => {
// // // // // // // //                   if (!isDisabled) setActiveTab(tab.id);
// // // // // // // //                 }}
// // // // // // // //                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
// // // // // // // //         ${
// // // // // // // //           activeTab === tab.id
// // // // // // // //             ? "bg-blue-600 text-white shadow-md scale-105"
// // // // // // // //             : isDisabled
// // // // // // // //             ? "bg-gray-200 text-gray-400 cursor-not-allowed"
// // // // // // // //             : "bg-gray-100 hover:bg-gray-200"
// // // // // // // //         }`}
// // // // // // // //                 disabled={isDisabled}
// // // // // // // //               >
// // // // // // // //                 <span>{tab.icon}</span> {tab.label}
// // // // // // // //               </button>
// // // // // // // //             );
// // // // // // // //           })}
// // // // // // // //         </div>

// // // // // // // //         <form onSubmit={handleSubmit} className="space-y-6">
// // // // // // // //           {/* Personal Tab */}
// // // // // // // //           {activeTab === "personal" && (
// // // // // // // //             <div className="bg-white p-6 rounded-xl shadow space-y-4">
// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 <Input
// // // // // // // //                   label="First Name *"
// // // // // // // //                   name="first_name"
// // // // // // // //                   value={formData.first_name}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />
// // // // // // // //                 <Input
// // // // // // // //                   label="Last Name *"
// // // // // // // //                   name="last_name"
// // // // // // // //                   value={formData.last_name}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />
// // // // // // // //               </div>
// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 <Select
// // // // // // // //                   label="Gender *"
// // // // // // // //                   name="gender"
// // // // // // // //                   value={formData.gender}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />

// // // // // // // //                 {/* Custom Styled Date Picker */}
// // // // // // // //                 <div className="flex flex-col w-full">
// // // // // // // //                   <label className="mb-1 font-medium text-gray-700">
// // // // // // // //                     Date of Birth *
// // // // // // // //                   </label>

// // // // // // // //                   <DatePicker
// // // // // // // //                     selected={formData.dob}
// // // // // // // //                     onChange={(date) =>
// // // // // // // //                       handleChange({ target: { name: "dob", value: date } })
// // // // // // // //                     }
// // // // // // // //                     maxDate={today}
// // // // // // // //                     minDate={seventyYearsAgo}
// // // // // // // //                     placeholderText="Select Date of Birth"
// // // // // // // //                     showYearDropdown
// // // // // // // //                     scrollableYearDropdown
// // // // // // // //                     yearDropdownItemNumber={70}
// // // // // // // //                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
// // // // // // // //                   />

// // // // // // // //                   {/* error message below box */}
// // // // // // // //                   {fieldErrors?.dob && (
// // // // // // // //                     <p className="text-red-500 text-sm mt-1">
// // // // // // // //                       {fieldErrors.dob}
// // // // // // // //                     </p>
// // // // // // // //                   )}
// // // // // // // //                 </div>
// // // // // // // //               </div>

// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 <Input
// // // // // // // //                   type="email"
// // // // // // // //                   label="Email *"
// // // // // // // //                   name="email"
// // // // // // // //                   value={formData.email}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                 />
// // // // // // // //                 <Input
// // // // // // // //                   label="Phone Number *"
// // // // // // // //                   name="phone_number"
// // // // // // // //                   value={formData.phone_number}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                 />
// // // // // // // //               </div>

// // // // // // // //               <Textarea
// // // // // // // //                 label="Address"
// // // // // // // //                 name="address"
// // // // // // // //                 value={formData.address}
// // // // // // // //                 onChange={handleChange}
// // // // // // // //                 fieldErrors={fieldErrors}
// // // // // // // //               />

// // // // // // // //               <div className="flex justify-end mt-4 gap-x-4">
// // // // // // // //                 <button
// // // // // // // //                   type="button"
// // // // // // // //                   onClick={handleBack}
// // // // // // // //                   className="px-6 py-2 rounded-lg text-white font-medium bg-blue-600 transition"
// // // // // // // //                 >
// // // // // // // //                   Back
// // // // // // // //                 </button>

// // // // // // // //                 <button
// // // // // // // //                   type="button"
// // // // // // // //                   onClick={handleNext}
// // // // // // // //                   style={{background:"rgb(1, 23, 72)"}}
// // // // // // // //                   className="px-6 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition"
// // // // // // // //                 >
// // // // // // // //                   Next
// // // // // // // //                 </button>
// // // // // // // //               </div>
// // // // // // // //             </div>
// // // // // // // //           )}

// // // // // // // //           {/* Employment Tab */}
// // // // // // // //           {activeTab === "employment" && (
// // // // // // // //             <div className="bg-white p-6 rounded-xl shadow space-y-4">
// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 <Select
// // // // // // // //                   label="Company *"
// // // // // // // //                   name="company_id"
// // // // // // // //                   value={formData.company_id}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={companies
// // // // // // // //                     .sort((a, b) =>
// // // // // // // //                       a.company_name.localeCompare(b.company_name)
// // // // // // // //                     ) // Sorting in ascending order
// // // // // // // //                     .map((c) => ({
// // // // // // // //                       v: c.company_id,
// // // // // // // //                       label: c.company_name,
// // // // // // // //                     }))}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />

// // // // // // // //                 <Select
// // // // // // // //                   label="Branch *"
// // // // // // // //                   name="branch_id"
// // // // // // // //                   value={formData.branch_id}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={branches
// // // // // // // //                     .sort((a, b) => a.branch_name.localeCompare(b.branch_name)) // Sorting in ascending order
// // // // // // // //                     .map((b) => ({
// // // // // // // //                       v: b.branch_id,
// // // // // // // //                       label: b.branch_name,
// // // // // // // //                     }))}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />
// // // // // // // //               </div>

// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 <Select
// // // // // // // //                   label="Department *"
// // // // // // // //                   name="department_id"
// // // // // // // //                   value={formData.department_id}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={departments.map((d) => ({
// // // // // // // //                     v: d.department_id,
// // // // // // // //                     label: d.department_name,
// // // // // // // //                   }))}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />
// // // // // // // //                 <Select
// // // // // // // //                   label="Reports To *"
// // // // // // // //                   name="reports_to"
// // // // // // // //                   value={formData.reports_to}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={employees.map((emp) => ({
// // // // // // // //                     v: emp.employee_id,
// // // // // // // //                     label: `${emp.first_name} ${emp.last_name}`,
// // // // // // // //                   }))}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                 />
// // // // // // // //               </div>

// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 <Select
// // // // // // // //                   label="Position *"
// // // // // // // //                   name="position_id"
// // // // // // // //                   value={formData.position_id}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={positions.map((pos) => ({
// // // // // // // //                     v: pos.position_id,
// // // // // // // //                     label: pos.position_name,
// // // // // // // //                   }))}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />

// // // // // // // //                 {/* Styled Hire Date Picker */}
// // // // // // // //                 <div className="flex flex-col w-full">
// // // // // // // //                   <label className="mb-1 font-medium text-gray-700">
// // // // // // // //                     Hire Date
// // // // // // // //                   </label>

// // // // // // // //                   <DatePicker
// // // // // // // //                     selected={formData.hire_date}
// // // // // // // //                     onChange={(date) =>
// // // // // // // //                       handleChange({
// // // // // // // //                         target: { name: "hire_date", value: date },
// // // // // // // //                       })
// // // // // // // //                     }
// // // // // // // //                     maxDate={today}
// // // // // // // //                     placeholderText="Select Hire Date"
// // // // // // // //                     className="
// // // // // // // //         w-full px-3 py-2
// // // // // // // //         border border-gray-300 rounded-md
// // // // // // // //         focus:ring-2 focus:ring-blue-500 focus:outline-none
// // // // // // // //       "
// // // // // // // //                   />

// // // // // // // //                   {fieldErrors?.hire_date && (
// // // // // // // //                     <p className="text-red-500 text-sm mt-1">
// // // // // // // //                       {fieldErrors.hire_date}
// // // // // // // //                     </p>
// // // // // // // //                   )}
// // // // // // // //                 </div>
// // // // // // // //               </div>

// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 <Select
// // // // // // // //                   label="Employment Type"
// // // // // // // //                   name="employment_type"
// // // // // // // //                   value={formData.employment_type}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={[
// // // // // // // //                     { v: "Full-time" },
// // // // // // // //                     { v: "Part-time" },
// // // // // // // //                     { v: "Contract" },
// // // // // // // //                     { v: "Intern" },
// // // // // // // //                   ]}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                 />
// // // // // // // //                 {/* <Select
// // // // // // // //                   label="Status"
// // // // // // // //                   name="status_id"
// // // // // // // //                   value={formData.status_id}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   options={[
// // // // // // // //                     { v: 1, label: "Active" },
// // // // // // // //                     { v: 7, label: "Pending" },
// // // // // // // //                     { v: 0, label: "Inactive" },
// // // // // // // //                   ]}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                 /> */}
// // // // // // // //               </div>
// // // // // // // //               <div className="flex justify-end mt-6 gap-x-4">
// // // // // // // //                 <button
// // // // // // // //                   type="button"
// // // // // // // //                   onClick={handleBack}
// // // // // // // //                   className="px-6 bg-blue-600 py-2 rounded-lg text-white font-medium  hover:bg-gray-600 transition"
// // // // // // // //                 >
// // // // // // // //                   Back
// // // // // // // //                 </button>

// // // // // // // //                 <button
// // // // // // // //                   type="button"
// // // // // // // //                   style={{background:"rgb(1, 23, 72)"}}
// // // // // // // //                   onClick={handleNextToSystem}
// // // // // // // //                   className="px-6 py-2 rounded-lg text-white font-medium transition"
// // // // // // // //                 >
// // // // // // // //                   Next
// // // // // // // //                 </button>
// // // // // // // //               </div>
// // // // // // // //             </div>
// // // // // // // //           )}
// // // // // // // //           {/* System Access Tab */}
// // // // // // // //           {activeTab === "system" && (
// // // // // // // //             <div className="bg-white p-6 rounded-xl shadow space-y-4">
// // // // // // // //               <div className="grid grid-cols-2 gap-6">
// // // // // // // //                 {/* Username */}
// // // // // // // //                 <Input
// // // // // // // //                   label="Username *"
// // // // // // // //                   name="username"
// // // // // // // //                   value={formData.username || ""}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   required
// // // // // // // //                 />

// // // // // // // //                 {/* Password */}
// // // // // // // //                 <Input
// // // // // // // //                   type="password"
// // // // // // // //                   label={id ? "New Password" : "Password *"} // Edit mode label
// // // // // // // //                   name="password"
// // // // // // // //                   value={formData.password || ""} // Will be empty initially in edit
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   placeholder={id ? "Enter new password to change" : ""}
// // // // // // // //                   required={!id} // Only required for create
// // // // // // // //                 />

// // // // // // // //                 <Input
// // // // // // // //                   type="password"
// // // // // // // //                   label={id ? "Confirm New Password" : "Confirm Password *"}
// // // // // // // //                   name="confirm_password"
// // // // // // // //                   value={formData.confirm_password || ""}
// // // // // // // //                   onChange={handleChange}
// // // // // // // //                   fieldErrors={fieldErrors}
// // // // // // // //                   placeholder={id ? "Confirm new password" : ""}
// // // // // // // //                   required={!id} // Only required for create
// // // // // // // //                 />
// // // // // // // //               </div>

// // // // // // // //               <div className="flex justify-end mt-6 gap-x-4">
// // // // // // // //                 <button
// // // // // // // //                   type="button"
// // // // // // // //                   onClick={handleBack}
// // // // // // // //                   className="px-6 py-2 rounded-lg text-white font-medium bg-blue-600 transition"
// // // // // // // //                 >
// // // // // // // //                   Back
// // // // // // // //                 </button>

// // // // // // // //                 <button
// // // // // // // //                   type="submit"
// // // // // // // //                   disabled={loading}
// // // // // // // //                   className="px-6 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition"
// // // // // // // //                 >
// // // // // // // //                   {loading
// // // // // // // //                     ? "Saving..."
// // // // // // // //                     : id
// // // // // // // //                     ? "Update Employee"
// // // // // // // //                     : "Create Employee"}
// // // // // // // //                 </button>
// // // // // // // //               </div>
// // // // // // // //             </div>
// // // // // // // //           )}
// // // // // // // //         </form>
// // // // // // // //       </div>
// // // // // // // //     </DashboardLayout>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default EmployeeForm;
// // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // import { XMarkIcon } from "@heroicons/react/24/outline";
// // // // // // // import { toast } from "react-hot-toast";
// // // // // // // import DatePicker from "react-datepicker";
// // // // // // // import "react-datepicker/dist/react-datepicker.css";

// // // // // // // import {
// // // // // // //   overlay,
// // // // // // //   drawer,
// // // // // // //   header,
// // // // // // //   headerTitle,
// // // // // // //   headerSubTitle,
// // // // // // //   closeButton,
// // // // // // //   progressBarOuter,
// // // // // // //   progressBarInner,
// // // // // // //   body,
// // // // // // //   sectionTitle,
// // // // // // //   fieldLabel,
// // // // // // //   inputClass,
// // // // // // //   selectClass,
// // // // // // //   radioGroup,
// // // // // // //   radioLabel,
// // // // // // //   footer,
// // // // // // //   buttonSecondary,
// // // // // // //   buttonPrimary,
// // // // // // //   errorText,
// // // // // // // } from "../../formClasses"; // your CSS module

// // // // // // // import { Input, Textarea, Select } from "../../components/Common/Formhandler/FormComponents";
// // // // // // // import { useNavigate, useParams } from "react-router-dom";
// // // // // // // import { validateLoginPassword } from "../../utils/validation/validations";
// // // // // // // import { employeeAPI, companyAPI, branchAPI, departmentAPI, positionsAPI } from "../../utils/registrationForms/api";

// // // // // // // const EmployeeForm = ({ onClose }) => {
// // // // // // //   const { id } = useParams();
// // // // // // //   const navigate = useNavigate();

// // // // // // //   const TOTAL_STEPS = 3;
// // // // // // //   const [activeStep, setActiveStep] = useState(1);
// // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // //   const [companies, setCompanies] = useState([]);
// // // // // // //   const [branches, setBranches] = useState([]);
// // // // // // //   const [departments, setDepartments] = useState([]);
// // // // // // //   const [employees, setEmployees] = useState([]);
// // // // // // //   const [positions, setPositions] = useState([]);
// // // // // // //   const [fieldErrors, setFieldErrors] = useState({});

// // // // // // //   const today = new Date();
// // // // // // //   const seventyYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 70));

// // // // // // //   const [formData, setFormData] = useState({
// // // // // // //     company_id: "",
// // // // // // //     branch_id: "",
// // // // // // //     department_id: "",
// // // // // // //     reports_to: "",
// // // // // // //     position_id: "",
// // // // // // //     first_name: "",
// // // // // // //     last_name: "",
// // // // // // //     gender: "",
// // // // // // //     dob: null,
// // // // // // //     email: "",
// // // // // // //     phone_number: "",
// // // // // // //     address: "",
// // // // // // //     hire_date: null,
// // // // // // //     employment_type: "Full-time",
// // // // // // //     username: "",
// // // // // // //     password: "",
// // // // // // //     confirm_password: "",
// // // // // // //   });

// // // // // // //   const [showPassword, setShowPassword] = useState(false);
// // // // // // //   const togglePasswordVisibility = () => setShowPassword(!showPassword);

// // // // // // //   // ---------------------- Fetch Data ----------------------
// // // // // // //   useEffect(() => {
// // // // // // //     const fetchCompanies = async () => {
// // // // // // //       try {
// // // // // // //         const res = await companyAPI.getAll();
// // // // // // //         setCompanies(res ?? []);
// // // // // // //       } catch {
// // // // // // //         toast.error("Failed to load companies");
// // // // // // //       }
// // // // // // //     };
// // // // // // //     fetchCompanies();

// // // // // // //     const fetchPositions = async () => {
// // // // // // //       try {
// // // // // // //         const res = await positionsAPI.getAll();
// // // // // // //         setPositions(res ?? []);
// // // // // // //       } catch {
// // // // // // //         toast.error("Failed to load positions");
// // // // // // //       }
// // // // // // //     };
// // // // // // //     fetchPositions();
// // // // // // //   }, []);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!id) return;
// // // // // // //     const fetchEmployee = async () => {
// // // // // // //       try {
// // // // // // //         const data = await employeeAPI.getById(id);
// // // // // // //         if (data) setFormData({ ...data, dob: data.dob ? new Date(data.dob) : null, hire_date: data.hire_date ? new Date(data.hire_date) : null, password: "", confirm_password: "" });
// // // // // // //       } catch {
// // // // // // //         toast.error("Failed to load employee");
// // // // // // //       }
// // // // // // //     };
// // // // // // //     fetchEmployee();
// // // // // // //   }, [id]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!formData.company_id) return;
// // // // // // //     const fetchBranches = async () => {
// // // // // // //       try {
// // // // // // //         const res = await branchAPI.getByCompany(formData.company_id);
// // // // // // //         setBranches(res ?? []);
// // // // // // //         setDepartments([]);
// // // // // // //         setEmployees([]);
// // // // // // //       } catch {
// // // // // // //         toast.error("Failed to load branches");
// // // // // // //       }
// // // // // // //     };
// // // // // // //     fetchBranches();
// // // // // // //   }, [formData.company_id]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!formData.company_id || !formData.branch_id) return;
// // // // // // //     const fetchDepartments = async () => {
// // // // // // //       try {
// // // // // // //         const res = await departmentAPI.getByBranch(formData.company_id, formData.branch_id);
// // // // // // //         setDepartments(res ?? []);
// // // // // // //       } catch {
// // // // // // //         toast.error("Failed to load departments");
// // // // // // //       }
// // // // // // //     };
// // // // // // //     fetchDepartments();
// // // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!formData.company_id || !formData.branch_id) return;
// // // // // // //     const fetchEmployees = async () => {
// // // // // // //       try {
// // // // // // //         const res = await employeeAPI.getByCompanyAndBranch(formData.company_id, formData.branch_id);
// // // // // // //         setEmployees(res ?? []);
// // // // // // //       } catch {
// // // // // // //         toast.error("Failed to load employees");
// // // // // // //       }
// // // // // // //     };
// // // // // // //     fetchEmployees();
// // // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // // //   // ---------------------- Handlers ----------------------
// // // // // // //   const handleChange = (e) => {
// // // // // // //     const { name, value } = e.target;
// // // // // // //     if (name === "company_id") {
// // // // // // //       setFormData({ ...formData, company_id: value, branch_id: "", department_id: "", reports_to: "" });
// // // // // // //     } else if (name === "branch_id") {
// // // // // // //       setFormData({ ...formData, branch_id: value, department_id: "", reports_to: "" });
// // // // // // //     } else setFormData({ ...formData, [name]: value });

// // // // // // //     if (fieldErrors[name]) {
// // // // // // //       const updatedErrors = { ...fieldErrors };
// // // // // // //       delete updatedErrors[name];
// // // // // // //       setFieldErrors(updatedErrors);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleBack = () => {
// // // // // // //     if (activeStep === 1) onClose();
// // // // // // //     else setActiveStep((prev) => prev - 1);
// // // // // // //   };

// // // // // // //   const handleNext = () => {
// // // // // // //     const errors = {};
// // // // // // //     if (activeStep === 1) {
// // // // // // //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach((field) => {
// // // // // // //         if (!formData[field]?.trim()) errors[field] = "This field is required";
// // // // // // //       });
// // // // // // //       if (!formData.dob) errors.dob = "Date of birth is required";
// // // // // // //       if (Object.keys(errors).length === 0) setActiveStep(2);
// // // // // // //       else setFieldErrors(errors);
// // // // // // //     } else if (activeStep === 2) {
// // // // // // //       ["company_id", "branch_id", "department_id", "position_id"].forEach((field) => {
// // // // // // //         if (!formData[field]) errors[field] = "This field is required";
// // // // // // //       });
// // // // // // //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// // // // // // //       if (Object.keys(errors).length === 0) setActiveStep(3);
// // // // // // //       else setFieldErrors(errors);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleSubmit = async (e) => {
// // // // // // //     e.preventDefault();
// // // // // // //     const errors = {};

// // // // // // //     ["first_name", "last_name", "gender", "email", "phone_number"].forEach((field) => {
// // // // // // //       if (!formData[field]?.trim()) errors[field] = "This field is required";
// // // // // // //     });
// // // // // // //     ["company_id", "branch_id", "department_id", "position_id"].forEach((field) => {
// // // // // // //       if (!formData[field]) errors[field] = "This field is required";
// // // // // // //     });

// // // // // // //     if (!id) {
// // // // // // //       if (!formData.username?.trim()) errors.username = "Username is required";
// // // // // // //       const passwordError = validateLoginPassword(formData.password);
// // // // // // //       if (passwordError) errors.password = passwordError;
// // // // // // //       if (formData.password !== formData.confirm_password) errors.confirm_password = "Passwords do not match";
// // // // // // //     }

// // // // // // //     setFieldErrors(errors);
// // // // // // //     if (Object.keys(errors).length > 0) return;

// // // // // // //     setLoading(true);
// // // // // // //     try {
// // // // // // //       if (id) await employeeAPI.update(id, formData);
// // // // // // //       else await employeeAPI.create(formData);
// // // // // // //       toast.success("Employee saved successfully");
// // // // // // //       onClose();
// // // // // // //     } catch {
// // // // // // //       toast.error("Failed to save employee");
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <>
// // // // // // //       {/* Overlay */}
// // // // // // //       <div className={overlay} onClick={onClose}></div>

// // // // // // //       {/* Drawer */}
// // // // // // //       <div className={drawer}>
// // // // // // //         {/* Header */}
// // // // // // //         <div className={header}>
// // // // // // //           <div>
// // // // // // //             <h2 className={headerTitle}>{id ? "Edit Employee" : "Create Employee"}</h2>
// // // // // // //             <p className={headerSubTitle}>
// // // // // // //               STEP {activeStep} OF {TOTAL_STEPS}
// // // // // // //             </p>
// // // // // // //           </div>
// // // // // // //           <button onClick={onClose} className={closeButton}>
// // // // // // //             <XMarkIcon className="w-6 h-6 text-[#011748]" />
// // // // // // //           </button>
// // // // // // //         </div>

// // // // // // //         {/* Progress Bar */}
// // // // // // //         <div className={progressBarOuter}>
// // // // // // //           <div className={progressBarInner} style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }} />
// // // // // // //         </div>

// // // // // // //         {/* Form Body */}
// // // // // // //         <form onSubmit={handleSubmit} className={body}>
// // // // // // //           {/* Step 1: Personal Info */}
// // // // // // //           {activeStep === 1 && (
// // // // // // //             <div className="space-y-4">
// // // // // // //               <h3 className={sectionTitle}>Personal Info</h3>
// // // // // // //               <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //               <Input label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //               <Select
// // // // // // //                 label="Gender *"
// // // // // // //                 name="gender"
// // // // // // //                 value={formData.gender}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 selectClass={selectClass}
// // // // // // //               />
// // // // // // //               <div>
// // // // // // //                 <label className={fieldLabel}>Date of Birth *</label>
// // // // // // //                 <DatePicker
// // // // // // //                   selected={formData.dob}
// // // // // // //                   onChange={(date) => setFormData({ ...formData, dob: date })}
// // // // // // //                   className={inputClass}
// // // // // // //                   maxDate={today}
// // // // // // //                   minDate={seventyYearsAgo}
// // // // // // //                   placeholderText="Select date"
// // // // // // //                   dateFormat="yyyy-MM-dd"
// // // // // // //                 />
// // // // // // //                 {fieldErrors.dob && <p className={errorText}>{fieldErrors.dob}</p>}
// // // // // // //               </div>
// // // // // // //               <Input label="Email *" name="email" value={formData.email} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //               <Input label="Phone Number *" name="phone_number" value={formData.phone_number} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //               <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //             </div>
// // // // // // //           )}

// // // // // // //           {/* Step 2: Employment Info */}
// // // // // // //           {activeStep === 2 && (
// // // // // // //             <div className="space-y-4">
// // // // // // //               <h3 className={sectionTitle}>Employment Info</h3>
// // // // // // //               <Select label="Company *" name="company_id" value={formData.company_id} onChange={handleChange} options={companies.map(c => ({ v: c.company_id, label: c.company_name }))} fieldErrors={fieldErrors} selectClass={selectClass} />
// // // // // // //               <Select label="Branch *" name="branch_id" value={formData.branch_id} onChange={handleChange} options={branches.map(b => ({ v: b.branch_id, label: b.branch_name }))} fieldErrors={fieldErrors} selectClass={selectClass} />
// // // // // // //               <Select label="Department *" name="department_id" value={formData.department_id} onChange={handleChange} options={departments.map(d => ({ v: d.department_id, label: d.department_name }))} fieldErrors={fieldErrors} selectClass={selectClass} />
// // // // // // //               <Select label="Reports To" name="reports_to" value={formData.reports_to} onChange={handleChange} options={employees.map(emp => ({ v: emp.employee_id, label: `${emp.first_name} ${emp.last_name}` }))} fieldErrors={fieldErrors} selectClass={selectClass} />
// // // // // // //               <Select label="Position *" name="position_id" value={formData.position_id} onChange={handleChange} options={positions.map(pos => ({ v: pos.position_id, label: pos.position_name }))} fieldErrors={fieldErrors} selectClass={selectClass} />
// // // // // // //               <div>
// // // // // // //                 <label className={fieldLabel}>Hire Date *</label>
// // // // // // //                 <DatePicker
// // // // // // //                   selected={formData.hire_date}
// // // // // // //                   onChange={(date) => setFormData({ ...formData, hire_date: date })}
// // // // // // //                   className={inputClass}
// // // // // // //                   maxDate={today}
// // // // // // //                   placeholderText="Select date"
// // // // // // //                   dateFormat="yyyy-MM-dd"
// // // // // // //                 />
// // // // // // //                 {fieldErrors.hire_date && <p className={errorText}>{fieldErrors.hire_date}</p>}
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           )}

// // // // // // //           {/* Step 3: System Access */}
// // // // // // //           {activeStep === 3 && (
// // // // // // //             <div className="space-y-4">
// // // // // // //               <h3 className={sectionTitle}>System Access</h3>
// // // // // // //               <Input label="Username *" name="username" value={formData.username} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //               <Input type={showPassword ? "text" : "password"} label="Password" name="password" value={formData.password} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //               <Input type={showPassword ? "text" : "password"} label="Confirm Password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} fieldErrors={fieldErrors} inputClass={inputClass} />
// // // // // // //               <div className="flex items-center gap-2">
// // // // // // //                 <input type="checkbox" checked={showPassword} onChange={togglePasswordVisibility} />
// // // // // // //                 <span className="text-sm text-[#1e293b]">Show Passwords</span>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           )}

// // // // // // //           {/* Footer Buttons */}
// // // // // // //           <div className={footer}>
// // // // // // //             <button type="button" className={buttonSecondary} onClick={handleBack}>Back</button>
// // // // // // //             {activeStep < TOTAL_STEPS ? (
// // // // // // //               <button type="button" className={buttonPrimary} onClick={handleNext}>Next</button>
// // // // // // //             ) : (
// // // // // // //               <button type="submit" className={buttonPrimary} disabled={loading}>{loading ? "Saving..." : "Submit"}</button>
// // // // // // //             )}
// // // // // // //           </div>
// // // // // // //         </form>
// // // // // // //       </div>
// // // // // // //     </>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default EmployeeForm;
// // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // import { XMarkIcon } from "@heroicons/react/24/outline";
// // // // // // // import { toast } from "react-hot-toast";
// // // // // // // import DatePicker from "react-datepicker";
// // // // // // // import "react-datepicker/dist/react-datepicker.css";

// // // // // // // import {
// // // // // // //   overlay,
// // // // // // //   drawer,
// // // // // // //   header,
// // // // // // //   headerTitle,
// // // // // // //   headerSubTitle,
// // // // // // //   closeButton,
// // // // // // //   progressBarOuter,
// // // // // // //   progressBarInner,
// // // // // // //   body,
// // // // // // //   sectionTitle,
// // // // // // //   fieldLabel,
// // // // // // //   inputClass,
// // // // // // //   selectClass,
// // // // // // //   footer,
// // // // // // //   buttonSecondary,
// // // // // // //   buttonPrimary,
// // // // // // //   errorText,
// // // // // // // } from "../../formClasses";

// // // // // // // import {
// // // // // // //   Input,
// // // // // // //   Textarea,
// // // // // // //   Select,
// // // // // // // } from "../../components/Common/Formhandler/FormComponents";
// // // // // // // import { validateLoginPassword } from "../../utils/validation/validations";
// // // // // // // import {
// // // // // // //   employeeAPI,
// // // // // // //   companyAPI,
// // // // // // //   branchAPI,
// // // // // // //   departmentAPI,
// // // // // // //   positionsAPI,
// // // // // // // } from "../../utils/registrationForms/api";

// // // // // // // const EmployeeForm = ({ id, onClose }) => {
// // // // // // //   const TOTAL_STEPS = 3;
// // // // // // //   const [activeStep, setActiveStep] = useState(1);
// // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // //   const [companies, setCompanies] = useState([]);
// // // // // // //   const [branches, setBranches] = useState([]);
// // // // // // //   const [departments, setDepartments] = useState([]);
// // // // // // //   const [employees, setEmployees] = useState([]);
// // // // // // //   const [positions, setPositions] = useState([]);
// // // // // // //   const [fieldErrors, setFieldErrors] = useState({});

// // // // // // //   const today = new Date();
// // // // // // //   const seventyYearsAgo = new Date(
// // // // // // //     new Date().setFullYear(new Date().getFullYear() - 70)
// // // // // // //   );

// // // // // // //   const [formData, setFormData] = useState({
// // // // // // //     company_id: "",
// // // // // // //     branch_id: "",
// // // // // // //     department_id: "",
// // // // // // //     reports_to: "",
// // // // // // //     position_id: "",
// // // // // // //     first_name: "",
// // // // // // //     last_name: "",
// // // // // // //     gender: "",
// // // // // // //     dob: null,
// // // // // // //     email: "",
// // // // // // //     phone_number: "",
// // // // // // //     address: "",
// // // // // // //     hire_date: null,
// // // // // // //     employment_type: "Full-time",
// // // // // // //     username: "",
// // // // // // //     password: "",
// // // // // // //     confirm_password: "",
// // // // // // //   });

// // // // // // //   const [showPassword, setShowPassword] = useState(false);
// // // // // // //   const togglePasswordVisibility = () => setShowPassword(!showPassword);

// // // // // // //   // ---------------------- Fetch static data ----------------------
// // // // // // //   useEffect(() => {
// // // // // // //     companyAPI
// // // // // // //       .getAll()
// // // // // // //       .then((res) => setCompanies(res ?? []))
// // // // // // //       .catch(() => toast.error("Failed to load companies"));
// // // // // // //     positionsAPI
// // // // // // //       .getAll()
// // // // // // //       .then((res) => setPositions(res ?? []))
// // // // // // //       .catch(() => toast.error("Failed to load positions"));
// // // // // // //   }, []);

// // // // // // //   // ---------------------- Load employee if editing ----------------------
// // // // // // //   useEffect(() => {
// // // // // // //     if (!id) return;
// // // // // // //     let mounted = true;
// // // // // // //     employeeAPI
// // // // // // //       .getById(id)
// // // // // // //       .then((data) => {
// // // // // // //         if (data && mounted) {
// // // // // // //           setFormData({
// // // // // // //             ...data,
// // // // // // //             dob: data.dob ? new Date(data.dob) : null,
// // // // // // //             hire_date: data.hire_date ? new Date(data.hire_date) : null,
// // // // // // //             password: "",
// // // // // // //             confirm_password: "",
// // // // // // //           });
// // // // // // //         }
// // // // // // //       })
// // // // // // //       .catch(() => toast.error("Failed to load employee"));
// // // // // // //     return () => {
// // // // // // //       mounted = false;
// // // // // // //     };
// // // // // // //   }, [id]);

// // // // // // //   // ---------------------- Fetch dependent data ----------------------
// // // // // // //   useEffect(() => {
// // // // // // //     if (!formData.company_id) return setBranches([]);
// // // // // // //     branchAPI
// // // // // // //       .getByCompany(formData.company_id)
// // // // // // //       .then((res) => {
// // // // // // //         setBranches(res ?? []);
// // // // // // //         setDepartments([]);
// // // // // // //         setEmployees([]);
// // // // // // //       })
// // // // // // //       .catch(() => toast.error("Failed to load branches"));
// // // // // // //   }, [formData.company_id]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!formData.company_id || !formData.branch_id) return setDepartments([]);
// // // // // // //     departmentAPI
// // // // // // //       .getByBranch(formData.company_id, formData.branch_id)
// // // // // // //       .then((res) => setDepartments(res ?? []))
// // // // // // //       .catch(() => toast.error("Failed to load departments"));
// // // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // // //   useEffect(() => {
// // // // // // //     if (!formData.company_id || !formData.branch_id) return setEmployees([]);
// // // // // // //     employeeAPI
// // // // // // //       .getByCompanyAndBranch(formData.company_id, formData.branch_id)
// // // // // // //       .then((res) => setEmployees(res ?? []))
// // // // // // //       .catch(() => toast.error("Failed to load employees"));
// // // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // // //   // ---------------------- Handlers ----------------------
// // // // // // //   const handleChange = (e) => {
// // // // // // //     const { name, value } = e.target;
// // // // // // //     if (name === "company_id")
// // // // // // //       setFormData({
// // // // // // //         ...formData,
// // // // // // //         company_id: value,
// // // // // // //         branch_id: "",
// // // // // // //         department_id: "",
// // // // // // //         reports_to: "",
// // // // // // //       });
// // // // // // //     else if (name === "branch_id")
// // // // // // //       setFormData({
// // // // // // //         ...formData,
// // // // // // //         branch_id: value,
// // // // // // //         department_id: "",
// // // // // // //         reports_to: "",
// // // // // // //       });
// // // // // // //     else setFormData({ ...formData, [name]: value });

// // // // // // //     if (fieldErrors[name]) {
// // // // // // //       const updatedErrors = { ...fieldErrors };
// // // // // // //       delete updatedErrors[name];
// // // // // // //       setFieldErrors(updatedErrors);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   // const handleBack = () => activeStep === 1 ? onClose() : setActiveStep(prev => prev - 1);

// // // // // // //   // const handleNext = () => {
// // // // // // //   //   const errors = {};
// // // // // // //   //   if (activeStep === 1) {
// // // // // // //   //     ["first_name", "last_name", "gender", "email", "phone_number"].forEach(f => !formData[f]?.trim() && (errors[f] = "This field is required"));
// // // // // // //   //     if (!formData.dob) errors.dob = "Date of birth is required";
// // // // // // //   //   } else if (activeStep === 2) {
// // // // // // //   //     ["company_id", "branch_id", "department_id", "position_id"].forEach(f => !formData[f] && (errors[f] = "This field is required"));
// // // // // // //   //     if (!formData.hire_date) errors.hire_date = "Hire date is required";
// // // // // // //   //   }

// // // // // // //   //   if (Object.keys(errors).length > 0) return setFieldErrors(errors);
// // // // // // //   //   setActiveStep(prev => prev + 1);
// // // // // // //   // };

// // // // // // //   const handleBack = () => {
// // // // // // //     if (activeStep === 1) {
// // // // // // //       onClose(); // Only close if first step
// // // // // // //     } else {
// // // // // // //       setActiveStep((prev) => prev - 1); // Go back a step otherwise
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleNext = () => {
// // // // // // //     const errors = {};

// // // // // // //     if (activeStep === 1) {
// // // // // // //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // // // // // //         (f) => {
// // // // // // //           if (!formData[f]?.trim()) errors[f] = "This field is required";
// // // // // // //         }
// // // // // // //       );
// // // // // // //       if (!formData.dob) errors.dob = "Date of birth is required";
// // // // // // //     }

// // // // // // //     if (activeStep === 2) {
// // // // // // //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // // // // // //         (f) => {
// // // // // // //           if (!formData[f]) errors[f] = "This field is required";
// // // // // // //         }
// // // // // // //       );
// // // // // // //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// // // // // // //     }

// // // // // // //     setFieldErrors(errors);

// // // // // // //     // Only go to next step if not on last step
// // // // // // //     if (Object.keys(errors).length === 0 && activeStep < TOTAL_STEPS) {
// // // // // // //       setActiveStep((prev) => prev + 1);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleSubmit = async (e) => {
// // // // // // //     e.preventDefault();
// // // // // // //     const errors = {};

// // // // // // //     ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // // // // // //       (f) => !formData[f]?.trim() && (errors[f] = "This field is required")
// // // // // // //     );
// // // // // // //     ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // // // // // //       (f) => !formData[f] && (errors[f] = "This field is required")
// // // // // // //     );

// // // // // // //     if (!id) {
// // // // // // //       if (!formData.username?.trim()) errors.username = "Username is required";
// // // // // // //       const passwordError = validateLoginPassword(formData.password);
// // // // // // //       if (passwordError) errors.password = passwordError;
// // // // // // //       if (formData.password !== formData.confirm_password)
// // // // // // //         errors.confirm_password = "Passwords do not match";
// // // // // // //     }

// // // // // // //     if (Object.keys(errors).length > 0) return setFieldErrors(errors);

// // // // // // //     setLoading(true);
// // // // // // //     try {
// // // // // // //       if (id) await employeeAPI.update(id, formData);
// // // // // // //       else await employeeAPI.create(formData);
// // // // // // //       toast.success("Employee saved successfully");
// // // // // // //       onClose();
// // // // // // //     } catch {
// // // // // // //       toast.error("Failed to save employee");
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <>
// // // // // // //       <div className={overlay} onClick={onClose}></div>
// // // // // // //       {/* <div className={drawer}> */}
// // // // // // //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// // // // // // //         <div className={header}>
// // // // // // //           <div>
// // // // // // //             <h2 className={headerTitle}>
// // // // // // //               {id ? "Edit Employee" : "Create Employee"}
// // // // // // //             </h2>
// // // // // // //             <p className={headerSubTitle}>
// // // // // // //               STEP {activeStep} OF {TOTAL_STEPS}
// // // // // // //             </p>
// // // // // // //           </div>
// // // // // // //           <button onClick={onClose} className={closeButton}>
// // // // // // //             <XMarkIcon className="w-6 h-6 text-[#011748]" />
// // // // // // //           </button>
// // // // // // //         </div>

// // // // // // //         <div className={progressBarOuter}>
// // // // // // //           <div
// // // // // // //             className={progressBarInner}
// // // // // // //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// // // // // // //           />
// // // // // // //         </div>

// // // // // // //         <form onSubmit={handleSubmit} className={body}>
// // // // // // //           {/* Step 1 */}
// // // // // // //           {activeStep === 1 && (
// // // // // // //             <div className="space-y-4">
// // // // // // //               <h3 className={sectionTitle}>Personal Info</h3>
// // // // // // //               <Input
// // // // // // //                 label="First Name *"
// // // // // // //                 name="first_name"
// // // // // // //                 value={formData.first_name}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //               <Input
// // // // // // //                 label="Last Name *"
// // // // // // //                 name="last_name"
// // // // // // //                 value={formData.last_name}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //               <Select
// // // // // // //                 label="Gender *"
// // // // // // //                 name="gender"
// // // // // // //                 value={formData.gender}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 selectClass={selectClass}
// // // // // // //               />
// // // // // // //               <div>
// // // // // // //                 <label className={fieldLabel}>Date of Birth *</label>
// // // // // // //                 <DatePicker
// // // // // // //                   selected={formData.dob}
// // // // // // //                   onChange={(date) => setFormData({ ...formData, dob: date })}
// // // // // // //                   className={inputClass}
// // // // // // //                   maxDate={today}
// // // // // // //                   minDate={seventyYearsAgo}
// // // // // // //                   placeholderText="Select date"
// // // // // // //                   dateFormat="yyyy-MM-dd"
// // // // // // //                 />
// // // // // // //                 {fieldErrors.dob && (
// // // // // // //                   <p className={errorText}>{fieldErrors.dob}</p>
// // // // // // //                 )}
// // // // // // //               </div>
// // // // // // //               <Input
// // // // // // //                 label="Email *"
// // // // // // //                 name="email"
// // // // // // //                 value={formData.email}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //               <Input
// // // // // // //                 label="Phone Number *"
// // // // // // //                 name="phone_number"
// // // // // // //                 value={formData.phone_number}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //               <Textarea
// // // // // // //                 label="Address"
// // // // // // //                 name="address"
// // // // // // //                 value={formData.address}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //             </div>
// // // // // // //           )}

// // // // // // //           {/* Step 2 */}
// // // // // // //           {activeStep === 2 && (
// // // // // // //             <div className="space-y-4">
// // // // // // //               <h3 className={sectionTitle}>Employment Info</h3>
// // // // // // //               <Select
// // // // // // //                 label="Company *"
// // // // // // //                 name="company_id"
// // // // // // //                 value={formData.company_id}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 options={companies.map((c) => ({
// // // // // // //                   v: c.company_id,
// // // // // // //                   label: c.company_name,
// // // // // // //                 }))}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 selectClass={selectClass}
// // // // // // //               />
// // // // // // //               <Select
// // // // // // //                 label="Branch *"
// // // // // // //                 name="branch_id"
// // // // // // //                 value={formData.branch_id}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 options={branches.map((b) => ({
// // // // // // //                   v: b.branch_id,
// // // // // // //                   label: b.branch_name,
// // // // // // //                 }))}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 selectClass={selectClass}
// // // // // // //               />
// // // // // // //               <Select
// // // // // // //                 label="Department *"
// // // // // // //                 name="department_id"
// // // // // // //                 value={formData.department_id}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 options={departments.map((d) => ({
// // // // // // //                   v: d.department_id,
// // // // // // //                   label: d.department_name,
// // // // // // //                 }))}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 selectClass={selectClass}
// // // // // // //               />
// // // // // // //               <Select
// // // // // // //                 label="Reports To"
// // // // // // //                 name="reports_to"
// // // // // // //                 value={formData.reports_to}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 options={employees.map((emp) => ({
// // // // // // //                   v: emp.employee_id,
// // // // // // //                   label: `${emp.first_name} ${emp.last_name}`,
// // // // // // //                 }))}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 selectClass={selectClass}
// // // // // // //               />
// // // // // // //               <Select
// // // // // // //                 label="Position *"
// // // // // // //                 name="position_id"
// // // // // // //                 value={formData.position_id}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 options={positions.map((pos) => ({
// // // // // // //                   v: pos.position_id,
// // // // // // //                   label: pos.position_name,
// // // // // // //                 }))}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 selectClass={selectClass}
// // // // // // //               />
// // // // // // //               <div>
// // // // // // //                 <label className={fieldLabel}>Hire Date *</label>
// // // // // // //                 <DatePicker
// // // // // // //                   selected={formData.hire_date}
// // // // // // //                   onChange={(date) =>
// // // // // // //                     setFormData({ ...formData, hire_date: date })
// // // // // // //                   }
// // // // // // //                   className={inputClass}
// // // // // // //                   maxDate={today}
// // // // // // //                   placeholderText="Select date"
// // // // // // //                   dateFormat="yyyy-MM-dd"
// // // // // // //                 />
// // // // // // //                 {fieldErrors.hire_date && (
// // // // // // //                   <p className={errorText}>{fieldErrors.hire_date}</p>
// // // // // // //                 )}
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           )}

// // // // // // //           {/* Step 3 */}
// // // // // // //           {activeStep === 3 && (
// // // // // // //             <div className="space-y-4">
// // // // // // //               <h3 className={sectionTitle}>System Access</h3>
// // // // // // //               <Input
// // // // // // //                 label="Username *"
// // // // // // //                 name="username"
// // // // // // //                 value={formData.username}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //               <Input
// // // // // // //                 type={showPassword ? "text" : "password"}
// // // // // // //                 label="Password"
// // // // // // //                 name="password"
// // // // // // //                 value={formData.password}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //               <Input
// // // // // // //                 type={showPassword ? "text" : "password"}
// // // // // // //                 label="Confirm Password"
// // // // // // //                 name="confirm_password"
// // // // // // //                 value={formData.confirm_password}
// // // // // // //                 onChange={handleChange}
// // // // // // //                 fieldErrors={fieldErrors}
// // // // // // //                 inputClass={inputClass}
// // // // // // //               />
// // // // // // //               <div className="flex items-center gap-2">
// // // // // // //                 <input
// // // // // // //                   type="checkbox"
// // // // // // //                   checked={showPassword}
// // // // // // //                   onChange={togglePasswordVisibility}
// // // // // // //                 />
// // // // // // //                 <span className="text-sm text-[#1e293b]">Show Passwords</span>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           )}

// // // // // // //           {/* Footer Buttons */}
// // // // // // //           <div className={footer}>
// // // // // // //             <button
// // // // // // //               type="button"
// // // // // // //               className={buttonSecondary}
// // // // // // //               onClick={handleBack}
// // // // // // //             >
// // // // // // //               Back
// // // // // // //             </button>
// // // // // // //             {activeStep < TOTAL_STEPS ? (
// // // // // // //               <button
// // // // // // //                 type="button"
// // // // // // //                 className={buttonPrimary}
// // // // // // //                 onClick={handleNext}
// // // // // // //               >
// // // // // // //                 Next
// // // // // // //               </button>
// // // // // // //             ) : (
// // // // // // //               <button
// // // // // // //                 type="submit"
// // // // // // //                 className={buttonPrimary}
// // // // // // //                 disabled={loading}
// // // // // // //               >
// // // // // // //                 {loading ? "Saving..." : "Save"}
// // // // // // //               </button>
// // // // // // //             )}
// // // // // // //           </div>
// // // // // // //         </form>
// // // // // // //       </div>
// // // // // // //     </>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default EmployeeForm;
// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { XMarkIcon } from "@heroicons/react/24/outline";
// // // // // // import { toast } from "react-hot-toast";
// // // // // // import DatePicker from "react-datepicker";
// // // // // // import "react-datepicker/dist/react-datepicker.css";

// // // // // // import {
// // // // // //   overlay,
// // // // // //   drawer,
// // // // // //   header,
// // // // // //   headerTitle,
// // // // // //   headerSubTitle,
// // // // // //   closeButton,
// // // // // //   progressBarOuter,
// // // // // //   progressBarInner,
// // // // // //   body,
// // // // // //   sectionTitle,
// // // // // //   fieldLabel,
// // // // // //   inputClass,
// // // // // //   selectClass,
// // // // // //   footer,
// // // // // //   buttonSecondary,
// // // // // //   buttonPrimary,
// // // // // //   errorText,
// // // // // // } from "../../formClasses";

// // // // // // import {
// // // // // //   Input,
// // // // // //   Textarea,
// // // // // //   Select,
// // // // // // } from "../../components/Common/Formhandler/FormComponents";
// // // // // // import { validateLoginPassword } from "../../utils/validation/validations";
// // // // // // import {
// // // // // //   employeeAPI,
// // // // // //   companyAPI,
// // // // // //   branchAPI,
// // // // // //   departmentAPI,
// // // // // //   positionsAPI,
// // // // // // } from "../../utils/registrationForms/api";

// // // // // // const EmployeeForm = ({ id, onClose }) => {
// // // // // //   const TOTAL_STEPS = 3;
// // // // // //   const [activeStep, setActiveStep] = useState(1);
// // // // // //   const [loading, setLoading] = useState(false);

// // // // // //   const [companies, setCompanies] = useState([]);
// // // // // //   const [branches, setBranches] = useState([]);
// // // // // //   const [departments, setDepartments] = useState([]);
// // // // // //   const [employees, setEmployees] = useState([]);
// // // // // //   const [positions, setPositions] = useState([]);
// // // // // //   const [fieldErrors, setFieldErrors] = useState({});

// // // // // //   const today = new Date();
// // // // // //   const seventyYearsAgo = new Date(
// // // // // //     new Date().setFullYear(new Date().getFullYear() - 70)
// // // // // //   );

// // // // // //   const [formData, setFormData] = useState({
// // // // // //     company_id: "",
// // // // // //     branch_id: "",
// // // // // //     department_id: "",
// // // // // //     reports_to: "",
// // // // // //     position_id: "",
// // // // // //     first_name: "",
// // // // // //     last_name: "",
// // // // // //     gender: "",
// // // // // //     dob: null,
// // // // // //     email: "",
// // // // // //     phone_number: "",
// // // // // //     address: "",
// // // // // //     hire_date: null,
// // // // // //     employment_type: "Full-time",
// // // // // //     username: "",
// // // // // //     password: "",
// // // // // //     confirm_password: "",
// // // // // //   });

// // // // // //   const [showPassword, setShowPassword] = useState(false);
// // // // // //   const togglePasswordVisibility = () => setShowPassword(!showPassword);

// // // // // //   // ---------------- Fetch static data ----------------
// // // // // //   useEffect(() => {
// // // // // //     companyAPI
// // // // // //       .getAll()
// // // // // //       .then((res) => setCompanies(res ?? []))
// // // // // //       .catch(() => toast.error("Failed to load companies"));
// // // // // //     positionsAPI
// // // // // //       .getAll()
// // // // // //       .then((res) => setPositions(res ?? []))
// // // // // //       .catch(() => toast.error("Failed to load positions"));
// // // // // //   }, []);

// // // // // //   // ---------------- Load employee for editing ----------------
// // // // // //   useEffect(() => {
// // // // // //     if (!id) return;
// // // // // //     let mounted = true;
// // // // // //     employeeAPI
// // // // // //       .getById(id)
// // // // // //       .then((data) => {
// // // // // //         if (data && mounted) {
// // // // // //           setFormData({
// // // // // //             ...data,
// // // // // //             dob: data.dob ? new Date(data.dob) : null,
// // // // // //             hire_date: data.hire_date ? new Date(data.hire_date) : null,
// // // // // //             password: "",
// // // // // //             confirm_password: "",
// // // // // //           });
// // // // // //         }
// // // // // //       })
// // // // // //       .catch(() => toast.error("Failed to load employee"));
// // // // // //     return () => {
// // // // // //       mounted = false;
// // // // // //     };
// // // // // //   }, [id]);

// // // // // //   // ---------------- Fetch dependent data ----------------
// // // // // //   useEffect(() => {
// // // // // //     if (!formData.company_id) return setBranches([]);
// // // // // //     branchAPI
// // // // // //       .getByCompany(formData.company_id)
// // // // // //       .then((res) => {
// // // // // //         setBranches(res ?? []);
// // // // // //         setDepartments([]);
// // // // // //         setEmployees([]);
// // // // // //       })
// // // // // //       .catch(() => toast.error("Failed to load branches"));
// // // // // //   }, [formData.company_id]);

// // // // // //   useEffect(() => {
// // // // // //     if (!formData.company_id || !formData.branch_id) return setDepartments([]);
// // // // // //     departmentAPI
// // // // // //       .getByBranch(formData.company_id, formData.branch_id)
// // // // // //       .then((res) => setDepartments(res ?? []))
// // // // // //       .catch(() => toast.error("Failed to load departments"));
// // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // //   useEffect(() => {
// // // // // //     if (!formData.company_id || !formData.branch_id) return setEmployees([]);
// // // // // //     employeeAPI
// // // // // //       .getByCompanyAndBranch(formData.company_id, formData.branch_id)
// // // // // //       .then((res) => setEmployees(res ?? []))
// // // // // //       .catch(() => toast.error("Failed to load employees"));
// // // // // //   }, [formData.company_id, formData.branch_id]);

// // // // // //   // ---------------- Handlers ----------------
// // // // // //   const handleChange = (e) => {
// // // // // //     const { name, value } = e.target;
// // // // // //     if (name === "company_id")
// // // // // //       setFormData({
// // // // // //         ...formData,
// // // // // //         company_id: value,
// // // // // //         branch_id: "",
// // // // // //         department_id: "",
// // // // // //         reports_to: "",
// // // // // //       });
// // // // // //     else if (name === "branch_id")
// // // // // //       setFormData({
// // // // // //         ...formData,
// // // // // //         branch_id: value,
// // // // // //         department_id: "",
// // // // // //         reports_to: "",
// // // // // //       });
// // // // // //     else setFormData({ ...formData, [name]: value });

// // // // // //     if (fieldErrors[name]) {
// // // // // //       const updatedErrors = { ...fieldErrors };
// // // // // //       delete updatedErrors[name];
// // // // // //       setFieldErrors(updatedErrors);
// // // // // //     }
// // // // // //   };

// // // // // //   const validateStep = (step) => {
// // // // // //     const errors = {};
// // // // // //     if (step === 1) {
// // // // // //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // // // // //         (f) => !formData[f]?.trim() && (errors[f] = "This field is required")
// // // // // //       );
// // // // // //       if (!formData.dob) errors.dob = "Date of birth is required";
// // // // // //     }
// // // // // //     if (step === 2) {
// // // // // //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // // // // //         (f) => !formData[f] && (errors[f] = "This field is required")
// // // // // //       );
// // // // // //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// // // // // //     }
// // // // // //     if (step === 3) {
// // // // // //       if (!formData.username?.trim()) errors.username = "Username is required";
// // // // // //       if (!id) {
// // // // // //         const passwordError = validateLoginPassword(formData.password);
// // // // // //         if (passwordError) errors.password = passwordError;
// // // // // //         if (formData.password !== formData.confirm_password)
// // // // // //           errors.confirm_password = "Passwords do not match";
// // // // // //       }
// // // // // //     }
// // // // // //     return errors;
// // // // // //   };

// // // // // //   const handleNext = () => {
// // // // // //     const errors = validateStep(activeStep);
// // // // // //     setFieldErrors(errors);
// // // // // //     if (Object.keys(errors).length === 0 && activeStep < TOTAL_STEPS)
// // // // // //       setActiveStep((prev) => prev + 1);
// // // // // //   };

// // // // // //   const handleBack = () =>
// // // // // //     activeStep === 1 ? onClose() : setActiveStep((prev) => prev - 1);

// // // // // //   const handleSubmit = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     let errors = {};
// // // // // //     for (let step = 1; step <= TOTAL_STEPS; step++)
// // // // // //       errors = { ...errors, ...validateStep(step) };
// // // // // //     if (Object.keys(errors).length > 0) return setFieldErrors(errors);

// // // // // //     setLoading(true);
// // // // // //     try {
// // // // // //       if (id) await employeeAPI.update(id, formData);
// // // // // //       else await employeeAPI.create(formData);
// // // // // //       toast.success("Employee saved successfully");
// // // // // //       onClose();
// // // // // //     } catch {
// // // // // //       toast.error("Failed to save employee");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <>
// // // // // //       <div className={overlay} onClick={onClose}></div>
// // // // // //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// // // // // //         <div className={header}>
// // // // // //           <div>
// // // // // //             <h2 className={headerTitle}>
// // // // // //               {id ? "Edit Employee" : "Create Employee"}
// // // // // //             </h2>
// // // // // //             <p className={headerSubTitle}>
// // // // // //               STEP {activeStep} OF {TOTAL_STEPS}
// // // // // //             </p>
// // // // // //           </div>
// // // // // //           <button onClick={onClose} className={closeButton}>
// // // // // //             <XMarkIcon className="w-6 h-6 text-[#011748]" />
// // // // // //           </button>
// // // // // //         </div>

// // // // // //         <div className={progressBarOuter}>
// // // // // //           <div
// // // // // //             className={progressBarInner}
// // // // // //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// // // // // //           />
// // // // // //         </div>

// // // // // //        <form
// // // // // //   onSubmit={handleSubmit}
// // // // // //   className={body}
// // // // // //   onKeyDown={(e) => {
// // // // // //     if (e.key === "Enter") {
// // // // // //       e.preventDefault(); // prevent default submit
// // // // // //       if (activeStep < TOTAL_STEPS) {
// // // // // //         handleNext(); // go to next step when Enter is pressed on step 1 or 2
// // // // // //       } else if (activeStep === TOTAL_STEPS) {
// // // // // //         handleSubmit(e); // submit manually on last step
// // // // // //       }
// // // // // //     }
// // // // // //   }}
// // // // // // >

// // // // // //           {/* Step 1 */}
// // // // // //           {activeStep === 1 && (
// // // // // //             <div className="space-y-4">
// // // // // //               <h3 className={sectionTitle}>Personal Info</h3>
// // // // // //               <Input
// // // // // //                 label="First Name *"
// // // // // //                 name="first_name"
// // // // // //                 value={formData.first_name}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 className={inputClass}
// // // // // //               />
// // // // // //               <Input
// // // // // //                 label="Last Name *"
// // // // // //                 name="last_name"
// // // // // //                 value={formData.last_name}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 className={inputClass}
// // // // // //               />
// // // // // //               <Select
// // // // // //                 label="Gender *"
// // // // // //                 name="gender"
// // // // // //                 value={formData.gender}
// // // // // //                 onChange={handleChange}
// // // // // //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 selectClass={selectClass}
// // // // // //               />
// // // // // //               <div>
// // // // // //                 <label className={fieldLabel}>Date of Birth *</label>
// // // // // //                 <DatePicker
// // // // // //                   selected={formData.dob}
// // // // // //                   onChange={(date) => setFormData({ ...formData, dob: date })}
// // // // // //                   className={inputClass}
// // // // // //                   maxDate={today}
// // // // // //                   minDate={seventyYearsAgo}
// // // // // //                   placeholderText="Select date"
// // // // // //                   dateFormat="yyyy-MM-dd"
// // // // // //                 />
// // // // // //                 {fieldErrors.dob && (
// // // // // //                   <p className={errorText}>{fieldErrors.dob}</p>
// // // // // //                 )}
// // // // // //               </div>
// // // // // //               <Input
// // // // // //                 label="Email *"
// // // // // //                 name="email"
// // // // // //                 value={formData.email}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 inputClass={inputClass}
// // // // // //               />
// // // // // //               <Input
// // // // // //                 label="Phone Number *"
// // // // // //                 name="phone_number"
// // // // // //                 value={formData.phone_number}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 inputClass={inputClass}
// // // // // //               />
// // // // // //               <Textarea
// // // // // //                 label="Address"
// // // // // //                 name="address"
// // // // // //                 value={formData.address}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 inputClass={inputClass}
// // // // // //               />
// // // // // //             </div>
// // // // // //           )}

// // // // // //           {/* Step 2 */}
// // // // // //           {activeStep === 2 && (
// // // // // //             <div className="space-y-4">
// // // // // //               <h3 className={sectionTitle}>Employment Info</h3>
// // // // // //               <Select
// // // // // //                 label="Company *"
// // // // // //                 name="company_id"
// // // // // //                 value={formData.company_id}
// // // // // //                 onChange={handleChange}
// // // // // //                 options={companies.map((c) => ({
// // // // // //                   v: c.company_id,
// // // // // //                   label: c.company_name,
// // // // // //                 }))}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 selectClass={selectClass}
// // // // // //               />
// // // // // //               <Select
// // // // // //                 label="Branch *"
// // // // // //                 name="branch_id"
// // // // // //                 value={formData.branch_id}
// // // // // //                 onChange={handleChange}
// // // // // //                 options={branches.map((b) => ({
// // // // // //                   v: b.branch_id,
// // // // // //                   label: b.branch_name,
// // // // // //                 }))}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 selectClass={selectClass}
// // // // // //               />
// // // // // //               <Select
// // // // // //                 label="Department *"
// // // // // //                 name="department_id"
// // // // // //                 value={formData.department_id}
// // // // // //                 onChange={handleChange}
// // // // // //                 options={departments.map((d) => ({
// // // // // //                   v: d.department_id,
// // // // // //                   label: d.department_name,
// // // // // //                 }))}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 selectClass={selectClass}
// // // // // //               />
// // // // // //               <Select
// // // // // //                 label="Reports To"
// // // // // //                 name="reports_to"
// // // // // //                 value={formData.reports_to}
// // // // // //                 onChange={handleChange}
// // // // // //                 options={employees.map((emp) => ({
// // // // // //                   v: emp.employee_id,
// // // // // //                   label: `${emp.first_name} ${emp.last_name}`,
// // // // // //                 }))}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 selectClass={selectClass}
// // // // // //               />
// // // // // //               <Select
// // // // // //                 label="Position *"
// // // // // //                 name="position_id"
// // // // // //                 value={formData.position_id}
// // // // // //                 onChange={handleChange}
// // // // // //                 options={positions.map((pos) => ({
// // // // // //                   v: pos.position_id,
// // // // // //                   label: pos.position_name,
// // // // // //                 }))}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 selectClass={selectClass}
// // // // // //               />
// // // // // //               <div>
// // // // // //                 <label className={fieldLabel}>Hire Date *</label>
// // // // // //                 <DatePicker
// // // // // //                   selected={formData.hire_date}
// // // // // //                   onChange={(date) =>
// // // // // //                     setFormData({ ...formData, hire_date: date })
// // // // // //                   }
// // // // // //                   className={inputClass}
// // // // // //                   maxDate={today}
// // // // // //                   placeholderText="Select date"
// // // // // //                   dateFormat="yyyy-MM-dd"
// // // // // //                 />
// // // // // //                 {fieldErrors.hire_date && (
// // // // // //                   <p className={errorText}>{fieldErrors.hire_date}</p>
// // // // // //                 )}
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}

// // // // // //           {/* Step 3 */}
// // // // // //           {activeStep === 3 && (
// // // // // //             <div className="space-y-4">
// // // // // //               <h3 className={sectionTitle}>System Access</h3>
// // // // // //               <Input
// // // // // //                 label="Username *"
// // // // // //                 name="username"
// // // // // //                 value={formData.username}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 inputClass={inputClass}
// // // // // //               />
// // // // // //               <Input
// // // // // //                 type={showPassword ? "text" : "password"}
// // // // // //                 label="Password *"
// // // // // //                 name="password"
// // // // // //                 value={formData.password}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 inputClass={inputClass}
// // // // // //               />
// // // // // //               <Input
// // // // // //                 type={showPassword ? "text" : "password"}
// // // // // //                 label="Confirm Password *"
// // // // // //                 name="confirm_password"
// // // // // //                 value={formData.confirm_password}
// // // // // //                 onChange={handleChange}
// // // // // //                 fieldErrors={fieldErrors}
// // // // // //                 inputClass={inputClass}
// // // // // //               />
// // // // // //               <div className="flex items-center gap-2">
// // // // // //                 <input
// // // // // //                   type="checkbox"
// // // // // //                   checked={showPassword}
// // // // // //                   onChange={togglePasswordVisibility}
// // // // // //                 />
// // // // // //                 <span className="text-sm text-[#1e293b]">Show Passwords</span>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}

// // // // // //           {/* Footer */}
// // // // // //           <div className={footer}>
// // // // // //             <button
// // // // // //               type="button"
// // // // // //               className={buttonSecondary}
// // // // // //               onClick={handleBack}
// // // // // //             >
// // // // // //               Back
// // // // // //             </button>
// // // // // //             {activeStep < TOTAL_STEPS ? (
// // // // // //               <button
// // // // // //                 type="button"
// // // // // //                 className={buttonPrimary}
// // // // // //                 onClick={handleNext}
// // // // // //               >
// // // // // //                 Next
// // // // // //               </button>
// // // // // //             ) : (
// // // // // //               <button
// // // // // //                 type="submit"
// // // // // //                 className={buttonPrimary}
// // // // // //                 disabled={loading}
// // // // // //               >
// // // // // //                 {loading ? "Saving..." : "Save"}
// // // // // //               </button>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </form>
// // // // // //       </div>
// // // // // //     </>
// // // // // //   );
// // // // // // };

// // // // // // export default EmployeeForm;
// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { XMarkIcon } from "@heroicons/react/24/outline";
// // // // // // import { toast } from "react-hot-toast";
// // // // // // import DatePicker from "react-datepicker";
// // // // // // import "react-datepicker/dist/react-datepicker.css";

// // // // // // import {
// // // // // //   overlay,
// // // // // //   drawer,
// // // // // //   header,
// // // // // //   headerTitle,
// // // // // //   headerSubTitle,
// // // // // //   closeButton,
// // // // // //   progressBarOuter,
// // // // // //   progressBarInner,
// // // // // //   body,
// // // // // //   sectionTitle,
// // // // // //   fieldLabel,
// // // // // //   inputClass,
// // // // // //   selectClass,
// // // // // //   footer,
// // // // // //   buttonSecondary,
// // // // // //   buttonPrimary,
// // // // // //   errorText,
// // // // // // } from "../../formClasses";

// // // // // // import { Input, Textarea, Select } from "../../components/Common/Formhandler/FormComponents";
// // // // // // import { validateLoginPassword } from "../../utils/validation/validations";
// // // // // // import {
// // // // // //   employeeAPI,
// // // // // //   companyAPI,
// // // // // //   branchAPI,
// // // // // //   departmentAPI,
// // // // // //   positionsAPI,
// // // // // // } from "../../utils/registrationForms/api";

// // // // // // const EmployeeForm = ({ id, onClose }) => {
// // // // // //   const TOTAL_STEPS = 3;
// // // // // //   const [activeStep, setActiveStep] = useState(1);
// // // // // //   const [loading, setLoading] = useState(false);

// // // // // //   const [companies, setCompanies] = useState([]);
// // // // // //   const [branches, setBranches] = useState([]);
// // // // // //   const [departments, setDepartments] = useState([]);
// // // // // //   const [employees, setEmployees] = useState([]);
// // // // // //   const [positions, setPositions] = useState([]);
// // // // // //   const [fieldErrors, setFieldErrors] = useState({});

// // // // // //   const today = new Date();
// // // // // //   const seventyYearsAgo = new Date(new Date().setFullYear(today.getFullYear() - 70));

// // // // // //   const [formData, setFormData] = useState({
// // // // // //     company_id: "",
// // // // // //     branch_id: "",
// // // // // //     department_id: "",
// // // // // //     reports_to: "",
// // // // // //     position_id: "",
// // // // // //     first_name: "",
// // // // // //     last_name: "",
// // // // // //     gender: "",
// // // // // //     dob: null,
// // // // // //     email: "",
// // // // // //     phone_number: "",
// // // // // //     address: "",
// // // // // //     hire_date: null,
// // // // // //     employment_type: "Full-time",
// // // // // //     username: "",
// // // // // //     password: "",
// // // // // //     confirm_password: "",
// // // // // //   });

// // // // // //   const [showPassword, setShowPassword] = useState(false);

// // // // // //   /* ------------------- FETCH STATIC DATA ------------------- */
// // // // // //   useEffect(() => {
// // // // // //     companyAPI.getAll().then(setCompanies);
// // // // // //     positionsAPI.getAll().then(setPositions);
// // // // // //   }, []);

// // // // // //   /* ------------------- LOAD EMPLOYEE (EDIT) ------------------- */
// // // // // //   useEffect(() => {
// // // // // //     if (!id) return;
// // // // // //     employeeAPI.getById(id).then((data) => {
// // // // // //       setFormData({
// // // // // //         ...data,
// // // // // //         dob: data?.dob ? new Date(data.dob) : null,
// // // // // //         hire_date: data?.hire_date ? new Date(data.hire_date) : null,
// // // // // //         password: "",
// // // // // //         confirm_password: "",
// // // // // //       });
// // // // // //     });
// // // // // //   }, [id]);

// // // // // //   /* ------------------- DEPENDENT DROPDOWNS ------------------- */
// // // // // //   useEffect(() => {
// // // // // //     if (!formData.company_id) return;
// // // // // //     branchAPI.getByCompany(formData.company_id).then(setBranches);
// // // // // //   }, [formData.company_id]);

// // // // // //   useEffect(() => {
// // // // // //     if (!formData.branch_id) return;
// // // // // //     departmentAPI.getByBranch(formData.company_id, formData.branch_id).then(setDepartments);
// // // // // //     employeeAPI.getByCompanyAndBranch(formData.company_id, formData.branch_id).then(setEmployees);
// // // // // //   }, [formData.branch_id]);

// // // // // //   /* ------------------- HANDLERS ------------------- */
// // // // // //   const handleChange = (e) => {
// // // // // //     const { name, value } = e.target;
// // // // // //     setFormData((p) => ({ ...p, [name]: value }));
// // // // // //     setFieldErrors((p) => ({ ...p, [name]: null }));
// // // // // //   };

// // // // // //   const validateStep = (step) => {
// // // // // //     const errors = {};
// // // // // //     if (step === 1) {
// // // // // //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // // // // //         (f) => !formData[f] && (errors[f] = "Required")
// // // // // //       );
// // // // // //       if (!formData.dob) errors.dob = "Required";
// // // // // //     }
// // // // // //     if (step === 2) {
// // // // // //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // // // // //         (f) => !formData[f] && (errors[f] = "Required")
// // // // // //       );
// // // // // //       if (!formData.hire_date) errors.hire_date = "Required";
// // // // // //     }
// // // // // //     if (step === 3 && !id) {
// // // // // //       if (!formData.username) errors.username = "Required";
// // // // // //       const pwdErr = validateLoginPassword(formData.password);
// // // // // //       if (pwdErr) errors.password = pwdErr;
// // // // // //       if (formData.password !== formData.confirm_password)
// // // // // //         errors.confirm_password = "Passwords do not match";
// // // // // //     }
// // // // // //     return errors;
// // // // // //   };

// // // // // //   const handleNext = () => {
// // // // // //     const errors = validateStep(activeStep);
// // // // // //     setFieldErrors(errors);
// // // // // //     if (!Object.keys(errors).length)
// // // // // //       setActiveStep((prev) => prev + 1);
// // // // // //   };

// // // // // //   const handleSubmit = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     const allErrors = {
// // // // // //       ...validateStep(1),
// // // // // //       ...validateStep(2),
// // // // // //       ...validateStep(3),
// // // // // //     };
// // // // // //     if (Object.keys(allErrors).length) return setFieldErrors(allErrors);

// // // // // //     setLoading(true);
// // // // // //     try {
// // // // // //       id
// // // // // //         ? await employeeAPI.update(id, formData)
// // // // // //         : await employeeAPI.create(formData);
// // // // // //       toast.success("Employee saved successfully");
// // // // // //       onClose();
// // // // // //     } catch {
// // // // // //       toast.error("Failed to save employee");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   /* ------------------- RENDER ------------------- */
// // // // // //   return (
// // // // // //     <>
// // // // // //       <div className={overlay} onClick={onClose} />

// // // // // //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// // // // // //         <div className={header}>
// // // // // //           <div>
// // // // // //             <h2 className={headerTitle}>
// // // // // //               {id ? "Edit Employee" : "Create Employee"}
// // // // // //             </h2>
// // // // // //             <p className={headerSubTitle}>
// // // // // //               STEP {activeStep} OF {TOTAL_STEPS}
// // // // // //             </p>
// // // // // //           </div>
// // // // // //           <button onClick={onClose} className={closeButton}>
// // // // // //             <XMarkIcon className="w-6 h-6" />
// // // // // //           </button>
// // // // // //         </div>

// // // // // //         <div className={progressBarOuter}>
// // // // // //           <div
// // // // // //             className={progressBarInner}
// // // // // //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// // // // // //           />
// // // // // //         </div>

// // // // // //         {/* 🔒 ENTER KEY BLOCKED */}
// // // // // //         <form
// // // // // //           className={body}
// // // // // //           onSubmit={handleSubmit}
// // // // // //           onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
// // // // // //         >

// // // // // //           {/* ---------------- STEP 1 ---------------- */}
// // // // // //           {activeStep === 1 && (
// // // // // //             <div className="space-y-4">
// // // // // //               <h3 className={sectionTitle}>Personal Info</h3>

// // // // // //               <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // // //               <Input label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />

// // // // // //               <Select label="Gender *" name="gender" value={formData.gender} onChange={handleChange}
// // // // // //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // // // // //                 fieldErrors={fieldErrors} className={selectClass}
// // // // // //               />

// // // // // //               <div>
// // // // // //                 <label className={fieldLabel}>Date of Birth *</label>
// // // // // //                 <DatePicker
// // // // // //                   selected={formData.dob}
// // // // // //                   onChange={(date) => setFormData({ ...formData, dob: date })}
// // // // // //                   className={inputClass}
// // // // // //                   maxDate={today}
// // // // // //                   minDate={seventyYearsAgo}
// // // // // //                 />
// // // // // //                 {fieldErrors.dob && <p className={errorText}>{fieldErrors.dob}</p>}
// // // // // //               </div>

// // // // // //               <Input label="Email *" name="email" value={formData.email} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // // //               <Input label="Phone Number *" name="phone_number" value={formData.phone_number} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // // //               <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // // //             </div>
// // // // // //           )}

// // // // // //           {/* ---------------- STEP 2 ---------------- */}
// // // // // //           {activeStep === 2 && (
// // // // // //             <div className="space-y-4">
// // // // // //               <h3 className={sectionTitle}>Employment Info</h3>

// // // // // //               <Select label="Company *" name="company_id" value={formData.company_id} onChange={handleChange}
// // // // // //                 options={companies.map(c => ({ v: c.company_id, label: c.company_name }))}
// // // // // //                 fieldErrors={fieldErrors} className={selectClass}
// // // // // //               />

// // // // // //               <Select label="Branch *" name="branch_id" value={formData.branch_id} onChange={handleChange}
// // // // // //                 options={branches.map(b => ({ v: b.branch_id, label: b.branch_name }))}
// // // // // //                 fieldErrors={fieldErrors} className={selectClass}
// // // // // //               />

// // // // // //               <Select label="Department *" name="department_id" value={formData.department_id} onChange={handleChange}
// // // // // //                 options={departments.map(d => ({ v: d.department_id, label: d.department_name }))}
// // // // // //                 fieldErrors={fieldErrors} className={selectClass}
// // // // // //               />

// // // // // //               <Select label="Reports To" name="reports_to" value={formData.reports_to} onChange={handleChange}
// // // // // //                 options={employees.map(emp => ({ v: emp.employee_id, label: `${emp.first_name} ${emp.last_name}` }))}
// // // // // //                 fieldErrors={fieldErrors} className={selectClass}
// // // // // //               />

// // // // // //               <Select label="Position *" name="position_id" value={formData.position_id} onChange={handleChange}
// // // // // //                 options={positions.map(p => ({ v: p.position_id, label: p.position_name }))}
// // // // // //                 fieldErrors={fieldErrors} className={selectClass}
// // // // // //               />

// // // // // //               <div>
// // // // // //                 <label className={fieldLabel}>Hire Date *</label>
// // // // // //                 <DatePicker
// // // // // //                   selected={formData.hire_date}
// // // // // //                   onChange={(date) => setFormData({ ...formData, hire_date: date })}
// // // // // //                   className={inputClass}
// // // // // //                 />
// // // // // //                 {fieldErrors.hire_date && <p className={errorText}>{fieldErrors.hire_date}</p>}
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}

// // // // // //           {/* ---------------- STEP 3 ---------------- */}
// // // // // //           {activeStep === 3 && (
// // // // // //             <div className="space-y-4">
// // // // // //               <h3 className={sectionTitle}>System Access</h3>

// // // // // //               <Input label="Username *" name="username" value={formData.username} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // // //               <Input type={showPassword ? "text" : "password"} label="Password *" name="password" value={formData.password} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // // //               <Input type={showPassword ? "text" : "password"} label="Confirm Password *" name="confirm_password" value={formData.confirm_password} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />

// // // // // //               <div className="flex gap-2 items-center">
// // // // // //                 <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(p => !p)} />
// // // // // //                 <span>Show Passwords</span>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           )}

// // // // // //           {/* ---------------- FOOTER ---------------- */}
// // // // // //           <div className={footer}>
// // // // // //             <button
// // // // // //               type="button"
// // // // // //               className={buttonSecondary}
// // // // // //               onClick={() => activeStep === 1 ? onClose() : setActiveStep(p => p - 1)}
// // // // // //             >
// // // // // //               Back
// // // // // //             </button>

// // // // // //             {activeStep < TOTAL_STEPS ? (
// // // // // //               <button type="button" className={buttonPrimary} onClick={handleNext}>
// // // // // //                 Next
// // // // // //               </button>
// // // // // //             ) : (
// // // // // //               <button type="submit" className={buttonPrimary} disabled={loading}>
// // // // // //                 {loading ? "Saving..." : "Save"}
// // // // // //               </button>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </form>
// // // // // //       </div>
// // // // // //     </>
// // // // // //   );
// // // // // // };

// // // // // // export default EmployeeForm;

// // // // // import React, { useState, useEffect } from "react";
// // // // // import { XMarkIcon } from "@heroicons/react/24/outline";
// // // // // import { toast } from "react-hot-toast";
// // // // // import DatePicker from "react-datepicker";
// // // // // import "react-datepicker/dist/react-datepicker.css";

// // // // // import {
// // // // //   overlay,
// // // // //   drawer,
// // // // //   header,
// // // // //   headerTitle,
// // // // //   headerSubTitle,
// // // // //   closeButton,
// // // // //   progressBarOuter,
// // // // //   progressBarInner,
// // // // //   body,
// // // // //   sectionTitle,
// // // // //   fieldLabel,
// // // // //   inputClass,
// // // // //   selectClass,
// // // // //   footer,
// // // // //   buttonSecondary,
// // // // //   buttonPrimary,
// // // // //   errorText,
// // // // // } from "../../formClasses";

// // // // // import { Input, Textarea, Select } from "../../components/Common/Formhandler/FormComponents";
// // // // // import { validateLoginPassword } from "../../utils/validation/validations";
// // // // // import {
// // // // //   employeeAPI,
// // // // //   companyAPI,
// // // // //   branchAPI,
// // // // //   departmentAPI,
// // // // //   positionsAPI,
// // // // // } from "../../utils/registrationForms/api";

// // // // // const EmployeeForm = ({ id, onClose }) => {
// // // // //   const TOTAL_STEPS = 3;

// // // // //   const [activeStep, setActiveStep] = useState(1);
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [fieldErrors, setFieldErrors] = useState({});
// // // // //   const [showPassword, setShowPassword] = useState(false);

// // // // //   const [companies, setCompanies] = useState([]);
// // // // //   const [branches, setBranches] = useState([]);
// // // // //   const [departments, setDepartments] = useState([]);
// // // // //   const [employees, setEmployees] = useState([]);
// // // // //   const [positions, setPositions] = useState([]);

// // // // //   const today = new Date();
// // // // //   const seventyYearsAgo = new Date(
// // // // //     new Date().setFullYear(new Date().getFullYear() - 70)
// // // // //   );

// // // // //   const [formData, setFormData] = useState({
// // // // //     company_id: "",
// // // // //     branch_id: "",
// // // // //     department_id: "",
// // // // //     reports_to: "",
// // // // //     position_id: "",
// // // // //     first_name: "",
// // // // //     last_name: "",
// // // // //     gender: "",
// // // // //     dob: null,
// // // // //     email: "",
// // // // //     phone_number: "",
// // // // //     address: "",
// // // // //     hire_date: null,
// // // // //     employment_type: "Full-time",
// // // // //     username: "",
// // // // //     password: "",
// // // // //     confirm_password: "",
// // // // //   });

// // // // //   /* ---------------- LOAD STATIC DATA ---------------- */
// // // // //   useEffect(() => {
// // // // //     companyAPI.getAll().then(setCompanies);
// // // // //     positionsAPI.getAll().then(setPositions);
// // // // //   }, []);

// // // // //   /* ---------------- LOAD EMPLOYEE (EDIT) ---------------- */
// // // // //   useEffect(() => {
// // // // //     if (!id) return;
// // // // //     employeeAPI.getById(id).then((data) => {
// // // // //       setFormData({
// // // // //         ...data,
// // // // //         dob: data?.dob ? new Date(data.dob) : null,
// // // // //         hire_date: data?.hire_date ? new Date(data.hire_date) : null,
// // // // //         password: "",
// // // // //         confirm_password: "",
// // // // //       });
// // // // //     });
// // // // //   }, [id]);

// // // // //   /* ---------------- DEPENDENT DROPDOWNS ---------------- */
// // // // //   useEffect(() => {
// // // // //     if (!formData.company_id) return;
// // // // //     branchAPI.getByCompany(formData.company_id).then(setBranches);
// // // // //   }, [formData.company_id]);

// // // // //   useEffect(() => {
// // // // //     if (!formData.branch_id) return;
// // // // //     departmentAPI
// // // // //       .getByBranch(formData.company_id, formData.branch_id)
// // // // //       .then(setDepartments);
// // // // //     employeeAPI
// // // // //       .getByCompanyAndBranch(formData.company_id, formData.branch_id)
// // // // //       .then(setEmployees);
// // // // //   }, [formData.branch_id]);

// // // // //   /* ---------------- HANDLERS ---------------- */
// // // // //   const handleChange = (e) => {
// // // // //     const { name, value } = e.target;
// // // // //     setFormData((p) => ({ ...p, [name]: value }));
// // // // //     setFieldErrors((p) => ({ ...p, [name]: null }));
// // // // //   };

// // // // //   const validateStep = (step) => {
// // // // //     const errors = {};

// // // // //     if (step === 1) {
// // // // //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // // // //         (f) => !formData[f] && (errors[f] = "This field is required")
// // // // //       );
// // // // //       if (!formData.dob) errors.dob = "Date of birth is required";
// // // // //     }

// // // // //     if (step === 2) {
// // // // //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // // // //         (f) => !formData[f] && (errors[f] = "This field is required")
// // // // //       );
// // // // //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// // // // //     }

// // // // //     if (step === 3 && !id) {
// // // // //       if (!formData.username)
// // // // //         errors.username = "Username is required";

// // // // //       const pwdErr = validateLoginPassword(formData.password);
// // // // //       if (pwdErr) errors.password = pwdErr;

// // // // //       if (formData.password !== formData.confirm_password)
// // // // //         errors.confirm_password = "Passwords do not match";
// // // // //     }

// // // // //     return errors;
// // // // //   };

// // // // //   const handleNext = () => {
// // // // //     const errors = validateStep(activeStep);
// // // // //     setFieldErrors(errors);
// // // // //     if (!Object.keys(errors).length) {
// // // // //       setActiveStep((p) => p + 1);
// // // // //     }
// // // // //   };

// // // // //   const handleSubmit = async (e) => {
// // // // //     e.preventDefault();

// // // // //     const errors = {
// // // // //       ...validateStep(1),
// // // // //       ...validateStep(2),
// // // // //       ...validateStep(3),
// // // // //     };

// // // // //     if (Object.keys(errors).length) {
// // // // //       setFieldErrors(errors);
// // // // //       return;
// // // // //     }

// // // // //     setLoading(true);
// // // // //     try {
// // // // //       id
// // // // //         ? await employeeAPI.update(id, formData)
// // // // //         : await employeeAPI.create(formData);

// // // // //       toast.success("Employee saved successfully");
// // // // //       onClose();
// // // // //     } catch (err) {
// // // // //       const msg =
// // // // //         err?.response?.data?.message ||
// // // // //         err?.message ||
// // // // //         "Failed to save employee";
// // // // //       toast.error(msg);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   /* ---------------- RENDER ---------------- */
// // // // //   return (
// // // // //     <>
// // // // //       <div className={overlay} onClick={onClose} />

// // // // //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// // // // //         <div className={header}>
// // // // //           <div>
// // // // //             <h2 className={headerTitle}>
// // // // //               {id ? "Edit Employee" : "Create Employee"}
// // // // //             </h2>
// // // // //             <p className={headerSubTitle}>
// // // // //               STEP {activeStep} OF {TOTAL_STEPS}
// // // // //             </p>
// // // // //           </div>
// // // // //           <button onClick={onClose} className={closeButton}>
// // // // //             <XMarkIcon className="w-6 h-6" />
// // // // //           </button>
// // // // //         </div>

// // // // //         <div className={progressBarOuter}>
// // // // //           <div
// // // // //             className={progressBarInner}
// // // // //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// // // // //           />
// // // // //         </div>

// // // // //         <form
// // // // //           className={body}
// // // // //           onSubmit={handleSubmit}
// // // // //           onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
// // // // //         >

// // // // //           {/* STEP 1 */}
// // // // //           {activeStep === 1 && (
// // // // //             <div className="space-y-4">
// // // // //               <h3 className={sectionTitle}>Personal Info</h3>
// // // // //               <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //               <Input label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //               <Select label="Gender *" name="gender" value={formData.gender} onChange={handleChange}
// // // // //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // // // //                 fieldErrors={fieldErrors} className={selectClass}
// // // // //               />
// // // // //               <label className={fieldLabel}>Date of Birth *</label>
// // // // //               <DatePicker selected={formData.dob} onChange={(d) => setFormData({ ...formData, dob: d })} className={inputClass} maxDate={today} minDate={seventyYearsAgo} />
// // // // //               {fieldErrors.dob && <p className={errorText}>{fieldErrors.dob}</p>}
// // // // //               <Input label="Email *" name="email" value={formData.email} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //               <Input label="Phone Number *" name="phone_number" value={formData.phone_number} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //               <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //             </div>
// // // // //           )}

// // // // //           {/* STEP 2 */}
// // // // //           {activeStep === 2 && (
// // // // //             <div className="space-y-4">
// // // // //               <h3 className={sectionTitle}>Employment Info</h3>
// // // // //               <Select label="Company *" name="company_id" value={formData.company_id} onChange={handleChange}
// // // // //                 options={companies.map(c => ({ v: c.company_id, label: c.company_name }))} fieldErrors={fieldErrors} className={selectClass} />
// // // // //               <Select label="Branch *" name="branch_id" value={formData.branch_id} onChange={handleChange}
// // // // //                 options={branches.map(b => ({ v: b.branch_id, label: b.branch_name }))} fieldErrors={fieldErrors} className={selectClass} />
// // // // //               <Select label="Department *" name="department_id" value={formData.department_id} onChange={handleChange}
// // // // //                 options={departments.map(d => ({ v: d.department_id, label: d.department_name }))} fieldErrors={fieldErrors} className={selectClass} />
// // // // //               <Select label="Reports To" name="reports_to" value={formData.reports_to} onChange={handleChange}
// // // // //                 options={employees.map(e => ({ v: e.employee_id, label: `${e.first_name} ${e.last_name}` }))} fieldErrors={fieldErrors} className={selectClass} />
// // // // //               <Select label="Position *" name="position_id" value={formData.position_id} onChange={handleChange}
// // // // //                 options={positions.map(p => ({ v: p.position_id, label: p.position_name }))} fieldErrors={fieldErrors} className={selectClass} />
// // // // //               <label className={fieldLabel}>Hire Date *</label>
// // // // //               <DatePicker selected={formData.hire_date} onChange={(d) => setFormData({ ...formData, hire_date: d })} className={inputClass} />
// // // // //               {fieldErrors.hire_date && <p className={errorText}>{fieldErrors.hire_date}</p>}
// // // // //             </div>
// // // // //           )}

// // // // //           {/* STEP 3 */}
// // // // //           {activeStep === 3 && (
// // // // //             <div className="space-y-4">
// // // // //               <h3 className={sectionTitle}>System Access</h3>
// // // // //               <Input label="Username *" name="username" value={formData.username} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //               <Input type={showPassword ? "text" : "password"} label="Password *" name="password" value={formData.password} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //               <Input type={showPassword ? "text" : "password"} label="Confirm Password *" name="confirm_password" value={formData.confirm_password} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// // // // //               <label className="flex gap-2 text-sm">
// // // // //                 <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(p => !p)} />
// // // // //                 Show Passwords
// // // // //               </label>
// // // // //             </div>
// // // // //           )}

// // // // //           {/* FOOTER */}
// // // // //           <div className={footer}>
// // // // //             <button type="button" className={buttonSecondary} onClick={() => activeStep === 1 ? onClose() : setActiveStep(p => p - 1)}>Back</button>
// // // // //             {activeStep < TOTAL_STEPS ? (
// // // // //               <button type="button" className={buttonPrimary} onClick={handleNext}>Next</button>
// // // // //             ) : (
// // // // //               <button type="submit" className={buttonPrimary} disabled={loading}>
// // // // //                 {loading ? "Saving..." : "Save"}
// // // // //               </button>
// // // // //             )}
// // // // //           </div>
// // // // //         </form>
// // // // //       </div>
// // // // //     </>
// // // // //   );
// // // // // };

// // // // // export default EmployeeForm;
// // // // import React, { useState, useEffect } from "react";
// // // // import { XMarkIcon } from "@heroicons/react/24/outline";
// // // // import { toast } from "react-hot-toast";
// // // // import DatePicker from "react-datepicker";
// // // // import "react-datepicker/dist/react-datepicker.css";

// // // // import {
// // // //   overlay,
// // // //   drawer,
// // // //   header,
// // // //   headerTitle,
// // // //   headerSubTitle,
// // // //   closeButton,
// // // //   progressBarOuter,
// // // //   progressBarInner,
// // // //   body,
// // // //   sectionTitle,
// // // //   fieldLabel,
// // // //   inputClass,
// // // //   selectClass,
// // // //   footer,
// // // //   buttonSecondary,
// // // //   buttonPrimary,
// // // //   errorText,
// // // // } from "../../formClasses";

// // // // import { Input, Textarea, Select } from "../../components/Common/Formhandler/FormComponents";
// // // // import { validateLoginPassword } from "../../utils/validation/validations";
// // // // import {
// // // //   employeeAPI,
// // // //   companyAPI,
// // // //   branchAPI,
// // // //   departmentAPI,
// // // //   positionsAPI,
// // // // } from "../../utils/registrationForms/api";

// // // // {/* ...other imports stay the same... */}

// // // // const EmployeeForm = ({ id, onClose }) => {
// // // //   const TOTAL_STEPS = 3;

// // // //   const [activeStep, setActiveStep] = useState(1);
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [fieldErrors, setFieldErrors] = useState({});
// // // //   const [showPassword, setShowPassword] = useState(false);

// // // //   const [companies, setCompanies] = useState([]);
// // // //   const [branches, setBranches] = useState([]);
// // // //   const [departments, setDepartments] = useState([]);
// // // //   const [employees, setEmployees] = useState([]);
// // // //   const [positions, setPositions] = useState([]);

// // // //   const today = new Date();
// // // //   const seventyYearsAgo = new Date(
// // // //     new Date().setFullYear(new Date().getFullYear() - 70)
// // // //   );

// // // //   const [formData, setFormData] = useState({
// // // //     company_id: "",
// // // //     branch_id: "",
// // // //     department_id: "",
// // // //     reports_to: "",
// // // //     position_id: "",
// // // //     first_name: "",
// // // //     last_name: "",
// // // //     gender: "",
// // // //     dob: null,
// // // //     email: "",
// // // //     phone_number: "",
// // // //     address: "",
// // // //     hire_date: null,
// // // //     employment_type: "Full-time",
// // // //     username: "",
// // // //     password: "",
// // // //     confirm_password: "",
// // // //   });

// // // //   /* ---------------- LOAD STATIC DATA ---------------- */
// // // //   useEffect(() => {
// // // //     companyAPI.getAll().then(setCompanies);
// // // //     positionsAPI.getAll().then(setPositions);
// // // //   }, []);

// // // //   /* ---------------- LOAD EMPLOYEE (EDIT) ---------------- */
// // // //   useEffect(() => {
// // // //     if (!id) return;
// // // //     employeeAPI.getById(id).then((data) => {
// // // //       setFormData({
// // // //         ...data,
// // // //         dob: data?.dob ? new Date(data.dob) : null,
// // // //         hire_date: data?.hire_date ? new Date(data.hire_date) : null,
// // // //         password: "",
// // // //         confirm_password: "",
// // // //       });
// // // //     });
// // // //   }, [id]);

// // // //   /* ---------------- DEPENDENT DROPDOWNS ---------------- */
// // // //   useEffect(() => {
// // // //     if (!formData.company_id) return;
// // // //     branchAPI.getByCompany(formData.company_id).then(setBranches);
// // // //   }, [formData.company_id]);

// // // //   useEffect(() => {
// // // //     if (!formData.branch_id) return;
// // // //     departmentAPI
// // // //       .getByBranch(formData.company_id, formData.branch_id)
// // // //       .then(setDepartments);
// // // //     employeeAPI
// // // //       .getByCompanyAndBranch(formData.company_id, formData.branch_id)
// // // //       .then(setEmployees);
// // // //   }, [formData.branch_id]);

// // // //   /* ---------------- HANDLERS ---------------- */
// // // //   const handleChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     setFormData((p) => ({ ...p, [name]: value }));
// // // //     setFieldErrors((p) => ({ ...p, [name]: null }));
// // // //   };

// // // //   const validateStep = (step) => {
// // // //     const errors = {};
// // // //     if (step === 1) {
// // // //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // // //         (f) => !formData[f] && (errors[f] = "This field is required")
// // // //       );
// // // //       if (!formData.dob) errors.dob = "Date of birth is required";
// // // //     }
// // // //     if (step === 2) {
// // // //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // // //         (f) => !formData[f] && (errors[f] = "This field is required")
// // // //       );
// // // //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// // // //     }
// // // //     if (step === 3 && !id) {
// // // //       if (!formData.username) errors.username = "Username is required";
// // // //       const pwdErr = validateLoginPassword(formData.password);
// // // //       if (pwdErr) errors.password = pwdErr;
// // // //       if (formData.password !== formData.confirm_password)
// // // //         errors.confirm_password = "Passwords do not match";
// // // //     }
// // // //     return errors;
// // // //   };

// // // //   const handleNext = () => {
// // // //     const errors = validateStep(activeStep);
// // // //     setFieldErrors(errors);
// // // //     if (!Object.keys(errors).length) setActiveStep((p) => p + 1);
// // // //   };

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();
// // // //     const errors = {
// // // //       ...validateStep(1),
// // // //       ...validateStep(2),
// // // //       ...validateStep(3),
// // // //     };
// // // //     if (Object.keys(errors).length) {
// // // //       setFieldErrors(errors);
// // // //       return;
// // // //     }

// // // //     setLoading(true);
// // // //     try {
// // // //       id
// // // //         ? await employeeAPI.update(id, formData)
// // // //         : await employeeAPI.create(formData);
// // // //       toast.success("Employee saved successfully");
// // // //       onClose();
// // // //     } catch (err) {
// // // //       const msg =
// // // //         err?.response?.data?.message ||
// // // //         err?.message ||
// // // //         "Failed to save employee";
// // // //       toast.error(msg);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   /* ---------------- RENDER ---------------- */
// // // //   return (
// // // //     <>
// // // //       {/* Remove onClick on overlay to prevent auto-close */}
// // // //       <div className={overlay} />

// // // //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// // // //         <div className={header}>
// // // //           <div>
// // // //             <h2 className={headerTitle}>
// // // //               {id ? "Edit Employee" : "Create Employee"}
// // // //             </h2>
// // // //             <p className={headerSubTitle}>
// // // //               STEP {activeStep} OF {TOTAL_STEPS}
// // // //             </p>
// // // //           </div>
// // // //           <button onClick={onClose} className={closeButton}>
// // // //             <XMarkIcon className="w-6 h-6" />
// // // //           </button>
// // // //         </div>

// // // //         <div className={progressBarOuter}>
// // // //           <div
// // // //             className={progressBarInner}
// // // //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// // // //           />
// // // //         </div>

// // // //         <form
// // // //           className={body}
// // // //           onSubmit={handleSubmit}
// // // //           onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
// // // //         >
// // // //           {/* STEP 1 */}
// // // //           {activeStep === 1 && (
// // // //             <div className="space-y-4">
// // // //               <h3 className={sectionTitle}>Personal Info</h3>
// // // //               <Input
// // // //                 label="First Name *"
// // // //                 name="first_name"
// // // //                 value={formData.first_name}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //               <Input
// // // //                 label="Last Name *"
// // // //                 name="last_name"
// // // //                 value={formData.last_name}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //               <Select
// // // //                 label="Gender *"
// // // //                 name="gender"
// // // //                 value={formData.gender}
// // // //                 onChange={handleChange}
// // // //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={selectClass}
// // // //               />
// // // //               <label className={fieldLabel}>Date of Birth *</label>
// // // //               <DatePicker
// // // //                 selected={formData.dob}
// // // //                 onChange={(d) => setFormData({ ...formData, dob: d })}
// // // //                 className={inputClass}
// // // //                 maxDate={today}
// // // //                 minDate={seventyYearsAgo}
// // // //               />
// // // //               {fieldErrors.dob && (
// // // //                 <p className={errorText}>{fieldErrors.dob}</p>
// // // //               )}
// // // //               <Input
// // // //                 label="Email *"
// // // //                 name="email"
// // // //                 value={formData.email}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //               <Input
// // // //                 label="Phone Number *"
// // // //                 name="phone_number"
// // // //                 value={formData.phone_number}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //               <Textarea
// // // //                 label="Address"
// // // //                 name="address"
// // // //                 value={formData.address}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //             </div>
// // // //           )}

// // // //           {/* STEP 2 */}
// // // //           {activeStep === 2 && (
// // // //             <div className="space-y-4">
// // // //               <h3 className={sectionTitle}>Employment Info</h3>
// // // //               <Select
// // // //                 label="Company *"
// // // //                 name="company_id"
// // // //                 value={formData.company_id}
// // // //                 onChange={handleChange}
// // // //                 options={companies.map((c) => ({
// // // //                   v: c.company_id,
// // // //                   label: c.company_name,
// // // //                 }))}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={selectClass}
// // // //               />
// // // //               <Select
// // // //                 label="Branch *"
// // // //                 name="branch_id"
// // // //                 value={formData.branch_id}
// // // //                 onChange={handleChange}
// // // //                 options={branches.map((b) => ({
// // // //                   v: b.branch_id,
// // // //                   label: b.branch_name,
// // // //                 }))}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={selectClass}
// // // //               />
// // // //               <Select
// // // //                 label="Department *"
// // // //                 name="department_id"
// // // //                 value={formData.department_id}
// // // //                 onChange={handleChange}
// // // //                 options={departments.map((d) => ({
// // // //                   v: d.department_id,
// // // //                   label: d.department_name,
// // // //                 }))}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={selectClass}
// // // //               />
// // // //               <Select
// // // //                 label="Reports To"
// // // //                 name="reports_to"
// // // //                 value={formData.reports_to}
// // // //                 onChange={handleChange}
// // // //                 options={employees.map((e) => ({
// // // //                   v: e.employee_id,
// // // //                   label: `${e.first_name} ${e.last_name}`,
// // // //                 }))}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={selectClass}
// // // //               />
// // // //               <Select
// // // //                 label="Position *"
// // // //                 name="position_id"
// // // //                 value={formData.position_id}
// // // //                 onChange={handleChange}
// // // //                 options={positions.map((p) => ({
// // // //                   v: p.position_id,
// // // //                   label: p.position_name,
// // // //                 }))}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={selectClass}
// // // //               />
// // // //               <label className={fieldLabel}>Hire Date *</label>
// // // //               <DatePicker
// // // //                 selected={formData.hire_date}
// // // //                 onChange={(d) => setFormData({ ...formData, hire_date: d })}
// // // //                 className={inputClass}
// // // //               />
// // // //               {fieldErrors.hire_date && (
// // // //                 <p className={errorText}>{fieldErrors.hire_date}</p>
// // // //               )}
// // // //             </div>
// // // //           )}

// // // //           {/* STEP 3 */}
// // // //           {activeStep === 3 && (
// // // //             <div className="space-y-4">
// // // //               <h3 className={sectionTitle}>System Access</h3>
// // // //               <Input
// // // //                 label="Username *"
// // // //                 name="username"
// // // //                 value={formData.username}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //               <Input
// // // //                 type={showPassword ? "text" : "password"}
// // // //                 label="Password *"
// // // //                 name="password"
// // // //                 value={formData.password}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //               <Input
// // // //                 type={showPassword ? "text" : "password"}
// // // //                 label="Confirm Password *"
// // // //                 name="confirm_password"
// // // //                 value={formData.confirm_password}
// // // //                 onChange={handleChange}
// // // //                 fieldErrors={fieldErrors}
// // // //                 className={inputClass}
// // // //               />
// // // //               <label className="flex gap-2 text-sm">
// // // //                 <input
// // // //                   type="checkbox"
// // // //                   checked={showPassword}
// // // //                   onChange={() => setShowPassword((p) => !p)}
// // // //                 />
// // // //                 Show Passwords
// // // //               </label>
// // // //             </div>
// // // //           )}

// // // //           {/* FOOTER */}
// // // //           <div className={footer}>
// // // //             <button
// // // //               type="button"
// // // //               className={buttonSecondary}
// // // //               onClick={() =>
// // // //                 activeStep === 1 ? onClose() : setActiveStep((p) => p - 1)
// // // //               }
// // // //             >
// // // //               Back
// // // //             </button>
// // // //             {activeStep < TOTAL_STEPS ? (
// // // //               <button
// // // //                 type="button"
// // // //                 className={buttonPrimary}
// // // //                 onClick={handleNext}
// // // //               >
// // // //                 Next
// // // //               </button>
// // // //             ) : (
// // // //               <button type="submit" className={buttonPrimary} disabled={loading}>
// // // //                 {loading ? "Saving..." : "Save"}
// // // //               </button>
// // // //             )}
// // // //           </div>
// // // //         </form>
// // // //       </div>
// // // //     </>
// // // //   );
// // // // };

// // // // export default EmployeeForm;

// // // import React, { useState, useEffect } from "react";
// // // import { XMarkIcon } from "@heroicons/react/24/outline";
// // // import { toast } from "react-hot-toast";
// // // import DatePicker from "react-datepicker";
// // // import "react-datepicker/dist/react-datepicker.css";

// // // import {
// // //   overlay,
// // //   drawer,
// // //   header,
// // //   headerTitle,
// // //   headerSubTitle,
// // //   closeButton,
// // //   progressBarOuter,
// // //   progressBarInner,
// // //   body,
// // //   sectionTitle,
// // //   fieldLabel,
// // //   inputClass,
// // //   selectClass,
// // //   footer,
// // //   buttonSecondary,
// // //   buttonPrimary,
// // //   errorText,
// // // } from "../../formClasses";

// // // import { Input, Textarea, Select } from "../../components/Common/Formhandler/FormComponents";
// // // import { validateLoginPassword } from "../../utils/validation/validations";
// // // import {
// // //   employeeAPI,
// // //   companyAPI,
// // //   branchAPI,
// // //   departmentAPI,
// // //   positionsAPI,
// // // } from "../../utils/registrationForms/api";

// // // const EmployeeForm = ({ id, onClose }) => {
// // //   const TOTAL_STEPS = 3;

// // //   const [activeStep, setActiveStep] = useState(1);
// // //   const [loading, setLoading] = useState(false);
// // //   const [fieldErrors, setFieldErrors] = useState({});
// // //   const [showPassword, setShowPassword] = useState(false);

// // //   const [companies, setCompanies] = useState([]);
// // //   const [branches, setBranches] = useState([]);
// // //   const [departments, setDepartments] = useState([]);
// // //   const [employees, setEmployees] = useState([]);
// // //   const [positions, setPositions] = useState([]);

// // //   const today = new Date();
// // //   const seventyYearsAgo = new Date(
// // //     new Date().setFullYear(new Date().getFullYear() - 70)
// // //   );

// // //   const [formData, setFormData] = useState({
// // //     company_id: "",
// // //     branch_id: "",
// // //     department_id: "",
// // //     reports_to: "",
// // //     position_id: "",
// // //     first_name: "",
// // //     last_name: "",
// // //     gender: "",
// // //     dob: null,
// // //     email: "",
// // //     phone_number: "",
// // //     address: "",
// // //     hire_date: null,
// // //     employment_type: "Full-time",
// // //     username: "",
// // //     password: "",
// // //     confirm_password: "",
// // //   });

// // //   /* ---------------- LOAD STATIC DATA ---------------- */
// // //   useEffect(() => {
// // //     companyAPI.getAll().then(setCompanies);
// // //     positionsAPI.getAll().then(setPositions);
// // //   }, []);

// // //   /* ---------------- LOAD EMPLOYEE (EDIT) ---------------- */
// // //   useEffect(() => {
// // //     if (!id) return;
// // //     employeeAPI.getById(id).then((data) => {
// // //       setFormData({
// // //         ...data,
// // //         dob: data?.dob ? new Date(data.dob) : null,
// // //         hire_date: data?.hire_date ? new Date(data.hire_date) : null,
// // //         password: "",
// // //         confirm_password: "",
// // //       });
// // //     });
// // //   }, [id]);

// // //   /* ---------------- DEPENDENT DROPDOWNS ---------------- */
// // //   useEffect(() => {
// // //     if (!formData.company_id) return;
// // //     branchAPI.getByCompany(formData.company_id).then(setBranches);
// // //   }, [formData.company_id]);

// // //   useEffect(() => {
// // //     if (!formData.branch_id) return;
// // //     departmentAPI
// // //       .getByBranch(formData.company_id, formData.branch_id)
// // //       .then(setDepartments);
// // //     employeeAPI
// // //       .getByCompanyAndBranch(formData.company_id, formData.branch_id)
// // //       .then(setEmployees);
// // //   }, [formData.branch_id]);

// // //   /* ---------------- HANDLERS ---------------- */
// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setFormData((p) => ({ ...p, [name]: value }));
// // //     setFieldErrors((p) => ({ ...p, [name]: null }));
// // //   };

// // //   const validateStep = (step) => {
// // //     const errors = {};
// // //     if (step === 1) {
// // //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// // //         (f) => !formData[f] && (errors[f] = "This field is required")
// // //       );
// // //       if (!formData.dob) errors.dob = "Date of birth is required";
// // //     }
// // //     if (step === 2) {
// // //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// // //         (f) => !formData[f] && (errors[f] = "This field is required")
// // //       );
// // //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// // //     }
// // //     if (step === 3 && !id) {
// // //       if (!formData.username) errors.username = "Username is required";
// // //       const pwdErr = validateLoginPassword(formData.password);
// // //       if (pwdErr) errors.password = pwdErr;
// // //       if (formData.password !== formData.confirm_password)
// // //         errors.confirm_password = "Passwords do not match";
// // //     }
// // //     return errors;
// // //   };

// // //   const handleNext = () => {
// // //     const errors = validateStep(activeStep);
// // //     setFieldErrors(errors);
// // //     if (!Object.keys(errors).length) setActiveStep((p) => p + 1);
// // //   };

// // //   const handleSubmit = async () => {
// // //     const errors = {
// // //       ...validateStep(1),
// // //       ...validateStep(2),
// // //       ...validateStep(3),
// // //     };
// // //     if (Object.keys(errors).length) {
// // //       setFieldErrors(errors);
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       id
// // //         ? await employeeAPI.update(id, formData)
// // //         : await employeeAPI.create(formData);
// // //       toast.success("Employee saved successfully");
// // //       onClose();
// // //     } catch (err) {
// // //       const msg =
// // //         err?.response?.data?.message ||
// // //         err?.message ||
// // //         "Failed to save employee";
// // //       toast.error(msg);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   /* ---------------- RENDER ---------------- */
// // //   return (
// // //     <>
// // //       {/* Overlay without onClick to prevent auto-close */}
// // //       <div className={overlay} />

// // //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// // //         <div className={header}>
// // //           <div>
// // //             <h2 className={headerTitle}>
// // //               {id ? "Edit Employee" : "Create Employee"}
// // //             </h2>
// // //             <p className={headerSubTitle}>
// // //               STEP {activeStep} OF {TOTAL_STEPS}
// // //             </p>
// // //           </div>
// // //           <button onClick={onClose} className={closeButton}>
// // //             <XMarkIcon className="w-6 h-6" />
// // //           </button>
// // //         </div>

// // //         <div className={progressBarOuter}>
// // //           <div
// // //             className={progressBarInner}
// // //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// // //           />
// // //         </div>

// // //         <div className={body}>
// // //           {/* STEP 1 */}
// // //           {activeStep === 1 && (
// // //             <div className="space-y-4">
// // //               <h3 className={sectionTitle}>Personal Info</h3>
// // //               <Input
// // //                 label="First Name *"
// // //                 name="first_name"
// // //                 value={formData.first_name}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //               <Input
// // //                 label="Last Name *"
// // //                 name="last_name"
// // //                 value={formData.last_name}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //               <Select
// // //                 label="Gender *"
// // //                 name="gender"
// // //                 value={formData.gender}
// // //                 onChange={handleChange}
// // //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// // //                 fieldErrors={fieldErrors}
// // //                 className={selectClass}
// // //               />
// // //               <label className={fieldLabel}>Date of Birth *</label>
// // //               <DatePicker
// // //                 selected={formData.dob}
// // //                 onChange={(d) => setFormData({ ...formData, dob: d })}
// // //                 className={inputClass}
// // //                 maxDate={today}
// // //                 minDate={seventyYearsAgo}
// // //               />
// // //               {fieldErrors.dob && <p className={errorText}>{fieldErrors.dob}</p>}
// // //               <Input
// // //                 label="Email *"
// // //                 name="email"
// // //                 value={formData.email}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //               <Input
// // //                 label="Phone Number *"
// // //                 name="phone_number"
// // //                 value={formData.phone_number}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //               <Textarea
// // //                 label="Address"
// // //                 name="address"
// // //                 value={formData.address}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //             </div>
// // //           )}

// // //           {/* STEP 2 */}
// // //           {activeStep === 2 && (
// // //             <div className="space-y-4">
// // //               <h3 className={sectionTitle}>Employment Info</h3>
// // //               <Select
// // //                 label="Company *"
// // //                 name="company_id"
// // //                 value={formData.company_id}
// // //                 onChange={handleChange}
// // //                 options={companies.map((c) => ({
// // //                   v: c.company_id,
// // //                   label: c.company_name,
// // //                 }))}
// // //                 fieldErrors={fieldErrors}
// // //                 className={selectClass}
// // //               />
// // //               <Select
// // //                 label="Branch *"
// // //                 name="branch_id"
// // //                 value={formData.branch_id}
// // //                 onChange={handleChange}
// // //                 options={branches.map((b) => ({
// // //                   v: b.branch_id,
// // //                   label: b.branch_name,
// // //                 }))}
// // //                 fieldErrors={fieldErrors}
// // //                 className={selectClass}
// // //               />
// // //               <Select
// // //                 label="Department *"
// // //                 name="department_id"
// // //                 value={formData.department_id}
// // //                 onChange={handleChange}
// // //                 options={departments.map((d) => ({
// // //                   v: d.department_id,
// // //                   label: d.department_name,
// // //                 }))}
// // //                 fieldErrors={fieldErrors}
// // //                 className={selectClass}
// // //               />
// // //               <Select
// // //                 label="Reports To"
// // //                 name="reports_to"
// // //                 value={formData.reports_to}
// // //                 onChange={handleChange}
// // //                 options={employees.map((e) => ({
// // //                   v: e.employee_id,
// // //                   label: `${e.first_name} ${e.last_name}`,
// // //                 }))}
// // //                 fieldErrors={fieldErrors}
// // //                 className={selectClass}
// // //               />
// // //               <Select
// // //                 label="Position *"
// // //                 name="position_id"
// // //                 value={formData.position_id}
// // //                 onChange={handleChange}
// // //                 options={positions.map((p) => ({
// // //                   v: p.position_id,
// // //                   label: p.position_name,
// // //                 }))}
// // //                 fieldErrors={fieldErrors}
// // //                 className={selectClass}
// // //               />
// // //               <label className={fieldLabel}>Hire Date *</label>
// // //               <DatePicker
// // //                 selected={formData.hire_date}
// // //                 onChange={(d) => setFormData({ ...formData, hire_date: d })}
// // //                 className={inputClass}
// // //               />
// // //               {fieldErrors.hire_date && (
// // //                 <p className={errorText}>{fieldErrors.hire_date}</p>
// // //               )}
// // //             </div>
// // //           )}

// // //           {/* STEP 3 */}
// // //           {activeStep === 3 && (
// // //             <div className="space-y-4">
// // //               <h3 className={sectionTitle}>System Access</h3>
// // //               <Input
// // //                 label="Username *"
// // //                 name="username"
// // //                 value={formData.username}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //               <Input
// // //                 type={showPassword ? "text" : "password"}
// // //                 label="Password *"
// // //                 name="password"
// // //                 value={formData.password}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //               <Input
// // //                 type={showPassword ? "text" : "password"}
// // //                 label="Confirm Password *"
// // //                 name="confirm_password"
// // //                 value={formData.confirm_password}
// // //                 onChange={handleChange}
// // //                 fieldErrors={fieldErrors}
// // //                 className={inputClass}
// // //               />
// // //               <label className="flex gap-2 text-sm">
// // //                 <input
// // //                   type="checkbox"
// // //                   checked={showPassword}
// // //                   onChange={() => setShowPassword((p) => !p)}
// // //                 />
// // //                 Show Passwords
// // //               </label>
// // //             </div>
// // //           )}

// // //           {/* FOOTER */}
// // //           <div className={footer}>
// // //             <button
// // //               type="button"
// // //               className={buttonSecondary}
// // //               onClick={() =>
// // //                 activeStep === 1 ? onClose() : setActiveStep((p) => p - 1)
// // //               }
// // //             >
// // //               Back
// // //             </button>
// // //             {activeStep < TOTAL_STEPS ? (
// // //               <button
// // //                 type="button"
// // //                 className={buttonPrimary}
// // //                 onClick={handleNext}
// // //               >
// // //                 Next
// // //               </button>
// // //             ) : (
// // //               <button
// // //                 type="button"
// // //                 className={buttonPrimary}
// // //                 disabled={loading}
// // //                 onClick={handleSubmit}
// // //               >
// // //                 {loading ? "Saving..." : "Save"}
// // //               </button>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // };

// // // export default EmployeeForm;
// // import React, { useState, useEffect } from "react";
// // import { XMarkIcon } from "@heroicons/react/24/outline";
// // import { toast } from "react-hot-toast";
// // import DatePicker from "react-datepicker";
// // import "react-datepicker/dist/react-datepicker.css";

// // import {
// //   overlay,
// //   drawer,
// //   header,
// //   headerTitle,
// //   headerSubTitle,
// //   closeButton,
// //   progressBarOuter,
// //   progressBarInner,
// //   body,
// //   sectionTitle,
// //   fieldLabel,
// //   inputClass,
// //   selectClass,
// //   footer,
// //   buttonSecondary,
// //   buttonPrimary,
// //   errorText,
// // } from "../../formClasses";

// // import { Input, Textarea, Select } from "../../components/Common/Formhandler/FormComponents";
// // import { validateLoginPassword } from "../../utils/validation/validations";
// // import {
// //   employeeAPI,
// //   companyAPI,
// //   branchAPI,
// //   departmentAPI,
// //   positionsAPI,
// // } from "../../utils/registrationForms/api";
// // /* ...imports stay the same... */

// // const EmployeeForm = ({ id, onClose }) => {
// //   const TOTAL_STEPS = 3;

// //   const [activeStep, setActiveStep] = useState(1);
// //   const [loading, setLoading] = useState(false);
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const [showPassword, setShowPassword] = useState(false);

// //   const [companies, setCompanies] = useState([]);
// //   const [branches, setBranches] = useState([]);
// //   const [departments, setDepartments] = useState([]);
// //   const [employees, setEmployees] = useState([]);
// //   const [positions, setPositions] = useState([]);

// //   const today = new Date();
// //   const seventyYearsAgo = new Date(
// //     new Date().setFullYear(new Date().getFullYear() - 70)
// //   );

// //   const [formData, setFormData] = useState({
// //     company_id: "",
// //     branch_id: "",
// //     department_id: "",
// //     reports_to: "",
// //     position_id: "",
// //     first_name: "",
// //     last_name: "",
// //     gender: "",
// //     dob: null,
// //     email: "",
// //     phone_number: "",
// //     address: "",
// //     hire_date: null,
// //     employment_type: "Full-time",
// //     username: "",
// //     password: "",
// //     confirm_password: "",
// //   });

// //   /* ---------------- LOAD STATIC DATA ---------------- */
// //   useEffect(() => {
// //     companyAPI.getAll().then(setCompanies);
// //     positionsAPI.getAll().then(setPositions);
// //   }, []);

// //   /* ---------------- LOAD EMPLOYEE (EDIT) ---------------- */
// //   useEffect(() => {
// //     if (!id) return;
// //     employeeAPI.getById(id).then((data) => {
// //       setFormData({
// //         ...data,
// //         dob: data?.dob ? new Date(data.dob) : null,
// //         hire_date: data?.hire_date ? new Date(data.hire_date) : null,
// //         password: "",
// //         confirm_password: "",
// //       });
// //     });
// //   }, [id]);

// //   /* ---------------- DEPENDENT DROPDOWNS ---------------- */
// //   useEffect(() => {
// //     if (!formData.company_id) return;
// //     branchAPI.getByCompany(formData.company_id).then(setBranches);
// //   }, [formData.company_id]);

// //   useEffect(() => {
// //     if (!formData.branch_id) return;
// //     departmentAPI
// //       .getByBranch(formData.company_id, formData.branch_id)
// //       .then(setDepartments);
// //     employeeAPI
// //       .getByCompanyAndBranch(formData.company_id, formData.branch_id)
// //       .then(setEmployees);
// //   }, [formData.branch_id]);

// //   /* ---------------- HANDLERS ---------------- */
// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((p) => ({ ...p, [name]: value }));
// //     setFieldErrors((p) => ({ ...p, [name]: null }));
// //   };

// //   /* ---------------- VALIDATION ---------------- */
// //   const validateStep = (step) => {
// //     const errors = {};

// //     // STEP 1: Personal Info
// //     if (step === 1) {
// //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// //         (field) => {
// //           if (!formData[field]) errors[field] = "This field is required";
// //         }
// //       );
// //       if (!formData.dob) errors.dob = "Date of birth is required";
// //     }

// //     // STEP 2: Employment Info
// //     if (step === 2) {
// //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// //         (field) => {
// //           if (!formData[field]) errors[field] = "This field is required";
// //         }
// //       );
// //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// //     }

// //     // STEP 3: System Access
// //     if (step === 3) {
// //       if (!formData.username) errors.username = "Username is required";

// //       // Validate password only if user entered something
// //       if (formData.password || formData.confirm_password) {
// //         const pwdError = validateLoginPassword(formData.password);
// //         if (pwdError) errors.password = pwdError;

// //         if (!formData.confirm_password)
// //           errors.confirm_password = "Confirm password is required";

// //         if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password)
// //           errors.confirm_password = "Passwords do not match";
// //       }
// //     }

// //     return errors;
// //   };

// //   const handleNext = () => {
// //     const errors = validateStep(activeStep);
// //     setFieldErrors(errors);
// //     if (Object.keys(errors).length === 0) setActiveStep((p) => p + 1);
// //   };

// //   const handleSubmit = async () => {
// //     // Validate all steps for both create and edit
// //     const errors = {
// //       ...validateStep(1),
// //       ...validateStep(2),
// //       ...validateStep(3),
// //     };

// //     if (Object.keys(errors).length > 0) {
// //       setFieldErrors(errors);
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       if (id) {
// //         await employeeAPI.update(id, formData);
// //       } else {
// //         await employeeAPI.create(formData);
// //       }
// //       toast.success("Employee saved successfully");
// //       onClose();
// //     } catch (err) {
// //       const msg = err?.response?.data?.message || err?.message || "Failed to save employee";
// //       toast.error(msg);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /* ---------------- RENDER ---------------- */
// //   return (
// //     <>
// //       <div className={overlay} />
// //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// //         <div className={header}>
// //           <div>
// //             <h2 className={headerTitle}>{id ? "Edit Employee" : "Create Employee"}</h2>
// //             <p className={headerSubTitle}>
// //               STEP {activeStep} OF {TOTAL_STEPS}
// //             </p>
// //           </div>
// //           <button onClick={onClose} className={closeButton}>
// //             <XMarkIcon className="w-6 h-6" />
// //           </button>
// //         </div>

// //         <div className={progressBarOuter}>
// //           <div
// //             className={progressBarInner}
// //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// //           />
// //         </div>

// //         <div className={body}>
// //           {/* STEP 1 */}
// //           {activeStep === 1 && (
// //             <div className="space-y-4">
// //               <h3 className={sectionTitle}>Personal Info</h3>
// //               <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //               <Input label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //               <Select label="Gender *" name="gender" value={formData.gender} onChange={handleChange} options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]} fieldErrors={fieldErrors} className={selectClass} />
// //               <label className={fieldLabel}>Date of Birth *</label>
// //               <DatePicker selected={formData.dob} onChange={(d) => setFormData({ ...formData, dob: d })} className={inputClass} maxDate={today} minDate={seventyYearsAgo} />
// //               {fieldErrors.dob && <p className={errorText}>{fieldErrors.dob}</p>}
// //               <Input label="Email *" name="email" value={formData.email} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //               <Input label="Phone Number *" name="phone_number" value={formData.phone_number} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //               <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //             </div>
// //           )}

// //           {/* STEP 2 */}
// //           {activeStep === 2 && (
// //             <div className="space-y-4">
// //               <h3 className={sectionTitle}>Employment Info</h3>
// //               <Select label="Company *" name="company_id" value={formData.company_id} onChange={handleChange} options={companies.map(c => ({ v: c.company_id, label: c.company_name }))} fieldErrors={fieldErrors} className={selectClass} />
// //               <Select label="Branch *" name="branch_id" value={formData.branch_id} onChange={handleChange} options={branches.map(b => ({ v: b.branch_id, label: b.branch_name }))} fieldErrors={fieldErrors} className={selectClass} />
// //               <Select label="Department *" name="department_id" value={formData.department_id} onChange={handleChange} options={departments.map(d => ({ v: d.department_id, label: d.department_name }))} fieldErrors={fieldErrors} className={selectClass} />
// //               <Select label="Reports To" name="reports_to" value={formData.reports_to} onChange={handleChange} options={employees.map(e => ({ v: e.employee_id, label: `${e.first_name} ${e.last_name}` }))} fieldErrors={fieldErrors} className={selectClass} />
// //               <Select label="Position *" name="position_id" value={formData.position_id} onChange={handleChange} options={positions.map(p => ({ v: p.position_id, label: p.position_name }))} fieldErrors={fieldErrors} className={selectClass} />
// //               <label className={fieldLabel}>Hire Date *</label>
// //               <DatePicker selected={formData.hire_date} onChange={(d) => setFormData({ ...formData, hire_date: d })} className={inputClass} />
// //               {fieldErrors.hire_date && <p className={errorText}>{fieldErrors.hire_date}</p>}
// //             </div>
// //           )}

// //           {/* STEP 3 */}
// //           {activeStep === 3 && (
// //             <div className="space-y-4">
// //               <h3 className={sectionTitle}>System Access</h3>
// //               <Input label="Username *" name="username" value={formData.username} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //               <Input type={showPassword ? "text" : "password"} label="Password *" name="password" value={formData.password} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //               <Input type={showPassword ? "text" : "password"} label="Confirm Password *" name="confirm_password" value={formData.confirm_password} onChange={handleChange} fieldErrors={fieldErrors} className={inputClass} />
// //               <label className="flex gap-2 text-sm">
// //                 <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(p => !p)} />
// //                 Show Passwords
// //               </label>
// //             </div>
// //           )}

// //           {/* FOOTER */}
// //           <div className={footer}>
// //             <button type="button" className={buttonSecondary} onClick={() => activeStep === 1 ? onClose() : setActiveStep(p => p - 1)}>Back</button>
// //             {activeStep < TOTAL_STEPS ? (
// //               <button type="button" className={buttonPrimary} onClick={handleNext}>Next</button>
// //             ) : (
// //               <button type="button" className={buttonPrimary} onClick={handleSubmit} disabled={loading}>
// //                 {loading ? "Saving..." : "Save"}
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default EmployeeForm;
// // import React, { useState, useEffect } from "react";
// // import { XMarkIcon } from "@heroicons/react/24/outline";
// // import { toast } from "react-hot-toast";
// // import DatePicker from "react-datepicker";
// // import "react-datepicker/dist/react-datepicker.css";

// // import {
// //   overlay,
// //   drawer,
// //   header,
// //   headerTitle,
// //   headerSubTitle,
// //   closeButton,
// //   progressBarOuter,
// //   progressBarInner,
// //   body,
// //   sectionTitle,
// //   fieldLabel,
// //   inputClass,
// //   selectClass,
// //   footer,
// //   buttonSecondary,
// //   buttonPrimary,
// //   errorText,
// // } from "../../formClasses";

// // import {
// //   Input,
// //   Textarea,
// //   Select,
// // } from "../../components/Common/Formhandler/FormComponents";
// // import { validateLoginPassword } from "../../utils/validation/validations";
// // import {
// //   employeeAPI,
// //   companyAPI,
// //   branchAPI,
// //   departmentAPI,
// //   positionsAPI,
// // } from "../../utils/registrationForms/api";

// // const EmployeeForm = ({ id, onClose }) => {
// //   const TOTAL_STEPS = 3;

// //   const [activeStep, setActiveStep] = useState(1);
// //   const [loading, setLoading] = useState(false);
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const [showPassword, setShowPassword] = useState(false);

// //   const [companies, setCompanies] = useState([]);
// //   const [branches, setBranches] = useState([]);
// //   const [departments, setDepartments] = useState([]);
// //   const [employees, setEmployees] = useState([]);
// //   const [positions, setPositions] = useState([]);

// //   const today = new Date();
// //   const seventyYearsAgo = new Date(
// //     new Date().setFullYear(new Date().getFullYear() - 70)
// //   );

// //   const [formData, setFormData] = useState({
// //     company_id: "",
// //     branch_id: "",
// //     department_id: "",
// //     reports_to: "",
// //     position_id: "",
// //     first_name: "",
// //     last_name: "",
// //     gender: "",
// //     dob: null,
// //     email: "",
// //     phone_number: "",
// //     address: "",
// //     hire_date: null,
// //     employment_type: "Full-time",
// //     username: "",
// //     password: "",
// //     confirm_password: "",
// //   });

// //   /* ---------------- LOAD STATIC DATA ---------------- */
// //   useEffect(() => {
// //     companyAPI.getAll().then(setCompanies);
// //     positionsAPI.getAll().then(setPositions);
// //   }, []);

// //   /* ---------------- LOAD EMPLOYEE (EDIT) ---------------- */
// //   useEffect(() => {
// //     if (!id) return;
// //     employeeAPI.getById(id).then((data) => {
// //       setFormData({
// //         ...data,
// //         dob: data?.dob ? new Date(data.dob) : null,
// //         hire_date: data?.hire_date ? new Date(data.hire_date) : null,
// //         password: "",
// //         confirm_password: "",
// //       });
// //     });
// //   }, [id]);

// //   /* ---------------- DEPENDENT DROPDOWNS ---------------- */
// //   useEffect(() => {
// //     if (!formData.company_id) return;
// //     branchAPI.getByCompany(formData.company_id).then(setBranches);
// //   }, [formData.company_id]);

// //   useEffect(() => {
// //     if (!formData.branch_id) return;
// //     departmentAPI
// //       .getByBranch(formData.company_id, formData.branch_id)
// //       .then(setDepartments);
// //     employeeAPI
// //       .getByCompanyAndBranch(formData.company_id, formData.branch_id)
// //       .then(setEmployees);
// //   }, [formData.branch_id]);

// //   /* ---------------- HANDLERS ---------------- */
// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((p) => ({ ...p, [name]: value }));
// //     setFieldErrors((p) => ({ ...p, [name]: null }));
// //   };

// //   /* ---------------- VALIDATION ---------------- */
// //   const validateStep = (step) => {
// //     const errors = {};

// //     if (step === 1) {
// //       ["first_name", "last_name", "gender", "email", "phone_number"].forEach(
// //         (field) => {
// //           if (!formData[field]) errors[field] = "This field is required";
// //         }
// //       );
// //       if (!formData.dob) errors.dob = "Date of birth is required";
// //     }

// //     if (step === 2) {
// //       ["company_id", "branch_id", "department_id", "position_id"].forEach(
// //         (field) => {
// //           if (!formData[field]) errors[field] = "This field is required";
// //         }
// //       );
// //       if (!formData.hire_date) errors.hire_date = "Hire date is required";
// //     }

// //     if (step === 3) {
// //       if (!formData.username) errors.username = "Username is required";

// //       if (formData.password || formData.confirm_password) {
// //         const pwdError = validateLoginPassword(formData.password);
// //         if (pwdError) errors.password = pwdError;

// //         if (!formData.confirm_password)
// //           errors.confirm_password = "Confirm password is required";

// //         if (
// //           formData.password &&
// //           formData.confirm_password &&
// //           formData.password !== formData.confirm_password
// //         )
// //           errors.confirm_password = "Passwords do not match";
// //       }
// //     }

// //     return errors;
// //   };

// //   const handleNext = () => {
// //     const errors = validateStep(activeStep);
// //     setFieldErrors(errors);
// //     if (Object.keys(errors).length === 0) setActiveStep((p) => p + 1);
// //   };

// //   const handleSubmit = async () => {
// //     // Validate all steps before saving
// //     const errors = {
// //       ...validateStep(1),
// //       ...validateStep(2),
// //       ...validateStep(3),
// //     };

// //     if (Object.keys(errors).length > 0) {
// //       setFieldErrors(errors);
// //       toast.error("Please fill all mandatory fields correctly.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       if (id) {
// //         await employeeAPI.update(id, formData);
// //       } else {
// //         await employeeAPI.create(formData);
// //       }
// //       toast.success("Employee saved successfully");
// //       onClose();
// //     } catch (err) {
// //       const msg =
// //         err?.response?.data?.message ||
// //         err?.message ||
// //         "Failed to save employee";
// //       toast.error(msg);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <>
// //       <div className={overlay} />
// //       <div className={drawer} onClick={(e) => e.stopPropagation()}>
// //         <div className={header}>
// //           <div>
// //             <h2 className={headerTitle}>
// //               {id ? "Edit Employee" : "Create Employee"}
// //             </h2>
// //             <p className={headerSubTitle}>
// //               STEP {activeStep} OF {TOTAL_STEPS}
// //             </p>
// //           </div>
// //           <button onClick={onClose} className={closeButton}>
// //             <XMarkIcon className="w-6 h-6" />
// //           </button>
// //         </div>

// //         <div className={progressBarOuter}>
// //           <div
// //             className={progressBarInner}
// //             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
// //           />
// //         </div>

// //         <div className={body}>
// //           {/* STEP 1 */}
// //           {activeStep === 1 && (
// //             <div className="space-y-4">
// //               <h3 className={sectionTitle}>Personal Info</h3>
// //               <Input
// //                 label="First Name *"
// //                 name="first_name"
// //                 value={formData.first_name}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //               <Input
// //                 label="Last Name *"
// //                 name="last_name"
// //                 value={formData.last_name}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //               <Select
// //                 label="Gender *"
// //                 name="gender"
// //                 value={formData.gender}
// //                 onChange={handleChange}
// //                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
// //                 fieldErrors={fieldErrors}
// //                 className={selectClass}
// //               />
// //           <div className="flex flex-col gap-1">
// //   <label className={fieldLabel}>Date of Birth *</label>

// //   <DatePicker
// //     selected={formData.dob}
// //     onChange={(d) => setFormData({ ...formData, dob: d })}
// //     className={inputClass}

// //     maxDate={today}
// //     minDate={seventyYearsAgo}

// //     showYearDropdown
// //     showMonthDropdown
// //     dropdownMode="select"
// //     scrollableYearDropdown
// //     yearDropdownItemNumber={100}

// //     // popperPlacement="bottom-start"
// //     // popperModifiers={[
// //     //   {
// //     //     name: "offset",
// //     //     options: {
// //     //       offset: [0, 8],
// //     //     },
// //     //   },
// //     // ]}

// //     dateFormat="dd/MM/yyyy"
// //   />

// //   {fieldErrors.dob && (
// //     <p className={errorText}>{fieldErrors.dob}</p>
// //   )}
// // </div>

// //               <Input
// //                 label="Email *"
// //                 name="email"
// //                 value={formData.email}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //               <Input
// //                 label="Phone Number *"
// //                 name="phone_number"
// //                 value={formData.phone_number}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //               <Textarea
// //                 label="Address"
// //                 name="address"
// //                 value={formData.address}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //             </div>
// //           )}

// //           {/* STEP 2 */}
// //           {activeStep === 2 && (
// //             <div className="space-y-4">
// //               <h3 className={sectionTitle}>Employment Info</h3>
// //               <Select
// //                 label="Company *"
// //                 name="company_id"
// //                 value={formData.company_id}
// //                 onChange={handleChange}
// //                 options={companies.map((c) => ({
// //                   v: c.company_id,
// //                   label: c.company_name,
// //                 }))}
// //                 fieldErrors={fieldErrors}
// //                 className={selectClass}
// //               />
// //               <Select
// //                 label="Branch *"
// //                 name="branch_id"
// //                 value={formData.branch_id}
// //                 onChange={handleChange}
// //                 options={branches.map((b) => ({
// //                   v: b.branch_id,
// //                   label: b.branch_name,
// //                 }))}
// //                 fieldErrors={fieldErrors}
// //                 className={selectClass}
// //               />
// //               <Select
// //                 label="Department *"
// //                 name="department_id"
// //                 value={formData.department_id}
// //                 onChange={handleChange}
// //                 options={departments.map((d) => ({
// //                   v: d.department_id,
// //                   label: d.department_name,
// //                 }))}
// //                 fieldErrors={fieldErrors}
// //                 className={selectClass}
// //               />
// //               <Select
// //                 label="Reports To"
// //                 name="reports_to"
// //                 value={formData.reports_to}
// //                 onChange={handleChange}
// //                 options={employees.map((e) => ({
// //                   v: e.employee_id,
// //                   label: `${e.first_name} ${e.last_name}`,
// //                 }))}
// //                 fieldErrors={fieldErrors}
// //                 className={selectClass}
// //               />
// //               <Select
// //                 label="Position *"
// //                 name="position_id"
// //                 value={formData.position_id}
// //                 onChange={handleChange}
// //                 options={positions.map((p) => ({
// //                   v: p.position_id,
// //                   label: p.position_name,
// //                 }))}
// //                 fieldErrors={fieldErrors}
// //                 className={selectClass}
// //               />
// //                         <div className="flex flex-col gap-1">

// //               <label className={fieldLabel}>Hire Date *</label>
// //               <DatePicker
// //                 selected={formData.hire_date}
// //                 onChange={(d) => setFormData({ ...formData, hire_date: d })}
// //                 className={inputClass}
// //               />
// //               {fieldErrors.hire_date && (
// //                 <p className={errorText}>{fieldErrors.hire_date}</p>
// //               )}
// //               </div>
// //             </div>
// //           )}

// //           {/* STEP 3 */}
// //           {activeStep === 3 && (
// //             <div className="space-y-4">
// //               <h3 className={sectionTitle}>System Access</h3>
// //               <Input
// //                 label="Username *"
// //                 name="username"
// //                 value={formData.username}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //               <Input
// //                 type={showPassword ? "text" : "password"}
// //                 label="Password *"
// //                 name="password"
// //                 value={formData.password}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //               <Input
// //                 type={showPassword ? "text" : "password"}
// //                 label="Confirm Password *"
// //                 name="confirm_password"
// //                 value={formData.confirm_password}
// //                 onChange={handleChange}
// //                 fieldErrors={fieldErrors}
// //                 className={inputClass}
// //               />
// //               <label className="flex gap-2 text-sm">
// //                 <input
// //                   type="checkbox"
// //                   checked={showPassword}
// //                   onChange={() => setShowPassword((p) => !p)}
// //                 />
// //                 Show Passwords
// //               </label>
// //             </div>
// //           )}

// //           <div className={footer}>
// //             <button
// //               type="button"
// //               className={buttonSecondary}
// //               onClick={() =>
// //                 activeStep === 1 ? onClose() : setActiveStep((p) => p - 1)
// //               }
// //             >
// //               Back
// //             </button>
// //             {activeStep < TOTAL_STEPS ? (
// //               <button
// //                 type="button"
// //                 className={buttonPrimary}
// //                 onClick={handleNext}
// //               >
// //                 Next
// //               </button>
// //             ) : (
// //               <button
// //                 type="button"
// //                 className={buttonPrimary}
// //                 onClick={handleSubmit}
// //                 disabled={loading}
// //               >
// //                 {loading ? "Saving..." : "Save"}
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default EmployeeForm;
// import React, { useState, useEffect } from "react";
// import { XMarkIcon } from "@heroicons/react/24/outline";
// import { toast } from "react-hot-toast";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// import {
//   overlay,
//   drawer,
//   header,
//   headerTitle,
//   headerSubTitle,
//   closeButton,
//   progressBarOuter,
//   progressBarInner,
//   body,
//   sectionTitle,
//   fieldLabel,
//   inputClass,
//   selectClass,
//   footer,
//   buttonSecondary,
//   buttonPrimary,
//   errorText,
// } from "../../formClasses";

// import { Input, Textarea, Select } from "../../components/Common/Formhandler/FormComponents";
// import { validateLoginPassword } from "../../utils/validation/validations";
// import {
//   employeeAPI,
//   companyAPI,
//   branchAPI,
//   departmentAPI,
//   positionsAPI,
// } from "../../utils/registrationForms/api";

// const EmployeeForm = ({ id, onClose }) => {
//   const TOTAL_STEPS = 4; // 4 steps now

//   const [activeStep, setActiveStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);

//   const [companies, setCompanies] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [positions, setPositions] = useState([]);

//   const today = new Date();
//   const seventyYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 70));

//   const [formData, setFormData] = useState({
//     company_id: "",
//     branch_id: "",
//     department_id: "",
//     reports_to: "",
//     position_id: "",
//     first_name: "",
//     last_name: "",
//     gender: "",
//     dob: null,
//     email: "",
//     phone_number: "",
//     address: "",
//     hire_date: null,
//     employment_type: "Full-time",
//     username: "",
//     password: "",
//     confirm_password: "",
//   });

//   // Load static data
//   useEffect(() => {
//     companyAPI.getAll().then(setCompanies);
//     positionsAPI.getAll().then(setPositions);
//   }, []);

//   // Load employee for edit
//   useEffect(() => {
//     if (!id) return;
//     employeeAPI.getById(id).then((data) => {
//       setFormData({
//         ...data,
//         dob: data?.dob ? new Date(data.dob) : null,
//         hire_date: data?.hire_date ? new Date(data.hire_date) : null,
//         password: "",
//         confirm_password: "",
//       });
//     });
//   }, [id]);

//   // Dependent dropdowns
//   useEffect(() => {
//     if (!formData.company_id) return;
//     branchAPI.getByCompany(formData.company_id).then(setBranches);
//   }, [formData.company_id]);

//   useEffect(() => {
//     if (!formData.branch_id) return;
//     departmentAPI.getByBranch(formData.company_id, formData.branch_id).then(setDepartments);
//     employeeAPI.getByCompanyAndBranch(formData.company_id, formData.branch_id).then(setEmployees);
//   }, [formData.branch_id]);

//   // Handlers
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//     setFieldErrors((p) => ({ ...p, [name]: null }));
//   };

//   // Validation per step
//   const validateStep = (step) => {
//     const errors = {};
//     if (step === 1) {
//       ["first_name", "last_name", "gender"].forEach((field) => {
//         if (!formData[field]) errors[field] = "This field is required";
//       });
//       if (!formData.dob) errors.dob = "Date of birth is required";
//     }
//     if (step === 2) {
//       ["email", "phone_number", "address"].forEach((field) => {
//         if (!formData[field]) errors[field] = "This field is required";
//       });
//     }
//     if (step === 3) {
//       ["company_id", "branch_id", "department_id", "position_id"].forEach((field) => {
//         if (!formData[field]) errors[field] = "This field is required";
//       });
//       if (!formData.hire_date) errors.hire_date = "Hire date is required";
//     }
//     if (step === 4) {
//       if (!formData.username) errors.username = "Username is required";
//       if (formData.password || formData.confirm_password) {
//         const pwdError = validateLoginPassword(formData.password);
//         if (pwdError) errors.password = pwdError;
//         if (!formData.confirm_password) errors.confirm_password = "Confirm password is required";
//         if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password)
//           errors.confirm_password = "Passwords do not match";
//       }
//     }
//     return errors;
//   };

//   const handleNext = () => {
//     const errors = validateStep(activeStep);
//     setFieldErrors(errors);
//     if (Object.keys(errors).length === 0) setActiveStep((p) => p + 1);
//   };

//   const handlePrevious = () => setActiveStep((p) => Math.max(p - 1, 1));

//   const handleSubmit = async () => {
//     // Validate all steps
//     const errors = {
//       ...validateStep(1),
//       ...validateStep(2),
//       ...validateStep(3),
//       ...validateStep(4),
//     };
//     if (Object.keys(errors).length > 0) {
//       setFieldErrors(errors);
//       toast.error("Please fill all mandatory fields correctly.");
//       return;
//     }
//     setLoading(true);
//     try {
//       if (id) await employeeAPI.update(id, formData);
//       else await employeeAPI.create(formData);
//       toast.success("Employee saved successfully");
//       onClose();
//     } catch (err) {
//       const msg = err?.response?.data?.message || err?.message || "Failed to save employee";
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className={overlay} />
//       <div className={drawer} onClick={(e) => e.stopPropagation()}>
//         <div className={header}>
//           <div>
//             <h2 className={headerTitle}>{id ? "Edit Employee" : "Create Employee"}</h2>
//             <p className={headerSubTitle}>
//               STEP {activeStep} OF {TOTAL_STEPS}
//             </p>
//           </div>
//           <button onClick={onClose} className={closeButton}>
//             <XMarkIcon className="w-6 h-6" />
//           </button>
//         </div>

//         <div className={progressBarOuter}>
//           <div
//             className={progressBarInner}
//             style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
//           />
//         </div>

//         <div className={body}>
//           {/* STEP 1: Personal Info */}
//           {activeStep === 1 && (
//             <div className="space-y-4">
//               <h3 className={sectionTitle}>Personal Information</h3>
//               <Input
//                 label="First Name *"
//                 name="first_name"
//                 value={formData.first_name}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//               <Input
//                 label="Last Name *"
//                 name="last_name"
//                 value={formData.last_name}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//               <Select
//                 label="Gender *"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//                 options={[{ v: "Male" }, { v: "Female" }, { v: "Other" }]}
//                 fieldErrors={fieldErrors}
//                 className={selectClass}
//               />
//               <div className="flex flex-col gap-1">
//                 <label className={fieldLabel}>Date of Birth *</label>
//                 <DatePicker
//                   selected={formData.dob}
//                   onChange={(d) => setFormData({ ...formData, dob: d })}
//                   className={inputClass}
//                   maxDate={today}
//                   minDate={seventyYearsAgo}
//                   showYearDropdown
//                   showMonthDropdown
//                   dropdownMode="select"
//                   scrollableYearDropdown
//                   yearDropdownItemNumber={100}
//                   dateFormat="dd/MM/yyyy"
//                 />
//                 {fieldErrors.dob && <p className={errorText}>{fieldErrors.dob}</p>}
//               </div>
//             </div>
//           )}

//           {/* STEP 2: Contact & Address */}
//           {activeStep === 2 && (
//               <div className="space-y-4">
//               <h3 className={sectionTitle}>Employment Information</h3>
//               <Select
//                 label="Company *"
//                 name="company_id"
//                 value={formData.company_id}
//                 onChange={handleChange}
//                 options={companies.map((c) => ({ v: c.company_id, label: c.company_name }))}
//                 fieldErrors={fieldErrors}
//                 className={selectClass}
//               />
//               <Select
//                 label="Branch *"
//                 name="branch_id"
//                 value={formData.branch_id}
//                 onChange={handleChange}
//                 options={branches.map((b) => ({ v: b.branch_id, label: b.branch_name }))}
//                 fieldErrors={fieldErrors}
//                 className={selectClass}
//               />
//               <Select
//                 label="Department *"
//                 name="department_id"
//                 value={formData.department_id}
//                 onChange={handleChange}
//                 options={departments.map((d) => ({ v: d.department_id, label: d.department_name }))}
//                 fieldErrors={fieldErrors}
//                 className={selectClass}
//               />
//               <Select
//                 label="Reports To"
//                 name="reports_to"
//                 value={formData.reports_to}
//                 onChange={handleChange}
//                 options={employees.map((e) => ({ v: e.employee_id, label: `${e.first_name} ${e.last_name}` }))}
//                 fieldErrors={fieldErrors}
//                 className={selectClass}
//               />
//               <Select
//                 label="Position *"
//                 name="position_id"
//                 value={formData.position_id}
//                 onChange={handleChange}
//                 options={positions.map((p) => ({ v: p.position_id, label: p.position_name }))}
//                 fieldErrors={fieldErrors}
//                 className={selectClass}
//               />
//               <div className="flex flex-col gap-1">
//                 <label className={fieldLabel}>Hire Date *</label>
//                 <DatePicker
//                   selected={formData.hire_date}
//                   onChange={(d) => setFormData({ ...formData, hire_date: d })}
//                   className={inputClass}
//                 />
//                 {fieldErrors.hire_date && <p className={errorText}>{fieldErrors.hire_date}</p>}
//               </div>
//             </div>
//           )}

//           {/* STEP 3: Employment Info */}
//           {activeStep === 3 && (

//              <div className="space-y-4">
//               <h3 className={sectionTitle}>Contact & Address Information</h3>
//               <Input
//                 label="Email *"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//               <Input
//                 label="Phone Number *"
//                 name="phone_number"
//                 value={formData.phone_number}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//               <Textarea
//                 label="Address *"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//             </div>

//           )}

//           {/* STEP 4: System Access */}
//           {activeStep === 4 && (
//             <div className="space-y-4">
//               <h3 className={sectionTitle}>System Access</h3>
//               <Input
//                 label="Username *"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//               <Input
//                 type={showPassword ? "text" : "password"}
//                 label="Password *"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//               <Input
//                 type={showPassword ? "text" : "password"}
//                 label="Confirm Password *"
//                 name="confirm_password"
//                 value={formData.confirm_password}
//                 onChange={handleChange}
//                 fieldErrors={fieldErrors}
//                 className={inputClass}
//               />
//               <label className="flex gap-2 text-sm">
//                 <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((p) => !p)} />
//                 Show Passwords
//               </label>
//             </div>
//           )}
//         </div>

//         <div className={footer}>
//           <button type="button" className={buttonSecondary} onClick={handlePrevious}>
//             Back
//           </button>
//           {activeStep < TOTAL_STEPS ? (
//             <button type="button" className={buttonPrimary} onClick={handleNext}>
//               Next
//             </button>
//           ) : (
//             <button type="button" className={buttonPrimary} onClick={handleSubmit} disabled={loading}>
//               {loading ? "Saving..." : "Save"}
//             </button>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default EmployeeForm;
import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  selectClass,
  textareaClass,
  footer,
  buttonSecondary,
  buttonPrimary,
  errorText,
} from "../../formClasses";

import {
  Input,
  Textarea,
  Select,
} from "../../components/Common/Formhandler/FormComponents";
import { validateLoginPassword } from "../../utils/validation/validations";
import {
  employeeAPI,
  companyAPI,
  branchAPI,
  departmentAPI,
  positionsAPI,
} from "../../utils/registrationForms/api";

const EmployeeForm = ({ id, onClose }) => {
  const TOTAL_STEPS = 4;
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);

  const today = new Date();
  const seventyYearsAgo = new Date(
    new Date().setFullYear(new Date().getFullYear() - 70)
  );

  const [formData, setFormData] = useState({
    company_id: "",
    branch_id: "",
    department_id: "",
    reports_to: "",
    position_id: "",
    first_name: "",
    last_name: "",
    gender: "",
    dob: null,
    email: "",
    phone_number: "",
    address: "",
    hire_date: null,
    employment_type: "Full-time",
    username: "",
    password: "",
    confirm_password: "",
  });

  // Load static data
  useEffect(() => {
    companyAPI.getAll().then(setCompanies);
    positionsAPI.getAll().then(setPositions);
  }, []);

  // Load employee for edit
  useEffect(() => {
    if (!id) return;
    employeeAPI.getById(id).then((data) => {
      setFormData({
        ...data,
        dob: data?.dob ? new Date(data.dob) : null,
        hire_date: data?.hire_date ? new Date(data.hire_date) : null,
        password: "",
        confirm_password: "",
      });
    });
  }, [id]);

  // Dependent dropdowns
  useEffect(() => {
    if (!formData.company_id) return;
    branchAPI.getByCompany(formData.company_id).then(setBranches);
  }, [formData.company_id]);

  useEffect(() => {
    if (!formData.branch_id) return;
    departmentAPI
      .getByBranch(formData.company_id, formData.branch_id)
      .then(setDepartments);
    employeeAPI
      .getByCompanyAndBranch(formData.company_id, formData.branch_id)
      .then(setEmployees);
  }, [formData.branch_id]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      ["first_name", "last_name", "gender"].forEach((field) => {
        if (!formData[field]) errors[field] = "This field is required";
      });
      if (!formData.dob) errors.dob = "Date of birth is required";
    }
    if (step === 2) {
      ["email", "phone_number", "address"].forEach((field) => {
        if (!formData[field]) errors[field] = "This field is required";
      });
    }
    if (step === 3) {
      ["company_id", "branch_id", "department_id", "position_id"].forEach(
        (field) => {
          if (!formData[field]) errors[field] = "This field is required";
        }
      );
      if (!formData.hire_date) errors.hire_date = "Hire date is required";
    }
    if (step === 4) {
      if (!formData.username) errors.username = "Username is required";
      if (formData.password || formData.confirm_password) {
        const pwdError = validateLoginPassword(formData.password);
        if (pwdError) errors.password = pwdError;
        if (!formData.confirm_password)
          errors.confirm_password = "Confirm password is required";
        if (
          formData.password &&
          formData.confirm_password &&
          formData.password !== formData.confirm_password
        )
          errors.confirm_password = "Passwords do not match";
      }
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(activeStep);
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setActiveStep((prev) => prev + 1);
  };

  const handlePrevious = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    const errors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4),
    };
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill all mandatory fields correctly.");
      return;
    }

    setLoading(true);
    try {
      if (id) await employeeAPI.update(id, formData);
      else await employeeAPI.create(formData);
      toast.success("Employee saved successfully");
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save employee";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={overlay}>
      <div className={drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={header}>
          <div>
            <h2 className={headerTitle}>
              {id ? "Edit Employee" : "Create Employee"}
            </h2>
            <p className={headerSubTitle}>
              STEP {activeStep} OF {TOTAL_STEPS}
            </p>
          </div>
          <button onClick={onClose} className={closeButton}>
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
            style={{ width: `${(activeStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className={body}>
          {/* Step 1: Personal Info */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <p className={sectionTitle}>Basic Information</p>
              <div>
                <label className={fieldLabel}>First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.first_name ? " border-black-500" : "")
                  }
                />
                {fieldErrors.first_name && (
                  <p className={errorText}>{fieldErrors.first_name}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.last_name ? " border-black-500" : "")
                  }
                />
                {fieldErrors.last_name && (
                  <p className={errorText}>{fieldErrors.last_name}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={
                    selectClass +
                    (fieldErrors.gender ? " border-black-500" : "")
                  }
                >
                  <option value="">-Select Gender-</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.gender && (
                  <p className={errorText}>{fieldErrors.gender}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Date of Birth *</label>
                <DatePicker
                  selected={formData.dob}
                  onChange={(d) => setFormData({ ...formData, dob: d })}
                  className={
                    inputClass + (fieldErrors.dob ? " border-black-500" : "")
                  }
                  maxDate={today}
                  minDate={seventyYearsAgo}
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  dateFormat="dd/MM/yyyy"
                />
                {fieldErrors.dob && (
                  <p className={errorText}>{fieldErrors.dob}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <p className={sectionTitle}>Contact Details</p>
              <div>
                <label className={fieldLabel}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={
                    inputClass + (fieldErrors.email ? " border-black-500" : "")
                  }
                />
                {fieldErrors.email && (
                  <p className={errorText}>{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Phone Number *</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.phone_number ? " border-black-500" : "")
                  }
                />
                {fieldErrors.phone_number && (
                  <p className={errorText}>{fieldErrors.phone_number}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={
                    textareaClass +
                    (fieldErrors.address ? " border-black-500" : "")
                  }
                />
                {fieldErrors.address && (
                  <p className={errorText}>{fieldErrors.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Employment Info */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <p className={sectionTitle}>Employment Details</p>
              <div>
                <label className={fieldLabel}>Company *</label>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  className={
                    selectClass +
                    (fieldErrors.company_id ? " border-black-500" : "")
                  }
                >
                  <option value="">-Select Company-</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.company_id && (
                  <p className={errorText}>{fieldErrors.company_id}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Branch *</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className={
                    selectClass +
                    (fieldErrors.branch_id ? " border-black-500" : "")
                  }
                >
                  <option value="">-Select Branch-</option>
                  {branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.branch_id && (
                  <p className={errorText}>{fieldErrors.branch_id}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Department *</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className={
                    selectClass +
                    (fieldErrors.department_id ? " border-black-500" : "")
                  }
                >
                  <option value="">-Select Department-</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.department_id && (
                  <p className={errorText}>{fieldErrors.department_id}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Reports To</label>
                <select
                  name="reports_to"
                  value={formData.reports_to}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">-Select Manager-</option>
                  {employees.map((e) => (
                    <option
                      key={e.employee_id}
                      value={e.employee_id}
                    >{`${e.first_name} ${e.last_name}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={fieldLabel}>Position *</label>
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  className={
                    selectClass +
                    (fieldErrors.position_id ? " border-black-500" : "")
                  }
                >
                  <option value="">-Select Position-</option>
                  {positions.map((p) => (
                    <option key={p.position_id} value={p.position_id}>
                      {p.position_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.position_id && (
                  <p className={errorText}>{fieldErrors.position_id}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Hire Date *</label>
                <DatePicker
                  selected={formData.hire_date}
                  onChange={(d) => setFormData({ ...formData, hire_date: d })}
                  className={
                    inputClass +
                    (fieldErrors.hire_date ? " border-black-500" : "")
                  }
                />
                {fieldErrors.hire_date && (
                  <p className={errorText}>{fieldErrors.hire_date}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: System Access */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <p className={sectionTitle}>System Access</p>
              <div>
                <label className={fieldLabel}>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.username ? " border-black-500" : "")
                  }
                />
                {fieldErrors.username && (
                  <p className={errorText}>{fieldErrors.username}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.password ? " border-black-500" : "")
                  }
                />
                {fieldErrors.password && (
                  <p className={errorText}>{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label className={fieldLabel}>Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={
                    inputClass +
                    (fieldErrors.confirm_password ? " border-black-500" : "")
                  }
                />
                {fieldErrors.confirm_password && (
                  <p className={errorText}>{fieldErrors.confirm_password}</p>
                )}
              </div>
              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((p) => !p)}
                />
                Show Passwords
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={footer}>
          <button
            type="button"
            className={buttonSecondary}
            onClick={handlePrevious}
          >
            Back
          </button>
          {activeStep < TOTAL_STEPS ? (
            <button
              type="button"
              className={buttonPrimary}
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className={buttonPrimary}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
