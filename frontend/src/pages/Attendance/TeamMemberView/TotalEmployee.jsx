import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import TeamMembersComponent from '../../../components/Attendance/TeamMemberView/TeamMembersComponent';

export default function TotalEmployee() {
    const navigate = useNavigate();

    const handleViewEmployee = (employeeId) => {
        navigate(`/attendance/employee/${employeeId}`);
    };

    const handleViewRegularization = (employeeId) => {
        navigate(`/attendance/regularization-requests/${employeeId}`);
    };

    const handleViewLeaveSummary = (employeeId) => {
        navigate(`/attendance/leave-summary/${employeeId}`);
    };

    const handleViewLeaveBalance = (employeeId) => {
        navigate(`/attendance/leave-balance/${employeeId}`);
    };

    const handleViewLeaveRequest = (employeeId) => {
        navigate(`/attendance/leave-requests/${employeeId}`);
    };

    return (
        <DashboardLayout pageTitle="Team Members">
        <TeamMembersComponent 
            onViewEmployee={handleViewEmployee}
            onViewRegularization={handleViewRegularization}
            onViewLeaveSummary={handleViewLeaveSummary}
            onViewLeaveBalance={handleViewLeaveBalance}
            onViewLeaveRequest={handleViewLeaveRequest}
        />
        </DashboardLayout>
    );
}

