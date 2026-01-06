import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import DepartmentFormModal from "./DepartmentFormModal";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import DataTable from "../../components/Common/DataTable";
import { toast } from "react-hot-toast";

import {
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import {
  departmentAPI,
  branchAPI,
  companyAPI,
} from "../../utils/registrationForms/api";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [departmentToReinstate, setDepartmentToReinstate] = useState(null);

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);

  /* ---------------- PAGINATION ---------------- */

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ---------------- FETCH ---------------- */

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [depRes, branchRes, companyRes] = await Promise.all([
        departmentAPI.getAll(),
        branchAPI.getAll(),
        companyAPI.getAll(),
      ]);

      setDepartments(
        depRes.map((dep) => ({
          ...dep,
          status: dep.status_id === 1 ? "Active" : "Archived",
        }))
      );

      setBranches(branchRes);
      setCompanies(companyRes);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  /* ---------------- LOOKUPS ---------------- */

  const branchMap = {};
  branches.forEach((b) => (branchMap[b.branch_id] = b.branch_name));

  const companyMap = {};
  companies.forEach((c) => (companyMap[c.company_id] = c.company_name));

  /* ---------------- FILTER ---------------- */

const filteredDepartments = departments
  .filter((dep) => {
    const matchesSearch =
      dep.department_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || dep.status === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    // Recently added first
    if (a.created_at && b.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    // fallback if created_at not available
    return b.department_id - a.department_id;
  });


  const totalItems = filteredDepartments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedDepartments = filteredDepartments.slice(
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
    if (i > 1 && i < total) {
      pages.add(i);
    }
  }

  const sortedPages = [...pages].sort((a, b) => a - b);

  const result = [];
  let last = null;

  for (const page of sortedPages) {
    if (last !== null && page - last > 1) {
      result.push("...");
    }
    result.push(page);
    last = page;
  }

  return result;
};



  /* ---------------- ACTIONS ---------------- */

  const handleDelete = (id) => {
    setDepartmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await departmentAPI.delete(departmentToDelete);
      toast.success("Department archived successfully");
      fetchAllData();
    } catch {
      toast.error("Failed to archive department");
    }
    setShowDeleteConfirm(false);
    setDepartmentToDelete(null);
  };

  const handleReinstate = (id) => {
    setDepartmentToReinstate(id);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    try {
      const formData = new FormData();
      formData.append("status_id", 1);
      await departmentAPI.update(departmentToReinstate, formData);
      toast.success("Department reinstated successfully");
      fetchAllData();
    } catch {
      toast.error("Failed to reinstate department");
    }
    setShowReinstateConfirm(false);
    setDepartmentToReinstate(null);
  };

  const handleCreate = () => {
    setEditingDepartmentId(null);
    setShowDepartmentModal(true);
  };

  const handleEdit = (id) => {
    setEditingDepartmentId(id);
    setShowDepartmentModal(true);
  };

  /* ---------------- TABLE ---------------- */
const columns = [
  { key: "main", label: "Main Department" },
  { key: "sub", label: "Sub Department" },
  { key: "company", label: "Company" },
  { key: "mainBranch", label: "Main Branch" },
  { key: "subBranch", label: "Sub Branch" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64 text-gray-600">
          Loading departments...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Departments">
      <div style={{ background: "#e9eff5" }} className="topcontainer">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
          <div className="ui-search">
            <input
              type="text"
              placeholder="Search departments..."
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
                  className={`ui-tab ${
                    statusFilter === status ? "active" : ""
                  }`}
                >
                  {status === "all" ? "All" : status}
                </button>
              ))}
            </div>

            <button className="ui-primary-btn" onClick={handleCreate}>
              + Create Department
            </button>
          </div>
        </div>

        {/* DATATABLE */}
        <DataTable
          columns={columns}
          data={paginatedDepartments}
 renderRow={(dep) => {
    const mainBranches = [];
    const subBranches = [];

    dep.branch_ids?.forEach((id, index) => {
      const name = branchMap[id];
      if (!name) return;

      if (index === 0) {
        mainBranches.push(name); // first → main branch
      } else {
        subBranches.push(name); // rest → sub branches
      }
    });

    return (
      <tr
        key={dep.department_id}
        className="ui-row hover:bg-gray-50"
        style={{ background: "#f6f9fc" }}
      >
        {/* Main Department */}
        <td className="ui-td">
          {dep.parent_department_name || dep.department_name}
        </td>

        {/* Sub Department */}
        <td className="ui-td">
          {dep.parent_department_id ? dep.department_name : "-"}
        </td>

        {/* Company */}
        <td className="ui-td">
          {companyMap[dep.company_id] || "-"}
        </td>

        {/* Main Branch */}
        <td className="ui-td">
          {mainBranches.length ? mainBranches.join(", ") : "-"}
        </td>

        {/* Sub Branch */}
        <td className="ui-td">
          {subBranches.length ? subBranches.join(", ") : "-"}
        </td>

        {/* Status */}
        <td className="ui-td">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full shadow-sm font-semibold ${
              dep.status === "Active"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
              style={{
                      color: dep.status === "Active" ? "#10b981" : undefined,
                    }}
          >
            {dep.status}
          </span>
        </td>

        {/* Actions */}
        <td className="ui-td">
          <div className="flex items-center gap-2">
            {dep.status === "Archived" ? (
              <button
                className="ui-icon-btn reinstate"
                onClick={() => handleReinstate(dep.department_id)}
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  className="ui-icon-btn edit"
                  onClick={() => handleEdit(dep.department_id)}
                >
                     <FiEdit size={18} />
                </button>
                <button
                  className="ui-icon-btn delete"
                  onClick={() => handleDelete(dep.department_id)}
                >
                 <RiDeleteBin7Line size={18} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }}
          pagination={
            totalItems > 0 && (
              <div className="ui-pagination font-custom">
                <div className="ui-pagination-info text-xs text-slate-500 mb-2">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} results
                </div>

                <div className="ui-pagination-controls flex gap-1">
                  <button
                    className="ui-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
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


                  <button
                    className="ui-page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
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
          title="Archive Department"
          message="Are you sure you want to archive this department?"
          confirmText="Archive"
          cancelText="Cancel"
          type="danger"
        />

        <ConfirmationModal
          isOpen={showReinstateConfirm}
          onClose={() => setShowReinstateConfirm(false)}
          onConfirm={confirmReinstate}
          title="Reinstate Department"
          message="Do you want to reinstate this department?"
          confirmText="Reinstate"
          cancelText="Cancel"
          type="info"
        />

        <DepartmentFormModal
          isOpen={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          departmentId={editingDepartmentId}
          onSuccess={fetchAllData}
        />
      </div>
    </DashboardLayout>
  );
};

export default Departments;
