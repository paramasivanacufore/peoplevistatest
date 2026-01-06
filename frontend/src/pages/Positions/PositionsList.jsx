import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import PositionFormModal from "./PositionFormModal";
import { toast } from "react-hot-toast";
import "../../styles/tableDesign.css";
import ConfirmationModal from "../../components/Common/ConfirmationModal";
import DataTable from "../../components/Common/DataTable";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import getPaginationRange from "../../utils/pagination";
import { positionAPI } from "../../utils/position/apiUtils";

const PositionsList = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);
  const [positionToReinstate, setPositionToReinstate] = useState(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editingPositionId, setEditingPositionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const columns = [
    { key: "position_name", label: "Position Name" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];
const fetchPositions = async () => {
  try {
    const res = await positionAPI.getAll();

    // ✅ THIS IS THE FIX
    setPositions(Array.isArray(res.positions) ? res.positions : []);

  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchPositions();
  }, []);

const filteredPositions = positions.filter((p) => {
  const matchesSearch =
    p.position_name?.toLowerCase().includes(searchQuery.toLowerCase());

  const statusText = p.status_id === 1 ? "Active" : "Archived";
  const matchesStatus =
    statusFilter === "All" || statusText === statusFilter;

  return matchesSearch && matchesStatus;
});


  const totalItems = filteredPositions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedPositions = filteredPositions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // use shared getPaginationRange from utils/pagination

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleDelete = (id) => {
    setPositionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await positionAPI.delete(positionToDelete);
      toast.success("Position archived successfully");
      setShowDeleteConfirm(false);
      fetchPositions();
    } catch (err) {
      toast.error("Error archiving position: " + err.message);
    }
  };

  const handleReinstate = (id) => {
    setPositionToReinstate(id);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    try {
      console.log("Reinstating position ID:", positionToReinstate);
      console.log("Sending data:", { status_id: 1 });
      await positionAPI.update(positionToReinstate, { status_id: 1 });
      console.log("Reinstate API call successful");
      toast.success("Position reinstated successfully");
      setShowReinstateConfirm(false);
      fetchPositions();
    } catch (error) {
      console.error("Reinstate error:", error);
      toast.error("Error reinstating position: " + error.message);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPositionToDelete(null);
  };

  const cancelReinstate = () => {
    setShowReinstateConfirm(false);
    setPositionToReinstate(null);
  };

  const handleCreate = () => {
    setEditingPositionId(null);
    setShowPositionModal(true);
  };

  const handleEdit = (id) => {
    setEditingPositionId(id);
    setShowPositionModal(true);
  };

  const handleCloseModal = () => {
    setShowPositionModal(false);
    setEditingPositionId(null);
  };

  const handleModalSuccess = () => {
    fetchPositions();
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading positions...</div>
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
    <DashboardLayout pageTitle="Positions List">
      <div style={{ background: "#e9eff5" }} className="topcontainer">
        <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
          <div className="ui-search">
            <input
              type="text"
              placeholder="Search positions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-search-input"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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

            <button onClick={handleCreate} className="ui-primary-btn">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Position
            </button>
          </div>
        </div>

        <DataTable
          className="font-custom"
          columns={columns}
          data={paginatedPositions}
          renderRow={(position) => {
            const statusText = position.status_id === 1 ? "Active" : "Archived";

            return (
            <tr key={position.position_id} className="ui-row">
              <td className="ui-td">{position.position_name}</td>
              <td className="ui-td">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  position.status_id === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {position.status || (position.status_id === 1 ? "Active" : "Archived")}
                </span>
              </td>

              <td className="ui-td">
                <div className="flex items-center gap-3">
                  {statusText === "Archived" ? (
                    <button
                      onClick={() => handleReinstate(position.position_id)}
                      className="ui-icon-btn reinstate"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(position.position_id)} className="ui-icon-btn edit">
                        <FiEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(position.position_id)} className="ui-icon-btn delete">
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </div>

                <div className="ui-pagination-controls">
                  <button className="ui-page-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                    Previous
                  </button>

                  {getPaginationRange(currentPage, totalPages).map((page, index) =>
                    page === "..." ? (
                      <span key={`dots-${index}`} className="px-2 text-slate-400">…</span>
                    ) : (
                      <button key={page} className={`ui-page-btn ${currentPage === page ? "active" : ""}`} onClick={() => goToPage(page)}>
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

        <PositionFormModal isOpen={showPositionModal} onClose={handleCloseModal} positionId={editingPositionId} onSuccess={handleModalSuccess} />

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Archive Position"
          message="Are you sure you want to archive this position?"
          confirmText="Archive"
          cancelText="Cancel"
          type="danger"
        />

        <ConfirmationModal
          isOpen={showReinstateConfirm}
          onClose={cancelReinstate}
          onConfirm={confirmReinstate}
          title="Reinstate Position"
          message="Are you sure you want to reinstate this position?"
          confirmText="Reinstate"
          cancelText="Cancel"
          type="success"
        />
      </div>
    </DashboardLayout>
  );
};

export default PositionsList;
