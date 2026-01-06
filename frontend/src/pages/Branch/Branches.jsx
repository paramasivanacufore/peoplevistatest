import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import BranchFormModal from "../../components/Branch/BranchFormModal";
import { toast } from "react-hot-toast";
import { branchAPI } from "../../utils/registrationForms/api";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";
import DataTable from "../../components/Common/DataTable";
import ConfirmationModal from "../../components/Common/ConfirmationModal"; // ✅ external modal

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [branchToReinstate, setBranchToReinstate] = useState(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const columns = [
    { key: "name", label: "Branch Name" },
    { key: "location", label: "Location" },
    { key: "company_name", label: "Company" },
    { key: "is_global", label: "Branch Type" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const data = await branchAPI.getAll();
      setBranches(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Filtered branches
  const filteredBranches = branches
    .filter((branch) => {
      const matchesSearch =
        branch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || branch.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // newest first
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      // fallback (if created_at not present)
      return b.branch_id - a.branch_id;
    });

  const totalItems = filteredBranches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1); // reset page when search/filter changes
  }, [searchQuery, statusFilter]);

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

  // Delete / Reinstate handlers
  const handleDelete = (branchId) => {
    setBranchToDelete(branchId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (branchToDelete) {
      try {
        await branchAPI.delete(branchToDelete);
        toast.success("Branch archived successfully");
        fetchBranches();
      } catch (err) {
        toast.error(err.message || "Failed to archive branch");
      }
    }
    setShowDeleteConfirm(false);
    setBranchToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBranchToDelete(null);
  };

  const handleReinstate = (branchId) => {
    setBranchToReinstate(branchId);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    if (branchToReinstate) {
      try {
        await branchAPI.reinstate(branchToReinstate);
        toast.success("Branch reinstated successfully");
        fetchBranches();
      } catch (err) {
        toast.error(err.message || "Failed to reinstate branch");
      }
    }
    setShowReinstateConfirm(false);
    setBranchToReinstate(null);
  };

  const cancelReinstate = () => {
    setShowReinstateConfirm(false);
    setBranchToReinstate(null);
  };

  // Modal handlers
  const handleCreateBranch = () => {
    setEditingBranchId(null);
    setShowBranchModal(true);
  };

  const handleEdit = (branchId) => {
    setEditingBranchId(branchId);
    setShowBranchModal(true);
  };

  const handleCloseModal = () => {
    setShowBranchModal(false);
    setEditingBranchId(null);
  };

  const handleModalSuccess = () => {
    fetchBranches();
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading branches...</div>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout pageTitle="Branches List">
      <div style={{ background: "#e9eff5" }} className="topcontainer">
        {/* Header + Tabs + Create Button */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
          <div className="ui-search">
            <input
              type="text"
              placeholder="Search branches..."
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
            <button
              type="button"
              onClick={handleCreateBranch}
              className="ui-primary-btn"
            >
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
              Create Branch
            </button>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          className="font-custom"
          columns={columns}
          data={paginatedBranches}
          renderRow={(branch) => {
            const branchType =
              Number(branch.is_global) === 1 ? "Main Branch" : "Sub Branch";

            return (
              <tr
                style={{ background: "#f6f9fc" }}
                key={branch.branch_id}
                className="ui-row hover:bg-gray-50"
              >
                <td className="ui-td">{branch.name || "N/A"}</td>
                <td className="ui-td">
                  {branch.city && branch.state
                    ? `${branch.city}, ${branch.state}`
                    : branch.city || branch.state || "N/A"}
                </td>

                <td className="ui-td">{branch.company_name || "N/A"}</td>
                <td className={`ui-td`}>{branchType}</td>
                <td className="ui-td">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full shadow-sm font-semibold ${
                      branch.status === "Active"
                        ? "bg-green-50"
                        : branch.status === "OnHold"
                        ? "bg-yellow-50 text-yellow-800"
                        : branch.status === "Archived"
                        ? "bg-red-50 text-red-800"
                        : "bg-gray-50 text-gray-800"
                    }`}
                    style={{
                      color: branch.status === "Active" ? "#10b981" : undefined,
                    }}
                  >
                    {branch.status}
                  </span>
                </td>
                <td className="ui-td">
                  <div className="flex items-center gap-2">
                    {branch.status === "Archived" ? (
                      <button
                        onClick={() => handleReinstate(branch.branch_id)}
                        className="ui-icon-btn reinstate"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(branch.branch_id)}
                          className="ui-icon-btn edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(branch.branch_id)}
                          className="ui-icon-btn delete"
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

                  {getPaginationRange(currentPage, totalPages).map(
                    (page, index) =>
                      page === "..." ? (
                        <span
                          key={`dots-${index}`}
                          className="px-2 text-slate-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={`page-${page}`}
                          className={`ui-page-btn ${
                            currentPage === page ? "active" : ""
                          }`}
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
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Archive Branch"
          message="Are you sure you want to archive this branch?"
          confirmText="Archive"
          cancelText="Cancel"
          type="danger"
        />

        <ConfirmationModal
          isOpen={showReinstateConfirm}
          onClose={cancelReinstate}
          onConfirm={confirmReinstate}
          title="Reinstate Branch"
          message="Do you want to reinstate this branch?"
          confirmText="Reinstate"
          cancelText="Cancel"
          type="info"
        />

        {/* Branch Form Modal */}
        <BranchFormModal
          isOpen={showBranchModal}
          onClose={handleCloseModal}
          branchId={editingBranchId}
          onSuccess={handleModalSuccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default Branches;
