import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../Common/DataTable';
import '../../../styles/tableDesign.css';
import { 
    FiUsers, 
    FiSearch,
    FiDownload
} from 'react-icons/fi';
import { IoChevronDown, IoClose } from 'react-icons/io5';
import { getOnLeaveEmployeesToday, getDepartments, exportOnLeaveEmployeesToday, getShifts } from '../../../utils/attendance/apiUtils';

const OnLeaveToday = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(''); // Input value (updates immediately)
    const [searchTerm, setSearchTerm] = useState(''); // Debounced search term (triggers API)
    const [selectedDepartments, setSelectedDepartments] = useState([]); // Array of selected department IDs
    const [selectedShifts, setSelectedShifts] = useState([]); // Array of selected shift IDs
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [showShiftDropdown, setShowShiftDropdown] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [totalItems, setTotalItems] = useState(0);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [filtersSubmitted, setFiltersSubmitted] = useState(false);

    // Fetch departments and shifts on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptsData, shiftsData] = await Promise.all([
                    getDepartments(),
                    getShifts()
                ]);
                setDepartments(deptsData || []);
                setShifts(shiftsData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Initial load - fetch data on mount
    useEffect(() => {
        fetchEmployees();
        setFiltersSubmitted(true);
    }, []);

    // Fetch data when page or filters change (only if filters have been submitted)
    useEffect(() => {
        if (filtersSubmitted) {
            fetchEmployees();
        }
    }, [currentPage, itemsPerPage, searchTerm, selectedDepartments, selectedShifts, sortColumn, sortDirection, filtersSubmitted]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...(searchTerm && { search: searchTerm }),
                ...(selectedDepartments.length > 0 && { department_ids: selectedDepartments.join(',') }),
                ...(selectedShifts.length > 0 && { shift_ids: selectedShifts.join(',') }),
                ...(sortColumn && { sort_by: sortColumn }),
                ...(sortColumn && { sort_order: sortDirection })
            };
            const data = await getOnLeaveEmployeesToday(params);
            setEmployees(data.employees || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Error fetching employees on leave:', error);
            setEmployees([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        setCurrentPage(1);
        setFiltersSubmitted(true);
        fetchEmployees();
    };

    const toggleDepartment = (deptId) => {
        setSelectedDepartments(prev => {
            if (prev.includes(deptId)) {
                return prev.filter(id => id !== deptId);
            } else {
                return [...prev, deptId];
            }
        });
        setFiltersSubmitted(false);
    };

    const toggleShift = (shiftId) => {
        setSelectedShifts(prev => {
            if (prev.includes(shiftId)) {
                return prev.filter(id => id !== shiftId);
            } else {
                return [...prev, shiftId];
            }
        });
        setFiltersSubmitted(false);
    };

    const removeDepartment = (deptId) => {
        const newDepartments = selectedDepartments.filter(id => id !== deptId);
        setSelectedDepartments(newDepartments);
        setCurrentPage(1);
        setFiltersSubmitted(false);
    };

    const removeShift = (shiftId) => {
        const newShifts = selectedShifts.filter(id => id !== shiftId);
        setSelectedShifts(newShifts);
        setCurrentPage(1);
        setFiltersSubmitted(false);
    };

    const exportToCSV = async () => {
        try {
            const params = {
                ...(searchTerm && { search: searchTerm }),
                ...(selectedDepartments.length > 0 && { department_ids: selectedDepartments.join(',') }),
                ...(selectedShifts.length > 0 && { shift_ids: selectedShifts.join(',') })
            };
            
            const data = await exportOnLeaveEmployeesToday(params);
            const allEmployees = data.employees || [];

            if (allEmployees.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Employee ID', 'Employee Name', 'Department', 'Shift', 'Date', 'Status'];
            
            const csvRows = [
                headers.join(','),
                ...allEmployees.map(emp => {
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
                        emp.employee_code || '',
                        `"${emp.employee_name || ''}"`,
                        `"${emp.department || 'N/A'}"`,
                        `"${emp.shift || 'N/A'}"`,
                        formatDate(emp.date),
                        emp.status || 'Leave'
                    ].join(',');
                })
            ];

            const BOM = '\uFEFF';
            const csvContent = BOM + csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const filename = `on_leave_employees_${dateStr}.csv`;
            
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
        { key: 'shift', label: 'Shift' },
        { key: 'status', label: 'Status' },
    ];

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (loading && employees.length === 0) {
        return (
            <div style={{ background: '#e9eff5' }} className="topcontainer">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading employees...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#e9eff5' }} className="topcontainer">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-3 gap-4">
                {/* SEARCH - Left-aligned on mobile and desktop */}
                <div className="ui-search w-auto lg:flex-1 lg:max-w-md">
                    <input
                        type="text"
                        placeholder="Search by name, email, department, or shift..."
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setCurrentPage(1);
                            setFiltersSubmitted(false);
                        }}
                        className="ui-search-input"
                    />
                </div>

                {/* Filters and Actions Container */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-auto lg:w-auto">
                    {/* Export Button - Left side on mobile */}
                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="ui-primary-btn order-first sm:order-last w-auto sm:w-auto"
                    >
                        <FiDownload className="w-4 h-4" />
                        Export CSV
                    </button>

                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                        {/* Department Filter - Multi-select */}
                        <div className="relative min-w-[140px] sm:min-w-[160px] flex-1 sm:flex-none">
                        <button
                            onClick={() => {
                                setShowDepartmentDropdown(!showDepartmentDropdown);
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
                        {departments.map((dept) => (
                                        <label
                                            key={dept.department_id}
                                            className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedDepartments.includes(dept.department_id)}
                                                onChange={() => toggleDepartment(dept.department_id)}
                                                className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className={selectedDepartments.includes(dept.department_id) ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                                {dept.department_name}
                                            </span>
                                        </label>
                        ))}
                                </div>
                            </>
                        )}
                    </div>

                        {/* Shift Filter - Multi-select */}
                        <div className="relative min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-none">
                        <button
                            onClick={() => {
                                setShowShiftDropdown(!showShiftDropdown);
                                setShowDepartmentDropdown(false);
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
                        {shifts.map((shift) => (
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

                        {/* Apply Button */}
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-1 bg-[#011748] text-white rounded-lg text-xs font-semibold hover:bg-[#011748]/90 transition-colors flex items-center gap-2 whitespace-nowrap w-full sm:w-auto"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Selected Filters Tags */}
            {(selectedDepartments.length > 0 || selectedShifts.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2 pt-2 sm:pt-2 border-t border-gray-200 mb-3">
                        {/* Department Tags */}
                        {selectedDepartments.map((deptId) => {
                            const dept = departments.find(d => d.department_id === deptId);
                            if (!dept) return null;
                            return (
                                <div
                                    key={deptId}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700"
                                >
                                    <span>{dept.department_name}</span>
                                    <button
                                        onClick={() => removeDepartment(deptId)}
                                        className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                        aria-label={`Remove ${dept.department_name} filter`}
                                    >
                                        <IoClose className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                </div>
                            );
                        })}

                        {/* Shift Tags */}
                        {selectedShifts.map((shiftId) => {
                            const shift = shifts.find(s => s.id === shiftId);
                            if (!shift) return null;
                            return (
                                <div
                                    key={shiftId}
                                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700"
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

            {/* TABLE */}
            <DataTable
                className="font-custom"
                columns={columns}
                data={employees}
                renderRow={(employee) => (
                    <tr key={employee.employee_id || employee.id} className="ui-row">
                        <td className="ui-td">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#011748] text-xs font-semibold border border-blue-100">
                                        {employee.employee_code || ''}
                                    </span>
                                </div>
                                <span className="flex-1 min-w-0 truncate">
                                        {employee.employee_name || 'N/A'}
                                </span>
                            </div>
                        </td>
                        <td className="ui-td">{employee.department || 'N/A'}</td>
                        <td className="ui-td">{employee.shift || 'N/A'}</td>
                        <td className="ui-td">{employee.status || 'Leave'}</td>
                    </tr>
                )}
                emptyMessage="No employees on leave found"
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

export default OnLeaveToday;
