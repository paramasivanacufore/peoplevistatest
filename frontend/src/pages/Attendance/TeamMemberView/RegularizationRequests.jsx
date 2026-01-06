import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import RegularizationRequestsComponent from '../../../components/Attendance/TeamMemberView/RegularizationRequestsComponent';

export default function RegularizationRequests() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/attendance/team-members');
    };

    return (
        <DashboardLayout pageTitle="Regularization Requests">
            <RegularizationRequestsComponent 
                employeeId={employeeId ? parseInt(employeeId) : null}
                onBack={handleBack}
            />
        </DashboardLayout>
    );
}
