import React, { useState, useEffect } from 'react';
import { IoArrowBack, IoCalendarOutline, IoChevronDown } from 'react-icons/io5';
  
import { FiDownload } from 'react-icons/fi';
import DataTable from '../../Common/DataTable';
import Papa from 'papaparse';
import { getEmployeeLeaveRequests } from '../../../utils/attendance/apiUtils';
import '../../../styles/tableDesign.css';

export default function LeaveRequestComponent({ employeeId, onBack }) {
  // Initialize with current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentMonthValue = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [monthOptions, setMonthOptions] = useState([]);
  const [submittedPeriod, setSubmittedPeriod] = useState(null);
  
  // Define screen sizes that need compact styling
  const getIsSmallScreen = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const smallScreens = [
      { width: 375, height: 667 },  // iPhone SE
      { width: 414, height: 896 },  // iPhone 11 Pro Max / iPhone XR
      { width: 390, height: 844 },  // iPhone 12/13/14
      { width: 430, height: 932 },  // iPhone 14 Pro Max
      { width: 412, height: 915 },  // Various Android
      { width: 360, height: 740 },  // Various Android
      { width: 344, height: 882 },  // Various Android
      { width: 540, height: 720 },  // Various Android
      { width: 412, height: 914 },  // Various Android
    ];
    return smallScreens.some(screen => width === screen.width && height === screen.height);
  };
  
  // Detect small screen sizes
  const [isSmallScreen, setIsSmallScreen] = useState(getIsSmallScreen());
  
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(getIsSmallScreen());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Data states
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [requestsData, setRequestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Generate month options based on selected year
  const generateMonthOptions = (year) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const options = [];
    
    if (year === currentYear) {
      // For current year, show months up to current month
      for (let month = 1; month <= currentMonth; month++) {
        options.push({
          value: `${year}-${String(month).padStart(2, '0')}`,
          label: `${months[month - 1]} ${year}`
        });
      }
    } else {
      // For past years, show all 12 months
      for (let month = 1; month <= 12; month++) {
        options.push({
          value: `${year}-${String(month).padStart(2, '0')}`,
          label: `${months[month - 1]} ${year}`
        });
      }
    }
    
    return options;
  };

  // Initialize month options on mount and update when year changes
  useEffect(() => {
    const options = generateMonthOptions(selectedYear);
    setMonthOptions(options);
    // If selected month is not valid for the current year, select current month or first available
    if (options.length > 0) {
      const isValid = options.some(opt => opt.value === selectedMonth);
      if (!isValid) {
        // Try to select current month if available, otherwise first available
        const currentMonthOption = options.find(opt => opt.value === currentMonthValue);
        setSelectedMonth(currentMonthOption ? currentMonthOption.value : options[0].value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Fetch employee info immediately when component loads
  useEffect(() => {
    if (employeeId) {
      fetchEmployeeInfo();
    }
  }, [employeeId]);

  // Fetch leave requests when period is submitted
  useEffect(() => {
    if (employeeId && submittedPeriod) {
      fetchLeaveRequests();
    }
  }, [employeeId, submittedPeriod, currentPage, itemsPerPage]);

  const fetchEmployeeInfo = async () => {
    if (!employeeId) return;
    
    try {
      // Fetch employee info without date filters
      const result = await getEmployeeLeaveRequests(employeeId, { page: 1, page_size: 1 });
      
      console.log('Employee info fetched:', result.employee);
      setEmployeeInfo(result.employee);
    } catch (err) {
      console.error('Error fetching employee info:', err);
    }
  };

  const fetchLeaveRequests = async () => {
    if (!employeeId || !submittedPeriod) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage
      };
      
      // Calculate period: 26 of previous month to 25 of current month
      const [year, month] = submittedPeriod.split('-');
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      let startMonth = monthNum - 1;
      let startYear = yearNum;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = yearNum - 1;
      }
      const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-26`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-25`;
      
      params.start_date = startDate;
      params.end_date = endDate;
      
      console.log('Fetching leave requests with params:', { employeeId, startDate, endDate, currentPage, itemsPerPage });
      
      const result = await getEmployeeLeaveRequests(employeeId, params);
      
      console.log('API Response:', result);
      console.log('Employee info:', result.employee);
      console.log('Requests data:', result.data);
      console.log('Data count:', result.data?.length || 0);
      
      // Update employee info if not already set
      if (result.employee && !employeeInfo) {
        setEmployeeInfo(result.employee);
      }
      setRequestsData(result.data || []);
      setPagination(result.pagination || {
        current_page: 1,
        page_size: itemsPerPage,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      });
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError('Failed to load leave requests');
      setRequestsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle submit button click
  const handleSubmit = () => {
    if (selectedYear && selectedMonth) {
      setSubmittedPeriod(selectedMonth);
      setCurrentPage(1); // Reset to first page when submitting
    }
  };

  // Helper function to format date for CSV (DD-MM-YYYY)
  const formatDateForCSV = (dateStr) => {
    if (!dateStr) return '';
    try {
      // Handle formats like "20-Nov-2025" or "2025-11-20"
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          // Try to parse as DD-MMM-YYYY
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = months.findIndex(m => m === parts[1]);
          if (monthIndex !== -1) {
            const day = parts[0].padStart(2, '0');
            const month = String(monthIndex + 1).padStart(2, '0');
            const year = parts[2];
            return `${day}-${month}-${year}`;
          }
          // If already in DD-MM-YYYY format
          if (parts[0].length === 2 && parts[1].length === 2) {
            return dateStr;
          }
          // If in YYYY-MM-DD format
          if (parts[0].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // CSV Export Function
  const handleExportExcel = async () => {
    if (!employeeId || !submittedPeriod) return;
    
    try {
      setLoading(true);
      
      // Calculate period: 26 of previous month to 25 of current month
      const [year, month] = submittedPeriod.split('-');
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      let startMonth = monthNum - 1;
      let startYear = yearNum;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = yearNum - 1;
      }
      const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-26`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-25`;
      
      // Fetch all data in batches (API limit is 100 per page)
      let allRequests = [];
      let currentPage = 1;
      const pageSize = 100; // Maximum allowed by API
      let hasMore = true;
      
      while (hasMore) {
        const params = {
          page: currentPage,
          page_size: pageSize,
          start_date: startDate,
          end_date: endDate
        };
        
        const result = await getEmployeeLeaveRequests(employeeId, params);
        const requests = result.data || [];
        
        allRequests = [...allRequests, ...requests];
        
        // Check if there are more pages
        const pagination = result.pagination || {};
        hasMore = pagination.has_next || false;
        currentPage++;
        
        // Safety check to prevent infinite loops
        if (currentPage > 1000) {
          console.warn('Reached maximum page limit during CSV export');
          break;
        }
      }
      
      // Format data for CSV with requested columns
      const csvData = allRequests.map((request) => {
        // Format Leave Period as "Start Date - End Date"
        const formattedStartDate = formatDateForCSV(request.start_date || '');
        const formattedEndDate = formatDateForCSV(request.end_date || '');
        const leavePeriod = formattedStartDate && formattedEndDate 
          ? `${formattedStartDate} - ${formattedEndDate}` 
          : (formattedStartDate || formattedEndDate || '');
        
        return {
          'Employee ID': employeeId || '',
          'Employee Name': employeeInfo?.name || '',
          'Leave Type': request.leave_type || '',
          'Leave Period': leavePeriod,
          'Days/hours taken': request.duration || '',
          'Date of request': formatDateForCSV(request.request_date || '')
        };
      });
      
      // Convert to CSV
      const csv = Papa.unparse(csvData);
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leave_requests_${employeeInfo?.name || 'employee'}_${submittedPeriod}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'bg-amber-100 text-amber-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  // DataTable Columns Configuration
  const columns = [
    { key: "sno", label: "S.No" },
    { key: "leaveType", label: "Leave Type" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "duration", label: "Duration" },
    { key: "requestDate", label: "Request Date" },
    { key: "status", label: "Status" },
    { key: "comments", label: "Comments" },
    { key: "approvedDate", label: "Approved Date" },
  ];

  // Pagination helpers
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
                <p className="text-sm sm:text-base text-gray-600 truncate">{employeeInfo.role} • {employeeInfo.department}</p>
              </div>
            </div>

            {/* Year Selection and Submit Section */}
            <div className="flex items-center gap-2 px-3 py-0.5 sm:px-4 sm:py-1.5 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0 h-auto sm:h-[70px] flex-wrap sm:flex-nowrap">

      {/* Year */}
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Year
      </span>
      <select
        value={selectedYear}
        onChange={(e) => {
          setSelectedYear(parseInt(e.target.value));
          setSubmittedPeriod(null);
          setRequestsData([]);
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white min-w-[100px]
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {generateYearOptions().map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {/* Month */}
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Month
      </span>
      <select
        value={selectedMonth}
        onChange={(e) => {
          setSelectedMonth(e.target.value);
          setSubmittedPeriod(null);
          setRequestsData([]);
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white min-w-[180px]
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Apply */}
      <button
        onClick={handleSubmit}
        disabled={!selectedYear || !selectedMonth}
        className={`ui-primary-btn whitespace-nowrap ${
          !selectedYear || !selectedMonth
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        Apply
      </button>

      {/* Export */}
      <button
        type="button"
        onClick={handleExportExcel}
        disabled={!submittedPeriod || loading}
        className={`ui-primary-btn whitespace-nowrap ${
          !submittedPeriod || loading
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        <FiDownload className="w-4 h-4" />
        Export CSV
      </button>
            </div>
          </div>
        )}
     

      {/* Leave Requests Table */}
      
        <div className="p-1.5">
          {!submittedPeriod ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Please select a year and month, then click Submit to view leave requests
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Loading...
            </div>
          ) : (
              <DataTable
                className="font-custom"
                columns={columns}
                data={requestsData}
                renderRow={(request, index) => {
                  const rowIndex = (pagination.current_page - 1) * pagination.page_size + index + 1;
                  return (
                    <tr key={index} className="ui-row">
                      <td className="ui-td py-3">{rowIndex}</td>
                      <td className="ui-td py-3">{request.leave_type || '—'}</td>
                      <td className="ui-td py-3">{request.start_date || '—'}</td>
                      <td className="ui-td py-3">{request.end_date || '—'}</td>
                      <td className="ui-td py-3">{request.duration || '—'}</td>
                      <td className="ui-td py-3">{request.request_date || '—'}</td>
                      <td className="ui-td py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                          {request.status || 'Pending'}
                        </span>
                      </td>
                      <td className="ui-td py-3" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        {request.comments || '—'}
                      </td>
                      <td className="ui-td py-3">{request.approved_date || '—'}</td>
                    </tr>
                  );
                }}
                emptyMessage={error || 'No leave requests found for the selected period'}
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
          )}
        </div>
      
    </div>
  );
}

