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
import { getCompensatoryRequests, approveCompensatoryRequest, rejectCompensatoryRequest, exportCompensatoryRequests } from '../../../utils/attendance/apiUtils';
import { getCurrentUserId } from '../../../utils/userUtils';
import ConfirmationModal from './ConfirmationModal';

const CompensatoryRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(''); // Input value (updates immediately)
    const [searchTerm, setSearchTerm] = useState(''); // Debounced search term (triggers API)
    const [processingId, setProcessingId] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [requestToReject, setRequestToReject] = useState(null);
    const [requestToApprove, setRequestToApprove] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [totalItems, setTotalItems] = useState(0);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchRequests();
    }, [currentPage, itemsPerPage, searchTerm]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...(searchTerm && { search: searchTerm })
            };
            const data = await getCompensatoryRequests(params);
            setRequests(data.compensatory_requests || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Error fetching compensatory requests:', error);
            setRequests([]);
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
            await approveCompensatoryRequest(requestToApprove, approvedBy);
            alert('Compensatory request approved successfully');
            fetchRequests();
            setShowApproveModal(false);
            setRequestToApprove(null);
        } catch (error) {
            console.error('Error approving compensatory request:', error);
            alert(error.message || 'Failed to approve compensatory request');
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
            await rejectCompensatoryRequest(requestToReject, rejectedBy, comments || undefined);
            alert('Compensatory request rejected successfully');
            fetchRequests();
            setShowRejectModal(false);
            setRequestToReject(null);
        } catch (error) {
            console.error('Error rejecting compensatory request:', error);
            alert(error.message || 'Failed to reject compensatory request');
        } finally {
            setProcessingId(null);
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

    const exportToCSV = async () => {
        try {
            const params = {
                ...(searchTerm && { search: searchTerm })
            };
            
            const data = await exportCompensatoryRequests(params);
            const allRequests = data.compensatory_requests || [];

            if (allRequests.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Leave ID', 'Employee ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Request Date', 'Status', 'Requested To', 'Comments'];
            
            const csvRows = [
                headers.join(','),
                ...allRequests.map(lr => {
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

                    return [
                        lr.leave_id || '',
                        lr.employee_code || '',
                        `"${lr.employee_name || ''}"`,
                        `"${lr.department || 'N/A'}"`,
                        `"${lr.leave_type || 'N/A'}"`,
                        formatDateCSV(lr.start_date),
                        formatDateCSV(lr.end_date),
                        formatDateCSV(lr.request_date),
                        lr.status || 'Pending',
                        `"${lr.requested_to_name || 'N/A'}"`,
                        `"${lr.comments || ''}"`
                    ].join(',');
                })
            ];

            const BOM = '\uFEFF';
            const csvContent = BOM + csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const filename = `compensatory_requests.csv`;
            
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
        { key: 'employee', label: 'Employee' },
        { key: 'department', label: 'Department' },
        { key: 'leave_type', label: 'Leave Type' },
        { key: 'date_range', label: 'Date Range' },
        { key: 'request_date', label: 'Request Date' },
        { key: 'requested_to', label: 'Requested To' },
        { key: 'actions', label: 'Actions' },
    ];

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (loading && requests.length === 0) {
        return (
            <div style={{ background: '#e9eff5' }} className="pt-0.5 pb-3 px-3 topcontainer">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading compensatory requests...</div>
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

            {/* TABLE */}
            <DataTable
                className="font-custom"
                columns={columns}
                data={requests}
                renderRow={(req) => (
                    <tr key={req.leave_id} className="ui-row">
                        <td className="ui-td">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#011748] text-xs font-semibold border border-blue-100">
                                        {req.employee_code}
                                    </span>
                                </div>
                                <span className="flex-1 min-w-0 truncate">
                                    {req.employee_name}
                                </span>
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900">{req.department}</div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900">{req.leave_type}</div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900">
                                {formatDate(req.start_date)} - {formatDate(req.end_date)}
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                {formatDate(req.request_date)}
                            </div>
                        </td>
                        <td className="ui-td">
                            <div className="text-sm text-gray-900">{req.requested_to_name}</div>
                        </td>
                        <td className="ui-td">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(req.leave_id);
                                    }}
                                    disabled={processingId === req.leave_id || req.status !== 'Pending'}
                                    className="ui-icon-btn approve disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Approve"
                                >
                                    <FiCheckCircle size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(req.leave_id);
                                    }}
                                    disabled={processingId === req.leave_id || req.status !== 'Pending'}
                                    className="ui-icon-btn reject disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Reject"
                                >
                                    <FiXCircle size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
                emptyMessage="No compensatory requests found"
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
            <ConfirmationModal
                isOpen={showApproveModal}
                onClose={() => {
                    setShowApproveModal(false);
                    setRequestToApprove(null);
                }}
                onConfirm={confirmApprove}
                title="Approve Compensatory Request"
                message="Are you sure you want to approve this compensatory request?"
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
                title="Reject Compensatory Request"
                message="Are you sure you want to reject this compensatory request? This action cannot be undone."
                confirmText="Reject"
                cancelText="Cancel"
                type="danger"
                showInput={true}
                inputPlaceholder="Please provide a reason for rejection (optional)..."
                inputLabel="Reason for Rejection (Optional)"
            />
        </div>
    );
};

export default CompensatoryRequests;
