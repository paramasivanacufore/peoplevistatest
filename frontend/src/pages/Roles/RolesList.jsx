import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import RoleFormModal from "./RoleFormModal";
import { toast } from "react-hot-toast";
import "../../styles/tableDesign.css";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import DataTable from "../../components/Common/DataTable";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import getPaginationRange from "../../utils/pagination";
import { roleAPI } from "../../utils/role/apiUtils";

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [roleToReinstate, setRoleToReinstate] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const columns = [
    { key: "role_name", label: "Role Name" },
    { key: "description", label: "Description" },
    { key: "role_level", label: "Level" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const data = await roleAPI.getAll();
      setRoles(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter logic
  const filteredRoles = roles
    .filter((role) => {
      const matchesSearch =
        role.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const statusText = role.status_id === 1 ? "Active" : "Archived";
      const matchesStatus =
        statusFilter === "All" || statusText === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Recently added first
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      // fallback if created_at not available
      return b.role_id - a.role_id;
    });

  const totalItems = filteredRoles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // use shared getPaginationRange from utils/pagination

  useEffect(() => {
    setCurrentPage(1); // reset page when filter/search changes
  }, [searchQuery, statusFilter]);

  // Delete role
  const handleDelete = (roleId) => {
    setRoleToDelete(roleId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await roleAPI.delete(roleToDelete);
      toast.success("Role archived successfully");
      setShowDeleteConfirm(false);
      fetchRoles();
    } catch (error) {
      toast.error("Error archiving role: " + error.message);
    }
  };

  const handleReinstate = (roleId) => {
    setRoleToReinstate(roleId);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    try {
      console.log("Reinstating role ID:", roleToReinstate);
      console.log("Sending data:", { status_id: 1 });
      await roleAPI.update(roleToReinstate, { status_id: 1 });
      console.log("Reinstate API call successful");
      toast.success("Role reinstated successfully");
      setShowReinstateConfirm(false);
      fetchRoles();
    } catch (error) {
      console.error("Reinstate error:", error);
      toast.error("Error reinstating role: " + error.message);
    }
  };

  // Cancel handlers
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  const cancelReinstate = () => {
    setShowReinstateConfirm(false);
    setRoleToReinstate(null);
  };

  // Modal handlers
  const handleCreateRole = () => {
    setEditingRoleId(null);
    setShowRoleModal(true);
  };

  const handleEdit = (id) => {
    setEditingRoleId(id);
    setShowRoleModal(true);
  };

  const handleCloseModal = () => {
    setShowRoleModal(false);
    setEditingRoleId(null);
  };

  const handleModalSuccess = () => {
    fetchRoles();
  };

  // Loading & error handling
  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading roles...</div>
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
    <DashboardLayout pageTitle="Roles List">
      <div style={{ background: "#e9eff5" }} className="topcontainer">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
          {/* SEARCH */}
          <div className="ui-search">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-search-input"
            />
          </div>
             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      {/* STATUS TABS */}
        <div className="ui-tabs">
          {["Active", "Archived", "All"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`ui-tab ${statusFilter === status ? "active" : ""}`}
            >
              {status}
            </button>
          ))}
        </div>
          {/* ADD ROLE */}
          <button onClick={handleCreateRole} className="ui-primary-btn">
            <svg
              className="w-5 h-5"
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
            Create Role
          </button>
          </div>
        </div>

  
        <DataTable
          className="font-custom"
          columns={columns}
          data={paginatedRoles}
          renderRow={(role) => {
            const statusText = role.status_id === 1 ? "Active" : "Archived";

            return (
              <tr key={role.role_id} className="ui-row">
                <td className="ui-td">{role.role_name}</td>
                <td className="ui-td">{role.description || "-"}</td>
                <td className="ui-td">Level {role.role_level}</td>
                
                <td className="ui-td">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    role.status_id === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {role.status || (role.status_id === 1 ? "Active" : "Archived")}
                  </span>
                </td>

                <td className="ui-td">
                  <div className="flex items-center gap-3">
                    {statusText === "Archived" ? (
                      <button
                        onClick={() => handleReinstate(role.role_id)}
                        className="ui-icon-btn reinstate"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(role.role_id)}
                          className="ui-icon-btn edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(role.role_id)}
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
                <div className="ui-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} results
                </div>

                <div className="ui-pagination-controls">
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
                          key={page}
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

        {/* MODAL */}
        <RoleFormModal
          isOpen={showRoleModal}
          onClose={handleCloseModal}
          roleId={editingRoleId}
          onSuccess={handleModalSuccess}
        />

        {/* ARCHIVE CONFIRM MODAL */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Archive Role"
          message="Are you sure you want to archive this role?"
          confirmText="Archive"
          cancelText="Cancel"
          type="danger"
        />

        {/* REINSTATE CONFIRM MODAL */}
        <ConfirmationModal
          isOpen={showReinstateConfirm}
          onClose={cancelReinstate}
          onConfirm={confirmReinstate}
          title="Reinstate Role"
          message="Are you sure you want to reinstate this role?"
          confirmText="Reinstate"
          cancelText="Cancel"
          type="success"
        />
      </div>
    </DashboardLayout>
  );
};

export default RolesList;
