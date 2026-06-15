import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUsers, FaUserCheck, FaUserClock, FaTasks,
  FaCalendarAlt, FaStar, FaChartLine, FaClock,
  FaCheckCircle, FaTimesCircle, FaSpinner,
  FaMoneyBillWave, FaBuilding, FaEnvelope,
  FaPhone, FaIdCard, FaUserTie, FaChartBar,
  FaBriefcase, FaTrophy, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaMinus
} from 'react-icons/fa';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const apiUrl = import.meta.env.VITE_API_URL;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/admin/dashboard`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setDashboardData(response.data.dashboard);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Dashboard Error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [apiUrl]);

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FaArrowUp className="trend-up" />;
    if (trend < 0) return <FaArrowDown className="trend-down" />;
    return <FaMinus className="trend-neutral" />;
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <FaTimesCircle className="error-icon" />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="admin-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { employeeStats, attendanceStats, leaveStats, salaryStats, taskStats, upcomingHolidays, recentActivities } = dashboardData;

  return (
    <div className="admin-dashboard">
      {/* Welcome Header */}
      <div className="admin-welcome">
        <div className="admin-welcome__content">
          <span className="admin-welcome__greeting">Admin Dashboard</span>
          <h1>Company Overview</h1>
          <p>Complete insights and analytics of your organization</p>
        </div>
        <div className="admin-welcome__date">
          <FaCalendarAlt />
          <div>
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <small>{currentTime.toLocaleTimeString()}</small>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-icon-total">
            <FaUsers />
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">Total Employees</span>
            <strong className="admin-stat-card__value">{employeeStats?.total || 0}</strong>
            <div className="admin-stat-card__sub">
              <span>{employeeStats?.active || 0} Active</span>
              <span>{employeeStats?.inactive || 0} Inactive</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-icon-new">
            <FaUserCheck />
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">New Joiners</span>
            <strong className="admin-stat-card__value">{employeeStats?.newJoiners || 0}</strong>
            <span className="admin-stat-card__sub">Last 30 days</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-icon-present">
            <FaClock />
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">Present Today</span>
            <strong className="admin-stat-card__value">{attendanceStats?.presentToday || 0}</strong>
            <span className="admin-stat-card__sub">{attendanceStats?.attendancePercentage || 0}% of total</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-icon-leave">
            <FaUserClock />
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">Pending Leaves</span>
            <strong className="admin-stat-card__value">{leaveStats?.pending || 0}</strong>
            <div className="admin-stat-card__sub">
              <span>Approved: {leaveStats?.approved || 0}</span>
              <span>Rejected: {leaveStats?.rejected || 0}</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-icon-salary">
            <FaMoneyBillWave />
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">Monthly Salary</span>
            <strong className="admin-stat-card__value">₹{(salaryStats?.totalMonthlySalary / 100000).toFixed(1)}L</strong>
            <span className="admin-stat-card__sub">Avg: ₹{(salaryStats?.averageSalary / 1000).toFixed(0)}K</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-icon-task">
            <FaTasks />
          </div>
          <div className="admin-stat-card__info">
            <span className="admin-stat-card__label">Task Completion</span>
            <strong className="admin-stat-card__value">{taskStats?.completionRate || 0}%</strong>
            <div className="admin-stat-card__sub">
              <span>{taskStats?.completed || 0} Completed</span>
              <span>{taskStats?.pending || 0} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="admin-two-column">

        {/* LEFT COLUMN */}
        <div className="admin-left-col">

          {/* Employee Distribution */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3><FaUsers /> Employee Distribution</h3>
            </div>

            {/* Role Distribution */}
            <div className="admin-role-distribution">
              <h4>By Role</h4>
              <div className="admin-role-grid">
                <div className="admin-role-item">
                  <span className="admin-role-name">HR</span>
                  <div className="admin-role-bar-wrapper">
                    <div
                      className="admin-role-bar"
                      style={{ width: `${(employeeStats?.roleDistribution?.HR / employeeStats?.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="admin-role-count">{employeeStats?.roleDistribution?.HR || 0}</span>
                </div>
                <div className="admin-role-item">
                  <span className="admin-role-name">Manager</span>
                  <div className="admin-role-bar-wrapper">
                    <div
                      className="admin-role-bar"
                      style={{ width: `${(employeeStats?.roleDistribution?.MANAGER / employeeStats?.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="admin-role-count">{employeeStats?.roleDistribution?.MANAGER || 0}</span>
                </div>
                <div className="admin-role-item">
                  <span className="admin-role-name">Employee</span>
                  <div className="admin-role-bar-wrapper">
                    <div
                      className="admin-role-bar"
                      style={{ width: `${(employeeStats?.roleDistribution?.EMPLOYEE / employeeStats?.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="admin-role-count">{employeeStats?.roleDistribution?.EMPLOYEE || 0}</span>
                </div>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="admin-dept-distribution">
              <h4>By Department</h4>
              <div className="admin-dept-list">
                {Object.entries(employeeStats?.departmentDistribution || {}).map(([dept, count], idx) => (
                  <div key={idx} className="admin-dept-item">
                    <span className="admin-dept-name">{dept}</span>
                    <div className="admin-dept-bar-wrapper">
                      <div
                        className="admin-dept-bar"
                        style={{ width: `${(count / employeeStats?.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="admin-dept-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3><FaChartLine /> Today's Attendance Overview</h3>
            </div>
            <div className="admin-attendance-stats">
              <div className="admin-attendance-item">
                <div className="admin-attendance-info">
                  <span className="admin-attendance-label">Present</span>
                  <strong>{attendanceStats?.presentToday || 0}</strong>
                </div>
                <div className="admin-attendance-bar present">
                  <div className="admin-attendance-fill" style={{ width: `${(attendanceStats?.presentToday / attendanceStats?.totalEmployees) * 100}%` }}></div>
                </div>
                <span className="admin-attendance-percent">{((attendanceStats?.presentToday / attendanceStats?.totalEmployees) * 100).toFixed(1)}%</span>
              </div>
              <div className="admin-attendance-item">
                <div className="admin-attendance-info">
                  <span className="admin-attendance-label">Late</span>
                  <strong>{attendanceStats?.lateToday || 0}</strong>
                </div>
                <div className="admin-attendance-bar late">
                  <div className="admin-attendance-fill" style={{ width: `${(attendanceStats?.lateToday / attendanceStats?.totalEmployees) * 100}%` }}></div>
                </div>
                <span className="admin-attendance-percent">{((attendanceStats?.lateToday / attendanceStats?.totalEmployees) * 100).toFixed(1)}%</span>
              </div>
              <div className="admin-attendance-item">
                <div className="admin-attendance-info">
                  <span className="admin-attendance-label">Half Day</span>
                  <strong>{attendanceStats?.halfDayToday || 0}</strong>
                </div>
                <div className="admin-attendance-bar half-day">
                  <div className="admin-attendance-fill" style={{ width: `${(attendanceStats?.halfDayToday / attendanceStats?.totalEmployees) * 100}%` }}></div>
                </div>
                <span className="admin-attendance-percent">{((attendanceStats?.halfDayToday / attendanceStats?.totalEmployees) * 100).toFixed(1)}%</span>
              </div>
              <div className="admin-attendance-item">
                <div className="admin-attendance-info">
                  <span className="admin-attendance-label">Absent</span>
                  <strong>{attendanceStats?.absentToday || 0}</strong>
                </div>
                <div className="admin-attendance-bar absent">
                  <div className="admin-attendance-fill" style={{ width: `${(attendanceStats?.absentToday / attendanceStats?.totalEmployees) * 100}%` }}></div>
                </div>
                <span className="admin-attendance-percent">{((attendanceStats?.absentToday / attendanceStats?.totalEmployees) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="admin-right-col">

          {/* Leave Trend */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3><FaChartLine /> Leave Trend (Last 6 Months)</h3>
            </div>
            <div className="admin-leave-trend">
              {leaveStats?.trend?.map((item, idx) => (
                <div key={idx} className="admin-trend-item">
                  <span className="admin-trend-month">{item.month}</span>
                  <div className="admin-trend-bar-wrapper">
                    <div
                      className="admin-trend-bar"
                      style={{ height: `${(item.count / Math.max(...leaveStats.trend.map(t => t.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="admin-trend-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Stats */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3><FaMoneyBillWave /> Salary Overview</h3>
            </div>
            <div className="admin-salary-stats">
              <div className="admin-salary-item">
                <span className="admin-salary-label">Total Monthly</span>
                <strong>₹{(salaryStats?.totalMonthlySalary / 100000).toFixed(2)}L</strong>
              </div>
              <div className="admin-salary-item">
                <span className="admin-salary-label">Average Salary</span>
                <strong>₹{(salaryStats?.averageSalary / 1000).toFixed(0)}K</strong>
              </div>
              <div className="admin-salary-item">
                <span className="admin-salary-label">Paid Status</span>
                <div className="admin-salary-status">
                  <span className="status-paid">{salaryStats?.paidCount || 0} Paid</span>
                  <span className="status-unpaid">{salaryStats?.unpaidCount || 0} Unpaid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Holidays */}
          {upcomingHolidays && upcomingHolidays.length > 0 && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h3><FaCalendarAlt /> Upcoming Holidays</h3>
              </div>
              <div className="admin-holidays-list">
                {upcomingHolidays.map((holiday, idx) => (
                  <div key={idx} className="admin-holiday-item">
                    <span className="admin-holiday-name">{holiday.name}</span>
                    <span className="admin-holiday-date">{holiday.date}</span>
                    <span className={`admin-holiday-type ${holiday.type}`}>{holiday.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activities */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3><FaExclamationTriangle /> Recent Activities</h3>
            </div>

            {/* Pending Leaves */}
            {recentActivities?.pendingLeaves?.length > 0 && (
              <div className="admin-recent-section">
                <h4>Pending Leave Requests</h4>
                {recentActivities.pendingLeaves.slice(0, 3).map((leave, idx) => (
                  <div key={idx} className="admin-recent-item">
                    <div className="admin-recent-avatar">
                      {leave.employeeName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-recent-info">
                      <strong>{leave.employeeName}</strong>
                      <small>{leave.fromDate} to {leave.toDate}</small>
                      <p>{leave.reason?.substring(0, 50)}</p>
                    </div>
                    <span className="admin-recent-badge pending">Pending</span>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Tasks */}
            {recentActivities?.pendingTasks?.length > 0 && (
              <div className="admin-recent-section">
                <h4>Pending Tasks</h4>
                {recentActivities.pendingTasks.slice(0, 3).map((task, idx) => (
                  <div key={idx} className="admin-recent-item">
                    <div className="admin-recent-avatar task">
                      <FaTasks />
                    </div>
                    <div className="admin-recent-info">
                      <strong>{task.title}</strong>
                      <small>Assigned to: {task.assignedTo?.map(a => a.employeeName).join(', ')}</small>
                      {task.deadline && <small>Due: {task.deadline}</small>}
                    </div>
                    <span className="admin-recent-badge pending">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="admin-footer-stats">
        <div className="admin-footer-item">
          <FaTrophy />
          <div>
            <span>Task Completion Rate</span>
            <strong>{taskStats?.completionRate || 0}%</strong>
          </div>
        </div>
        <div className="admin-footer-item">
          <FaBriefcase />
          <div>
            <span>Total Departments</span>
            <strong>{Object.keys(employeeStats?.departmentDistribution || {}).length}</strong>
          </div>
        </div>
        <div className="admin-footer-item">
          <FaStar />
          <div>
            <span>Leave Approval Rate</span>
            <strong>{leaveStats?.total > 0 ? Math.round((leaveStats?.approved / leaveStats?.total) * 100) : 0}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;