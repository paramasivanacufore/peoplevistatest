import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import LeaveBalanceComponent from '../../../components/Attendance/TeamMemberView/LeaveBalanceComponent';

export default function LeaveBalance() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/attendance/team-members');
    };

    return (
        <DashboardLayout pageTitle="Leave Balance">
            <LeaveBalanceComponent 
                employeeId={employeeId ? parseInt(employeeId) : null}
                onBack={handleBack}
            />
        </DashboardLayout>
    );
}
