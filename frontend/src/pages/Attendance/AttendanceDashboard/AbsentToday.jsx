import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import AbsentToday from '../../../components/Attendance/AttendanceDashboard/AbsentToday';

const AbsentTodayPage = () => {
    return (
        <DashboardLayout pageTitle="Absent Today">
            <AbsentToday />
        </DashboardLayout>
    );
};

export default AbsentTodayPage;

