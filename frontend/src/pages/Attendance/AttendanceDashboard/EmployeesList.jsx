import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import EmployeesListComponent from '../../../components/Attendance/AttendanceDashboard/EmployeeList';

const EmployeesList = () => {
    return (
        <DashboardLayout pageTitle="All Employees">
            <EmployeesListComponent />
        </DashboardLayout>
    );
};

export default EmployeesList;

