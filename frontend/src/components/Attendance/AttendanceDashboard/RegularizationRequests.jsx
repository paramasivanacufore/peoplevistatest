import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../Common/DataTable';
import '../../../styles/tableDesign.css';
import { 
    FiUsers, 
    FiSearch,
    FiCalendar,
    FiCheckCircle,
    FiXCircle,
    FiDownload
} from 'react-icons/fi';
import { getRegularizationRequests, approveRegularizationRequest, rejectRegularizationRequest, exportRegularizationRequests } from '../../../utils/attendance/apiUtils';
import { getCurrentUserId } from '../../../utils/userUtils';
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';

const RegularizationRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    // Fetch data when page or filters change
    useEffect(() => {
        fetchRequests();
    }, [currentPage, itemsPerPage, searchTerm, sortColumn, sortDirection]);

    // Clear selections only when filters/search/sort change (not page change)
    useEffect(() => {
        setSelectedIds(new Set());
    }, [searchTerm, sortColumn, sortDirection]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const currentUserId = getCurrentUserId();
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...(searchTerm && { search: searchTerm }),
                manager_id: currentUserId, // Filter by employees who report to current user
                ...(sortColumn && { sort_by: sortColumn }),
                ...(sortColumn && { sort_order: sortDirection })
            };
            const data = await getRegularizationRequests(params);
            setRequests(data.regularization_requests || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Error fetching regularization requests:', error);
            setRequests([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleApprove = (requestId) => {
        setRequestToApprove(requestId);
        setShowApproveModal(true);
    };

    const confirmApprove = async () => {
        if (!requestToApprove) return;
        
        try {
            setProcessingId(requestToApprove);
            const approvedBy = getCurrentUserId();
            await approveRegularizationRequest(requestToApprove, approvedBy);
            setToast({ show: true, message: 'Regularization request approved successfully', type: 'success' });
            fetchRequests();
            setSelectedIds(new Set()); // Clear selections
            setShowApproveModal(false);
            setRequestToApprove(null);
        } catch (error) {
            console.error('Error approving regularization request:', error);
            setToast({ show: true, message: error.message || 'Failed to approve regularization request', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (requestId) => {
        setRequestToReject(requestId);
        setShowRejectModal(true);
    };

    const confirmReject = async (comments) => {
        if (!requestToReject) return;
        
        try {
            setProcessingId(requestToReject);
            const rejectedBy = getCurrentUserId();
            await rejectRegularizationRequest(requestToReject, rejectedBy, comments || undefined);
            setToast({ show: true, message: 'Regularization request rejected successfully', type: 'success' });
            fetchRequests();
            setSelectedIds(new Set()); // Clear selections
            setShowRejectModal(false);
            setRequestToReject(null);
        } catch (error) {
            console.error('Error rejecting regularization request:', error);
            setToast({ show: true, message: error.message || 'Failed to reject regularization request', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleSelectAll = async (e) => {
        if (e.target.checked) {
            // Fetch all regularization requests across all pages
            try {
                const currentUserId = getCurrentUserId();
                const allRequests = [];
                let currentPageNum = 1;
                let hasMore = true;

                while (hasMore) {
                    const params = {
                        page: currentPageNum,
                        limit: 100, // Use larger limit to fetch more at once
                        ...(searchTerm && { search: searchTerm }),
                        manager_id: currentUserId
                    };
                    const data = await getRegularizationRequests(params);
                    const requestsData = data.regularization_requests || [];
                    
                    if (requestsData.length > 0) {
                        allRequests.push(...requestsData);
                    }
                    
                    hasMore = requestsData.length === 100 && allRequests.length < (data.total || 0);
                    currentPageNum++;
                }

                // Select all IDs from all pages
                const allIds = new Set(allRequests.map(req => req.request_id));
                setSelectedIds(allIds);
            } catch (error) {
                console.error('Error fetching all requests:', error);
                // Fallback to selecting only current page
                const allIds = new Set(requests.map(req => req.request_id));
                setSelectedIds(allIds);
            }
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (requestId, checked) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(requestId);
        } else {
            newSelected.delete(requestId);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) {
            alert('Please select at least one regularization request to approve');
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
            const promises = idsArray.map(id => approveRegularizationRequest(id, approvedBy));
            await Promise.all(promises);
            
            setToast({ show: true, message: `Successfully approved ${idsArray.length} regularization request(s)`, type: 'success' });
            fetchRequests(); // Refresh the list
            setSelectedIds(new Set()); // Clear selections
        } catch (error) {
            console.error('Error bulk approving regularization requests:', error);
            setToast({ show: true, message: error.message || 'Failed to approve some regularization requests', type: 'error' });
        } finally {
            setBulkProcessing(false);
        }
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

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return timeString;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Present': { bg: 'bg-green-100', text: 'text-green-800' },
            'Absent': { bg: 'bg-red-100', text: 'text-red-800' },
            'Leave': { bg: 'bg-orange-100', text: 'text-orange-800' }
        };
        const config = statusConfig[status] || statusConfig['Present'];
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {status}
            </span>
        );
    };

    const exportToCSV = async () => {
        try {
            const currentUserId = getCurrentUserId();
            const params = {
                ...(searchTerm && { search: searchTerm }),
                manager_id: currentUserId // Filter by employees who report to current user
            };
            
            const data = await exportRegularizationRequests(params);
            const allRequests = data.regularization_requests || [];

            if (allRequests.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Request ID', 'Employee ID', 'Employee Name', 'Department', 'Date', 'Reason', 'Regularization Type', 'Old Check In', 'Old Check Out', 'Corrected Check In', 'Corrected Check Out', 'Status', 'Approved By', 'Created At'];
            
            const csvRows = [
                headers.join(','),
                ...allRequests.map(rr => {
                    const formatDateCSV = (dateString) => {
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

                    const formatTimeCSV = (timeString) => {
                        if (!timeString) return 'N/A';
                        try {
                            const date = new Date(timeString);
                            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        } catch {
                            return timeString;
                        }
                    };

                    return [
                        rr.request_id || '',
                        rr.employee_code || '',
                        `"${rr.employee_name || ''}"`,
                        `"${rr.department || 'N/A'}"`,
                        formatDateCSV(rr.date),
                        `"${rr.reason || ''}"`,
                        `"${rr.regularization_type || 'N/A'}"`,
                        formatTimeCSV(rr.old_check_in),
                        formatTimeCSV(rr.old_check_out),
                        formatTimeCSV(rr.corrected_check_in),
                        formatTimeCSV(rr.corrected_check_out),
                        rr.status || 'Pending',
                        `"${rr.approved_by_name || 'N/A'}"`,
                        formatDateCSV(rr.created_at)
                    ].join(',');
                })
            ];

            const BOM = '\uFEFF';
            const csvContent = BOM + csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const filename = `regularization_requests.csv`;
            
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
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type' },
        { key: 'old_time', label: 'Old Time' },
        { key: 'corrected_time', label: 'Corrected Time' },
        { key: 'reason', label: 'Reason' },
        { key: 'actions', label: 'Actions' },
    ];

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const allSelected = selectedIds.size > 0 && selectedIds.size === requests.length && requests.length > 0;

    if (loading && requests.length === 0) {
        return (
            <div style={{ background: '#e9eff5' }} className="pt-0.5 pb-3 px-3 topcontainer">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading regularization requests...</div>
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
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="ui-search-input"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="mb-3 flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedIds.size} request(s) selected
                    </span>
                    <button
                        type="button"
                        onClick={handleBulkApprove}
                        disabled={bulkProcessing}
                        className="ui-primary-btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiCheckCircle className="w-4 h-4" />
                        Approve All
                    </button>
                </div>
            )}

            {/* TABLE */}
            <DataTable
                className="font-custom"
                columns={columns}
                data={requests}
                renderRow={(request) => (
                    <tr key={request.request_id} className="ui-row">
                        <td className="ui-td">
                            <input
                                type="checkbox"
                                checked={selectedIds.has(request.request_id)}
                                onChange={(e) => handleSelectOne(request.request_id, e.target.checked)}
                                className="w-4 h-4 text-[#011748] bg-gray-100 border-gray-200 rounded focus:ring-[#011748] focus:ring-2 hover:border-gray-200 hover:bg-gray-100"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-2">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#011748] text-xs font-semibold border border-blue-100">
                                        {request.employee_code}
                                    </span>
                                </div>
                                <span className="flex-1 min-w-0 truncate">
                                    {request.employee_name || 'N/A'}
                                </span>
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-1 text-sm text-gray-900 whitespace-nowrap">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                {formatDate(request.date)}
                            </div>
                        </td>
                        <td className="ui-td">{request.regularization_type || 'N/A'}</td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 text-xs">IN:</span>
                                    <span>{formatTime(request.old_check_in)}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-gray-500 text-xs">OUT:</span>
                                    <span>{formatTime(request.old_check_out)}</span>
                                </div>
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 text-xs">IN:</span>
                                    <span className="font-semibold text-green-600">{formatTime(request.corrected_check_in)}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-gray-500 text-xs">OUT:</span>
                                    <span className="font-semibold text-green-600">{formatTime(request.corrected_check_out)}</span>
                                </div>
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900 break-words whitespace-normal max-w-[200px]" title={request.reason || 'No reason provided'}>
                                {request.reason || 'N/A'}
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(request.request_id);
                                    }}
                                    disabled={processingId === request.request_id || request.status !== 'Pending'}
                                    className="ui-icon-btn approve disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Approve"
                                >
                                    <FiCheckCircle size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(request.request_id);
                                    }}
                                    disabled={processingId === request.request_id || request.status !== 'Pending'}
                                    className="ui-icon-btn reject disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Reject"
                                >
                                    <FiXCircle size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
                emptyMessage="No regularization requests found"
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

            {/* Modals */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmBulkApprove}
                title="Approve Regularization Requests"
                message={`Are you sure you want to approve ${selectedIds.size} regularization request(s)? This action cannot be undone.`}
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
                title="Approve Regularization Request"
                message="Are you sure you want to approve this regularization request?"
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
                title="Reject Regularization Request"
                message="Are you sure you want to reject this regularization request? This action cannot be undone."
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
        </div>
    );
};

export default RegularizationRequests;
