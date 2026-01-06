import React from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import HolidayView from "../../components/Attendance/Holiday/HolidayView";

const Holidays = () => {
  return (
    <DashboardLayout pageTitle="Holidays List">
      <HolidayView />
    </DashboardLayout>
  );
};

export default Holidays;
