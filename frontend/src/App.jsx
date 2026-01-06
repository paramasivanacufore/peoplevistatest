import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WelcomePage from "./components/DashboardLayout/WelcomePage";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout/DashboardLayout";
import Branches from "./pages/branch/Branches";
import Departments from "./pages/department/Departments";
import Employees from "./pages/employee/Employees";


// attendance_module imports
import AttendanceDashboard from "./pages/Attendance/AttendanceDashboard/AttendanceDashboard";
import EmployeesList from "./pages/Attendance/AttendanceDashboard/EmployeesList";
import PresentTodayPage from "./pages/Attendance/AttendanceDashboard/PresentToday";
import OnLeaveTodayPage from "./pages/Attendance/AttendanceDashboard/OnLeaveToday";
import AbsentTodayPage from "./pages/Attendance/AttendanceDashboard/AbsentToday";
import LeaveRequestsPage from "./pages/Attendance/AttendanceDashboard/LeaveRequests";
import RegularizationRequestsPage from "./pages/Attendance/AttendanceDashboard/RegularizationRequests";
import CompensatoryRequestsPage from "./pages/Attendance/AttendanceDashboard/CompensatoryRequests";
import TotalEmployee from "./pages/Attendance/TeamMemberView/TotalEmployee";
import EmployeeAttendance from "./pages/Attendance/TeamMemberView/EmployeeAttendance";
import RegularizationRequests from "./pages/Attendance/TeamMemberView/RegularizationRequests";
import LeaveSummary from "./pages/Attendance/TeamMemberView/LeaveSummary";
import LeaveBalance from "./pages/Attendance/TeamMemberView/LeaveBalance";
import LeaveRequest from "./pages/Attendance/TeamMemberView/LeaveRequest";
import MyAttendance from "./pages/Attendance/MyAttendance/MyAttendance";
import EmployeeRegularization from "./pages/Attendance/Regularization/EmployeeRegularization";
import EmployeeLeaveSummary from "./pages/Attendance/Leave/EmployeLeaveSummary";
import LeaveForm from "./pages/Attendance/Leave/LeaveForm";
import { AuthProvider } from "./context/AuthContext";
import NavigationGuard from "./components/NavigationGuard";
import ForgotPassword from "./pages/Login/ForgotPassword";
import { PermissionProvider } from "./context/PemissionAccessContext";
import VerifyOTP from "./pages/Login/OtpVerification";
import LeaveTypeView from "./components/Attendance/LeaveTypeView";
import ResetPassword from "./pages/Login/ResetPassword";

import PositionsList from "./pages/Positions/PositionsList";
import ShiftsList from "./pages/Shifts/ShiftsList";
import Companies from "./pages/Company/Companies";
import RolesList from "./pages/Roles/RolesList";
import Holidays from "./pages/Attendance/Holidays";
import BiometricDevices from "./pages/Attendance/BiometricDevices";
import EmployeeForm from "./pages/employee/EmployeeForm";

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <NavigationGuard />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public / original routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin_operation/company_page" element={<Companies />} />
          <Route path="/admin_operation/branch_page" element={<Branches />} />
          <Route
            path="/admin_operation/department_page"
            element={<Departments />}
          />
          <Route
            path="/admin_operation/employee_page"
            element={<Employees />}
          />

          {/* Registration routes (aliases for admin_operation routes) */}
          <Route path="/registration/company_page" element={<Companies />} />
          <Route path="/registration/branch_page" element={<Branches />} />
          <Route
            path="/registration/department_page"
            element={<Departments />}
          />
          <Route path="/registration/employee_page" element={<Employees />} />
          <Route path="/employees/new" element={<EmployeeForm />} />
          <Route path="/employees/edit/:id" element={<EmployeeForm />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <WelcomePage />
              </DashboardLayout>
            }
          />

          {/* Attendance module routes */}
          <Route
            path="/attendance/attendance-dashboard"
            element={<AttendanceDashboard />}
          />
          <Route path="/attendance/my-attendance" element={<MyAttendance />} />
          <Route
            path="/attendance/regularization"
            element={<EmployeeRegularization />}
          />
          <Route
            path="/attendance/regularization"
            element={<EmployeeRegularization />}
          />
          <Route path="/admin_operation/roles_page" element={<RolesList />} />
          <Route path="/admin_operation/position_page" element={<PositionsList />} />
          <Route path="/shiftreg" element={<ShiftsList />} />
          <Route
            path="/attendance/emp-leave"
            element={<EmployeeLeaveSummary />}
          />
          <Route path="/attendance/leave-request" element={<LeaveForm />} />
          <Route path="/attendance/employees" element={<EmployeesList />} />
          <Route
            path="/attendance/present-today"
            element={<PresentTodayPage />}
          />
          <Route
            path="/attendance/on-leave-today"
            element={<OnLeaveTodayPage />}
          />
          <Route
            path="/attendance/absent-today"
            element={<AbsentTodayPage />}
          />
          <Route
            path="/attendance/leave-requests"
            element={<LeaveRequestsPage />}
          />
          <Route
            path="/attendance/regularization-approvals"
            element={<RegularizationRequestsPage />}
          />
          <Route
            path="/attendance/compensatory-approvals"
            element={<CompensatoryRequestsPage />}
          />
          <Route path="/attendance/team-members" element={<TotalEmployee />} />
          <Route
            path="/attendance/employee/:employeeId"
            element={<EmployeeAttendance />}
          />
          <Route
            path="/attendance/regularization-requests/:employeeId"
            element={<RegularizationRequests />}
          />
          <Route
            path="/attendance/leave-summary/:employeeId"
            element={<LeaveSummary />}
          />
          <Route
            path="/attendance/leave-balance/:employeeId"
            element={<LeaveBalance />}
          />
          <Route
            path="/attendance/leave-requests/:employeeId"
            element={<LeaveRequest />}
          />
          <Route
            path="/attendance/leave-types"
            element={
              <DashboardLayout pageTitle="Leave Types">
                <LeaveTypeView />
              </DashboardLayout>
            }
          />
          <Route
            path="/attendance/holidays"
            element={<Holidays />}
          />
          <Route
            path="/attendance/biometric-devices"
            element={<BiometricDevices />}
          />
        </Routes>
        
        
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
