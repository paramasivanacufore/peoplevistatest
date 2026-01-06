import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import EmployeeLeaveComponent from '../../../components/Attendance/leave/EmployeeLeaveComponent';

export default function EmployeeLeaveSummary() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/attendance/team-members');
    };

    return (
        <DashboardLayout pageTitle="Leave Summary">
            <EmployeeLeaveComponent 
                employeeId={employeeId ? parseInt(employeeId) : 1}
                onBack={handleBack}
            />
        </DashboardLayout>
    );
}
