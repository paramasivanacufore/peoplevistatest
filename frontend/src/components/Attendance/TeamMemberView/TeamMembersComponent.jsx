import React, { useState, useEffect } from 'react';
import { IoChevronDown, IoClose, IoEyeOutline } from 'react-icons/io5';
import { MdCalendarToday, MdAccessTime, MdDescription, MdAttachMoney, MdVisibility } from 'react-icons/md';
import DataTable from '../../../components/Common/DataTable';
import Papa from 'papaparse';
import { getTeamAttendance, getTeamDepartments, getShifts } from '../../../utils/attendance/apiUtils';
import '../../../styles/tableDesign.css';

export default function TeamMembersComponent({ onViewEmployee, onViewRegularization, onViewLeaveSummary, onViewLeaveBalance, onViewLeaveRequest }) {
    const [searchInput, setSearchInput] = useState(''); // Input value (updates immediately)
    const [searchTerm, setSearchTerm] = useState(''); // Debounced search term (triggers API)
    const [selectedDepartments, setSelectedDepartments] = useState([]); // Array of selected department IDs
    const [selectedShifts, setSelectedShifts] = useState([]); // Array of selected shift IDs
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showShiftDropdown, setShowShiftDropdown] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [departmentList, setDepartmentList] = useState([]); // Store full department objects
    const [shiftList, setShiftList] = useState([]); // Store full shift objects
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDebounce, setSearchDebounce] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        page_size: 10,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
    });
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [expandedRows, setExpandedRows] = useState({});
    const [filtersSubmitted, setFiltersSubmitted] = useState(false); // Track if filters have been submitted
    const [selectedEmployeeForActions, setSelectedEmployeeForActions] = useState(null); // For action cards modal/dropdown

    const statuses = ['All Status', 'Present', 'Absent', 'Leave', 'Holiday', 'Week Off', 'Regularized'];

    // Action cards configuration
    const actionCards = [
        { 
            icon: MdCalendarToday, 
            label: 'Attendance', 
            color: 'text-blue-600',
            onClick: (employeeId) => onViewEmployee && onViewEmployee(employeeId)
        },
        { 
            icon: MdAccessTime, 
            label: 'Regularization', 
            color: 'text-purple-600',
            onClick: (employeeId) => onViewRegularization && onViewRegularization(employeeId)
        },
        { 
            icon: MdDescription, 
            label: 'Leave Summary', 
            color: 'text-green-600',
            onClick: (employeeId) => onViewLeaveSummary && onViewLeaveSummary(employeeId)
        },
        { 
            icon: MdDescription, 
            label: 'Leave Request', 
            color: 'text-orange-600',
            onClick: (employeeId) => onViewLeaveRequest && onViewLeaveRequest(employeeId)
        },
        { 
            icon: MdAttachMoney, 
            label: 'Leave Balance', 
            color: 'text-teal-600',
            onClick: (employeeId) => onViewLeaveBalance && onViewLeaveBalance(employeeId)
        },
        { 
            icon: MdVisibility, 
            label: 'Compensatory', 
            color: 'text-indigo-600',
            onClick: (employeeId) => {
                // TODO: Implement compensatory off view
                console.log('Compensatory off for employee:', employeeId);
            }
        },
    ];

    const toggleRowExpansion = (employeeId) => {
        setExpandedRows(prev => ({
            ...prev,
            [employeeId]: !prev[employeeId]
        }));
    };

    // Fetch departments and shifts on component mount
    useEffect(() => {
        fetchDepartments();
        fetchShifts();
    }, []);

 // Debounce search input
 useEffect(() => {
    const timer = setTimeout(() => {
        setSearchTerm(searchInput);
        setCurrentPage(1);
        
        setFiltersSubmitted(true);
    }, 500);
    return () => clearTimeout(timer);
}, [searchInput]);

    
    useEffect(() => {
        fetchAttendanceData();
        setFiltersSubmitted(true); 
    }, []); 
    useEffect(() => {
        if (currentPage > 0 && filtersSubmitted) {
            
            fetchAttendanceData();
        }
    }, [currentPage, itemsPerPage, searchTerm]); // Fetch when page, items per page, or search term changes

    const fetchDepartments = async () => {
        try {
            const response = await getTeamDepartments();
            setDepartmentList(response || []);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Failed to load departments');
        }
    };

    const fetchShifts = async () => {
        try {
            const response = await getShifts();
            setShiftList(response || []);
        } catch (err) {
            console.error('Error fetching shifts:', err);
            setError('Failed to load shifts');
        }
    };
    const fetchAttendanceData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            
            // Add multiple department IDs
            if (selectedDepartments.length > 0) {
                params.department_ids = selectedDepartments.join(',');
                console.log('DEBUG: Sending department_ids:', selectedDepartments);
            }
            
            // Add multiple shift IDs
            if (selectedShifts.length > 0) {
                params.shift_ids = selectedShifts.join(',');
            }
            
            if (selectedStatus && selectedStatus !== 'All Status') {
                params.status = selectedStatus;
            }
            
            if (searchTerm && searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            
            // Add pagination parameters
            params.page = currentPage;
            params.page_size = itemsPerPage;

            const result = await getTeamAttendance(params);
            console.log('DEBUG: API Response:', result);
            console.log('DEBUG: Response type:', typeof result);
            console.log('DEBUG: Is array:', Array.isArray(result));
            console.log('DEBUG: Has data property:', 'data' in result);
            console.log('DEBUG: Employees count:', result.data?.length || result.length || 0);
            if (result.data && result.data.length > 0) {
                console.log('DEBUG: First employee:', result.data[0]);
            }
            
            // Handle both old format (array) and new format (object with data and pagination)
            if (Array.isArray(result)) {
                setEmployees(result);
                setPagination({
                    current_page: 1,
                    page_size: itemsPerPage,
                    total_items: result.length,
                    total_pages: Math.ceil(result.length / itemsPerPage),
                    has_next: false,
                    has_previous: false
                });
            } else {
                setEmployees(result.data || []);
                setPagination(result.pagination || {
                    current_page: 1,
                    page_size: itemsPerPage,
                    total_items: 0,
                    total_pages: 0,
                    has_next: false,
                    has_previous: false
                });
            }
        } catch (err) {
            console.error('Error fetching attendance data:', err);
            setError('Failed to load attendance data');
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        setCurrentPage(1); // Reset to first page when applying filters
        setFiltersSubmitted(true); // Mark filters as submitted
        fetchAttendanceData();
    };
    
    const handleItemsPerPageChange = (newSize) => {
        setItemsPerPage(newSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const toggleDepartment = (deptId) => {
        setSelectedDepartments(prev => {
            if (prev.includes(deptId)) {
                return prev.filter(id => id !== deptId);
            } else {
                return [...prev, deptId];
            }
        });
        setFiltersSubmitted(false); // Reset submitted state when filter is changed
    };

    const toggleShift = (shiftId) => {
        setSelectedShifts(prev => {
            if (prev.includes(shiftId)) {
                return prev.filter(id => id !== shiftId);
            } else {
                return [...prev, shiftId];
            }
        });
        setFiltersSubmitted(false); // Reset submitted state when filter is changed
    };

    const removeDepartment = (deptId) => {
        const newDepartments = selectedDepartments.filter(id => id !== deptId);
        setSelectedDepartments(newDepartments);
        setCurrentPage(1);
        setFiltersSubmitted(false); // Reset submitted state when filter is removed
        // Don't fetch automatically - user needs to click submit
    };

    const removeShift = (shiftId) => {
        const newShifts = selectedShifts.filter(id => id !== shiftId);
        setSelectedShifts(newShifts);
        setCurrentPage(1);
        setFiltersSubmitted(false); // Reset submitted state when filter is removed
        // Don't fetch automatically - user needs to click submit
    };

    const removeStatus = () => {
        setSelectedStatus('All Status');
        setCurrentPage(1);
        setFiltersSubmitted(false); // Reset submitted state when filter is removed
        // Don't fetch automatically - user needs to click submit
    };

    // Pagination - now handled server-side, so we use employees directly
    const paginatedEmployees = employees;
    
    // Calculate pagination info for display
    const totalItems = pagination.total_items || 0;
    const totalPages = pagination.total_pages || 1;
    
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Pagination range helper with dots
    const getPaginationRange = (current, total) => {
        const delta = 1; // pages around current
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

    // Generate avatar color - light grey for all
    const getAvatarColor = (initials) => {
        return 'bg-gray-200';
    };

    // Get status badge color - Softer colors matching Image 1
    const getStatusColor = (status) => {
        const base =
        'inline-flex items-center px-3 py-1 rounded-full shadow-sm font-semibold';
        switch (status) {
            case 'Present':
                return `${base} bg-emerald-50 text-emerald-700`;
            case 'Absent':
                return `${base} bg-red-50 text-red-700`;
            case 'Leave':
                return `${base} bg-yellow-50 text-yellow-700`;
            case 'Holiday':
                return `${base} bg-blue-50 text-blue-700`;
            case 'Week Off':
                return `${base} bg-gray-50 text-gray-700`;
            case 'Regularized':
                return `${base} bg-purple-50 text-purple-700`;
            default:
                return `${base} bg-gray-50 text-gray-700`;
        }
    };

    // CSV Export Function
    const exportToCSV = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch all data without pagination
            const params = {};
            
            if (selectedDepartments.length > 0) {
                params.department_ids = selectedDepartments.join(',');
            }
            
            if (selectedShifts.length > 0) {
                params.shift_ids = selectedShifts.join(',');
            }
            
            if (selectedStatus && selectedStatus !== 'All Status') {
                params.status = selectedStatus;
            }
            
            if (searchTerm && searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            
            // Fetch all records (use a large page_size to get all data)
            params.page = 1;
            params.page_size = 10000;

            console.log('DEBUG: Export CSV - Fetching with params:', params);
            const result = await getTeamAttendance(params);
            
            console.log('DEBUG: Export CSV - API Response:', result);
            const allEmployees = Array.isArray(result) ? result : (result.data || []);
            console.log('DEBUG: Export CSV - Employees count:', allEmployees.length);
            
            if (allEmployees.length === 0) {
                setError('No data available to export');
                return;
            }
            
            // Format data for CSV
            const csvData = allEmployees.map(employee => ({
                'EMP ID': employee.empId || '',
                'Employee Name': employee.name || '',
                'Department': employee.department || '',
                'Role': employee.role || '',
                'Shift': employee.shift || '',
                'Status': employee.status || '',
                'First Punch': employee.first_in_time || '',
                'Last Punch': employee.last_out_time || '',
                'Total Hours': employee.total_working_hours || '',
                'Total Punches': employee.total_punches || 0
            }));
            
            // Convert to CSV
            const csv = Papa.unparse(csvData);
            
            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `team_members_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL object
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting CSV:', err);
            setError(`Failed to export CSV: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // DataTable Columns Configuration - Simple format for custom DataTable
    const columns = [
        { key: "employee", label: "Employee" },
        { key: "department", label: "Department" },
        { key: "shift", label: "Shift" },
        { key: "reporting_to", label: "Reporting To" },
        { key: "status", label: "Status" },
        { key: "actions", label: "Actions" },
    ];

    return (
        <div 
            className="max-w-[1400px] mx-auto"
            style={{ 
                background: "#e9eff5",
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                maxHeight: '100vh',
                height: '100%'
            }}
        >
            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
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
                    {/* Department Filter - Multi-select */}
                    <div className="relative min-w-[140px] sm:min-w-[160px]">
                        <button
                            onClick={() => {
                                setShowDepartmentDropdown(!showDepartmentDropdown);
                                setShowStatusDropdown(false);
                                setShowShiftDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#011748] text-xs sm:text-sm text-gray-700 whitespace-nowrap w-full justify-between"
                        >
                            <span>
                                {selectedDepartments.length === 0
                                    ? 'All Departments'
                                    : `${selectedDepartments.length} Selected`}
                            </span>
                            <IoChevronDown className={`w-4 h-4 transition-transform ${showDepartmentDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showDepartmentDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDepartmentDropdown(false)}
                                />
                                <div className="absolute left-0 right-0 sm:right-auto sm:left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                    {departmentList.map((dept) => (
                                        <label
                                            key={dept.id}
                                            className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedDepartments.includes(dept.id)}
                                                onChange={() => toggleDepartment(dept.id)}
                                                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className={selectedDepartments.includes(dept.id) ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                                                {dept.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative min-w-[120px] sm:min-w-[140px]">
                        <button
                            onClick={() => {
                                setShowStatusDropdown(!showStatusDropdown);
                                setShowDepartmentDropdown(false);
                                setShowShiftDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#011748] text-xs sm:text-sm text-gray-700 whitespace-nowrap w-full justify-between"
                        >
                            <span>{selectedStatus}</span>
                            <IoChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showStatusDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowStatusDropdown(false)}
                                />
                                <div className="absolute left-0 right-0 sm:right-auto sm:left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                    {statuses.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setSelectedStatus(status);
                                                setShowStatusDropdown(false);
                                                setFiltersSubmitted(false);
                                            }}
                                            className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 ${
                                                selectedStatus === status ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Shift Filter - Multi-select */}
                    <div className="relative min-w-[120px] sm:min-w-[140px]">
                        <button
                            onClick={() => {
                                setShowShiftDropdown(!showShiftDropdown);
                                setShowDepartmentDropdown(false);
                                setShowStatusDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#011748] text-xs sm:text-sm text-gray-700 whitespace-nowrap w-full justify-between"
                        >
                            <span>
                                {selectedShifts.length === 0
                                    ? 'All Shifts'
                                    : `${selectedShifts.length} Selected`}
                            </span>
                            <IoChevronDown className={`w-4 h-4 transition-transform ${showShiftDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showShiftDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowShiftDropdown(false)}
                                />
                                <div className="absolute left-0 right-0 sm:right-auto sm:left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                    {shiftList.map((shift) => (
                                        <label
                                            key={shift.id}
                                            className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedShifts.includes(shift.id)}
                                                onChange={() => toggleShift(shift.id)}
                                                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className={selectedShifts.includes(shift.id) ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                                                {shift.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="ui-primary-btn whitespace-nowrap"
                    >
                      Apply
                    </button>
                </div>
            </div>

            {/* Selected Filters Tags */}
            {(selectedDepartments.length > 0 || selectedShifts.length > 0 || (selectedStatus && selectedStatus !== 'All Status')) && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2 mx-auto w-full max-w-[1400px] pt-2 sm:pt-2 border-t border-transparent-200 mb-3 bg-white rounded-lg px-3 py-2">
                    {/* Department Tags */}
                    {selectedDepartments.map((deptId) => {
                        const dept = departmentList.find(d => d.id === deptId);
                        if (!dept) return null;
                        return (
                            <div
                                key={deptId}
                                className="inline-flex items-center gap-1 sm:gap-1.5 
px-1.5 sm:px-2.5 
py-0.5 sm:py-1 
bg-gray-100 border border-gray-300 
rounded-full text-[10px] sm:text-xs text-gray-700"
                            >
                                <span>{dept.name}</span>
                                <button
                                    onClick={() => removeDepartment(deptId)}
                                    className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                    aria-label={`Remove ${dept.name} filter`}
                                >
                                    <IoClose className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                            </div>
                        );
                    })}

                    {/* Status Tag */}
                    {selectedStatus && selectedStatus !== 'All Status' && (
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 border border-gray-300 rounded-full text-[10px] sm:text-xs text-gray-700">
                            <span>{selectedStatus}</span>
                            <button
                                onClick={removeStatus}
                                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                aria-label={`Remove ${selectedStatus} filter`}
                            >
                                <IoClose className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                        </div>
                    )}

                    {/* Shift Tags */}
                    {selectedShifts.map((shiftId) => {
                        const shift = shiftList.find(s => s.id === shiftId);
                        if (!shift) return null;
                        return (
                            <div
                                key={shiftId}
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 border border-gray-300 rounded-full text-[10px] sm:text-xs text-gray-700"
                            >
                                <span>{shift.name}</span>
                                <button
                                    onClick={() => removeShift(shiftId)}
                                    className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                    aria-label={`Remove ${shift.name} filter`}
                                >
                                    <IoClose className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="p-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-sm text-gray-500">
                        Loading...
                    </div>
                </div>
            )}

            {/* DataTable */}
            {!loading && (
                <div>
                    <style>{`
                        .team-members-table-wrapper {
                            display: flex;
                            flex-direction: column;
                            height: 100%;
                            
                        }
                        .team-members-table-wrapper .ui-card {
                            display: flex;
                            flex-direction: column;
                            height: 100%;
                            
                        }
                        .team-members-table-wrapper .ui-table-wrapper {
                            flex: 1;
                            overflow-y: auto;
                            overflow-x: auto;
                            scrollbar-width: none;
                            -ms-overflow-style: none;
                        }
                        .team-members-table-wrapper .ui-table-wrapper::-webkit-scrollbar {
                            display: none;
                        }
                        .team-members-table-wrapper .ui-table thead {
                            position: sticky;
                            top: 0;
                            z-index: 10;
                            background: rgb(248 250 252);
                        }
                    `}</style>
                    <div className="team-members-table-wrapper">
                <DataTable
                                className="font-custom"
                    columns={columns}
                    data={paginatedEmployees}
                                renderRow={(employee) => {
                                            const isExpanded = expandedRows[employee.employee_id] || false;
                                            
                                            return (
                                                <React.Fragment key={employee.employee_id}>
                                                    <tr className="ui-row">
                                                        <td className="ui-td">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-shrink-0">
                                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#011748] text-xs font-semibold border border-blue-100">
                                                                        {paginatedEmployees.indexOf(employee) + 1 + (currentPage - 1) * itemsPerPage}
                                                                    </span>
                                                                </div>
                                                                <span className="flex-1 min-w-0 truncate">
                                                                    {employee.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="ui-td text-xs sm:text-sm text-gray-700">
                                                            {employee.department || '-'}
                                                        </td>
                                                        
                                                        <td className="ui-td text-xs sm:text-sm truncate">
                                                            {employee.shift || '-'}
                                                        </td>
                                                        
                                                        <td className="ui-td text-xs sm:text-sm text-gray-700">
                                                            {employee.reporting_to || 'N/A'}
                                                        </td>
                                                        
                                                        <td className="ui-td">
                                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                                                                {employee.status}
                                                            </span>
                                                        </td>
                                                        
                                                        <td className="ui-td">
                                                            <button
                                                                onClick={(e) => {
                                                                    if (expandedRows[employee.employee_id]) {
                                                                        setExpandedRows(prev => ({
                                                                            ...prev,
                                                                            [employee.employee_id]: false
                                                                        }));
                                                                        setSelectedEmployeeForActions(null);
                                                                    } else {
                                                                        setExpandedRows(prev => ({
                                                                            ...prev,
                                                                            [employee.employee_id]: true
                                                                        }));
                                                                        setSelectedEmployeeForActions(employee.employee_id);
                                                                        
                                                                        // Scroll to expanded row after state update
                                                                        setTimeout(() => {
                                                                            const rowElement = document.querySelector(`tr[data-expanded-row="${employee.employee_id}"]`);
                                                                            if (rowElement) {
                                                                                // Find the scrollable container
                                                                                const scrollContainer = rowElement.closest('.ui-table-wrapper');
                                                                                if (scrollContainer) {
                                                                                    const containerRect = scrollContainer.getBoundingClientRect();
                                                                                    const elementRect = rowElement.getBoundingClientRect();
                                                                                    const scrollTop = scrollContainer.scrollTop;
                                                                                    const elementTop = elementRect.top - containerRect.top + scrollTop;
                                                                                    
                                                                                    scrollContainer.scrollTo({
                                                                                        top: elementTop - 20, // 20px offset from top
                                                                                        behavior: 'smooth'
                                                                                    });
                                                                                }
                                                                            }
                                                                        }, 150);
                                                                    }
                                                                }}
                                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-[#011748] transition-colors cursor-pointer group"
                                                                aria-label={isExpanded ? 'Hide Details' : 'View Details'}
                                                            >
                                                                <IoEyeOutline className={`w-4 h-4 ${isExpanded ? 'text-[#011748]' : 'text-gray-600 group-hover:text-[#011748]'} transition-colors`} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Expandable Action Cards Row */}
                                                    {isExpanded && (
                                                        <tr 
                                                            className="ui-row bg-gray-50"
                                                            data-expanded-row={employee.employee_id}
                                                        >
                                                            <td colSpan={columns.length} className="ui-td p-4 border-t-0">
                                                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-2">
                                {actionCards.map((action, idx) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                action.onClick(employee.employee_id);
                                                setExpandedRows(prev => ({
                                                    ...prev,
                                                    [employee.employee_id]: false
                                                }));
                                                                                        setSelectedEmployeeForActions(null);
                                            }}
                                                                                    className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                                                <span className="font-medium text-gray-900 text-xs sm:text-sm">{action.label}</span>
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-gray-500">Click to view details</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        }}
                                        emptyMessage="No employees found"
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
                                                            disabled={currentPage === 1 || !pagination.has_previous}
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
                                                            disabled={currentPage === totalPages || !pagination.has_next}
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
            </div>
            )}
        </div>
    );
}

