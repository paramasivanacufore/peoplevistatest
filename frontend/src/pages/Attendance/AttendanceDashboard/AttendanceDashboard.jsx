import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import AttendanceDashboardComponent from '../../../components/Attendance/AttendanceDashboard/AttendanceDashboard';

const AttendanceDashboard = () => {
    return (
        <DashboardLayout pageTitle="Team Dashboard">
            <AttendanceDashboardComponent />
        </DashboardLayout>
    );
};

export default AttendanceDashboard;
