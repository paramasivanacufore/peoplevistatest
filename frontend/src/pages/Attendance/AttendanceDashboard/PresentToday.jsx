import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import PresentToday from '../../../components/Attendance/AttendanceDashboard/PresentToday';

const PresentTodayPage = () => {
    return (
        <DashboardLayout pageTitle="Present Today">
            <PresentToday />
        </DashboardLayout>
    );
};

export default PresentTodayPage;

