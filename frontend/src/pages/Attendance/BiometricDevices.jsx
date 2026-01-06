import React from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import BiometricDeviceView from "../../components/Attendance/BiometricDevice/BiometricDeviceView";

const BiometricDevices = () => {
  return (
    <DashboardLayout pageTitle="Biometric Devices List">
      <BiometricDeviceView />
    </DashboardLayout>
  );
};

export default BiometricDevices;
