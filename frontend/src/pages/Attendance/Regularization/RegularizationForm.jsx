import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout/DashboardLayout';
import RegularizationFormComponent from '../../../components/Attendance/Regularization/RegularizationFormComponent';

export default function RegularizationForm() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/attendance/regularization');
    };

    return (
        <DashboardLayout pageTitle="Regularization">
            <RegularizationFormComponent 
                employeeId={employeeId ? parseInt(employeeId) : 1}
                onBack={handleBack}
            />

             
        </DashboardLayout>
    );
}
