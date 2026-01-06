// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { employeeAPI } from "../../utils/registrationForms/api";
// import { toast } from "react-hot-toast";
// import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/Common/DataTable";
// import ConfirmationModal from "../../components/Common/ConfirmationModal";
// import {
//   PencilSquareIcon,
//   TrashIcon,
//   ArrowPathIcon,
// } from "@heroicons/react/24/outline";

// const Employees = () => {
//   const navigate = useNavigate();

//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("Active");

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
//   const [employeeToDelete, setEmployeeToDelete] = useState(null);
//   const [employeeToReinstate, setEmployeeToReinstate] = useState(null);

//   /* ---------------- PAGINATION ---------------- */

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   /* ---------------- FETCH ---------------- */

//   const fetchEmployees = async () => {
//     try {
//       setLoading(true);
//       const data = await employeeAPI.getAll();
//       setEmployees(data);
//     } catch {
//       toast.error("Failed to fetch employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   /* ---------------- FILTER ---------------- */

// const filteredEmployees = employees
//   .filter((employee) => {
//     const matchesSearch =
//       employee.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       employee.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       employee.position_name
//         ?.toLowerCase()
//         .includes(searchQuery.toLowerCase());

//     const matchesStatus =
//       statusFilter === "all" || employee.status_name === statusFilter;

//     return matchesSearch && matchesStatus;
//   })
//   .sort((a, b) => {
//     // Recently added first
//     if (a.created_at && b.created_at) {
//       return new Date(b.created_at) - new Date(a.created_at);
//     }
//     // fallback if created_at not present
//     return b.employee_id - a.employee_id;
//   });


//   const totalItems = filteredEmployees.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   const paginatedEmployees = filteredEmployees.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, statusFilter]);

//   const goToPage = (page) => {
//     if (page >= 1 && page <= totalPages) setCurrentPage(page);
//   };

// const getPaginationRange = (current, total) => {
//   const pages = new Set();

//   pages.add(1);
//   pages.add(total);

//   for (let i = current - 1; i <= current + 1; i++) {
//     if (i > 1 && i < total) {
//       pages.add(i);
//     }
//   }

//   const sortedPages = [...pages].sort((a, b) => a - b);

//   const result = [];
//   let last = null;

//   for (const page of sortedPages) {
//     if (last !== null && page - last > 1) {
//       result.push("...");
//     }
//     result.push(page);
//     last = page;
//   }

//   return result;
// };


//   /* ---------------- ACTIONS ---------------- */

//   // const handleEdit = (id) => navigate(`/employees/edit/${id}`);

//   const handleEdit = (id) => {
//     setEditingEmployeeId(id);
//     setShowEmployeeModal(true);
//   };

//   const handleDelete = (id) => {
//     setEmployeeToDelete(id);
//     setShowDeleteConfirm(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       await employeeAPI.archive(employeeToDelete);
//       toast.success("Employee archived successfully");
//       fetchEmployees();
//     } catch {
//       toast.error("Failed to archive employee");
//     }
//     setShowDeleteConfirm(false);
//     setEmployeeToDelete(null);
//   };

//   const handleReinstate = (id) => {
//     setEmployeeToReinstate(id);
//     setShowReinstateConfirm(true);
//   };

//   const confirmReinstate = async () => {
//     try {
//       await employeeAPI.reinstate(employeeToReinstate);
//       toast.success("Employee reinstated successfully");
//       fetchEmployees();
//     } catch {
//       toast.error("Failed to reinstate employee");
//     }
//     setShowReinstateConfirm(false);
//     setEmployeeToReinstate(null);
//   };

//   /* ---------------- TABLE ---------------- */

//   const columns = [
//     { key: "name", label: "Name" },
//     { key: "email", label: "Email" },
//     { key: "phone", label: "Phone" },
//     { key: "job", label: "Job Title" },
//     { key: "status", label: "Status" },
//     { key: "actions", label: "Actions" },
//   ];

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex justify-center items-center h-64">
//           <div className="text-lg text-gray-600">Loading employees...</div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout pageTitle="Employees List">
//       <div style={{ background: "#e4eaf2" }} className="topcontainer">
//         {/* HEADER */}
//         <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
//           <div className="ui-search">
//             <input
//               type="text"
//               placeholder="Search employees..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="ui-search-input"
//             />
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//             <div className="ui-tabs font-custom">
//               {["Active", "Archived", "all"].map((status) => (
//                 <button
//                   key={status}
//                   onClick={() => setStatusFilter(status)}
//                   className={`ui-tab ${
//                     statusFilter === status ? "active" : ""
//                   }`}
//                 >
//                   {status === "all" ? "All" : status}
//                 </button>
//               ))}
//             </div>

//             <Link to="/employees/new" className="ui-primary-btn">
//               <svg
//                 className="w-5 h-5 mr-1"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2}
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 4v16m8-8H4"
//                 />
//               </svg>
//               Create Employee
//             </Link>
//           </div>
//         </div>

//         {/* DATATABLE */}
//         <DataTable
//           columns={columns}
//           data={paginatedEmployees}
//           renderRow={(employee) => (
//             <tr
//               key={employee.employee_id}
//               className="ui-row hover:bg-gray-50"
//               style={{ background: "#f6f9fc" }}
//             >
//               <td className="ui-td">
//                 {employee.first_name} {employee.last_name}
//               </td>
//               <td className="ui-td">{employee.email}</td>
//               <td className="ui-td">{employee.phone_number}</td>
//               <td className="ui-td">{employee.position_name || "N/A"}</td>

//               <td className="ui-td">
//                 <span
//                   className={`inline-flex items-center px-3 py-1 rounded-full shadow-sm ${
//                     employee.status_name === "Active"
//                       ? "bg-green-50 text-green-800"
//                       : employee.status_name === "Archived"
//                       ? "bg-red-50 text-red-800"
//                       : "bg-gray-50 text-gray-800"
//                   }`}
//                 >
//                   {employee.status_name}
//                 </span>
//               </td>

//               <td className="ui-td">
//                 <div className="flex items-center gap-2">
//                   {employee.status_name === "Archived" ? (
//                     <button
//                       onClick={() =>
//                         handleReinstate(employee.employee_id)
//                       }
//                       className="ui-icon-btn reinstate"
//                     >
//                       <ArrowPathIcon className="w-5 h-5" />
//                     </button>
//                   ) : (
//                     <>
//                       <button
//                         onClick={() =>
//                           handleEdit(employee.employee_id)
//                         }
//                         className="ui-icon-btn edit"
//                       >
//                         <PencilSquareIcon className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() =>
//                           handleDelete(employee.employee_id)
//                         }
//                         className="ui-icon-btn delete"
//                       >
//                         <TrashIcon className="w-5 h-5" />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </td>
//             </tr>
//           )}
//           pagination={
//             totalItems > 0 && (
//               <div className="ui-pagination font-custom">
//                 <div className="ui-pagination-info text-xs text-slate-500 mb-2">
//                   Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
//                   {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
//                   {totalItems} results
//                 </div>

//                 <div className="ui-pagination-controls flex gap-1">
//                   <button
//                     className="ui-page-btn"
//                     disabled={currentPage === 1}
//                     onClick={() => goToPage(currentPage - 1)}
//                   >
//                     Previous
//                   </button>

//                     {getPaginationRange(currentPage, totalPages).map((page, index) =>
//   page === "..." ? (
//     <span key={`dots-${index}`} className="px-2 text-slate-400">…</span>
//   ) : (
//     <button
//       key={`page-${page}`}
//       className={`ui-page-btn ${currentPage === page ? "active" : ""}`}
//       onClick={() => goToPage(page)}
//     >
//       {page}
//     </button>
//   )
// )}

//                   <button
//                     className="ui-page-btn"
//                     disabled={currentPage === totalPages}
//                     onClick={() => goToPage(currentPage + 1)}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )
//           }
//         />

//         {/* CONFIRMATION MODALS */}
//         <ConfirmationModal
//           isOpen={showDeleteConfirm}
//           onClose={() => setShowDeleteConfirm(false)}
//           onConfirm={confirmDelete}
//           title="Archive Employee"
//           message="Are you sure you want to archive this employee?"
//           confirmText="Archive"
//           cancelText="Cancel"
//           type="danger"
//         />
     

//         <ConfirmationModal
//           isOpen={showReinstateConfirm}
//           onClose={() => setShowReinstateConfirm(false)}
//           onConfirm={confirmReinstate}
//           title="Reinstate Employee"
//           message="Do you want to reinstate this employee?"
//           confirmText="Reinstate"
//           cancelText="Cancel"
//           type="info"
//         />
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Employees;
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import DataTable from "../../components/Common/DataTable";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";
import { employeeAPI } from "../../utils/registrationForms/api";
import { PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import EmployeeForm from "./EmployeeForm"; // Make sure path is correct

const Employees = () => {
  /* ---------------- NAVIGATION / STATE ---------------- */
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeToReinstate, setEmployeeToReinstate] = useState(null);

  /* ---------------- PAGINATION ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ---------------- MODAL ---------------- */
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  /* ---------------- FETCH ---------------- */
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredEmployees = employees
    .filter((employee) => {
      const matchesSearch =
        employee.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || employee.status_name === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return b.employee_id - a.employee_id;
    });

  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPaginationRange = (current, total) => {
    const pages = new Set();
    pages.add(1);
    pages.add(total);
    for (let i = current - 1; i <= current + 1; i++) {
      if (i > 1 && i < total) pages.add(i);
    }
    const sortedPages = [...pages].sort((a, b) => a - b);
    const result = [];
    let last = null;
    for (const page of sortedPages) {
      if (last !== null && page - last > 1) result.push("...");
      result.push(page);
      last = page;
    }
    return result;
  };

  /* ---------------- ACTIONS ---------------- */
  const handleEdit = (id) => {
    setEditingEmployeeId(id);
    setShowEmployeeModal(true);
  };

  const handleCreate = () => {
    setEditingEmployeeId(null);
    setShowEmployeeModal(true);
  };

  const handleDelete = (id) => {
    setEmployeeToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await employeeAPI.archive(employeeToDelete);
      toast.success("Employee archived successfully");
      fetchEmployees();
    } catch {
      toast.error("Failed to archive employee");
    }
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const handleReinstate = (id) => {
    setEmployeeToReinstate(id);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    try {
      await employeeAPI.reinstate(employeeToReinstate);
      toast.success("Employee reinstated successfully");
      fetchEmployees();
    } catch {
      toast.error("Failed to reinstate employee");
    }
    setShowReinstateConfirm(false);
    setEmployeeToReinstate(null);
  };

  /* ---------------- TABLE ---------------- */
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "job", label: "Job Title" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading employees...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Employees List">
      <div style={{ background: "#e9eff5" }} className="topcontainer">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
          <div className="ui-search">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-search-input"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="ui-tabs font-custom">
              {["Active", "Archived", "all"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`ui-tab ${statusFilter === status ? "active" : ""}`}
                >
                  {status === "all" ? "All" : status}
                </button>
              ))}
            </div>

            <button onClick={handleCreate} className="ui-primary-btn">
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Employee
            </button>
          </div>
        </div>

        {/* DATATABLE */}
        <DataTable
          columns={columns}
          data={paginatedEmployees}
          renderRow={(employee) => (
            <tr key={employee.employee_id} className="ui-row hover:bg-gray-50" style={{ background: "#f6f9fc" }}>
              <td className="ui-td">{employee.first_name} {employee.last_name}</td>
              <td className="ui-td">{employee.email}</td>
              <td className="ui-td">{employee.phone_number}</td>
              <td className="ui-td">{employee.position_name || "N/A"}</td>
              <td className="ui-td">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full shadow-sm font-semibold ${
                    employee.status_name === "Active"
                      ? "bg-green-50 text-green-800"
                      : employee.status_name === "Archived"
                      ? "bg-red-50 text-red-800"
                      : "bg-gray-50 text-gray-800"
                  }`}
                       style={{
                      color: employee.status_name === "Active" ? "#10b981" : undefined,
                    }}
                >
                  {employee.status_name}
                </span>
              </td>
              <td className="ui-td">
                <div className="flex items-center gap-2">
                  {employee.status_name === "Archived" ? (
                    <button onClick={() => handleReinstate(employee.employee_id)} className="ui-icon-btn reinstate">
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleEdit(employee.employee_id)
                        }
                        className="ui-icon-btn edit"
                      >
                          <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(employee.employee_id)
                        }
                        className="ui-icon-btn delete"
                      >
                        <RiDeleteBin7Line size={18} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}
          pagination={
            totalItems > 0 && (
              <div className="ui-pagination font-custom">
                <div className="ui-pagination-info text-xs text-slate-500 mb-2">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </div>

                <div className="ui-pagination-controls flex gap-1">
                  <button className="ui-page-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                    Previous
                  </button>

                  {getPaginationRange(currentPage, totalPages).map((page, index) =>
                    page === "..." ? (
                      <span key={`dots-${index}`} className="px-2 text-slate-400">…</span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        className={`ui-page-btn ${currentPage === page ? "active" : ""}`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button className="ui-page-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                    Next
                  </button>
                </div>
              </div>
            )
          }
        />

        {/* CONFIRMATION MODALS */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Archive Employee"
          message="Are you sure you want to archive this employee?"
          confirmText="Archive"
          cancelText="Cancel"
          type="danger"
        />

        <ConfirmationModal
          isOpen={showReinstateConfirm}
          onClose={() => setShowReinstateConfirm(false)}
          onConfirm={confirmReinstate}
          title="Reinstate Employee"
          message="Do you want to reinstate this employee?"
          confirmText="Reinstate"
          cancelText="Cancel"
          type="info"
        />

        {/* EMPLOYEE FORM MODAL */}
        {showEmployeeModal && (
          <EmployeeForm
            id={editingEmployeeId} // null for new employee
            onClose={() => {
              setShowEmployeeModal(false);
              setEditingEmployeeId(null);
              fetchEmployees(); // refresh table after save
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Employees;
