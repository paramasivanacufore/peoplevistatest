import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import LeaveRequests from '../../../components/Attendance/AttendanceDashboard/LeaveRequests';

const LeaveRequestsPage = () => {
    return (
        <DashboardLayout pageTitle="Pending Leave Requests">
            <LeaveRequests />
        </DashboardLayout>
    );
};

export default LeaveRequestsPage;

