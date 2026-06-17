import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home/Home";
import AdminLayout from "./Pages/Admin/AdminLayout/AdminLayout";
import AdminAuth from "./Pages/Admin/Authentication/AdminAuth";
import CreateUser from "./Pages/Admin/UserManagement/CreateUser";
import AllUsers from "./Pages/Admin/UserManagement/UsersView/AllUsers";
import PolicySettings from "./Pages/Admin/Policies/PolicySettings";
import PerfumeScroll from "./Pages/PerfumeScroll/PerfumeScroll";
import EmployeeLogin from "./Pages/Authentication/EmployeeLogin";
import EmployeeLayout from "./Pages/Employee/Layout/EmployeeLayout";
import EmployeeDashboard from "./Pages/Employee/Dashboard/EmployeeDashboard";
import EmployeeProfile from "./Pages/Employee/Profile/EmployeeProfile";
import EmployeeAttendance from "./Pages/Employee/Attendance/EmployeeAttendance";
import ManagerLayout from "./Pages/Manager/Layout/ManagerLayout";
import ManagerDashboard from "./Pages/Manager/Dashboard/ManagerDashboard";
import ManagerProfile from "./Pages/Manager/Profile/ManagerProfile";
import ManagerAttendance from "./Pages/Manager/Attandance/ManagerAttendance";
import HRLayout from "./Pages/HR/HRLayout/HRLayout";
import HRDashboard from "./Pages/HR/Dashboard/HRDashboard";
import HRProfile from "./Pages/HR/Profile/HRProfile";
import HRAttendance from "./Pages/HR/Attendance/HRAttendance";
import EmployeeLeave from "./Pages/Employee/Leave/EmployeeLeave";
import ManagerSelfLeave from "./Pages/Manager/Leave/ManagerSelfLeave/ManagerSelfLeave";
import ManagerTeamLeave from "./Pages/Manager/Leave/ManagerTeamLeave/ManagerTeamLeave";
import HRSelfLeave from "./Pages/HR/Leave/HRSelfLeave/HRSelfLeave";
import HRAllLeave from "./Pages/HR/Leave/HRAllLeave/HRAllLeave";
import AdminLeave from "./Pages/Admin/Leave/AdminLeave";
import AdminAttendance from "./Pages/Admin/Attendance/AdminAttendance";
import ManagerTasks from "./Pages/Manager/TasksManage/Task/ManagerTasks";
import ManagerPerformance from "./Pages/Manager/TasksManage/Performance/ManagerPerformance";
import EmployeePerformance from "./Pages/Employee/TaskPerformance/EmployeePerformance";
import HRAllOverview from "./Pages/HR/PerformanceOverview/HRAllOverview";
import AdminAllOverview from "./Pages/Admin/PerformanceOverview/AdminAllOverview";
import Announcements from "./Pages/Announcements/Announcements";
import EmployeeSalary from "./Pages/Employee/Salary/EmployeeSalary";
import HRSalary from "./Pages/HR/Salary/HRSalary";
import AdminSalary from "./Pages/Admin/Salary/AdminSalary";
import ManagerSalary from "./Pages/Manager/Salary/ManagerSalary";
import HRPolicySettings from "./Pages/HR/Policies/HRPolicySettings";
import AllEmployees from "./Pages/Admin/Employees/AllEmployees";
import ManagerTeam from "./Pages/Manager/Team/ManagerTeam";
import AdminDashboard from "./Pages/Admin/Dashboard/AdminDashboard";
import PageNotFound from "./Pages/404/PageNotFound";
import AdminReports from "./Pages/Admin/Reports/AdminReports";
// HR Imports


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        {/* <Route path="/" element={<PerfumeScroll />} /> */}
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/login" element={<EmployeeLogin />} />
        <Route path="*" element={<PageNotFound />} />


        {/* Admin Routes (with Layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AllUsers />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="policies" element={<PolicySettings />} />
          <Route path="leave" element={<AdminLeave />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="overview" element={<AdminAllOverview />} />
          <Route path="announcements" element={<Announcements userRole="ADMIN" />} />
          <Route path="salary" element={<AdminSalary />} />
          <Route path="employees" element={<AllEmployees />} />
          <Route path="reports" element={<AdminReports />} />


        </Route>

        {/* Employee Routes (with Layout) */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="leave" element={<EmployeeLeave />} />
          <Route path="performance" element={<EmployeePerformance />} />
          <Route path="announcements" element={<Announcements userRole="EMPLOYEE" />} />
          <Route path="salary" element={<EmployeeSalary />} />


        </Route>

        {/* Manager Routes (with Layout) */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="profile" element={<ManagerProfile />} />
          <Route path="attendance" element={<ManagerAttendance />} />
          <Route path="leave/self" element={<ManagerSelfLeave />} />
          <Route path="leave/team" element={<ManagerTeamLeave />} />
          <Route path="tasks" element={<ManagerTasks />} />
          <Route path="performance" element={<ManagerPerformance />} />
          <Route path="announcements" element={<Announcements userRole="MANAGER" />} />
          <Route path="salary" element={<ManagerSalary />} />
          <Route path="team" element={<ManagerTeam />} />

        </Route>

        {/* HR Routes (with Layout) */}
        <Route path="/hr" element={<HRLayout />}>
          <Route path="dashboard" element={<HRDashboard />} />
          <Route path="profile" element={<HRProfile />} />
          <Route path="attendance" element={<HRAttendance />} />
          <Route path="leave/self" element={<HRSelfLeave />} />
          <Route path="leave/all" element={<HRAllLeave />} />
          <Route path="overview" element={<HRAllOverview />} />
          <Route path="announcements" element={<Announcements userRole="HR" />} />
          <Route path="salary" element={<HRSalary />} />
          <Route path="policies" element={<HRPolicySettings />} />
          <Route path="employees" element={<AllEmployees />} />



        </Route>
      </Routes>
    </Router>
  );
};

export default App;