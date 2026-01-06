import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../Common/DataTable';
import '../../../styles/tableDesign.css';
import { 
    FiUsers, 
    FiSearch,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiDownload
} from 'react-icons/fi';
import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, exportLeaveRequests } from '../../../utils/attendance/apiUtils';
import { getCurrentUserId } from '../../../utils/userUtils';
import { getLeaveTypeShortcut } from '../../../utils/leaveTypeUtils';
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';

const LeaveRequests = () => {
    const navigate = useNavigate();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(''); // Input value (updates immediately)
    const [searchTerm, setSearchTerm] = useState(''); // Debounced search term (triggers API)
    const [processingId, setProcessingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [requestToReject, setRequestToReject] = useState(null);
    const [requestToApprove, setRequestToApprove] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [totalItems, setTotalItems] = useState(0);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch data when page or filters change
    useEffect(() => {
        fetchLeaveRequests();
    }, [currentPage, itemsPerPage, searchTerm, sortColumn, sortDirection]);

    // Clear selections only when filters/search/sort change (not page change)
    useEffect(() => {
        setSelectedIds(new Set());
    }, [searchTerm, sortColumn, sortDirection]);

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            const currentUserId = getCurrentUserId();
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                status: 'Pending', // Always show pending requests
                ...(searchTerm && { search: searchTerm }),
                manager_id: currentUserId, // Filter by employees who report to current user
                ...(sortColumn && { sort_by: sortColumn }),
                ...(sortColumn && { sort_order: sortDirection })
            };
            const data = await getLeaveRequests(params);
            setLeaveRequests(data.leave_requests || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            setLeaveRequests([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };


    const handleApprove = (leaveId) => {
        setRequestToApprove(leaveId);
        setShowApproveModal(true);
    };

    const confirmApprove = async () => {
        if (!requestToApprove) return;
        
        try {
            setProcessingId(requestToApprove);
            const approvedBy = getCurrentUserId();
            await approveLeaveRequest(requestToApprove, approvedBy);
            setToast({ show: true, message: 'Leave request approved successfully', type: 'success' });
            fetchLeaveRequests(); // Refresh the list
            setSelectedIds(new Set()); // Clear selections
            setShowApproveModal(false);
            setRequestToApprove(null);
        } catch (error) {
            console.error('Error approving leave request:', error);
            setToast({ show: true, message: error.message || 'Failed to approve leave request', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (leaveId) => {
        setRequestToReject(leaveId);
        setShowRejectModal(true);
    };

    const confirmReject = async (comments) => {
        if (!requestToReject) return;
        
        try {
            setProcessingId(requestToReject);
            const rejectedBy = getCurrentUserId();
            await rejectLeaveRequest(requestToReject, rejectedBy, comments || undefined);
            setToast({ show: true, message: 'Leave request rejected successfully', type: 'success' });
            fetchLeaveRequests(); // Refresh the list
            setSelectedIds(new Set()); // Clear selections
            setShowRejectModal(false);
            setRequestToReject(null);
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            setToast({ show: true, message: error.message || 'Failed to reject leave request', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleSelectAll = async (e) => {
        if (e.target.checked) {
            // Fetch all leave requests across all pages
            try {
                const currentUserId = getCurrentUserId();
                const allRequests = [];
                let currentPageNum = 1;
                let hasMore = true;

                while (hasMore) {
                    const params = {
                        page: currentPageNum,
                        limit: 100, // Use larger limit to fetch more at once
                        status: 'Pending',
                        ...(searchTerm && { search: searchTerm }),
                        manager_id: currentUserId
                    };
                    const data = await getLeaveRequests(params);
                    const requests = data.leave_requests || [];
                    
                    if (requests.length > 0) {
                        allRequests.push(...requests);
                    }
                    
                    hasMore = requests.length === 100 && allRequests.length < (data.total || 0);
                    currentPageNum++;
                }

                // Select all IDs from all pages
                const allIds = new Set(allRequests.map(lr => lr.leave_id));
                setSelectedIds(allIds);
            } catch (error) {
                console.error('Error fetching all requests:', error);
                // Fallback to selecting only current page
                const allIds = new Set(leaveRequests.map(lr => lr.leave_id));
                setSelectedIds(allIds);
            }
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (leaveId, checked) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(leaveId);
        } else {
            newSelected.delete(leaveId);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) {
            alert('Please select at least one leave request to approve');
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmBulkApprove = async () => {
        setShowConfirmModal(false);
        
        try {
            setBulkProcessing(true);
            const approvedBy = getCurrentUserId();
            const idsArray = Array.from(selectedIds);
            
            // Approve all selected requests
            const promises = idsArray.map(id => approveLeaveRequest(id, approvedBy));
            await Promise.all(promises);
            
            setToast({ show: true, message: `Successfully approved ${idsArray.length} leave request(s)`, type: 'success' });
            fetchLeaveRequests(); // Refresh the list
            setSelectedIds(new Set()); // Clear selections
        } catch (error) {
            console.error('Error bulk approving leave requests:', error);
            setToast({ show: true, message: error.message || 'Failed to approve some leave requests', type: 'error' });
        } finally {
            setBulkProcessing(false);
        }
    };

    const exportToCSV = async () => {
        try {
            const currentUserId = getCurrentUserId();
            const params = {
                status: 'Pending',
                ...(searchTerm && { search: searchTerm }),
                manager_id: currentUserId // Filter by employees who report to current user
            };
            
            const data = await exportLeaveRequests(params);
            const allRequests = data.leave_requests || [];

            if (allRequests.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Leave ID', 'Employee ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Request Date', 'Status', 'Requested To', 'Approved By', 'Approved Date', 'Comments'];
            
            const csvRows = [
                headers.join(','),
                ...allRequests.map(lr => {
                    const formatDate = (dateString) => {
                        if (!dateString) return '';
                        try {
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) return dateString;
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const year = date.getFullYear();
                            return `${month}/${day}/${year}`;
                        } catch {
                            return dateString;
                        }
                    };

                    return [
                        lr.leave_id || '',
                        lr.employee_code || '',
                        `"${lr.employee_name || ''}"`,
                        `"${lr.department || 'N/A'}"`,
                        `"${getLeaveTypeShortcut(lr.leave_type) || 'N/A'}"`,
                        formatDate(lr.start_date),
                        formatDate(lr.end_date),
                        formatDate(lr.request_date),
                        lr.status || 'Pending',
                        `"${lr.requested_to_name || 'N/A'}"`,
                        `"${lr.approved_by_name || 'N/A'}"`,
                        formatDate(lr.approved_date),
                        `"${lr.comments || ''}"`
                    ].join(',');
                })
            ];

            const BOM = '\uFEFF';
            const csvContent = BOM + csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const filename = `pending_leave_requests.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            alert('Failed to export data. Please try again.');
        }
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

    const goToPage = (page) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock },
            'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle },
            'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: FiXCircle },
            'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiAlertCircle }
        };

        const config = statusConfig[status] || statusConfig['Pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {status || 'Pending'}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateString;
        }
    };

    const allSelected = leaveRequests.length > 0 && leaveRequests.every(lr => selectedIds.has(lr.leave_id));

    const columns = [
        { 
            key: 'select', 
            label: '',
            renderHeader: () => (
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#011748] bg-gray-100 border-gray-200 rounded focus:ring-[#011748] focus:ring-2 hover:border-gray-200 hover:bg-gray-100"
                    title="Select all requests across all pages"
                />
            )
        },
        { key: 'employee', label: 'Employee' },
        { key: 'leave_type', label: 'Leave Type' },
        { key: 'date_range', label: 'Date Range' },
        { key: 'request_date', label: 'Request Date' },
        { key: 'reason', label: 'Reason' },
        { key: 'actions', label: 'Actions' },
    ];

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (loading && leaveRequests.length === 0) {
        return (
            <div style={{ background: '#e9eff5' }} className="pt-0.5 pb-3 px-3 topcontainer">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading leave requests...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#e9eff5' }} className="pt-0.5 pb-3 px-3 topcontainer">
            {/* HEADER */}
            <div className="flex flex-wrap justify-between items-center mb-3 gap-4">
                {/* SEARCH */}
                <div className="ui-search">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="ui-search-input"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {selectedIds.size > 0 && (
                        <button
                            type="button"
                            onClick={handleBulkApprove}
                            disabled={bulkProcessing}
                            className="ui-primary-btn"
                        >
                            <FiCheckCircle className="w-4 h-4" />
                            Approve All ({selectedIds.size})
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="ui-primary-btn"
                    >
                        <FiDownload className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* MODALS */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmBulkApprove}
                title="Approve Leave Requests"
                message={`Are you sure you want to approve ${selectedIds.size} leave request(s)? This action cannot be undone.`}
                confirmText="Approve All"
                cancelText="Cancel"
                type="warning"
            />
            <ConfirmationModal
                isOpen={showApproveModal}
                onClose={() => {
                    setShowApproveModal(false);
                    setRequestToApprove(null);
                }}
                onConfirm={confirmApprove}
                title="Approve Leave Request"
                message="Are you sure you want to approve this leave request?"
                confirmText="Approve"
                cancelText="Cancel"
                type="success"
            />
            <ConfirmationModal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false);
                    setRequestToReject(null);
                }}
                onConfirm={confirmReject}
                title="Reject Leave Request"
                message="Are you sure you want to reject this leave request? This action cannot be undone."
                confirmText="Reject"
                cancelText="Cancel"
                type="danger"
                showInput={true}
                inputPlaceholder="Please provide a reason for rejection (optional)..."
                inputLabel="Reason for Rejection (Optional)"
            />
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}

            {/* TABLE */}
            <DataTable
                className="font-custom"
                columns={columns}
                data={leaveRequests}
                renderRow={(lr) => (
                    <tr key={lr.leave_id} className="ui-row">
                        <td className="ui-td">
                            <input
                                type="checkbox"
                                checked={selectedIds.has(lr.leave_id)}
                                onChange={(e) => handleSelectOne(lr.leave_id, e.target.checked)}
                                className="w-4 h-4 text-[#011748] bg-gray-100 border-gray-200 rounded focus:ring-[#011748] focus:ring-2 hover:border-gray-200 hover:bg-gray-100"
                            />
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#011748] text-xs font-semibold border border-blue-100">
                                        {lr.employee_code}
                                    </span>
                                </div>
                                <span className="flex-1 min-w-0 truncate">
                                    {lr.employee_name || 'N/A'}
                                </span>
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900 whitespace-nowrap" title={lr.leave_type}>
                                {getLeaveTypeShortcut(lr.leave_type)}
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900 whitespace-nowrap">
                                {formatDate(lr.start_date)} - {formatDate(lr.end_date)}
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-1 text-sm text-gray-900 whitespace-nowrap">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                {formatDate(lr.request_date)}
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900 break-words whitespace-normal" title={lr.comments || 'No reason provided'}>
                                {lr.comments || 'N/A'}
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(lr.leave_id);
                                    }}
                                    disabled={processingId === lr.leave_id || lr.status !== 'Pending'}
                                    className="ui-icon-btn approve disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Approve"
                                >
                                    <FiCheckCircle size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(lr.leave_id);
                                    }}
                                    disabled={processingId === lr.leave_id || lr.status !== 'Pending'}
                                    className="ui-icon-btn reject disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Reject"
                                >
                                    <FiXCircle size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
                emptyMessage="No leave requests found"
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
        </div>
    );
};

export default LeaveRequests;
