import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getDashboardOverview, getHolidays } from '../../../utils/attendance/apiUtils';

const AttendanceDashboard = () => {
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedHolidayYear, setSelectedHolidayYear] = useState(new Date().getFullYear());
    
    // Collapsible states
    const [holidaysCollapsed, setHolidaysCollapsed] = useState(true);
    const [weeklyCollapsed, setWeeklyCollapsed] = useState(true);
    const [heatmapCollapsed, setHeatmapCollapsed] = useState(true);

    // Dashboard data from API
    const [dashboardData, setDashboardData] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeaveToday: 0,
        absentToday: 0,
        pendingLeaveApprovals: 0,
        pendingRegularizationApprovals: 0,
        pendingCompensatoryApprovals: 0,
    });
    const [dashboardLoading, setDashboardLoading] = useState(true);

    // Holidays data from API
    const [holidays, setHolidays] = useState([]);
    const [holidaysLoading, setHolidaysLoading] = useState(true);
    const [availableYears, setAvailableYears] = useState([]);

    const currentYear = new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get holidays for selected year
    const selectedYearHolidays = holidays
        .filter(h => h.year === selectedHolidayYear)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fetch dashboard overview data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setDashboardLoading(true);
                const data = await getDashboardOverview();
                setDashboardData(data);
            } catch (error) {
                console.error('Error fetching dashboard overview:', error);
            } finally {
                setDashboardLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Fetch holidays data
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                setHolidaysLoading(true);
                const holidaysData = await getHolidays();
                setHolidays(holidaysData);
                
                const years = [...new Set(holidaysData.map(h => h.year))].sort();
                setAvailableYears(years);
                
                if (years.length > 0) {
                    const currentYear = new Date().getFullYear();
                    if (years.includes(currentYear)) {
                        setSelectedHolidayYear(currentYear);
                    } else if (!years.includes(selectedHolidayYear)) {
                        setSelectedHolidayYear(years[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching holidays:', error);
            } finally {
                setHolidaysLoading(false);
            }
        };
        fetchHolidays();
    }, []);

    // Calculate donut chart values
    const overviewTotal = dashboardData.presentToday + dashboardData.onLeaveToday + dashboardData.absentToday;
    const presentPercentage = overviewTotal > 0 ? (dashboardData.presentToday / overviewTotal) * 100 : 0;
    const onLeavePercentage = overviewTotal > 0 ? (dashboardData.onLeaveToday / overviewTotal) * 100 : 0;
    const absentPercentage = overviewTotal > 0 ? (dashboardData.absentToday / overviewTotal) * 100 : 0;

    const pendingTotal = dashboardData.pendingLeaveApprovals + dashboardData.pendingRegularizationApprovals + dashboardData.pendingCompensatoryApprovals;
    const leaveRequestsPercentage = pendingTotal > 0 ? (dashboardData.pendingLeaveApprovals / pendingTotal) * 100 : 0;
    const regularizationPercentage = pendingTotal > 0 ? (dashboardData.pendingRegularizationApprovals / pendingTotal) * 100 : 0;
    const compensatoryPercentage = pendingTotal > 0 ? (dashboardData.pendingCompensatoryApprovals / pendingTotal) * 100 : 0;

    // Donut chart calculations
    const donutRadius = 100; // Increased from 90 to make inner hole bigger
    const circumference = 2 * Math.PI * donutRadius;
    const presentDashArray = `${(presentPercentage / 100) * circumference} ${circumference}`;
    const onLeaveDashArray = `${(onLeavePercentage / 100) * circumference} ${circumference}`;
    const absentDashArray = `${(absentPercentage / 100) * circumference} ${circumference}`;
    const onLeaveOffset = -((presentPercentage / 100) * circumference);
    const absentOffset = onLeaveOffset - ((onLeavePercentage / 100) * circumference);

    const leaveRequestsDashArray = `${(leaveRequestsPercentage / 100) * circumference} ${circumference}`;
    const regularizationDashArray = `${(regularizationPercentage / 100) * circumference} ${circumference}`;
    const compensatoryDashArray = `${(compensatoryPercentage / 100) * circumference} ${circumference}`;
    const regularizationOffset = -((leaveRequestsPercentage / 100) * circumference);
    const compensatoryOffset = regularizationOffset - ((regularizationPercentage / 100) * circumference);

    // Weekly attendance data
    const weeklyData = [
        { day: 'Mon', value: 220 },
        { day: 'Tue', value: 215 },
        { day: 'Wed', value: 225 },
        { day: 'Thu', value: 218 },
        { day: 'Fri', value: 222 },
        { day: 'Sat', value: 180 },
        { day: 'Sun', value: 150 }
    ];

    const maxValue = Math.max(...weeklyData.map(d => d.value));
    const minValue = Math.min(...weeklyData.map(d => d.value));
    const range = maxValue - minValue;
    const calculatePercentage = (value) => ((value - minValue) / range) * 100;

    // Generate heatmap data
    const generateHeatmapData = (year, month) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const heatmapData = [];
        const firstDay = new Date(year, month, 1).getDay();

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            let className = 'bg-gray-200';
            if (!isWeekend) {
                const rand = Math.random();
                if (rand > 0.7) className = 'bg-emerald-500';
                else if (rand > 0.4) className = 'bg-indigo-600';
                else className = 'bg-amber-400';
            }

            heatmapData.push({
                day: i,
                className,
                isWeekend
            });
        }

        return { heatmapData, firstDay };
    };

    const { heatmapData, firstDay } = generateHeatmapData(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth()
    );

    const navigateToMonth = (direction) => {
        const newMonth = new Date(selectedMonth);
        newMonth.setMonth(selectedMonth.getMonth() + direction);
        setSelectedMonth(newMonth);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const formatHolidayDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
        return { day, month, weekday };
    };


    return (
        <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Column - 9/12 width */}
                    <div className="lg:col-span-9 space-y-4">
                        {/* Charts Section - Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* 1. OVERVIEW SECTION - Donut Chart */}
                            <div className="backdrop-blur-xl rounded-[14px] shadow-[0_4px_18px_rgba(1,23,72,0.05)] border border-white/60 p-5 hover:shadow-[0_6px_24px_rgba(1,23,72,0.1)] hover:-translate-y-[3px] hover:border-[rgba(249,183,34,0.25)] transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 252, 0.75) 100%)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 rounded" style={{ backgroundColor: '#011748' }}></div>
                                        <h2 className="font-bold" style={{ fontSize: '18px', color: '#1e293b', letterSpacing: '-0.3px' }}>Overview</h2>
                                    </div>
                                    <button
                                        onClick={() => navigate('/attendance/employees')}
                                        className="flex items-center gap-1 transition-colors hover:text-[#f9b722]"
                                        style={{ fontSize: '11px', fontWeight: 500, color: '#011748' }}
                                    >
                                        <FiUsers className="w-3.5 h-3.5" />
                                        All Employees
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {/* Donut Chart */}
                                    <div className="relative flex-shrink-0" style={{ width: '180px', height: '180px', filter: 'drop-shadow(0 4px 12px rgba(1, 23, 72, 0.08))' }}>
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240" style={{ position: 'relative', zIndex: 1 }}>
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                style={{ stroke: '#e5e7eb', pointerEvents: 'none' }}
                                            />
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                strokeDasharray={presentDashArray}
                                                strokeDashoffset="0"
                                                style={{ stroke: '#011748', cursor: 'pointer', pointerEvents: 'auto' }}
                                                onClick={() => navigate('/attendance/present-today')}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                strokeDasharray={onLeaveDashArray}
                                                strokeDashoffset={onLeaveOffset}
                                                style={{ stroke: '#f9b722', cursor: 'pointer', pointerEvents: 'auto' }}
                                                onClick={() => navigate('/attendance/on-leave-today')}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                strokeDasharray={absentDashArray}
                                                strokeDashoffset={absentOffset}
                                                style={{ stroke: '#9ca3af', cursor: 'pointer', pointerEvents: 'auto' }}
                                                onClick={() => navigate('/attendance/absent-today')}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                        </svg>
                                        <div 
                                            className="absolute inset-0 flex items-center justify-center"
                                            style={{ zIndex: 2, pointerEvents: 'none' }}
                                            title="View All Employees"
                                        >
                                            <p 
                                                style={{ 
                                                    fontSize: '26px', 
                                                    fontWeight: 800, 
                                                    color: '#1e293b',
                                                    margin: 0,
                                                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    letterSpacing: '-0.5px',
                                                    pointerEvents: 'auto',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate('/attendance/employees');
                                                }}
                                                className="transition-transform hover:scale-105"
                                            >
                                                {overviewTotal}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Legend */}
                                    <div className="flex-1 w-full sm:w-auto space-y-2">
                                        <div 
                                            className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all hover:translate-x-1 gap-2" 
                                            style={{ background: 'transparent' }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(249, 183, 34, 0.05) 0%, transparent 100%)'} 
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => navigate('/attendance/present-today')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#011748', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}></div>
                                                <span className="text-[10px] sm:text-xs" style={{ fontWeight: 500, color: '#475569', flex: 1, minWidth: 0 }}>Present</span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs" style={{ fontWeight: 600, color: '#334155' }}>{dashboardData.presentToday}</span>
                                        </div>
                                        <div 
                                            className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all hover:translate-x-1 gap-2" 
                                            style={{ background: 'transparent' }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(249, 183, 34, 0.05) 0%, transparent 100%)'} 
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => navigate('/attendance/on-leave-today')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#f9b722', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}></div>
                                                <span className="text-[10px] sm:text-xs" style={{ fontWeight: 500, color: '#475569', flex: 1, minWidth: 0 }}>On Leave</span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs" style={{ fontWeight: 600, color: '#334155' }}>{dashboardData.onLeaveToday}</span>
                                        </div>
                                        <div 
                                            className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all hover:translate-x-1 gap-2" 
                                            style={{ background: 'transparent' }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(249, 183, 34, 0.05) 0%, transparent 100%)'} 
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => navigate('/attendance/absent-today')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#9ca3af', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}></div>
                                                <span className="text-[10px] sm:text-xs" style={{ fontWeight: 500, color: '#475569', flex: 1, minWidth: 0 }}>Absent</span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs" style={{ fontWeight: 600, color: '#334155' }}>{dashboardData.absentToday}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. PENDING REQUESTS SECTION - Donut Chart */}
                            <div className="backdrop-blur-xl rounded-[14px] shadow-[0_4px_18px_rgba(1,23,72,0.05)] border border-white/60 p-5 hover:shadow-[0_6px_24px_rgba(1,23,72,0.1)] hover:-translate-y-[3px] hover:border-[rgba(249,183,34,0.25)] transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 252, 0.75) 100%)' }}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-5 rounded" style={{ backgroundColor: '#011748' }}></div>
                                    <h2 className="font-bold" style={{ fontSize: '18px', color: '#1e293b', letterSpacing: '-0.3px' }}>Pending Requests</h2>
                                    {pendingTotal > 0 && (
                                        <span className="relative flex h-2 w-2 items-center justify-center">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#f9b722' }}></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#f9b722' }}></span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {/* Donut Chart */}
                                    <div className="relative flex-shrink-0" style={{ width: '180px', height: '180px', filter: 'drop-shadow(0 4px 12px rgba(1, 23, 72, 0.08))' }}>
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240" style={{ position: 'relative', zIndex: 2 }}>
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                style={{ stroke: '#e5e7eb', pointerEvents: 'none' }}
                                            />
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                strokeDasharray={leaveRequestsDashArray}
                                                strokeDashoffset="0"
                                                style={{ stroke: '#011748', cursor: 'pointer', pointerEvents: 'auto' }}
                                                onClick={() => navigate('/attendance/leave-requests')}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                strokeDasharray={regularizationDashArray}
                                                strokeDashoffset={regularizationOffset}
                                                style={{ stroke: '#60a5fa', cursor: 'pointer', pointerEvents: 'auto' }}
                                                onClick={() => navigate('/attendance/regularization-approvals')}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                            <circle
                                                cx="120"
                                                cy="120"
                                                r={donutRadius}
                                                fill="none"
                                                strokeWidth="35"
                                                strokeDasharray={compensatoryDashArray}
                                                strokeDashoffset={compensatoryOffset}
                                                style={{ stroke: '#fbbf24', cursor: 'pointer', pointerEvents: 'auto' }}
                                                onClick={() => navigate('/attendance/compensatory-approvals')}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
                                            <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Time Off</p>
                                            <p style={{ 
                                                fontSize: '26px', 
                                                fontWeight: 800, 
                                                color: '#1e293b',
                                                margin: 0,
                                                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                letterSpacing: '-0.5px'
                                            }}>
                                                {pendingTotal}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Legend */}
                                    <div className="flex-1 w-full sm:w-auto space-y-2">
                                        <div 
                                            className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all hover:translate-x-1 gap-2" 
                                            style={{ background: 'transparent' }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(249, 183, 34, 0.05) 0%, transparent 100%)'} 
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => navigate('/attendance/leave-requests')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#011748', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}></div>
                                                <span className="text-[10px] sm:text-xs" style={{ fontWeight: 500, color: '#475569', flex: 1, minWidth: 0 }}>Leave Requests</span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs" style={{ fontWeight: 600, color: '#334155' }}>{dashboardData.pendingLeaveApprovals}</span>
                                        </div>
                                        <div 
                                            className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all hover:translate-x-1 gap-2" 
                                            style={{ background: 'transparent' }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(249, 183, 34, 0.05) 0%, transparent 100%)'} 
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => navigate('/attendance/regularization-approvals')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#60a5fa', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}></div>
                                                <span className="text-[10px] sm:text-xs" style={{ fontWeight: 500, color: '#475569', flex: 1, minWidth: 0 }}>Regularization</span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs" style={{ fontWeight: 600, color: '#334155' }}>{dashboardData.pendingRegularizationApprovals}</span>
                                        </div>
                                        <div 
                                            className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-all hover:translate-x-1 gap-2" 
                                            style={{ background: 'transparent' }} 
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(249, 183, 34, 0.05) 0%, transparent 100%)'} 
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => navigate('/attendance/compensatory-approvals')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="rounded" style={{ width: '16px', height: '16px', backgroundColor: '#fbbf24', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' }}></div>
                                                <span className="text-[10px] sm:text-xs" style={{ fontWeight: 500, color: '#475569', flex: 1, minWidth: 0 }}>Compensatory</span>
                                            </div>
                                            <span className="text-[10px] sm:text-xs" style={{ fontWeight: 600, color: '#334155' }}>{dashboardData.pendingCompensatoryApprovals}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. HOLIDAYS SECTION – COLLAPSIBLE */}
                        <div className={`backdrop-blur-xl rounded-[14px] shadow-[0_4px_18px_rgba(1,23,72,0.05)] border border-white/60 p-5 hover:shadow-[0_6px_24px_rgba(1,23,72,0.1)] hover:-translate-y-[3px] hover:border-[rgba(249,183,34,0.25)] transition-all duration-300`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 252, 0.75) 100%)' }}>
                            <div
                                className="flex items-center justify-between cursor-pointer rounded-xl p-2 -m-2 transition-colors hover:bg-[rgba(249,183,34,0.04)]"
                                onClick={() => setHolidaysCollapsed(!holidaysCollapsed)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 rounded" style={{ backgroundColor: '#011748' }}></div>
                                    <h2 className="font-bold whitespace-nowrap" style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.3px' }}>Holidays • {selectedHolidayYear}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5 rounded-[10px] p-1" style={{ background: 'rgba(1, 23, 72, 0.06)', border: '1px solid rgba(1, 23, 72, 0.08)' }}>
                                        {holidaysLoading ? (
                                            <span className="px-3 py-1.5 text-xs text-slate-500">Loading...</span>
                                        ) : availableYears.length > 0 ? (
                                            availableYears.map((year) => (
                                                <button
                                                    key={year}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedHolidayYear(year);
                                                    }}
                                                    className="px-3.5 py-1.5 rounded-lg transition-all"
                                                    style={{
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        ...(selectedHolidayYear === year
                                                            ? {
                                                                background: 'linear-gradient(135deg, #011748 0%, #1e3a8a 100%)',
                                                                color: 'white',
                                                                boxShadow: '0 2px 8px rgba(1, 23, 72, 0.15)'
                                                            }
                                                            : {
                                                                background: 'transparent',
                                                                color: '#64748b'
                                                            })
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (selectedHolidayYear !== year) {
                                                            e.currentTarget.style.color = '#011748';
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (selectedHolidayYear !== year) {
                                                            e.currentTarget.style.color = '#64748b';
                                                            e.currentTarget.style.background = 'transparent';
                                                        }
                                                    }}
                                                >
                                                    {year}
                                                </button>
                                            ))
                                        ) : (
                                            <span className="px-3 py-1.5 text-xs text-slate-500">No years</span>
                                        )}
                                    </div>
                                    <button className="p-1 hover:bg-white/60 rounded transition-colors">
                                        {holidaysCollapsed ? (
                                            <FiChevronDown className="w-5 h-5" style={{ color: '#6b7280' }} />
                                        ) : (
                                            <FiChevronUp className="w-5 h-5" style={{ color: '#6b7280' }} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className={`overflow-hidden transition-all duration-400 ${holidaysCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 mt-4'}`}>
                                <div className="space-y-2 pt-2">
                                    {holidaysLoading ? (
                                        <div className="text-center py-8" style={{ color: '#64748b' }}>Loading holidays...</div>
                                    ) : selectedYearHolidays.length > 0 ? (
                                        selectedYearHolidays.map((holiday, index) => {
                                            const { day, month, weekday } = formatHolidayDate(holiday.date);
                                            const holidayDate = new Date(holiday.date);
                                            const isUpcoming = holidayDate >= today;
                                            
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-3.5 rounded-[10px] border hover:bg-white hover:border-[rgba(249,183,34,0.2)] hover:translate-x-[3px] transition-all"
                                                    style={{ background: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(1, 23, 72, 0.04)' }}
                                                >
                                                    <div className="flex flex-col items-center justify-center min-w-[44px] h-11 rounded-lg flex-shrink-0" style={{ background: 'rgba(1, 23, 72, 0.04)' }}>
                                                        <span className="leading-none font-bold" style={{ fontSize: '15px', color: '#011748' }}>{day}</span>
                                                        <span className="font-bold uppercase tracking-wide" style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.5px' }}>{month}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold mb-0.5" style={{ fontSize: '13px', color: '#011748' }}>{holiday.name}</h3>
                                                        <p style={{ fontSize: '11px', color: '#64748b' }}>{weekday}</p>
                                                    </div>
                                                    {isUpcoming && (
                                                        <span className="font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wide" style={{ fontSize: '9px', background: 'linear-gradient(135deg, #f9b722 0%, #fbbf24 100%)', letterSpacing: '0.4px' }}>
                                                            Upcoming
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8" style={{ color: '#64748b' }}>No holidays found for {selectedHolidayYear}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - 3/12 width */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* 4. QUICK ACTIONS */}
                        <div className="backdrop-blur-xl rounded-[14px] shadow-[0_4px_18px_rgba(1,23,72,0.05)] border border-white/60 p-4 hover:shadow-[0_6px_24px_rgba(1,23,72,0.1)] hover:-translate-y-[3px] hover:border-[rgba(249,183,34,0.25)] transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 252, 0.75) 100%)' }}>
                            <h2 className="font-bold mb-3" style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.3px' }}>Quick Actions</h2>
                            <button
                                onClick={() => navigate('/attendance/team-members')}
                                className="w-full text-white py-2.5 px-4 rounded-[10px] font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                                style={{ 
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    background: '#011748',
                                    border: '2px solid transparent',
                                    letterSpacing: '0.3px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#f9b722';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(249, 183, 34, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            >
                                <FiUsers className="w-4 h-4" />
                                Members
                            </button>
                        </div>

                        {/* 5. WEEKLY ATTENDANCE VIEW - Line Graph */}
                        <div className={`backdrop-blur-xl rounded-[14px] shadow-[0_4px_18px_rgba(1,23,72,0.05)] border border-white/60 p-4 hover:shadow-[0_6px_24px_rgba(1,23,72,0.1)] hover:-translate-y-[3px] hover:border-[rgba(249,183,34,0.25)] transition-all duration-300`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 252, 0.75) 100%)' }}>
                            <div
                                className="flex items-center justify-between cursor-pointer rounded-xl p-2 -m-2 transition-colors hover:bg-[rgba(249,183,34,0.04)] mb-2"
                                onClick={() => setWeeklyCollapsed(!weeklyCollapsed)}
                            >
                                <div>
                                    <h2 className="font-bold" style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.3px' }}>Weekly Attendance</h2>
                                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Stable vs last week</p>
                                </div>
                                <button className="p-1 hover:bg-white/60 rounded transition-colors">
                                    {weeklyCollapsed ? (
                                        <FiChevronDown className="w-5 h-5" style={{ color: '#6b7280' }} />
                                    ) : (
                                        <FiChevronUp className="w-5 h-5" style={{ color: '#6b7280' }} />
                                    )}
                                </button>
                            </div>
                            <div className={`overflow-hidden transition-all duration-400 ${weeklyCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                                <div className="relative pt-2.5" style={{ height: '208px' }}>
                                    <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                                        {/* Grid lines */}
                                        {[0, 25, 50, 75, 100, 125].map((yPos) => (
                                            <line
                                                key={yPos}
                                                x1="0"
                                                y1={150 - yPos}
                                                x2="400"
                                                y2={150 - yPos}
                                                stroke="#E5E7EB"
                                                strokeWidth="0.5"
                                                strokeDasharray="2,2"
                                            />
                                        ))}
                                        {/* Area fill */}
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#011748" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#011748" stopOpacity="0.05" />
                                            </linearGradient>
                                        </defs>
                                        <polygon
                                            fill="url(#gradient)"
                                            points={`0,150 ${weeklyData.map((d, i) => {
                                                const x = (i / (weeklyData.length - 1)) * 400;
                                                const y = 150 - calculatePercentage(d.value);
                                                return `${x},${y}`;
                                            }).join(' ')} 400,150`}
                                            opacity="0.2"
                                        />
                                        {/* Line */}
                                        <polyline
                                            fill="none"
                                            stroke="#011748"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={weeklyData.map((d, i) => {
                                                const x = (i / (weeklyData.length - 1)) * 400;
                                                const y = 150 - calculatePercentage(d.value);
                                                return `${x},${y}`;
                                            }).join(' ')}
                                        />
                                        {/* Data points */}
                                        {weeklyData.map((d, i) => {
                                            const x = (i / (weeklyData.length - 1)) * 400;
                                            const y = 150 - calculatePercentage(d.value);
                                            return (
                                                <g key={i}>
                                                    <circle cx={x} cy={y} r="6" fill="white" stroke="#011748" strokeWidth="2" />
                                                    <circle cx={x} cy={y} r="4" fill="#011748" />
                                                </g>
                                            );
                                        })}
                                    </svg>
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 font-medium" style={{ fontSize: '11px', color: '#6b7280' }}>
                                        {weeklyData.map((d, i) => (
                                            <span key={i}>{d.day}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. MONTHLY HEATMAP – COLLAPSIBLE */}
                        <div className={`backdrop-blur-xl rounded-[14px] shadow-[0_4px_18px_rgba(1,23,72,0.05)] border border-white/60 p-4 hover:shadow-[0_6px_24px_rgba(1,23,72,0.1)] hover:-translate-y-[3px] hover:border-[rgba(249,183,34,0.25)] transition-all duration-300`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 252, 0.75) 100%)' }}>
                            <div
                                className="flex items-center justify-between cursor-pointer rounded-xl p-2 -m-2 transition-colors hover:bg-[rgba(249,183,34,0.04)] mb-2"
                                onClick={() => setHeatmapCollapsed(!heatmapCollapsed)}
                            >
                                <div>
                                    <h2 className="font-bold whitespace-nowrap" style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.3px' }}>Monthly Heatmap</h2>
                                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Team overview</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateToMonth(-1);
                                        }}
                                        className="p-1 hover:bg-white/60 rounded transition-colors"
                                    >
                                        <svg className="w-3 h-3" style={{ color: '#6b7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateToMonth(1);
                                        }}
                                        className="p-1 hover:bg-white/60 rounded transition-colors"
                                    >
                                        <svg className="w-3 h-3" style={{ color: '#6b7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                    <button className="p-1 hover:bg-white/60 rounded transition-colors ml-1">
                                        {heatmapCollapsed ? (
                                            <FiChevronDown className="w-5 h-5" style={{ color: '#6b7280' }} />
                                        ) : (
                                            <FiChevronUp className="w-5 h-5" style={{ color: '#6b7280' }} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className={`overflow-hidden transition-all duration-400 ${heatmapCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                                <div className="grid grid-cols-7 gap-0.5 mb-2 max-w-[180px] mx-auto pt-2.5">
                                    {/* Empty cells for days before month starts */}
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square rounded-sm" style={{ visibility: 'hidden' }}></div>
                                    ))}
                                    {/* Heatmap cells */}
                                    {heatmapData.map((day, index) => {
                                        let bgColor = '#e5e7eb'; // weekend default
                                        if (!day.isWeekend) {
                                            if (day.className.includes('emerald')) bgColor = '#10b981';
                                            else if (day.className.includes('indigo')) bgColor = 'rgba(1, 23, 72, 0.6)';
                                            else if (day.className.includes('amber')) bgColor = '#fb923c';
                                        }
                                        
                                        return (
                                            <div
                                                key={index}
                                                className="aspect-square rounded-sm hover:opacity-80 hover:scale-110 hover:z-10 hover:shadow-lg transition-all duration-200 cursor-pointer relative group"
                                                style={{ backgroundColor: bgColor }}
                                                title={`Day ${day.day}${day.isWeekend ? ' - Weekend' : ''}`}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs font-semibold text-white drop-shadow">
                                                        {day.day}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="text-center pb-2.5" style={{ fontSize: '11px', color: '#6b7280' }}>
                                    {formatDate(selectedMonth)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default AttendanceDashboard;
