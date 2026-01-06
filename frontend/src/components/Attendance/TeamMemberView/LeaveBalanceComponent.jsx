import React, { useState, useEffect } from 'react';
import { IoCalendarOutline } from 'react-icons/io5';
import { getLeaveBalance } from '../../../utils/attendance/apiUtils';
import DataTable from '../../Common/DataTable';
import '../../../styles/tableDesign.css';

export default function LeaveBalanceComponent({ employeeId, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [submittedYear, setSubmittedYear] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Generate avatar color based on initials
  const getAvatarColor = (initials) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Generate year options (2014 to current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2014; year--) {
      years.push(year);
    }
    return years;
  };

  // Get icon/initials for leave type
  const getLeaveTypeIcon = (leaveTypeName) => {
    // Generate initials from leave type name
    const words = leaveTypeName.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    } else {
      return leaveTypeName.substring(0, 2).toUpperCase();
    }
  };

  // Get color for leave type icon
  const getLeaveTypeColor = (leaveTypeName) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
      'bg-teal-100 text-teal-600'
    ];
    const index = leaveTypeName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Fetch employee info on mount
  useEffect(() => {
    if (employeeId && !employeeInfo) {
      fetchEmployeeInfo();
    }
  }, [employeeId]);

  // Fetch leave balance when year is submitted
  useEffect(() => {
    if (employeeId && submittedYear) {
      fetchLeaveBalance();
    }
  }, [employeeId, submittedYear]);

  const fetchEmployeeInfo = async () => {
    if (!employeeId) return;
    
    try {
      // Fetch with current year to get employee info
      const result = await getLeaveBalance(employeeId, { year: new Date().getFullYear() });
      
      if (result.employee) {
        setEmployeeInfo(result.employee);
      }
    } catch (err) {
      console.error('Error fetching employee info:', err);
    }
  };

  const fetchLeaveBalance = async () => {
    if (!employeeId || !submittedYear) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getLeaveBalance(employeeId, { year: submittedYear });
      
      console.log('Leave balance fetched:', result);
      
      if (result.employee && !employeeInfo) {
        setEmployeeInfo(result.employee);
      }
      
      setLeaveBalances(result.leave_balances || []);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
      setError('Failed to load leave balance');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedYear) {
      setSubmittedYear(selectedYear);
      setLeaveBalances([]);
      setCurrentPage(1); // Reset to first page when submitting
      setError(null);
      
      // Directly fetch data instead of relying on useEffect
      // This ensures data is fetched even if the same year is selected twice
      setLoading(true);
      try {
        const result = await getLeaveBalance(employeeId, { year: selectedYear });
        
        console.log('Leave balance fetched:', result);
        
        if (result.employee && !employeeInfo) {
          setEmployeeInfo(result.employee);
        }
        
        setLeaveBalances(result.leave_balances || []);
      } catch (err) {
        console.error('Error fetching leave balance:', err);
        setError('Failed to load leave balance');
      } finally {
        setLoading(false);
      }
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

  // Pagination calculations
  const totalItems = leaveBalances.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedBalances = leaveBalances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  return (
    <div className="flex-1 overflow-y-auto bg-transparent scrollbar-hide" style={{ background: "#e9eff5" }}>
      {/* Header */}
      
        {/* Top Bar */}
        
        
        {employeeInfo && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-1 pt-0.5 px-1.5">
            {/* Employee Profile Card */}
            <div className="flex items-center gap-2 px-3 py-0.5 sm:px-4 sm:py-1.5 border border-gray-200 bg-white rounded-lg shadow-sm flex-1 h-[70px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#011748] text-white rounded-xl flex items-center justify-center text-base sm:text-lg font-bold">
                {employeeInfo.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{employeeInfo.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">{employeeInfo.department} • {employeeInfo.role}</p>
              </div>
            </div>

            {/* Year Selection and Submit Section */}
            <div className="flex items-center gap-2 px-3 py-0.5 sm:px-4 sm:py-1.5 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0 h-[70px]">
              <IoCalendarOutline className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Year</span>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(parseInt(e.target.value));
                  setSubmittedYear(null);
                  setLeaveBalances([]);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white min-w-[100px]"
              >
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSubmit}
                disabled={!selectedYear}
                className={`ui-primary-btn whitespace-nowrap flex-shrink-0 ${
                  !selectedYear
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        )}
     

      {/* Leave Balance Table */}
      
        <div className="p-1.5">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Loading leave balance...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-sm text-red-500">
              {error}
            </div>
          ) : !submittedYear ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Please select a year and click Submit to view leave balance
            </div>
          ) : (
            <DataTable
              className="font-custom"
              columns={[
                { key: "leaveType", label: "Leave Type" },
                { key: "available", label: "Available" },
                { key: "booked", label: "Booked" },
                { key: "carriedForward", label: "Carried Forward" },
              ]}
              data={paginatedBalances}
              renderRow={(balance) => (
                <tr key={balance.balance_id} className="ui-row">
                  <td className="ui-td">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getLeaveTypeColor(balance.leave_type_name)} flex items-center justify-center font-semibold text-sm`}>
                        {getLeaveTypeIcon(balance.leave_type_name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{balance.leave_type_name}</div>
                        {balance.description && (
                          <div className="text-xs text-gray-500">{balance.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="ui-td">
                    <span className={`text-sm font-semibold ${parseFloat(balance.remaining) > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {balance.available}
                    </span>
                  </td>
                  <td className="ui-td">
                    <span className="text-sm font-semibold text-gray-900">
                      {balance.booked}
                    </span>
                  </td>
                  <td className="ui-td">
                    <span className="text-sm font-medium text-gray-700">
                      {parseFloat(balance.carried_forward || 0) > 0 ? balance.carried_forward : '—'}
                    </span>
                  </td>
                </tr>
              )}
              emptyMessage={error || `No leave balance data found for ${submittedYear}`}
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
          )}
        </div>
      
    </div>
  );
}

