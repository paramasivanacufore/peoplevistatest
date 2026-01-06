import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DataTable from '../Common/DataTable';
import ConfirmationModal from '../Common/ConfirmationModal';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { leaveTypeAPI } from '../../utils/leaveType/apiUtils';
import LeaveTypeForm from './LeaveTypeForm';
import '../../Styles/tableDesign.css';

const LeaveTypeView = () => {
  /* ---------------- NAVIGATION / STATE ---------------- */
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leaveTypeToDelete, setLeaveTypeToDelete] = useState(null);

  /* ---------------- PAGINATION ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ---------------- MODAL ---------------- */
  const [editingLeaveTypeId, setEditingLeaveTypeId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  /* ---------------- FETCH ---------------- */
  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await leaveTypeAPI.getAllLeaveTypes();
      setLeaveTypes(response.leave_types || response || []);
    } catch (error) {
      console.error('Error loading leave types:', error);
      toast.error('Failed to fetch leave types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredLeaveTypes = leaveTypes
    .filter((leaveType) => {
      const matchesSearch =
        leaveType.leave_type_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leaveType.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'Active' && leaveType.is_active === true) ||
        (statusFilter === 'Archived' && leaveType.is_active === false);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return (b.leave_type_id || 0) - (a.leave_type_id || 0);
    });

  const totalItems = filteredLeaveTypes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedLeaveTypes = filteredLeaveTypes.slice(
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
      if (last !== null && page - last > 1) result.push('...');
      result.push(page);
      last = page;
    }
    return result;
  };

  /* ---------------- ACTIONS ---------------- */
  const handleEdit = (id) => {
    setEditingLeaveTypeId(id);
    setShowFormModal(true);
  };

  const handleCreate = () => {
    setEditingLeaveTypeId(null);
    setShowFormModal(true);
  };

  const handleDelete = (id) => {
    setLeaveTypeToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await leaveTypeAPI.deleteLeaveType(leaveTypeToDelete);
      toast.success('Leave type deleted successfully');
      fetchLeaveTypes();
    } catch {
      toast.error('Failed to delete leave type');
    }
    setShowDeleteConfirm(false);
    setLeaveTypeToDelete(null);
  };

  /* ---------------- TABLE ---------------- */
  const columns = [
    { key: 'leave_type_name', label: 'Leave Type Name' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading leave types...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#e9eff5' }} className="topcontainer">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-3 gap-3 sm:gap-4">
        <div className="ui-search w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Search leave types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ui-search-input"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="ui-tabs font-custom w-full sm:w-auto">
            {['Active', 'Archived', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`ui-tab ${statusFilter === status ? 'active' : ''}`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          <button onClick={handleCreate} className="ui-primary-btn w-full sm:w-auto">
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
            <span className="hidden sm:inline">Create Leave Type</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* DATATABLE */}
      <DataTable
        columns={columns}
        data={paginatedLeaveTypes}
        renderRow={(leaveType) => (
          <tr key={leaveType.leave_type_id} className="ui-row hover:bg-gray-50" style={{ background: '#f6f9fc' }}>
            <td className="ui-td">
              <div className="truncate max-w-[200px] sm:max-w-none" title={leaveType.leave_type_name || 'N/A'}>
                {leaveType.leave_type_name || 'N/A'}
              </div>
            </td>
            <td className="ui-td">
              <div className="truncate max-w-[200px] sm:max-w-none" title={leaveType.description || 'N/A'}>
                {leaveType.description || 'N/A'}
              </div>
            </td>
            <td className="ui-td">
              <span
                className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full shadow-sm font-semibold text-xs sm:text-sm ${
                  leaveType.is_active
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
                style={{
                  color: leaveType.is_active ? '#10b981' : undefined,
                }}
              >
                {leaveType.is_active ? 'Active' : 'Archived'}
              </span>
            </td>
            <td className="ui-td">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => handleEdit(leaveType.leave_type_id)}
                  className="ui-icon-btn edit"
                  aria-label="Edit leave type"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(leaveType.leave_type_id)}
                  className="ui-icon-btn delete"
                  aria-label="Delete leave type"
                >
                  <RiDeleteBin7Line size={18} />
                </button>
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
                  page === '...' ? (
                    <span key={`dots-${index}`} className="px-2 text-slate-400">…</span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      className={`ui-page-btn ${currentPage === page ? 'active' : ''}`}
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
        emptyMessage="No leave types found"
      />

      {/* CONFIRMATION MODALS */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Leave Type"
        message="Are you sure you want to delete this leave type? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* LEAVE TYPE FORM MODAL */}
      {showFormModal && (
        <LeaveTypeForm
          id={editingLeaveTypeId}
          onClose={() => {
            setShowFormModal(false);
            setEditingLeaveTypeId(null);
            fetchLeaveTypes();
          }}
        />
      )}
    </div>
  );
};

export default LeaveTypeView;
