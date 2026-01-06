import React, { useState, useEffect } from "react";
import { IoArrowBack, IoChevronDown } from "react-icons/io5";
import DataTable from "../../Common/DataTable";
import "../../../styles/tableDesign.css";
import Papa from "papaparse";
import { getEmployeeRegularizationRequests } from "../../../utils/attendance/apiUtils";
// import { useNavigate } from "react-router-dom";
import RegularizationDrawer from "./RegularizationFormComponent";

export default function EmployeeRegularizationComponent({ employeeId, onBack }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthOptions, setMonthOptions] = useState([]);
  const [activePeriod, setActivePeriod] = useState("");
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
    has_previous: false,
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // NEW: drawer state
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let y = currentYear; y >= 2024; y--) arr.push(y);
    return arr;
  };

  const generateMonthOptions = (year) => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;

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

    const maxMonth = year === thisYear ? thisMonth : 12;

    return Array.from({ length: maxMonth }, (_, i) => ({
      value: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: `${months[i]} ${year}`,
    }));
  };

  // Set initial month on mount
  useEffect(() => {
    const opts = generateMonthOptions(selectedYear);
    setMonthOptions(opts);
    const thisMonth = `${selectedYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(thisMonth);
    setActivePeriod(thisMonth);
  }, []);

  // Update months when year changes
  useEffect(() => {
    const opts = generateMonthOptions(selectedYear);
    setMonthOptions(opts);

    const valid = opts.some((o) => o.value === selectedMonth);
    const newMonth = valid ? selectedMonth : opts[opts.length - 1].value;

    setSelectedMonth(newMonth);
    setActivePeriod(newMonth);
    setCurrentPage(1);
  }, [selectedYear]);

  // Auto-fetch whenever month changes
  useEffect(() => {
    if (selectedMonth) {
      setActivePeriod(selectedMonth);
      setCurrentPage(1);
    }
  }, [selectedMonth]);

  // Fetch employee info once
  useEffect(() => {
    if (employeeId) fetchEmployeeInfo();
  }, [employeeId]);

  useEffect(() => {
    if (employeeId && activePeriod) fetchRegularizationRequests();
  }, [employeeId, activePeriod, currentPage, itemsPerPage]);

  const fetchEmployeeInfo = async () => {
    try {
      const result = await getEmployeeRegularizationRequests(employeeId, {
        page: 1,
        page_size: 1,
      });
      setEmployeeInfo(result.employee);
    } catch (err) {
      console.error(err);
    }
  };
  

  const fetchRegularizationRequests = async () => {
    if (!activePeriod) return;

    setLoading(true);
    setError(null);

    try {
      const [year, month] = activePeriod.split("-");
      const m = parseInt(month);
      const y = parseInt(year);

      let startMonth = m - 1,
        startYear = y;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = y - 1;
      }

      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        start_date: `${startYear}-${String(startMonth).padStart(2, "0")}-26`,
        end_date: `${y}-${String(m).padStart(2, "0")}-25`,
      };

      const result = await getEmployeeRegularizationRequests(employeeId, params);

      setRequestsData(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      console.error(err);
      setRequestsData([]);
      setError("Failed to load regularization requests");
    } finally {
      setLoading(false);
    }
  };

const columns = [
  { key: "sno", label: "S.No" },
  { key: "date", label: "Worked Day" },
  { key: "old_hours", label: "Present Hours Old" },
  { key: "new_hours", label: "Present Hours New" },
  { key: "old_status", label: "Old Status" },
  { key: "new_status", label: "New Status" },
  { key: "reason", label: "Reason" },
  { key: "approval_status", label: "Approval Status" },
  // { key: "actions", label: "Action" },
];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        minHeight: "45px", // slightly taller header
      },
    },
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: "bold",
        textTransform: "uppercase",
        color: "#2a2a30ff",
        paddingLeft: "12px",
        paddingRight: "12px",
        lineHeight: "20px",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
      },
    },
  };
// ===============================
// CSV Formatting Helpers
// ===============================
const formatDateForCSV = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
};

const formatTimeForCSV = (timeStr) => {
  if (!timeStr) return "";
  // If already HH:mm
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  const date = new Date(timeStr);
  if (isNaN(date)) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const exportToCSV = async () => {


  if (!employeeId) {
    alert("Employee ID missing");
    return;
  }

  if (!activePeriod) {
    alert("Please select period");
    return;
  }

  try {
    setLoading(true);
    // console.log("Starting CSV export...");

    const [year, month] = activePeriod.split("-");
    // console.log("Parsed period:", year, month);

    const yearNum = Number(year);
    const monthNum = Number(month);

    let startMonth = monthNum - 1;
    let startYear = yearNum;

    if (startMonth === 0) {
      startMonth = 12;
      startYear -= 1;
    }

    const startDate = `${startYear}-${String(startMonth).padStart(2, "0")}-26`;
    const endDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-25`;

    // console.log("Date range:", startDate, endDate);

    let allRequests = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      // console.log("Fetching page:", page);

      const res = await getEmployeeRegularizationRequests(employeeId, {
        page,
        page_size: 100,
        start_date: startDate,
        end_date: endDate,
      });

      // console.log("API response:", res);

      allRequests.push(...(res?.data || []));
      hasMore = Boolean(res?.pagination?.has_next);
      page++;
    }

    // console.log("Total records:", allRequests.length);

    if (allRequests.length === 0) {
      alert("No data found for selected period");
      setLoading(false);
      return;
    }

    const rows = allRequests.map((r) => ({
      "Employee Name": employeeInfo?.name || "",
      "Attendance Date": formatDateForCSV(r?.date || ""),
      "Old Check-In": formatTimeForCSV(r?.old_check_in || ""),
      "New Check-In": formatTimeForCSV(r?.corrected_check_in || ""),
      Status: r?.status || "",
    }));

    const csv = Papa.unparse(rows);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "regularization.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("CSV downloaded successfully");
  } catch (e) {
    console.error("CSV export failed:", e);
    alert("Export failed");
  } finally {
    setLoading(false);
  }
};

  const handleExportExcel = () => {
    console.log('jjjjjjj')
    exportToCSV();
  };

  return (
    <div className="p-1 overflow-x-auto rounded-lg">
      <div className="py-2 px-1 sm:py-2 md:py-2 flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4">
        <div className="relative">
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#011748] text-xs sm:text-sm font-medium text-gray-700"
          >
            <span>{selectedYear}</span>
            <IoChevronDown
              className={`w-4 h-4 transition-transform ${
                showYearDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showYearDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowYearDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-48 max-h-60 overflow-y-auto">
                {generateYearOptions().map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setSelectedYear(y);
                      setShowYearDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm ${
                      selectedYear === y
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative min-w-[120px] sm:min-w-[140px]">
          <button
            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#011748] text-xs sm:text-sm font-medium text-gray-700"
          >
            <span>
              {monthOptions.find((m) => m.value === selectedMonth)?.label ||
                "Select Month"}
            </span>
            <IoChevronDown
              className={`w-4 h-4 transition-transform ${
                showMonthDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showMonthDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMonthDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-56 max-h-60 overflow-y-auto">
                {monthOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedMonth(opt.value);
                      setShowMonthDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm ${
                      selectedMonth === opt.value
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
          {/* Open drawer instead of navigation */}
          <button 
            onClick={() => setDrawerOpen(true)}
            className="px-3 py-2 text-white bg-[#011748] rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Regularization Request
          </button>
          <button
            onClick={handleExportExcel}
            className="px-5 py-2 bg-[#011748] text-white rounded-lg font-semibold hover:bg-[#011748]/90 transition-colors flex items-center gap-1 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
     <DataTable
  className="font-custom"
  columns={columns}
  data={requestsData}
  renderRow={(row, index) => (
    <tr key={row.request_id} className="ui-row">
      <td className="ui-td customtd">
        {(pagination.current_page - 1) * pagination.page_size + index + 1}
      </td>

      <td className="ui-td customtd">{row.date || "—"}</td>
      <td className="ui-td customtd">{row.old_hours || "—"}</td>
      <td className="ui-td customtd">{row.new_hours || "—"}</td>
      <td className="ui-td customtd">{row.old_status || "—"}</td>
      <td className="ui-td customtd">{row.new_status || "—"}</td>

      <td className="ui-td customtd max-w-[220px] truncate">
        {row.reason || "—"}
      </td>

      <td className="ui-td customtd">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-people-blue/10 text-people-blue">
          {row.approval_status || "Pending"}
        </span>
      </td>
{/* 
      <td className="ui-td">
        <button
          onClick={() => alert(`View Request: ${row.request_id}`)}
          className="ui-action-btn"
        >
          View →
        </button>
      </td> */}
    </tr>
  )}
  pagination={
    pagination.total_items > 0 && (
      <div className="ui-pagination font-custom">
        <div className="ui-pagination-info">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, pagination.total_items)} of{" "}
          {pagination.total_items} results
        </div>

        <div className="ui-pagination-controls">
          <button
            className="ui-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                className={`ui-page-btn ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            className="ui-page-btn"
            disabled={!pagination.has_next}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    )
  }
/>

      </div>

      {/* Drawer */}
      <RegularizationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
