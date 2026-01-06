import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import LeaveFormComponent from '../../../components/Attendance/leave/LeaveFormComponent';

export default function LeaveForm() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/attendance/emp-leave');
    };

    return (
        <DashboardLayout pageTitle="Leave Request">
            <LeaveFormComponent 
                employeeId={employeeId ? parseInt(employeeId) : 1}
                onBack={handleBack}
            />

             
        </DashboardLayout>
    );
}
