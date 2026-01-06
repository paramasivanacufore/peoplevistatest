import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import RegularizationRequests from '../../../components/Attendance/AttendanceDashboard/RegularizationRequests';

const RegularizationRequestsPage = () => {
    return (
        <DashboardLayout pageTitle="Pending Regularization Requests">
            <RegularizationRequests />
        </DashboardLayout>
    );
};

export default RegularizationRequestsPage;


