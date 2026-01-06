import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import CompensatoryRequests from '../../../components/Attendance/AttendanceDashboard/CompensatoryRequest';

const CompensatoryRequestsPage = () => {
    return (
        <DashboardLayout pageTitle="Pending Compensatory Requests">
            <CompensatoryRequests />
        </DashboardLayout>
    );
};

export default CompensatoryRequestsPage;


