import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUser, FaCalendarAlt, FaClock, FaCheckCircle, 
  FaTimesCircle, FaTasks, FaMoneyBillWave, FaStar,
  FaArrowRight, FaSpinner, FaUsers, FaEnvelope,
  FaPhone, FaBuilding, FaBriefcase, FaIdCard,
  FaChartLine, FaLeaf, FaBell, FaEye
} from 'react-icons/fa';
import './EmployeeDashboard.scss';

const EmployeeDashboard = () => {
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
        const response = await axios.get(`${apiUrl}/employee/dashboard`, {
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

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      'ON_TIME': 'status-on-time',
      'LATE': 'status-late',
      'ABSENT': 'status-absent',
      'HALF_DAY': 'status-half-day',
      'NOT_STARTED': 'status-not-started'
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'ON_TIME': 'On Time',
      'LATE': 'Late',
      'ABSENT': 'Absent',
      'HALF_DAY': 'Half Day',
      'NOT_STARTED': 'Not Started'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="emp-dashboard-loading">
        <div className="emp-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-dashboard-error">
        <FaTimesCircle className="error-icon" />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="emp-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { employee, quickStats, todayStatus, attendance, leave, tasks, salary, performance, upcomingHolidays } = dashboardData;

  return (
    <div className="emp-dashboard">
      {/* Welcome Header */}
      <div className="emp-welcome">
        <div className="emp-welcome__content">
          <span className="emp-welcome__greeting">Welcome back,</span>
          <h1>{employee.name}</h1>
          <p>
            <FaBriefcase /> {employee.designation || 'Employee'} | 
            <FaBuilding /> {employee.department || 'General'}
          </p>
        </div>
        <div className="emp-welcome__date">
          <FaCalendarAlt />
          <div>
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <small>{currentTime.toLocaleTimeString()}</small>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="emp-stats-grid">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon">
            <FaClock />
          </div>
          <div className="emp-stat-card__info">
            <span className="emp-stat-card__label">Attendance Rate</span>
            <strong className="emp-stat-card__value">{quickStats.attendanceRate}%</strong>
          </div>
        </div>
        
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon">
            <FaTasks />
          </div>
          <div className="emp-stat-card__info">
            <span className="emp-stat-card__label">Pending Tasks</span>
            <strong className="emp-stat-card__value">{quickStats.pendingTasks}</strong>
            {quickStats.overdueTasks > 0 && (
              <small className="emp-stat-card__warning">{quickStats.overdueTasks} overdue</small>
            )}
          </div>
        </div>
        
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon">
            <FaLeaf />
          </div>
          <div className="emp-stat-card__info">
            <span className="emp-stat-card__label">Leave Balance</span>
            <strong className="emp-stat-card__value">{quickStats.leaveBalance}</strong>
            <small>days remaining</small>
          </div>
        </div>
        
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon">
            <FaStar />
          </div>
          <div className="emp-stat-card__info">
            <span className="emp-stat-card__label">Last Rating</span>
            <strong className="emp-stat-card__value">
              {quickStats.lastPerformanceRating || '—'}
              {quickStats.lastPerformanceRating && <span>/5</span>}
            </strong>
          </div>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="emp-today-card">
        <h2>
          <FaClock /> Today's Status
        </h2>
        <div className="emp-today-status">
          <div className={`emp-status-badge ${getStatusClass(todayStatus.status)}`}>
            {todayStatus.status === 'ON_TIME' && <FaCheckCircle />}
            {todayStatus.status === 'LATE' && <FaClock />}
            {todayStatus.status === 'ABSENT' && <FaTimesCircle />}
            {todayStatus.status === 'HALF_DAY' && <FaClock />}
            {todayStatus.status === 'NOT_STARTED' && <FaClock />}
            {getStatusText(todayStatus.status)}
          </div>
          
          {todayStatus.hasCheckedIn ? (
            <div className="emp-today-time">
              <div className="emp-time-item">
                <label>Check In</label>
                <span>{todayStatus.checkInTime || '—'}</span>
              </div>
              <div className="emp-time-item">
                <label>Check Out</label>
                <span>{todayStatus.checkOutTime || 'Not yet'}</span>
              </div>
              {todayStatus.totalHours > 0 && (
                <div className="emp-time-item">
                  <label>Total Hours</label>
                  <span>{todayStatus.totalHours} hrs</span>
                </div>
              )}
            </div>
          ) : (
            <div className="emp-today-message">
              <p>You haven't checked in yet today</p>
              <small>Please check in to start your workday</small>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="emp-two-column">
        
        {/* LEFT COLUMN */}
        <div className="emp-left-col">
          
          {/* Attendance Summary */}
          <div className="emp-card">
            <div className="emp-card__header">
              <h3><FaChartLine /> This Month's Attendance</h3>
            </div>
            <div className="emp-attendance-summary">
              <div className="emp-summary-item">
                <span>Present Days</span>
                <strong>{attendance.thisMonth.presentDays}</strong>
                <small>out of {attendance.thisMonth.totalDays}</small>
              </div>
              <div className="emp-summary-stats">
                <div className="emp-stat-badge emp-on-time">
                  <span>On Time</span>
                  <strong>{attendance.thisMonth.onTimeDays}</strong>
                </div>
                <div className="emp-stat-badge emp-late">
                  <span>Late</span>
                  <strong>{attendance.thisMonth.lateDays}</strong>
                </div>
                <div className="emp-stat-badge emp-half-day">
                  <span>Half Day</span>
                  <strong>{attendance.thisMonth.halfDays}</strong>
                </div>
                <div className="emp-stat-badge emp-absent">
                  <span>Absent</span>
                  <strong>{attendance.thisMonth.absentDays}</strong>
                </div>
              </div>
            </div>
            
            {/* Attendance Trend */}
            {attendance.trend && attendance.trend.length > 0 && (
              <div className="emp-trend">
                <h4>Last 6 Months Trend</h4>
                <div className="emp-trend-bars">
                  {attendance.trend.map((month, idx) => (
                    <div key={idx} className="emp-trend-item">
                      <div 
                        className="emp-trend-bar" 
                        style={{ height: `${(month.present / (month.total || 30)) * 100}%` }}
                      ></div>
                      <span>{month.month}</span>
                      <small>{month.present}/{month.total}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* My Tasks */}
          <div className="emp-card">
            <div className="emp-card__header">
              <h3><FaTasks /> My Tasks</h3>
              {tasks.pending.length > 0 && (
                <span className="emp-badge">{tasks.pending.length} Pending</span>
              )}
            </div>
            
            {tasks.pending.length === 0 ? (
              <div className="emp-empty-state">
                <FaCheckCircle />
                <p>No pending tasks! Great job! 🎉</p>
              </div>
            ) : (
              <div className="emp-task-list">
                {tasks.pending.slice(0, 5).map((task, idx) => (
                  <div key={idx} className="emp-task-item">
                    <div className="emp-task-info">
                      <strong>{task.title}</strong>
                      {task.deadline && (
                        <small>
                          <FaCalendarAlt /> Due: {new Date(task.deadline).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                    <div className={`emp-task-status ${new Date(task.deadline) < new Date() ? 'emp-overdue' : ''}`}>
                      {new Date(task.deadline) < new Date() ? 'Overdue' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {tasks.summary.completed > 0 && (
              <div className="emp-task-footer">
                <span>✅ {tasks.summary.completed} tasks completed</span>
                <span>📋 {tasks.summary.total} total tasks</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="emp-right-col">
          
          {/* Leave Balance */}
          <div className="emp-card">
            <div className="emp-card__header">
              <h3><FaLeaf /> Leave Balance</h3>
            </div>
            {leave.balances.length === 0 ? (
              <div className="emp-empty-state">
                <p>No leave data available</p>
              </div>
            ) : (
              <div className="emp-leave-balance">
                {leave.balances.map((balance, idx) => (
                  <div key={idx} className="emp-leave-item">
                    <div className="emp-leave-info">
                      <span className="emp-leave-type">{balance.leaveType}</span>
                      <div className="emp-leave-progress">
                        <div 
                          className="emp-leave-progress-bar" 
                          style={{ width: `${(balance.used / balance.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="emp-leave-numbers">
                      <span>Used: {balance.used}</span>
                      <span>Remaining: {balance.remaining}</span>
                      <span>Total: {balance.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upcoming Leaves */}
            {leave.upcomingLeaves && leave.upcomingLeaves.length > 0 && (
              <div className="emp-upcoming-leaves">
                <h4>Upcoming Leaves</h4>
                {leave.upcomingLeaves.map((leaveReq, idx) => (
                  <div key={idx} className="emp-upcoming-item">
                    <span>📅 {leaveReq.fromDate} to {leaveReq.toDate}</span>
                    <small>{leaveReq.reason}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Salary Summary */}
          <div className="emp-card">
            <div className="emp-card__header">
              <h3><FaMoneyBillWave /> Salary Summary</h3>
            </div>
            <div className="emp-salary-info">
              <div className="emp-salary-item">
                <label>Basic Salary</label>
                <span>₹{salary.basicSalary?.toLocaleString()}</span>
              </div>
              {salary.netSalary && (
                <>
                  <div className="emp-salary-item">
                    <label>Deductions</label>
                    <span className="emp-deduction">- ₹{salary.deductions?.toLocaleString()}</span>
                  </div>
                  <div className="emp-salary-item emp-net-salary">
                    <label>Net Salary</label>
                    <span>₹{salary.netSalary?.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="emp-salary-status">
                <span className={`emp-status ${salary.status === 'PAID' ? 'emp-paid' : 'emp-unpaid'}`}>
                  {salary.status === 'PAID' ? '✓ Paid' : '⏳ Unpaid'}
                </span>
                {salary.lastPaidMonth && (
                  <small>Last paid: {salary.lastPaidMonth}</small>
                )}
              </div>
            </div>
          </div>

          {/* Performance */}
          {performance.lastReview && (
            <div className="emp-card">
              <div className="emp-card__header">
                <h3><FaStar /> Last Performance Review</h3>
              </div>
              <div className="emp-performance">
                <div className="emp-rating">
                  <div className="emp-rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < Math.floor(performance.lastReview.overallRating) ? 'emp-star-filled' : 'emp-star-empty'} 
                      />
                    ))}
                  </div>
                  <span className="emp-rating-value">{performance.lastReview.overallRating}/5</span>
                </div>
                {performance.lastReview.comments && (
                  <p className="emp-review-comment">"{performance.lastReview.comments}"</p>
                )}
                <small>Reviewed on: {performance.lastReview.reviewMonth}</small>
              </div>
            </div>
          )}

          {/* Upcoming Holidays */}
          {upcomingHolidays && upcomingHolidays.length > 0 && (
            <div className="emp-card">
              <div className="emp-card__header">
                <h3><FaBell /> Upcoming Holidays</h3>
              </div>
              <div className="emp-holidays">
                {upcomingHolidays.map((holiday, idx) => (
                  <div key={idx} className="emp-holiday-item">
                    <span className="emp-holiday-name">{holiday.name}</span>
                    <span className="emp-holiday-date">{holiday.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee Info Footer Card */}
      <div className="emp-info-card">
        <h3><FaUser /> Employee Information</h3>
        <div className="emp-info-grid">
          <div className="emp-info-item">
            <FaIdCard />
            <div>
              <label>Employee ID</label>
              <p>{employee.employeeId}</p>
            </div>
          </div>
          <div className="emp-info-item">
            <FaEnvelope />
            <div>
              <label>Email</label>
              <p>{employee.email}</p>
            </div>
          </div>
          <div className="emp-info-item">
            <FaBriefcase />
            <div>
              <label>Designation</label>
              <p>{employee.designation || 'Not assigned'}</p>
            </div>
          </div>
          <div className="emp-info-item">
            <FaBuilding />
            <div>
              <label>Department</label>
              <p>{employee.department || 'Not assigned'}</p>
            </div>
          </div>
          <div className="emp-info-item">
            <FaCalendarAlt />
            <div>
              <label>Joined On</label>
              <p>{new Date(employee.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;