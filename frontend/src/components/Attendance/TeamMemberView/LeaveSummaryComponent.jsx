import React, { useState, useEffect } from 'react';
import { IoArrowBack, IoCalendarOutline, IoChevronDown } from 'react-icons/io5';
import { Calendar, Coffee, AlertCircle, Umbrella, CalendarDays } from 'lucide-react';
import { getLeaveSummary } from '../../../utils/attendance/apiUtils';
import DataTable from '../../../components/Common/DataTable';
import '../../../Styles/tableDesign.css';

export default function LeaveSummaryComponent({ employeeId, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [submittedYear, setSubmittedYear] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [absentDays, setAbsentDays] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [pastLeaves, setPastLeaves] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [pastHolidays, setPastHolidays] = useState([]);
  const [summary, setSummary] = useState({
    total_absent_days: 0,
    total_upcoming_leaves: 0,
    total_past_leaves: 0,
    total_upcoming_holidays: 0,
    total_past_holidays: 0
  });

  // Pagination states for each table
  const [absentDaysPage, setAbsentDaysPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const itemsPerPage = 6;

  // Table expansion states
  const [absentDaysExpanded, setAbsentDaysExpanded] = useState(false);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [pastExpanded, setPastExpanded] = useState(false);

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

  // Fetch employee info on mount
  useEffect(() => {
    if (employeeId && !employeeInfo) {
      fetchEmployeeInfo();
    }
  }, [employeeId]);

  // Fetch leave summary when year is submitted
  useEffect(() => {
    if (employeeId && submittedYear) {
      fetchLeaveSummary();
    }
  }, [employeeId, submittedYear]);

  const fetchEmployeeInfo = async () => {
    if (!employeeId) return;
    
    try {
      // Fetch with current year to get employee info
      const result = await getLeaveSummary(employeeId, { year: new Date().getFullYear() });
      
      if (result.employee) {
        setEmployeeInfo(result.employee);
      }
    } catch (err) {
      console.error('Error fetching employee info:', err);
    }
  };

  const fetchLeaveSummary = async () => {
    if (!employeeId || !submittedYear) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use submitted year
      const result = await getLeaveSummary(employeeId, { year: submittedYear });
      
      console.log('Leave summary fetched:', result);
      
      if (result.employee && !employeeInfo) {
        setEmployeeInfo(result.employee);
      }
      
      setAbsentDays(result.absent_days || []);
      setUpcomingLeaves(result.upcoming_leaves || []);
      setPastLeaves(result.past_leaves || []);
      setUpcomingHolidays(result.upcoming_holidays || []);
      setPastHolidays(result.past_holidays || []);
      setSummary(result.summary || {
        total_absent_days: 0,
        total_upcoming_leaves: 0,
        total_past_leaves: 0,
        total_upcoming_holidays: 0,
        total_past_holidays: 0
      });
    } catch (err) {
      console.error('Error fetching leave summary:', err);
      setError('Failed to load leave summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedYear) {
      setSubmittedYear(selectedYear);
      setAbsentDays([]);
      setUpcomingLeaves([]);
      setPastLeaves([]);
      setUpcomingHolidays([]);
      setPastHolidays([]);
      setSummary({
        total_absent_days: 0,
        total_upcoming_leaves: 0,
        total_past_leaves: 0,
        total_upcoming_holidays: 0,
        total_past_holidays: 0
      });
      // Reset pagination
      setAbsentDaysPage(1);
      setUpcomingPage(1);
      setPastPage(1);
      // Collapse all tables
      setAbsentDaysExpanded(false);
      setUpcomingExpanded(false);
      setPastExpanded(false);
      setError(null);
      
      // Directly fetch data instead of relying on useEffect
      // This ensures data is fetched even if the same year is selected twice
      setLoading(true);
      try {
        const result = await getLeaveSummary(employeeId, { year: selectedYear });
        
        console.log('Leave summary fetched:', result);
        
        if (result.employee && !employeeInfo) {
          setEmployeeInfo(result.employee);
        }
        
        setAbsentDays(result.absent_days || []);
        setUpcomingLeaves(result.upcoming_leaves || []);
        setPastLeaves(result.past_leaves || []);
        setUpcomingHolidays(result.upcoming_holidays || []);
        setPastHolidays(result.past_holidays || []);
        setSummary(result.summary || {
          total_absent_days: 0,
          total_upcoming_leaves: 0,
          total_past_leaves: 0,
          total_upcoming_holidays: 0,
          total_past_holidays: 0
        });
      } catch (err) {
        console.error('Error fetching leave summary:', err);
        setError('Failed to load leave summary');
      } finally {
        setLoading(false);
      }
    }
  };

  // Pagination helpers
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

  // Pagination calculations
  const absentDaysTotal = absentDays.length;
  const absentDaysTotalPages = Math.ceil(absentDaysTotal / itemsPerPage);
  const paginatedAbsentDays = absentDays.slice(
    (absentDaysPage - 1) * itemsPerPage,
    absentDaysPage * itemsPerPage
  );

  const upcomingItems = [...upcomingLeaves.map(l => ({ ...l, isLeave: true })), ...upcomingHolidays.map(h => ({ ...h, isLeave: false }))];
  const upcomingTotal = upcomingItems.length;
  const upcomingTotalPages = Math.ceil(upcomingTotal / itemsPerPage);
  const paginatedUpcoming = upcomingItems.slice(
    (upcomingPage - 1) * itemsPerPage,
    upcomingPage * itemsPerPage
  );

  const pastItems = [...pastLeaves.map(l => ({ ...l, isLeave: true })), ...pastHolidays.map(h => ({ ...h, isLeave: false }))];
  const pastTotal = pastItems.length;
  const pastTotalPages = Math.ceil(pastTotal / itemsPerPage);
  const paginatedPast = pastItems.slice(
    (pastPage - 1) * itemsPerPage,
    pastPage * itemsPerPage
  );

  return (
    <div className="flex-1 overflow-y-auto bg-transparent scrollbar-hide" style={{ background: "#e9eff5" }}>
      {/* Header */}
      
        {/* Top Bar */}
        
        
        {employeeInfo && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 pt-1.5 px-1.5">
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
                    setAbsentDays([]);
                    setUpcomingLeaves([]);
                    setPastLeaves([]);
                    setUpcomingHolidays([]);
                    setPastHolidays([]);
                    setSummary({
                      total_absent_days: 0,
                      total_upcoming_leaves: 0,
                      total_past_leaves: 0,
                      total_upcoming_holidays: 0,
                      total_past_holidays: 0
                    });
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
      

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6 px-4 py-0">
        {(() => {
          const cards = [
            {
              label: "Absent Days",
              value: summary.total_absent_days,
              icon: AlertCircle,
              color: "red",
              gradient: "from-red-500 to-pink-500"
            },
            {
              label: "Upcoming Leaves",
              value: summary.total_upcoming_leaves,
              icon: Coffee,
              color: "blue",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              label: "Past Leaves",
              value: summary.total_past_leaves,
              icon: Calendar,
              color: "green",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              label: "Upcoming Holidays",
              value: summary.total_upcoming_holidays,
              icon: Umbrella,
              color: "purple",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              label: "Past Holidays",
              value: summary.total_past_holidays,
              icon: CalendarDays,
              color: "orange",
              gradient: "from-orange-500 to-amber-500"
            }
          ];

          const colorClasses = {
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600' },
            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
            red: { bg: 'bg-red-50', text: 'text-red-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
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
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
                
                <div className="p-3">
                  {/* Icon and Label at top - left aligned */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg ${colorClass.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 ${colorClass.text}`} />
                    </div>
                    <p className="text-xs font-medium text-gray-600 leading-tight flex-1">
                      {card.label}
                    </p>
                  </div>
                  
                  {/* Value centered */}
                  <div className="text-center">
                    <p className={`text-xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                      {card.value}
                    </p>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </div>
            );
          });
        })()}
      </div>

      {/* Absent Days Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Absent Days <span className="text-sm font-normal text-gray-500">({summary.total_absent_days} days)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Unpaid absence days</p>
        </div>
          <button
            onClick={() => setAbsentDaysExpanded(!absentDaysExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label={absentDaysExpanded ? 'Collapse' : 'Expand'}
          >
            <IoChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${absentDaysExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {absentDaysExpanded && (
          <DataTable
          className="font-custom"
          columns={[
            { key: "date", label: "Date" },
            { key: "duration", label: "Duration" },
            { key: "status", label: "Status" },
          ]}
          data={paginatedAbsentDays}
          renderRow={(day) => (
            <tr key={day.date_formatted} className="ui-row">
              <td className="ui-td py-2.5">{day.date_formatted}</td>
              <td className="ui-td py-2.5">{day.duration}</td>
              <td className="ui-td py-2.5">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {day.status}
                      </span>
                    </td>
                  </tr>
          )}
          emptyMessage="No absent days found"
          pagination={
            absentDaysTotal > 0 && (
              <div className="ui-pagination font-custom">
                <div className="ui-pagination-info">
                  Showing {(absentDaysPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(absentDaysPage * itemsPerPage, absentDaysTotal)} of{" "}
                  {absentDaysTotal} results
                </div>

                <div className="ui-pagination-controls">
                  <button
                    className="ui-page-btn"
                    disabled={absentDaysPage === 1}
                    onClick={() => setAbsentDaysPage(absentDaysPage - 1)}
                  >
                    Previous
                  </button>

                  {getPaginationRange(absentDaysPage, absentDaysTotalPages).map(
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
                            absentDaysPage === page ? "active" : ""
                          }`}
                          onClick={() => setAbsentDaysPage(page)}
                        >
                          {page}
                        </button>
                      )
                  )}

                  <button
                    className="ui-page-btn"
                    disabled={absentDaysPage === absentDaysTotalPages}
                    onClick={() => setAbsentDaysPage(absentDaysPage + 1)}
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

      {/* Upcoming Leaves Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Leaves & Holidays <span className="text-sm font-normal text-gray-500">({summary.total_upcoming_leaves + summary.total_upcoming_holidays} items)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Approved leaves and upcoming holidays</p>
        </div>
          <button
            onClick={() => setUpcomingExpanded(!upcomingExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label={upcomingExpanded ? 'Collapse' : 'Expand'}
          >
            <IoChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${upcomingExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {upcomingExpanded && (
          <DataTable
            className="font-custom"
            columns={[
              { key: "date", label: "Date" },
              { key: "type", label: "Type" },
              { key: "duration", label: "Duration" },
              { key: "status", label: "Status" },
            ]}
            data={paginatedUpcoming}
            renderRow={(item, index) => (
              <tr key={item.isLeave ? `leave-${index}` : `holiday-${index}`} className="ui-row">
                <td className="ui-td py-2.5">{item.date_formatted}</td>
                <td className="ui-td py-2.5">
                  {item.isLeave ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                      {item.leave_type}
                      </div>
                  ) : (
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-purple-500" />
                      {item.holiday_name}
                      </div>
                  )}
                    </td>
                <td className="ui-td py-2.5">{item.isLeave ? item.duration : '—'}</td>
                <td className="ui-td py-2.5">
                  {item.isLeave ? (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  ) : (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        Holiday
                      </span>
                  )}
                  </td>
                </tr>
              )}
            emptyMessage="No upcoming leaves or holidays"
            pagination={
              upcomingTotal > 0 && (
                <div className="ui-pagination font-custom">
                  <div className="ui-pagination-info">
                    Showing {(upcomingPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(upcomingPage * itemsPerPage, upcomingTotal)} of{" "}
                    {upcomingTotal} results
                  </div>

                  <div className="ui-pagination-controls">
                    <button
                      className="ui-page-btn"
                      disabled={upcomingPage === 1}
                      onClick={() => setUpcomingPage(upcomingPage - 1)}
                    >
                      Previous
                    </button>

                    {getPaginationRange(upcomingPage, upcomingTotalPages).map(
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
                              upcomingPage === page ? "active" : ""
                            }`}
                            onClick={() => setUpcomingPage(page)}
                          >
                            {page}
                          </button>
                        )
                    )}

                    <button
                      className="ui-page-btn"
                      disabled={upcomingPage === upcomingTotalPages}
                      onClick={() => setUpcomingPage(upcomingPage + 1)}
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

      {/* Past Leaves Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Past Leave & Holidays <span className="text-sm font-normal text-gray-500">({summary.total_past_leaves + summary.total_past_holidays} items)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Approved leaves and past holidays</p>
        </div>
          <button
            onClick={() => setPastExpanded(!pastExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label={pastExpanded ? 'Collapse' : 'Expand'}
          >
            <IoChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${pastExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {pastExpanded && (
          <DataTable
          className="font-custom"
          columns={[
            { key: "date", label: "Date" },
            { key: "type", label: "Type" },
            { key: "duration", label: "Duration" },
            { key: "status", label: "Status" },
          ]}
          data={paginatedPast}
          renderRow={(item, index) => (
            <tr key={item.isLeave ? `past-leave-${index}` : `past-holiday-${index}`} className="ui-row">
              <td className="ui-td py-2.5">{item.date_formatted}</td>
              <td className="ui-td py-2.5">
                {item.isLeave ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                    {item.leave_type}
                      </div>
                ) : (
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4 text-purple-500" />
                    {item.holiday_name}
                      </div>
                )}
                    </td>
              <td className="ui-td py-2.5">{item.isLeave ? item.duration : '—'}</td>
              <td className="ui-td py-2.5">
                {item.isLeave ? (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {item.status}
                  </span>
                ) : (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        Holiday
                      </span>
                )}
                  </td>
                </tr>
              )}
          emptyMessage="No past leaves or holidays"
          pagination={
            pastTotal > 0 && (
              <div className="ui-pagination font-custom">
                <div className="ui-pagination-info">
                  Showing {(pastPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(pastPage * itemsPerPage, pastTotal)} of{" "}
                  {pastTotal} results
                </div>

                <div className="ui-pagination-controls">
                  <button
                    className="ui-page-btn"
                    disabled={pastPage === 1}
                    onClick={() => setPastPage(pastPage - 1)}
                  >
                    Previous
                  </button>

                  {getPaginationRange(pastPage, pastTotalPages).map(
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
                            pastPage === page ? "active" : ""
                          }`}
                          onClick={() => setPastPage(page)}
                        >
                          {page}
                        </button>
                      )
                  )}

                  <button
                    className="ui-page-btn"
                    disabled={pastPage === pastTotalPages}
                    onClick={() => setPastPage(pastPage + 1)}
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

