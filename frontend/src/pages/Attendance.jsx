import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/DashboardLayout/Sidebar';
import Topbar from '../components/DashboardLayout/Topbar';
import HolidayView from '../components/Attendance/HolidayView';
import ShiftView from '../components/Attendance/ShiftView';
import BiometricDeviceView from '../components/Attendance/BiometricDeviceView';
import LeaveAllocationView from '../components/Attendance/LeaveAllocationView';
import LeaveTypeView from '../components/Attendance/LeaveTypeView';
import LeaveRequestView from '../components/Attendance/LeaveRequestView';
import { usePermissions } from '../context/PermissionContext';

const Attendance = () => {
  const [searchParams] = useSearchParams();
  const { permissions, loading: permissionsLoading, hasPermissionKey } = usePermissions();

  const [activeTab, setActiveTab] = useState('holidays');

  const allTabs = [
    { id: 'holidays', component: HolidayView },
    { id: 'shifts', component: ShiftView },
    { id: 'devices', component: BiometricDeviceView },
    { id: 'leave-type', component: LeaveTypeView },
    { id: 'leave-allocation', component: LeaveAllocationView },
    { id: 'leave-request', component: LeaveRequestView }
  ];

  const hasAdminAccess = hasPermissionKey('pv_attendance', 'attendance_admin_operations', 'view');
  const tabs = hasAdminAccess ? allTabs : [];

  useEffect(() => {
    if (!hasPermissionKey) return;

    const tab = searchParams.get('tab');
    const validTabs = allTabs.map(t => t.id);

    if (tab && validTabs.includes(tab)) {
      if (hasAdminAccess) {
        setActiveTab(tab);
      } else if (tabs.length > 0) {
        setActiveTab(tabs[0].id);
        window.history.replaceState({}, '', `/attendance?tab=${tabs[0].id}`);
      }
    } else if (tabs.length > 0 && !tab) {
      setActiveTab(tabs[0].id);
    }
  }, [searchParams, hasPermissionKey, hasAdminAccess, tabs]);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || HolidayView;

  if (permissionsLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading permissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tabs.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600">
                  You don't have permission to access attendance admin operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        {/* Body Content Only */}
        <main className="flex-1 overflow-y-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default Attendance;
