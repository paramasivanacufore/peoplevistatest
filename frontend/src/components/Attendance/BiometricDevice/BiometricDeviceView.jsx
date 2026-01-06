import React, { useState, useEffect } from "react";
import BiometricDeviceFormModal from "./BiometricDeviceFormModal";
import { toast } from "react-hot-toast";
import { biometricDeviceAPI } from "../../../utils/apiUtils";
import "../../../styles/tableDesign.css";
import {
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ConfirmationModal from "../../Common/ConfirmationModal";
import DataTable from "../../Common/DataTable";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin7Line } from "react-icons/ri";

const BiometricDeviceView = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReinstateConfirm, setShowReinstateConfirm] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [deviceToReinstate, setDeviceToReinstate] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const columns = [
    { key: "device_name", label: "Device Name" },
    { key: "device_id", label: "Device ID" },
    { key: "device_ip", label: "IP Address" },
    { key: "device_serial_number", label: "Serial Number" },
    { key: "location", label: "Location" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch all devices
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await biometricDeviceAPI.getAllDevices(false);
      console.log("Devices API Response:", data);
      const devicesArray = Array.isArray(data) ? data : [];
      console.log("Devices Array:", devicesArray);
      setDevices(devicesArray);
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to load devices");
      toast.error(err?.response?.data?.detail || err?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Filter logic
  const filteredDevices = Array.isArray(devices) 
    ? devices
        .filter((device) => {
      const matchesSearch =
        device.device_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        device.device_id
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        device.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.device_ip?.includes(searchQuery);

      const statusText = device.status_id === 1 ? "Active" : "Archived";
      const matchesStatus =
        statusFilter === "All" || statusText === statusFilter;

      return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          // Recently added first
          return b.device_id?.localeCompare(a.device_id) || 0;
        })
    : [];

  const totalItems = filteredDevices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedDevices = filteredDevices.slice(
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

  // Archive device
  const handleDelete = (deviceId) => {
    setDeviceToDelete(deviceId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await biometricDeviceAPI.deleteDevice(deviceToDelete);
      toast.success("Device archived successfully");
      setShowDeleteConfirm(false);
      fetchDevices();
    } catch (error) {
      toast.error("Error archiving device: " + (error?.response?.data?.detail || error?.message || "Unknown error"));
    }
  };

  // Reinstate device
  const handleReinstate = (deviceId) => {
    setDeviceToReinstate(deviceId);
    setShowReinstateConfirm(true);
  };

  const confirmReinstate = async () => {
    try {
      const device = devices.find((d) => d.device_id === deviceToReinstate);
      if (device) {
        await biometricDeviceAPI.updateDevice(deviceToReinstate, {
          ...device,
          status_id: 1,
        });
        toast.success("Device reinstated successfully");
        setShowReinstateConfirm(false);
        fetchDevices();
      }
    } catch (error) {
      toast.error("Error reinstating device: " + (error?.response?.data?.detail || error?.message || "Unknown error"));
    }
  };

  // Cancel handlers
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeviceToDelete(null);
  };
  const cancelReinstate = () => {
    setShowReinstateConfirm(false);
    setDeviceToReinstate(null);
  };

  // Modal handlers
  const handleCreateDevice = () => {
    setEditingDeviceId(null);
    setShowDeviceModal(true);
  };
  const handleEdit = (id) => {
    setEditingDeviceId(id);
    setShowDeviceModal(true);
  };
  const handleCloseModal = () => {
    setShowDeviceModal(false);
    setEditingDeviceId(null);
  };
  const handleModalSuccess = () => {
    fetchDevices();
  };

  // Loading & error handling
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading devices...</div>
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
            placeholder="Search devices..."
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

          {/* ADD DEVICE */}
          <button onClick={handleCreateDevice} className="ui-primary-btn">
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
            Create Device
          </button>
        </div>
      </div>

      {/* TABLE */}
      <DataTable
        className="font-custom"
        columns={columns}
        data={paginatedDevices}
        renderRow={(device) => {
          const statusText = device.status_id === 1 ? "Active" : "Archived";

          return (
            <tr key={device.device_id} className="ui-row">
              <td className="ui-td">{device.device_name}</td>
              <td className="ui-td">{device.device_id}</td>
              <td className="ui-td">{device.device_ip}</td>
              <td className="ui-td">{device.device_serial_number}</td>
              <td className="ui-td">{device.location}</td>

              <td className="ui-td">
                <div className="flex items-center gap-3">
                  {statusText === "Archived" ? (
                    <button
                      onClick={() => handleReinstate(device.device_id)}
                      className="ui-icon-btn reinstate"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(device.device_id)}
                        className="ui-icon-btn edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(device.device_id)}
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
      <BiometricDeviceFormModal
        isOpen={showDeviceModal}
        onClose={handleCloseModal}
        deviceId={editingDeviceId}
        onSuccess={handleModalSuccess}
      />
      {/* ARCHIVE CONFIRM MODAL */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Archive Device"
        message="Are you sure you want to archive this device?"
        confirmText="Archive"
        cancelText="Cancel"
        type="danger"
      />

      {/* REINSTATE CONFIRM MODAL */}
      <ConfirmationModal
        isOpen={showReinstateConfirm}
        onClose={cancelReinstate}
        onConfirm={confirmReinstate}
        title="Reinstate Device"
        message="Do you want to reinstate this device?"
        confirmText="Reinstate"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default BiometricDeviceView;
