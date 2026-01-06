import React, { useState, useEffect } from "react";
import HolidayFormModal from "./HolidayFormModal";
import { toast } from "react-hot-toast";
import { holidayAPI } from "../../../utils/apiUtils";
import "../../../styles/tableDesign.css";
import {
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ConfirmationModal from "../../Common/ConfirmationModal";
import DataTable from "../../Common/DataTable";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";

const HolidayView = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [holidayToReinstate, setHolidayToReinstate] = useState(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const columns = [
    { key: "holiday_name", label: "Holiday Name" },
    { key: "holiday_date", label: "Date" },
    { key: "holiday_type", label: "Type" },
    { key: "branch_name", label: "Branch" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch all holidays
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await holidayAPI.getAllHolidays({ activeOnly: false });
      console.log("Holidays API Response:", response);
      // API returns { total: number, holidays: array }
      const holidaysArray = Array.isArray(response) 
        ? response 
        : (response?.holidays || []);
      console.log("Holidays Array:", holidaysArray);
      setHolidays(holidaysArray);
    } catch (err) {
      console.error("Error fetching holidays:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to load holidays");
      toast.error(err?.response?.data?.detail || err?.message || "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Filter logic
  const filteredHolidays = Array.isArray(holidays) 
    ? holidays
        .filter((holiday) => {
          const matchesSearch =
            holiday.holiday_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            holiday.description?.toLowerCase().includes(searchQuery.toLowerCase());

          const statusText = holiday.status_id === 1 ? "Active" : "Archived";
          const matchesStatus =
            statusFilter === "All" || statusText === statusFilter;

          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          // Recently added first
          return new Date(b.holiday_date || 0) - new Date(a.holiday_date || 0);
        })
    : [];

  const totalItems = filteredHolidays.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedHolidays = filteredHolidays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPaginationRange = (current, total) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Archive holiday
  const handleDelete = (holidayId) => {
    setHolidayToDelete(holidayId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await holidayAPI.deleteHoliday(holidayToDelete);
      toast.success("Holiday archived successfully");
      setShowDeleteConfirm(false);
      fetchHolidays();
    } catch (error) {
      toast.error("Error archiving holiday: " + (error?.response?.data?.detail || error?.message || "Unknown error"));
    }
  };

  // Reinstate holiday
  const handleReinstate = (holidayId) => {
    setHolidayToReinstate(holidayId);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    try {
      const holiday = holidays.find((h) => h.holiday_id === holidayToReinstate);
      if (holiday) {
        await holidayAPI.updateHoliday(holidayToReinstate, {
          ...holiday,
          status_id: 1,
        });
        toast.success("Holiday reinstated successfully");
        setShowReinstateConfirm(false);
        fetchHolidays();
      }
    } catch (error) {
      toast.error("Error reinstating holiday: " + (error?.response?.data?.detail || error?.message || "Unknown error"));
    }
  };

  // Cancel handlers
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setHolidayToDelete(null);
  };
  const cancelReinstate = () => {
    setShowReinstateConfirm(false);
    setHolidayToReinstate(null);
  };

  // Modal handlers
  const handleCreateHoliday = () => {
    setEditingHolidayId(null);
    setShowHolidayModal(true);
  };
  const handleEdit = (id) => {
    setEditingHolidayId(id);
    setShowHolidayModal(true);
  };
  const handleCloseModal = () => {
    setShowHolidayModal(false);
    setEditingHolidayId(null);
  };
  const handleModalSuccess = () => {
    fetchHolidays();
  };

  // Loading & error handling
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading holidays...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );

  return (
    <div style={{ background: "#e9eff5" }} className="topcontainer">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
        {/* SEARCH */}
        <div className="ui-search">
          <input
            type="text"
            placeholder="Search holidays..."
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
                onClick={() => setStatusFilter(status)}
                className={`ui-tab ${
                  statusFilter === status ? "active" : ""
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* ADD HOLIDAY */}
          <button onClick={handleCreateHoliday} className="ui-primary-btn">
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
            Create Holiday
          </button>
        </div>
      </div>

      {/* TABLE */}
      <DataTable
        className="font-custom"
        columns={columns}
        data={paginatedHolidays}
        renderRow={(holiday) => {
          const statusText = holiday.status_id === 1 ? "Active" : "Archived";
          const formattedDate = holiday.holiday_date
            ? new Date(holiday.holiday_date).toLocaleDateString()
            : "—";

          return (
            <tr key={holiday.holiday_id} className="ui-row">
              <td className="ui-td">{holiday.holiday_name}</td>
              <td className="ui-td">{formattedDate}</td>
              <td className="ui-td">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    holiday.holiday_type === "Public"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {holiday.holiday_type}
                </span>
              </td>
              <td className="ui-td">
                {holiday.branch_name || "All Branches"}
              </td>

              <td className="ui-td">
                <div className="flex items-center gap-3">
                  {statusText === "Archived" ? (
                    <button
                      onClick={() => handleReinstate(holiday.holiday_id)}
                      className="ui-icon-btn reinstate"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(holiday.holiday_id)}
                        className="ui-icon-btn edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(holiday.holiday_id)}
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
      <HolidayFormModal
        isOpen={showHolidayModal}
        onClose={handleCloseModal}
        holidayId={editingHolidayId}
        onSuccess={handleModalSuccess}
      />
      {/* ARCHIVE CONFIRM MODAL */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Archive Holiday"
        message="Are you sure you want to archive this holiday?"
        confirmText="Archive"
        cancelText="Cancel"
        type="danger"
      />

      {/* REINSTATE CONFIRM MODAL */}
      <ConfirmationModal
        isOpen={showReinstateConfirm}
        onClose={cancelReinstate}
        onConfirm={confirmReinstate}
        title="Reinstate Holiday"
        message="Do you want to reinstate this holiday?"
        confirmText="Reinstate"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default HolidayView;
