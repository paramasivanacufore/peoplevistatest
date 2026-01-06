import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import OnLeaveToday from '../../../components/Attendance/AttendanceDashboard/OnLeaveToday';

const OnLeaveTodayPage = () => {
    return (
        <DashboardLayout pageTitle="On Leave Today">
            <OnLeaveToday />
        </DashboardLayout>
    );
};

export default OnLeaveTodayPage;

