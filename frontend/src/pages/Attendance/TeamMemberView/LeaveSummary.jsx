import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import LeaveSummaryComponent from '../../../components/Attendance/TeamMemberView/LeaveSummaryComponent';

export default function LeaveSummary() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/attendance/team-members');
    };

    return (
        <DashboardLayout pageTitle="Leave Summary">
        <LeaveSummaryComponent 
            employeeId={employeeId ? parseInt(employeeId) : null}
            onBack={handleBack}
        />
        </DashboardLayout>
    );
}
