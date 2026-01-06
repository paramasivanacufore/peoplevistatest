import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiCalendar, FiCheck, FiX, FiXCircle } from 'react-icons/fi';
import LeaveRequestForm from './LeaveRequestForm';
import ConfirmationModal from '../Common/ConfirmationModal';
import { leaveRequestAPI } from '../../utils/leaveRequest/apiUtils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LeaveRequestView = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Approved, Rejected, Cancelled
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveRequestToDelete, setLeaveRequestToDelete] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'cancel'
  const [actionComments, setActionComments] = useState('');
  const [leaveRequestToAction, setLeaveRequestToAction] = useState(null);

  // Load leave requests from API
  const loadLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leaveRequestAPI.getAllLeaveRequests();
      setLeaveRequests(response.leave_requests || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setError('Failed to load leave requests. Please try again.');
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  useEffect(() => {
    filterLeaveRequests();
  }, [searchTerm, filterStatus, leaveRequests]);

  const filterLeaveRequests = () => {
    let filtered = [...leaveRequests];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(lr =>
        (lr.employee_name && lr.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lr.leave_type_name && lr.leave_type_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lr.comments && lr.comments.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(lr => lr.status === filterStatus);
    }

    setFilteredLeaveRequests(filtered);
  };

  const handleEdit = (leaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setShowForm(true);
  };

  const handleDelete = (leaveRequestId) => {
    const leaveRequest = leaveRequests.find(lr => lr.leave_id === leaveRequestId);
    setLeaveRequestToDelete(leaveRequest);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!leaveRequestToDelete) return;
    
    try {
      await leaveRequestAPI.deleteLeaveRequest(leaveRequestToDelete.leave_id);
      await loadLeaveRequests();
      setShowDeleteModal(false);
      setLeaveRequestToDelete(null);
      toast.success('Leave request deleted successfully');
    } catch (error) {
      console.error('Error deleting leave request:', error);
      toast.error(error.message || 'Failed to delete leave request');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setLeaveRequestToDelete(null);
  };

  const handleCreateNew = () => {
    setSelectedLeaveRequest(null);
    setShowForm(true);
  };

  const handleSaveLeaveRequest = async (leaveRequestData) => {
    try {
      await loadLeaveRequests();
      setShowForm(false);
      setSelectedLeaveRequest(null);
      toast.success('Leave request saved successfully');
    } catch (error) {
      console.error('Error saving leave request:', error);
    }
  };

  const handleApprove = (leaveRequest) => {
    setLeaveRequestToAction(leaveRequest);
    setActionType('approve');
    setActionComments('');
    setShowActionModal(true);
  };

  const handleReject = (leaveRequest) => {
    setLeaveRequestToAction(leaveRequest);
    setActionType('reject');
    setActionComments('');
    setShowActionModal(true);
  };

  const handleCancel = (leaveRequest) => {
    setLeaveRequestToAction(leaveRequest);
    setActionType('cancel');
    setActionComments('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!leaveRequestToAction || !actionType) return;
    
    try {
      if (actionType === 'approve') {
        await leaveRequestAPI.approveLeaveRequest(
          leaveRequestToAction.leave_id,
          user?.employee_id || leaveRequestToAction.requested_to,
          actionComments || null
        );
        toast.success('Leave request approved successfully');
      } else if (actionType === 'reject') {
        await leaveRequestAPI.rejectLeaveRequest(
          leaveRequestToAction.leave_id,
          user?.employee_id || leaveRequestToAction.requested_to,
          actionComments || null
        );
        toast.success('Leave request rejected');
      } else if (actionType === 'cancel') {
        await leaveRequestAPI.cancelLeaveRequest(leaveRequestToAction.leave_id);
        toast.success('Leave request cancelled');
      }
      
      await loadLeaveRequests();
      setShowActionModal(false);
      setLeaveRequestToAction(null);
      setActionType(null);
      setActionComments('');
    } catch (error) {
      console.error(`Error ${actionType}ing leave request:`, error);
      toast.error(error.message || `Failed to ${actionType} leave request`);
    }
  };

  const cancelAction = () => {
    setShowActionModal(false);
    setLeaveRequestToAction(null);
    setActionType(null);
    setActionComments('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canApproveReject = (leaveRequest) => {
    // User can approve/reject if they are the requested_to person and status is Pending
    return leaveRequest.status === 'Pending' && 
           user?.employee_id === leaveRequest.requested_to;
  };

  const canCancel = (leaveRequest) => {
    // User can cancel if they are the requester and status is Pending
    return leaveRequest.status === 'Pending' && 
           user?.employee_id === leaveRequest.employee_id;
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiCalendar className="text-blue-600 w-5 h-5" />
              Leave Requests
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage employee leave requests</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Create Leave Request
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by employee, leave type, or comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading leave requests...</div>
        ) : filteredLeaveRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No leave requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Leave Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Requested To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeaveRequests.map((lr) => (
                  <tr key={lr.leave_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {lr.employee_name || `Employee #${lr.employee_id}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {lr.leave_type_name || `Type #${lr.leave_type_id}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(lr.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(lr.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {lr.requested_to_name || `Employee #${lr.requested_to}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lr.status)}`}>
                        {lr.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {canApproveReject(lr) && (
                          <>
                            <button
                              onClick={() => handleApprove(lr)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Approve"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(lr)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Reject"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {canCancel(lr) && (
                          <button
                            onClick={() => handleCancel(lr)}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="Cancel"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        )}
                        {lr.status === 'Pending' && user?.employee_id === lr.employee_id && (
                          <button
                            onClick={() => handleEdit(lr)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                        {(lr.status === 'Pending' || lr.status === 'Cancelled') && (
                          <button
                            onClick={() => handleDelete(lr.leave_id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <LeaveRequestForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedLeaveRequest(null);
        }}
        leaveRequest={selectedLeaveRequest}
        onSave={handleSaveLeaveRequest}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Leave Request"
        message={`Are you sure you want to delete this leave request? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />

      {/* Action Confirmation Modal (Approve/Reject/Cancel) */}
      {showActionModal && leaveRequestToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {actionType === 'approve' && 'Approve Leave Request'}
                {actionType === 'reject' && 'Reject Leave Request'}
                {actionType === 'cancel' && 'Cancel Leave Request'}
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                {actionType === 'approve' && 'Are you sure you want to approve this leave request?'}
                {actionType === 'reject' && 'Are you sure you want to reject this leave request?'}
                {actionType === 'cancel' && 'Are you sure you want to cancel this leave request?'}
              </p>
              {(actionType === 'approve' || actionType === 'reject') && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={actionComments}
                    onChange={(e) => setActionComments(e.target.value)}
                    rows={3}
                    placeholder="Enter comments..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={cancelAction}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {actionType === 'approve' && 'Approve'}
                {actionType === 'reject' && 'Reject'}
                {actionType === 'cancel' && 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestView;


