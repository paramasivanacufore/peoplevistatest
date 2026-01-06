import React, { useState, useEffect } from 'react';
import { IoTimeOutline, IoArrowBack, IoArrowForward, IoCalendarOutline, IoEllipsisVertical, IoTrendingUp, IoStar, IoAlertCircle, IoGrid, IoList, IoClose, IoFilter, IoHelpCircle, IoPerson, IoChevronDown, IoSearch, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { FiDownload } from 'react-icons/fi';
import { Calendar, Clock, Coffee, AlertCircle, Umbrella, CalendarDays, Zap, RefreshCw } from 'lucide-react';
import DataTable from '../../../components/Common/DataTable';
import Papa from 'papaparse';
import { getEmployeeAttendance } from '../../../utils/attendance/apiUtils';
import '../../../Styles/tableDesign.css';

export default function EmployeeAttendanceComponent({ employeeId, onBack }) {
  // Initialize with current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentMonthValue = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  // Table view states
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [monthOptions, setMonthOptions] = useState([]);
  const [submittedPeriod, setSubmittedPeriod] = useState(null); // Store submitted year-month for data fetching
  
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  
  // Employee data states
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
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
  const [summary, setSummary] = useState({
    total_payable_days: 0,
    total_present_days: 0,
    paid_leaves: 0,
    unpaid_leave_absent: 0,
    total_holidays: 0,
    total_weekends: 0,
    total_overtime_earned: '0h 0m',
    comp_off_credited: 0,
    comp_off_used: 0
  });

  // Generate avatar color based on initials
  const getAvatarColor = (initials) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Backend data is used directly - no need for sample data

  // Generate year options (2014 to current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2014; year--) {
      years.push(year);
    }
    return years;
  };
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

  // Fetch employee attendance data only when submitted
  useEffect(() => {
    if (employeeId && submittedPeriod) {
      fetchEmployeeAttendance();
    }
  }, [employeeId, currentPage, itemsPerPage, submittedPeriod]);

  const fetchEmployeeInfo = async () => {
    if (!employeeId) return;
    
    try {
      // Fetch employee info without date filters - just get basic info
      const result = await getEmployeeAttendance(employeeId, { page: 1, page_size: 1 });
      
      console.log('Employee info fetched:', result.employee);
      if (result.employee) {
        setEmployeeInfo(result.employee);
      }
    } catch (err) {
      console.error('Error fetching employee info:', err);
    }
  };

  const fetchEmployeeAttendance = async () => {
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
      
      console.log('Fetching attendance with params:', { employeeId, startDate, endDate, currentPage, itemsPerPage });
      
      const result = await getEmployeeAttendance(employeeId, params);
      
      console.log('API Response:', result);
      console.log('Summary data:', result.summary);
      
      // Update employee info if not already set, or update if new data is available
      if (result.employee) {
        setEmployeeInfo(result.employee);
      }
      setAttendanceData(result.data || []);
      setPagination(result.pagination || {
        current_page: 1,
        page_size: itemsPerPage,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      });
      setSummary(result.summary || {
        total_payable_days: 0,
        total_present_days: 0,
        paid_leaves: 0,
        unpaid_leave_absent: 0,
        total_holidays: 0,
        total_weekends: 0,
        total_overtime_earned: '0h 0m',
        comp_off_credited: 0,
        comp_off_used: 0
      });
    } catch (err) {
      console.error('Error fetching employee attendance:', err);
      setError('Failed to load attendance data');
      setAttendanceData([]);
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

  // Helper function to parse date from DD-MMM-YYYY format
  const parseDate = (dateStr) => {
    // Format: '26-Oct-2025' or '01-Nov-2025'
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const year = parseInt(parts[2]);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames.findIndex(m => monthStr.toLowerCase().startsWith(m.toLowerCase()));
      
      if (month !== -1 && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return null;
  };

  // Use backend paginated data directly
  const displayData = attendanceData;
  const paginatedResult = {
    data: attendanceData,
    total: pagination.total_items,
    totalPages: pagination.total_pages
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
      let allAttendance = [];
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
        
        const result = await getEmployeeAttendance(employeeId, params);
        const attendance = result.data || [];
        allAttendance.push(...attendance);
        
        // Check if there are more pages
        const pagination = result.pagination || {};
        hasMore = pagination.has_next || false;
        currentPage++;
        
        // Safety check: if we got fewer records than page_size, we're done
        if (attendance.length < pageSize) {
          hasMore = false;
        }
      }
      
      // Reverse to get ascending date order (oldest first) for CSV export
      allAttendance = [...allAttendance].reverse();
      
      // Helper function to format date as DD-MM-YYYY
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
          // Parse date from DD-MMM-YYYY format
          const months = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          };
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = months[parts[1]] || '01';
            const year = parts[2];
            return `${day}-${month}-${year}`;
          }
          return dateStr;
        } catch {
          return dateStr;
        }
      };
      
      // Helper function to format time as HH:MM
      const formatTime = (timeStr) => {
        if (!timeStr || timeStr === '—') return '';
        // If already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
        // If in HH:MM:SS format, remove seconds
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr.substring(0, 5);
        // If in "Xh Ym" format, convert to HH:MM
        const match = timeStr.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          const hours = parseInt(match[1]).toString().padStart(2, '0');
          const minutes = parseInt(match[2]).toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
        return timeStr;
      };
      
      // Helper function to format datetime as DD-MM-YYYY HH:MM
      const formatDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr || timeStr === '—') return '';
        const formattedDate = formatDate(dateStr);
        // Extract time from "09:20 AM" format
        let time = '';
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const period = timeMatch[3];
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            time = `${hours.toString().padStart(2, '0')}:${minutes}`;
          }
        } else {
          time = formatTime(timeStr);
        }
        return time ? `${formattedDate} ${time}` : '';
      };
      
      // Helper function to calculate payable hours (8 hours for Present, 0 for others)
      const calculatePayableHours = (status, totalHours) => {
        if (status === 'Present' && totalHours) {
          // Extract hours from totalHours string
          const match = totalHours.match(/(\d+)h\s*(\d+)m/);
          if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            // If total hours >= 8, payable is 8:00, otherwise use actual hours
            if (hours > 8 || (hours === 8 && minutes > 0)) {
              return '08:00';
            } else {
              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
          }
          return '08:00'; // Default to 8 hours for Present
        }
        return '00:00';
      };
      
      // Helper function to calculate overtime (hours beyond 8:00)
      const calculateOvertime = (status, totalHours, payableHours) => {
        if (status !== 'Present' || !totalHours || payableHours === '00:00') return '00:00';
        
        // Extract hours and minutes from totalHours
        const totalMatch = totalHours.match(/(\d+)h\s*(\d+)m/);
        if (totalMatch) {
          const totalH = parseInt(totalMatch[1]);
          const totalM = parseInt(totalMatch[2]);
          const totalMinutes = totalH * 60 + totalM;
          
          // Extract from payableHours (format: HH:MM)
          const payableParts = payableHours.split(':');
          const payableH = parseInt(payableParts[0]) || 0;
          const payableM = parseInt(payableParts[1]) || 0;
          const payableMinutes = payableH * 60 + payableM;
          
          // Calculate overtime
          const otMinutes = totalMinutes - payableMinutes;
          if (otMinutes > 0) {
            const otHours = Math.floor(otMinutes / 60);
            const otMins = otMinutes % 60;
            return `${otHours.toString().padStart(2, '0')}:${otMins.toString().padStart(2, '0')}`;
          }
        }
        return '00:00';
      };
      
      // Format data for CSV - match the image format
      const csvData = allAttendance.map((record) => {
        const formattedDate = formatDate(record.date);
        const firstCheckIn = formatDateTime(record.date, record.firstPunch);
        const lastCheckOut = formatDateTime(record.date, record.lastPunch);
        const totalHours = formatTime(record.totalHours);
        const payableHours = calculatePayableHours(record.status, record.totalHours);
        const overtime = calculateOvertime(record.status, record.totalHours, payableHours);
        
        return {
          'Employee': employeeInfo?.name || '',
          'Employee N': employeeInfo?.name || '',
          'Date': formattedDate,
          'First Check-In': firstCheckIn,
          'Last Check-Out': lastCheckOut,
          'Check-in': '', // Empty as per image
          'Check-out': '', // Empty as per image
          'Check-in L': '', // Check-in Location - empty as per image
          'Check-out L': '', // Check-out Location - empty as per image
          'Total Hours': totalHours,
          'Payable Hours': payableHours,
          'Overtime': overtime,
          'Deviation': '', // Empty as per image
        'Status': record.status || '',
          'Shift(s)': record.shift || '',
          'Reason': '', // Empty as per image
          'Description': '' // Empty as per image
        };
      });
      
      // Add total row (matching image format - "Total" in Check-out L column)
      const totalRow = {
        'Employee': '',
        'Employee N': '',
        'Date': '',
        'First Check-In': '',
        'Last Check-Out': '',
        'Check-in': '',
        'Check-out': '',
        'Check-in L': '',
        'Check-out L': 'Total', // "Total" text in this column as per image
        'Total Hours': '', // Will calculate below
        'Payable Hours': '', // Will calculate below
        'Overtime': '', // Will calculate below
        'Deviation': '00:00',
        'Status': '',
        'Shift(s)': '',
        'Reason': '',
        'Description': ''
      };
      
      // Calculate totals
      let totalHoursSum = 0;
      let payableHoursSum = 0;
      let overtimeSum = 0;
      
      csvData.forEach(row => {
        if (row['Total Hours']) {
          const [h, m] = row['Total Hours'].split(':').map(Number);
          totalHoursSum += (h || 0) * 60 + (m || 0);
        }
        if (row['Payable Hours']) {
          const [h, m] = row['Payable Hours'].split(':').map(Number);
          payableHoursSum += (h || 0) * 60 + (m || 0);
        }
        if (row['Overtime']) {
          const [h, m] = row['Overtime'].split(':').map(Number);
          overtimeSum += (h || 0) * 60 + (m || 0);
        }
      });
      
      const formatMinutes = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
      
      totalRow['Total Hours'] = formatMinutes(totalHoursSum);
      totalRow['Payable Hours'] = formatMinutes(payableHoursSum);
      totalRow['Overtime'] = formatMinutes(overtimeSum);
      
      // Add total row to CSV data
      csvData.push(totalRow);
      
      // Convert to CSV
      const csv = Papa.unparse(csvData);
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${employeeInfo?.name || 'employee'}_${submittedPeriod}.csv`);
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
      'Present': 'bg-emerald-50 text-emerald-700',
      'Absent': 'bg-red-100 text-red-800',
      'Weekend': 'bg-gray-100 text-gray-800',
      'Holiday': 'bg-amber-100 text-amber-800',
      'Half Day': 'bg-blue-100 text-blue-800',
      'On Duty': 'bg-purple-100 text-purple-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  // DataTable Columns Configuration
  const columns = [
    { key: "sno", label: "S.No" },
    { key: "workDay", label: "Work Day" },
    { key: "date", label: "Date" },
    { key: "firstPunch", label: "First Punch" },
    { key: "lastPunch", label: "Last Punch" },
    { key: "totalHours", label: "Total Hours" },
    { key: "status", label: "Status" },
    { key: "shift", label: "Shift" },
    { key: "ot", label: "OT Duration" },
   
  ];

  // Calculate pagination
  const totalItems = pagination.total_items || 0;
  const totalPages = pagination.total_pages || 1;
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
              {/* Top Bar */}
            

              {/* Main Card */}
        <div className="bg-transparent rounded-lg shadow-sm border border-transparent overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">

    {/* ================= Employee Profile Card ================= */}
    {employeeInfo && (
      <div className="flex items-center gap-2 px-3 py-0.5 sm:px-4 sm:py-1.5 border border-gray-200 bg-white rounded-lg shadow-sm flex-1 h-[70px]">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#011748] text-white rounded-xl flex items-center justify-center text-base sm:text-lg font-bold"
        >
                      {employeeInfo.initials}
                    </div>

                <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {employeeInfo.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">
            {employeeInfo.role} • {employeeInfo.department}
          </p>
                    </div>
                  </div>
                )}

    {/* ================= Filters Section ================= */}
    <div className="flex items-center gap-2 px-3 py-0.5 sm:px-4 sm:py-1.5 bg-gray-50 rounded-lg border border-gray-200 h-auto sm:h-[70px] flex-wrap sm:flex-nowrap">

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

                {/* Period Info */}
                {submittedPeriod && (() => {
                  const [year, month] = submittedPeriod.split('-');
                  const monthNum = parseInt(month);
                  const yearNum = parseInt(year);
                  const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ];
                  let startMonth = monthNum - 1;
                  let startYear = yearNum;
                  if (startMonth === 0) {
                    startMonth = 12;
                    startYear = yearNum - 1;
                  }
                  return (
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                      <p className="text-sm text-blue-700">
                        Showing attendance records from <span className="font-semibold">26 {months[startMonth - 1]} {startYear}</span> to <span className="font-semibold">25 {months[monthNum - 1]} {yearNum}</span>
                      </p>
                    </div>
                  );
                })()}

              {/* Scrollable Container for DataTable and Summary */}
              <div 
                className="overflow-y-auto flex-1"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitScrollbar: 'none'
                }}
              >
                <style>{`
                  .employee-attendance-scrollable::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                  }
                  .employee-attendance-scrollable {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                <div className="employee-attendance-scrollable">
                  {/* DataTable */}
                  {!submittedPeriod ? (
                    <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                      Please select a year and month, then click Submit to view attendance records
                    </div>
                  ) : loading ? (
                    <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500">
                      Loading...
                    </div>
                  ) : (
                      <DataTable
                        className="font-custom"
                        columns={columns}
                        data={displayData}
                        renderRow={(record, index) => {
                          const rowIndex = (pagination.current_page - 1) * pagination.page_size + index + 1;
                          return (
                            <tr key={index} className="ui-row">
                            <td className="ui-td py-3">{rowIndex}</td>
                            <td className="ui-td py-3">{record.workDay || '—'}</td>
                            <td className="ui-td py-3">{record.date || '—'}</td>
                            <td className="ui-td py-3">{record.firstPunch || '—'}</td>
                            <td className="ui-td py-3">{record.lastPunch || '—'}</td>
                            <td className="ui-td py-3">
                              <span className="font-semibold py-3">{record.totalHours || '—'}</span>
                              </td>
                            <td className="ui-td py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(record.status)}`}>
                                  {record.status || '—'}
                                </span>
                              </td>
                            <td className="ui-td py-3">{record.shift || '—'}</td>
                            <td className="ui-td py-3">{record.ot || '—'}</td>
                              
                            </tr>
                          );
                        }}
                        emptyMessage={error || 'No attendance records found for the selected period'}
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

                  {/* Summary Cards */}
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 ">
                    {(() => {
                      // Define colors for gradient accent bars (2 of each color for 8 cards)
                      const accentColors = [
                        '#011748',  // Dark blue - card 1
                        '#f9b722',  // Yellow - card 2
                        '#60a5fa',  // Blue - card 3
                        '#9ca3af',  // Grey - card 4
                        '#011748',  // Dark blue - card 5
                        '#f9b722',  // Yellow - card 6
                        '#60a5fa',  // Blue - card 7
                        '#9ca3af'   // Grey - card 8
                      ];

                      const cards = [
                        {
                          label: "Total Payable Days",
                          value: summary.total_payable_days,
                          icon: Calendar,
                          color: "slate",
                          accentColor: accentColors[0]
                        },
                        {
                          label: "Total Present Days",
                          value: summary.total_present_days,
                          icon: Calendar,
                          color: "slate",
                          accentColor: accentColors[1]
                        },
                        {
                          label: "Paid Leaves",
                          value: summary.paid_leaves,
                          icon: Coffee,
                          color: "slate",
                          accentColor: accentColors[2]
                        },
                        {
                          label: "Unpaid Leave / Absent",
                          value: summary.unpaid_leave_absent,
                          icon: AlertCircle,
                          color: "slate",
                          accentColor: accentColors[3]
                        },
                        {
                          label: "Total Holidays",
                          value: summary.total_holidays,
                          icon: Umbrella,
                          color: "slate",
                          accentColor: accentColors[4]
                        },
                        {
                          label: "Total Weekends",
                          value: summary.total_weekends,
                          icon: CalendarDays,
                          color: "slate",
                          accentColor: accentColors[5]
                        },
                        {
                          label: "Total Overtime Earned",
                          value: summary.total_overtime_earned,
                          icon: Clock,
                          color: "slate",
                          accentColor: accentColors[6]
                        },
                        {
                          label: "Comp-Off (Credit/Used)",
                          value: `${summary.comp_off_credited} / ${summary.comp_off_used}`,
                          icon: RefreshCw,
                          color: "slate",
                          accentColor: accentColors[7]
                        }
                      ];

                      const colorClasses = {
                        // emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
                        // green: { bg: 'bg-green-50', text: 'text-green-600' },
                        // blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
                        // red: { bg: 'bg-red-50', text: 'text-red-600' },
                        // purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
                        // orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
                        // indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
                        slate: { bg: 'bg-slate-50', text: 'text-slate-600' }
                      };

                      return cards.map((card, index) => {
                        const Icon = card.icon;
                        const colorClass = colorClasses[card.color] || colorClasses.slate;
                        return (
                          <div
                            key={index}
                            className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                          >
                            {/* Gradient accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: card.accentColor }} />
                            
                            <div className="p-3">
                              {/* Icon and Label at top - left aligned */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${colorClass.bg} group-hover:scale-110 transition-transform duration-300`}>
                                  <Icon className={`w-4 h-4 ${colorClass.text}`} />
                                </div>
                                <p className="text-sm font-medium text-[#011748] leading-tight flex-1">
  {card.label}
</p>
                              </div>
                              
                              {/* Value centered */}
                              <div className="text-center">
                                <p className="text-xl font-bold" style={{ color: card.accentColor }}>
                                  {card.value}
                                </p>
                              </div>
                            </div>
                            
                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" style={{ background: card.accentColor }} />
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
}

