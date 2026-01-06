import React, { useState, useEffect } from "react";
import { FiUsers } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";

import Papa from "papaparse";
import { getEmployeeAttendance } from "../../../utils/attendance/apiUtils";
import DataTable from "../../Common/DataTable";

const MyAttendanceComponent = ({ employeeId, onBack }) => {
  const [monthOptions, setMonthOptions] = useState([]);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthValue = `${currentYear}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [submittedPeriod, setSubmittedPeriod] = useState(currentMonthValue); // trigger API call
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showSummary, setShowSummary] = useState(false);

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
    has_previous: false,
  });
  const [summary, setSummary] = useState({
    total_payable_days: 0,
    total_present_days: 0,
    paid_leaves: 0,
    unpaid_leave_absent: 0,
    total_holidays: 0,
    total_weekends: 0,
    total_overtime_earned: "0h 0m",
    comp_off_credited: 0,
    comp_off_used: 0,
  });

  /* ================= TABLE ================= */
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

  const daysInMonth = 30;

  const startDay = 6;
  const weeks = [];
  let days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
    if (days.length === 7) {
      weeks.push(days);
      days = [];
    }
  }

  // Add remaining days
  if (days.length > 0) {
    while (days.length < 7) {
      days.push(null);
    }
    weeks.push(days);
  }

  // Generate avatar color based on initials
  const getAvatarColor = (initials) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Backend data is used directly - no need for sample data

  // Generate year options (2014 to current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2024; year--) {
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
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const options = [];

    if (year === currentYear) {
      // For current year, show months up to current month
      for (let month = 1; month <= currentMonth; month++) {
        options.push({
          value: `${year}-${String(month).padStart(2, "0")}`,
          label: `${months[month - 1]} ${year}`,
        });
      }
    } else {
      // For past years, show all 12 months
      for (let month = 1; month <= 12; month++) {
        options.push({
          value: `${year}-${String(month).padStart(2, "0")}`,
          label: `${months[month - 1]} ${year}`,
        });
      }
    }

    return options;
  };

  // Update month options when year changes
  useEffect(() => {
    const options = generateMonthOptions(selectedYear);
    setMonthOptions(options);
    // Auto-select first month if available
    if (options.length > 0 && !selectedMonth) {
      setSelectedMonth(options[0].value);
    } else if (options.length > 0) {
      // Check if current selected month is still valid for this year
      const isValid = options.some((opt) => opt.value === selectedMonth);
      if (!isValid) {
        setSelectedMonth(options[0].value);
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
      const result = await getEmployeeAttendance(employeeId, {
        page: 1,
        page_size: 1,
      });

      console.log("Employee info fetched:", result.employee);
      if (result.employee) {
        setEmployeeInfo(result.employee);
      }
    } catch (err) {
      console.error("Error fetching employee info:", err);
    }
  };

  const fetchEmployeeAttendance = async () => {
    if (!employeeId || !submittedPeriod) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };

      // Calculate period: 26 of previous month to 25 of current month
      const [year, month] = submittedPeriod.split("-");
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      let startMonth = monthNum - 1;
      let startYear = yearNum;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = yearNum - 1;
      }
      const startDate = `${startYear}-${String(startMonth).padStart(
        2,
        "0"
      )}-26`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-25`;

      params.start_date = startDate;
      params.end_date = endDate;

      console.log("Fetching attendance with params:", {
        employeeId,
        startDate,
        endDate,
        currentPage,
        itemsPerPage,
      });

      const result = await getEmployeeAttendance(employeeId, params);

      console.log("API Response:", result);
      console.log("Summary data:", result.summary);

      // Update employee info if not already set, or update if new data is available
      if (result.employee) {
        setEmployeeInfo(result.employee);
      }
      setAttendanceData(result.data || []);
      setPagination(
        result.pagination || {
          current_page: 1,
          page_size: itemsPerPage,
          total_items: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        }
      );
      setSummary(
        result.summary || {
          total_payable_days: 0,
          total_present_days: 0,
          paid_leaves: 0,
          unpaid_leave_absent: 0,
          total_holidays: 0,
          total_weekends: 0,
          total_overtime_earned: "0h 0m",
          comp_off_credited: 0,
          comp_off_used: 0,
        }
      );
    } catch (err) {
      console.error("Error fetching employee attendance:", err);
      setError("Failed to load attendance data");
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
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const year = parseInt(parts[2]);

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames.findIndex((m) =>
        monthStr.toLowerCase().startsWith(m.toLowerCase())
      );

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
    totalPages: pagination.total_pages,
  };

  const handleExportPDF = () => {
    alert(`Exporting attendance report as PDF for period: ${submittedPeriod}`);
  };

  // CSV Export Function
  const handleExportExcel = async () => {
    if (!employeeId || !submittedPeriod) return;

    try {
      setLoading(true);

      // Calculate period: 26 of previous month to 25 of current month
      const [year, month] = submittedPeriod.split("-");
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      let startMonth = monthNum - 1;
      let startYear = yearNum;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = yearNum - 1;
      }
      const startDate = `${startYear}-${String(startMonth).padStart(
        2,
        "0"
      )}-26`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-25`;

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
          end_date: endDate,
        };

        const response = await getEmployeeAttendance(employeeId, params);

        const result = response.data;
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
        if (!dateStr) return "";
        try {
          // Parse date from DD-MMM-YYYY format
          const months = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Sep: "09",
            Oct: "10",
            Nov: "11",
            Dec: "12",
          };
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            const day = parts[0].padStart(2, "0");
            const month = months[parts[1]] || "01";
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
        if (!timeStr || timeStr === "—") return "";
        // If already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
        // If in HH:MM:SS format, remove seconds
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr.substring(0, 5);
        // If in "Xh Ym" format, convert to HH:MM
        const match = timeStr.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          const hours = parseInt(match[1]).toString().padStart(2, "0");
          const minutes = parseInt(match[2]).toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        }
        return timeStr;
      };

      // Helper function to format datetime as DD-MM-YYYY HH:MM
      const formatDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr || timeStr === "—") return "";
        const formattedDate = formatDate(dateStr);
        // Extract time from "09:20 AM" format
        let time = "";
        if (timeStr.includes("AM") || timeStr.includes("PM")) {
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const period = timeMatch[3];
            if (period === "PM" && hours !== 12) hours += 12;
            if (period === "AM" && hours === 12) hours = 0;
            time = `${hours.toString().padStart(2, "0")}:${minutes}`;
          }
        } else {
          time = formatTime(timeStr);
        }
        return time ? `${formattedDate} ${time}` : "";
      };

      // Helper function to calculate payable hours (8 hours for Present, 0 for others)
      const calculatePayableHours = (status, totalHours) => {
        if (status === "Present" && totalHours) {
          // Extract hours from totalHours string
          const match = totalHours.match(/(\d+)h\s*(\d+)m/);
          if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            // If total hours >= 8, payable is 8:00, otherwise use actual hours
            if (hours > 8 || (hours === 8 && minutes > 0)) {
              return "08:00";
            } else {
              return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;
            }
          }
          return "08:00"; // Default to 8 hours for Present
        }
        return "00:00";
      };

      // Helper function to calculate overtime (hours beyond 8:00)
      const calculateOvertime = (status, totalHours, payableHours) => {
        if (status !== "Present" || !totalHours || payableHours === "00:00")
          return "00:00";

        // Extract hours and minutes from totalHours
        const totalMatch = totalHours.match(/(\d+)h\s*(\d+)m/);
        if (totalMatch) {
          const totalH = parseInt(totalMatch[1]);
          const totalM = parseInt(totalMatch[2]);
          const totalMinutes = totalH * 60 + totalM;

          // Extract from payableHours (format: HH:MM)
          const payableParts = payableHours.split(":");
          const payableH = parseInt(payableParts[0]) || 0;
          const payableM = parseInt(payableParts[1]) || 0;
          const payableMinutes = payableH * 60 + payableM;

          // Calculate overtime
          const otMinutes = totalMinutes - payableMinutes;
          if (otMinutes > 0) {
            const otHours = Math.floor(otMinutes / 60);
            const otMins = otMinutes % 60;
            return `${otHours.toString().padStart(2, "0")}:${otMins
              .toString()
              .padStart(2, "0")}`;
          }
        }
        return "00:00";
      };

      // Format data for CSV - match the image format
      const csvData = allAttendance.map((record) => {
        const formattedDate = formatDate(record.date);
        const firstCheckIn = formatDateTime(record.date, record.firstPunch);
        const lastCheckOut = formatDateTime(record.date, record.lastPunch);
        const totalHours = formatTime(record.totalHours);
        const payableHours = calculatePayableHours(
          record.status,
          record.totalHours
        );
        const overtime = calculateOvertime(
          record.status,
          record.totalHours,
          payableHours
        );

        return {
          Employee: employeeInfo?.name || "",
          "Employee N": employeeInfo?.name || "",
          Date: formattedDate,
          "First Check-In": firstCheckIn,
          "Last Check-Out": lastCheckOut,
          "Check-in": "", // Empty as per image
          "Check-out": "", // Empty as per image
          "Check-in L": "", // Check-in Location - empty as per image
          "Check-out L": "", // Check-out Location - empty as per image
          "Total Hours": totalHours,
          "Payable Hours": payableHours,
          Overtime: overtime,
          Deviation: "", // Empty as per image
          Status: record.status || "",
          "Shift(s)": record.shift || "",
          Reason: "", // Empty as per image
          Description: "", // Empty as per image
        };
      });

      // Add total row (matching image format - "Total" in Check-out L column)
      const totalRow = {
        Employee: "",
        "Employee N": "",
        Date: "",
        "First Check-In": "",
        "Last Check-Out": "",
        "Check-in": "",
        "Check-out": "",
        "Check-in L": "",
        "Check-out L": "Total", // "Total" text in this column as per image
        "Total Hours": "", // Will calculate below
        "Payable Hours": "", // Will calculate below
        Overtime: "", // Will calculate below
        Deviation: "00:00",
        Status: "",
        "Shift(s)": "",
        Reason: "",
        Description: "",
      };

      // Calculate totals
      let totalHoursSum = 0;
      let payableHoursSum = 0;
      let overtimeSum = 0;

      csvData.forEach((row) => {
        if (row["Total Hours"]) {
          const [h, m] = row["Total Hours"].split(":").map(Number);
          totalHoursSum += (h || 0) * 60 + (m || 0);
        }
        if (row["Payable Hours"]) {
          const [h, m] = row["Payable Hours"].split(":").map(Number);
          payableHoursSum += (h || 0) * 60 + (m || 0);
        }
        if (row["Overtime"]) {
          const [h, m] = row["Overtime"].split(":").map(Number);
          overtimeSum += (h || 0) * 60 + (m || 0);
        }
      });

      const formatMinutes = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}`;
      };

      totalRow["Total Hours"] = formatMinutes(totalHoursSum);
      totalRow["Payable Hours"] = formatMinutes(payableHoursSum);
      totalRow["Overtime"] = formatMinutes(overtimeSum);

      // Add total row to CSV data
      csvData.push(totalRow);

      // Convert to CSV
      const csv = Papa.unparse(csvData);

      // Download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `attendance_${employeeInfo?.name || "employee"}_${submittedPeriod}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      setError("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const options = generateMonthOptions(selectedYear);
    setMonthOptions(options);

    if (options.length > 0) {
      // Keep current month if available
      const isValid = options.some((opt) => opt.value === selectedMonth);
      if (!isValid) {
        setSelectedMonth(options[0].value);
        setSubmittedPeriod(options[0].value); // update submitted period to trigger API
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  useEffect(() => {
    if (employeeId && submittedPeriod) {
      fetchEmployeeAttendance();
    }
  }, [employeeId, currentPage, itemsPerPage, submittedPeriod]);

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      Present: "bg-emerald-50 text-emerald-700",
      Absent: "bg-rose-50 text-rose-700",
      "Week Off": "bg-people-blue/10 text-people-blue",
      Holiday: "bg-amber-50 text-amber-700",
      "Half Day": "bg-sky-50 text-sky-700",
      "On Duty": "bg-violet-50 text-violet-700",
    };

    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getRowClass = (rowClass) => {
    const classMap = {
      present: "hover:bg-gray-50",
      absent: "hover:bg-gray-50",
      weekend: "bg-gray-50 hover:bg-gray-100",
      holiday: "bg-amber-50 hover:bg-amber-100",
    };
    return classMap[rowClass] || "hover:bg-gray-50";
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Scrollable Content Wrapper */}
      <div
        style={{ background: "#e9eff5" }}
        className="flex-1 overflow-y-auto p-3 sm:p-1 md:p-1"
      >
        {/* <div className="max-w-7xl mx-auto"></div> */}
        {/* <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8"> */}
        {/* <div className="max-w-7xl mx-auto"> */}
        {/* Filters Row */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4"> */}
        <div className="p-4 md:p-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Year + Month */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {/* Year Dropdown */}
            <div className="relative min-w-[120px] sm:min-w-[140px]">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#011748] text-xs sm:text-sm text-gray-700 whitespace-nowrap w-full justify-between"
              >
                <span>{selectedYear}</span>
                <IoChevronDown className={`w-4 h-4 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Year Dropdown Menu */}
              {showYearDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowYearDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 sm:right-auto sm:left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {generateYearOptions().map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                          setSubmittedPeriod(null);
                          setAttendanceData([]);
                        }}
                        className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 ${
                          selectedYear === year ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Month Dropdown */}
            <div className="relative min-w-[160px] sm:min-w-[180px]">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#011748] text-xs sm:text-sm text-gray-700 whitespace-nowrap w-full justify-between"
              >
                <span className="truncate">{monthOptions.find(opt => opt.value === selectedMonth)?.label || 'Select Month'}</span>
                <IoChevronDown className={`w-4 h-4 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Month Dropdown Menu */}
              {showMonthDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMonthDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 sm:right-auto sm:left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {monthOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedMonth(option.value);
                          setSubmittedPeriod(option.value);
                          setAttendanceData([]);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 ${
                          selectedMonth === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowSummary((prev) => !prev)}
              className="px-3 py-2  bg-[#011748] text-white rounded-lg text-sm font-medium hover:bg-[#011748de] transition shadow w-full sm:w-auto"
            >
              {showSummary ? "Hide Summary" : "Show Summary"}
            </button>
            <button
              onClick={handleExportExcel}
              // disabled={!submittedPeriod || loading}
              className="px-5 py-2 bg-[#011748] text-white rounded-lg font-semibold hover:bg-[#011748]/90 transition-colors flex items-center gap-1 text-sm"
            >
              Export CSV
            </button>
            {/* <button
              onClick={handleExportExcel}
              disabled={!submittedPeriod || loading}
              // className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow w-full sm:w-auto ${
              //   !submittedPeriod || loading
              //     ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              //     : "bg-green-600 hover:bg-green-700 text-white"
              // }`}
              className="px-2 py-1 bg-[#011748] text-white rounded-lg font-semibold hover:bg-[#011748]/90 transition-colors flex items-center"
            >
              Export CSV
            </button> */}
          </div>
        </div>

        {/* Summary */}
        {showSummary && (
          <div>
            <div className="p-6 border-b border-gray-200 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-700">Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-700">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-700">Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-700">On Duty</span>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Payable Days */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-700 font-medium mb-1">
                  Total Payable Days
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {summary.total_payable_days}
                </div>
              </div>

              {/* Total Present Days */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-700 font-medium mb-1">
                  Total Present Days
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {summary.total_present_days}
                </div>
              </div>

              {/* Paid Leaves */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-1">
                  Paid Leaves
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {summary.paid_leaves}
                </div>
              </div>

              {/* Unpaid Leave */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-red-700 font-medium mb-1">
                  Unpaid Leave / Absent
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {summary.unpaid_leave_absent}
                </div>
              </div>

              {/* Total Holidays */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="text-sm text-amber-700 font-medium mb-1">
                  Total Holidays
                </div>
                <div className="text-2xl font-bold text-amber-900">
                  {summary.total_holidays}
                </div>
              </div>

              {/* Total Weekends */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-700 font-medium mb-1">
                  Total Weekends
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.total_weekends}
                </div>
              </div>

              {/* Total OT */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-700 font-medium mb-1">
                  Total Overtime Earned
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {summary.total_overtime_earned}
                </div>
              </div>

              {/* Comp Off */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-700 font-medium mb-1">
                  Comp-Off (Credit/Used)
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.comp_off_credited} / {summary.comp_off_used}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Period Info */}
        {/* {submittedPeriod &&
                (() => {
                  const [year, month] = submittedPeriod.split("-");
                  const monthNum = parseInt(month);
                  const yearNum = parseInt(year);
                  const months = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
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
                        Showing attendance records from{" "}
                        <span className="font-semibold">
                          26 {months[startMonth - 1]} {startYear}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold">
                          25 {months[monthNum - 1]} {yearNum}
                        </span>
                      </p>
                    </div>
                  );
                })()} */}
        {/* </div> */}

        {/* Pagination & Items Per Page Top */}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <DataTable
            columns={columns}
            data={attendanceData}
            renderRow={(row, index) => (
              <tr key={index} className="ui-row">
                <td className="ui-td customtd">{index + 1}</td>
                <td className="ui-td customtd">{row.workDay || "—"}</td>
                <td className="ui-td customtd">{row.date || "—"}</td>
                <td className="ui-td customtd">{row.firstPunch || "—"}</td>
                <td className="ui-td customtd">{row.lastPunch || "—"}</td>
                <td className="ui-td customtd">{row.totalHours || "—"}</td>

                <td className="ui-td customtd">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="ui-td customtd">{row.shift || "—"}</td>
                <td className="ui-td customtd">{row.ot || "—"}</td>
              </tr>
            )}
            pagination={
              submittedPeriod &&
              !loading &&
              paginatedResult.totalPages > 0 && (
                <div className="ui-pagination">
                  {/* INFO */}
                  <div className="ui-pagination-info">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      pagination.total_items
                    )}{" "}
                    of {pagination.total_items} results
                  </div>

                  {/* CONTROLS */}
                  <div className="ui-pagination-controls">
                    {/* PREVIOUS */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.has_previous}
                      className="ui-page-btn"
                    >
                      Previous
                    </button>

                    {/* PAGE NUMBERS */}
                    {(() => {
                      const pages = [];
                      const maxVisible = 7;

                      let startPage = Math.max(
                        1,
                        pagination.current_page - Math.floor(maxVisible / 2)
                      );
                      let endPage = Math.min(
                        pagination.total_pages,
                        startPage + maxVisible - 1
                      );

                      if (endPage - startPage < maxVisible - 1) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }

                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            className="ui-page-btn"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span
                              key="dots-start"
                              className="px-2 text-slate-400"
                            >
                              …
                            </span>
                          );
                        }
                      }

                      for (let page = startPage; page <= endPage; page++) {
                        pages.push(
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`ui-page-btn ${
                              pagination.current_page === page ? "active" : ""
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }

                      if (endPage < pagination.total_pages) {
                        if (endPage < pagination.total_pages - 1) {
                          pages.push(
                            <span
                              key="dots-end"
                              className="px-2 text-slate-400"
                            >
                              …
                            </span>
                          );
                        }
                        pages.push(
                          <button
                            key={pagination.total_pages}
                            onClick={() =>
                              setCurrentPage(pagination.total_pages)
                            }
                            className="ui-page-btn"
                          >
                            {pagination.total_pages}
                          </button>
                        );
                      }

                      return pages;
                    })()}

                    {/* NEXT */}
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(pagination.total_pages, p + 1)
                        )
                      }
                      disabled={!pagination.has_next}
                      className="ui-page-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )
            }
          />
        </div>
        <div className="h-10 sm:h-12"></div>
      </div>
    </div>
  );
};

export default MyAttendanceComponent;
