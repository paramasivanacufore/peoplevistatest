import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import MyAttendanceComponent from '../../../components/Attendance/MyAttendance/MyAttendanceComponent';

export default function EmployeeAttendance() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/attendance/team-members');
    };

    return (
        <DashboardLayout pageTitle="My Attendance">
            <MyAttendanceComponent 
                employeeId={employeeId ? parseInt(employeeId) : 1}
                onBack={handleBack}
            />
        </DashboardLayout>
    );
}
