import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUsers, FaUserCheck, FaUserClock, FaTasks,
  FaCalendarAlt, FaStar, FaChartLine, FaClock,
  FaCheckCircle, FaTimesCircle, FaSpinner,
  FaArrowRight, FaBell, FaEye, FaPercentage,
  FaUmbrella, FaPlane, FaLaptopCode, FaUserTie,
  FaChartBar, FaTrophy, FaExclamationTriangle
} from 'react-icons/fa';
import './ManagerDashboard.scss';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('attendance');

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
        const response = await axios.get(`${apiUrl}/manager/dashboard`, {
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

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'ON_TIME': 'status-on-time',
      'LATE': 'status-late',
      'ABSENT': 'status-absent',
      'HALF_DAY': 'status-half-day',
      'HOLIDAY': 'status-holiday',
      'WEEKEND': 'status-weekend',
      'ON_LEAVE': 'status-on-leave',
      'HALF_DAY_WEEKEND': 'status-half-day'
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'ON_TIME': 'On Time ✓',
      'LATE': 'Late ⏰',
      'ABSENT': 'Absent ✗',
      'HALF_DAY': 'Half Day ⏳',
      'HOLIDAY': 'Holiday 🎉',
      'WEEKEND': 'Weekend 🌴',
      'ON_LEAVE': 'On Leave 📋',
      'HALF_DAY_WEEKEND': 'Half Day (Sat)'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ON_TIME': return <FaCheckCircle />;
      case 'LATE': return <FaClock />;
      case 'ABSENT': return <FaTimesCircle />;
      case 'HALF_DAY': return <FaClock />;
      case 'HOLIDAY': return <FaUmbrella />;
      case 'WEEKEND': return <FaPlane />;
      case 'ON_LEAVE': return <FaUserClock />;
      default: return <FaClock />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'HR': return <FaUserTie />;
      case 'MANAGER': return <FaLaptopCode />;
      default: return <FaUserCheck />;
    }
  };

  if (loading) {
    return (
      <div className="mgr-dashboard-loading">
        <div className="mgr-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mgr-dashboard-error">
        <FaTimesCircle className="error-icon" />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mgr-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, teamAttendance, teamAttendanceRates, pendingLeaves, upcomingLeaves, tasks, performance, todayInfo } = dashboardData;

  // Check if today is holiday
  const isTodayHoliday = todayInfo?.isHoliday || stats?.isTodayHoliday;
  const isTodayWeekend = todayInfo?.isWeekend || stats?.isTodayWeekend;
  const todayType = todayInfo?.type || stats?.todayType;

  return (
    <div className="mgr-dashboard">
      {/* Welcome Header */}
      <div className="mgr-welcome">
        <div className="mgr-welcome__content">
          <span className="mgr-welcome__greeting">Manager Dashboard</span>
          <h1>Team Overview</h1>
          <p>Manage and monitor your team's performance</p>
        </div>
        <div className="mgr-welcome__date">
          <FaCalendarAlt />
          <div>
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <small>{currentTime.toLocaleTimeString()}</small>
          </div>
        </div>
      </div>

      {/* Today Info Banner - Shows if Holiday or Weekend */}
      {(isTodayHoliday || isTodayWeekend) && (
        <div className={`mgr-today-banner ${isTodayHoliday ? 'mgr-banner-holiday' : 'mgr-banner-weekend'}`}>
          <div className="mgr-banner-icon">
            {isTodayHoliday ? <FaUmbrella /> : <FaPlane />}
          </div>
          <div className="mgr-banner-content">
            <h4>{isTodayHoliday ? '🎉 Holiday Today!' : '🌴 Weekend Today!'}</h4>
            <p>
              {isTodayHoliday
                ? `Today is a company holiday. No attendance marking required for team members.`
                : `Today is ${todayType === 'WEEKEND' ? 'Sunday (Weekly Off)' : 'Saturday (Weekend)'}. Team members are not expected to work.`}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mgr-stats-grid">
        <div className="mgr-stat-card">
          <div className="mgr-stat-card__icon mgr-icon-team">
            <FaUsers />
          </div>
          <div className="mgr-stat-card__info">
            <span className="mgr-stat-card__label">Team Size</span>
            <strong className="mgr-stat-card__value">{stats.teamSize}</strong>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-card__icon mgr-icon-present">
            <FaUserCheck />
          </div>
          <div className="mgr-stat-card__info">
            <span className="mgr-stat-card__label">Present Today</span>
            <strong className="mgr-stat-card__value">
              {isTodayHoliday || isTodayWeekend ? '—' : stats.presentToday}
            </strong>
            {!(isTodayHoliday || isTodayWeekend) && (
              <small>of {stats.teamSize}</small>
            )}
            {(isTodayHoliday || isTodayWeekend) && (
              <small className="mgr-holiday-text">Holiday/Weekend</small>
            )}
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-card__icon mgr-icon-attendance">
            <FaPercentage />
          </div>
          <div className="mgr-stat-card__info">
            <span className="mgr-stat-card__label">Team Attendance</span>
            <strong className="mgr-stat-card__value">
              {isTodayHoliday || isTodayWeekend ? '—' : `${stats.attendancePercentage}%`}
            </strong>
            {(isTodayHoliday || isTodayWeekend) && (
              <small className="mgr-holiday-text">No attendance today</small>
            )}
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-card__icon mgr-icon-task">
            <FaTasks />
          </div>
          <div className="mgr-stat-card__info">
            <span className="mgr-stat-card__label">Pending Tasks</span>
            <strong className="mgr-stat-card__value">{stats.pendingTasks}</strong>
            {stats.overdueTasks > 0 && (
              <small className="mgr-warning">{stats.overdueTasks} overdue</small>
            )}
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-card__icon mgr-icon-leave">
            <FaUserClock />
          </div>
          <div className="mgr-stat-card__info">
            <span className="mgr-stat-card__label">Pending Leaves</span>
            <strong className="mgr-stat-card__value">{stats.pendingLeaveRequests}</strong>
          </div>
        </div>

        <div className="mgr-stat-card">
          <div className="mgr-stat-card__icon mgr-icon-rating">
            <FaStar />
          </div>
          <div className="mgr-stat-card__info">
            <span className="mgr-stat-card__label">Avg Team Rating</span>
            <strong className="mgr-stat-card__value">{stats.avgTeamRating}</strong>
            <small>/5</small>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mgr-tabs">
        <button
          className={`mgr-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FaClock /> Team Attendance
        </button>
        <button
          className={`mgr-tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <FaStar /> Performance
        </button>
        <button
          className={`mgr-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FaTasks /> Tasks
        </button>
      </div>

      {/* Tab Content */}
      <div className="mgr-tab-content">

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="mgr-two-column">

            {/* LEFT COLUMN - Today's Team Attendance */}
            <div className="mgr-left-col">
              <div className="mgr-card">
                <div className="mgr-card__header">
                  <h3><FaClock /> Today's Team Attendance</h3>
                  <span className="mgr-card-badge">
                    {isTodayHoliday || isTodayWeekend ? 'Holiday/Weekend' : `${stats.presentToday} / ${stats.teamSize} Present`}
                  </span>
                </div>

                {teamAttendance.length === 0 ? (
                  <div className="mgr-empty-state">
                    <FaUsers />
                    <p>No team members found</p>
                  </div>
                ) : (
                  <div className="mgr-attendance-list">
                    <div className="mgr-attendance-header">
                      <span>Employee</span>
                      <span>Status</span>
                      <span>Action</span>
                    </div>
                    {teamAttendance.map((member, idx) => (
                      <div key={idx} className="mgr-attendance-item">
                        <div className="mgr-attendance-info">
                          <div className="mgr-attendance-avatar">
                            {member.name?.charAt(0).toUpperCase()}
                            {member.role && <span className="mgr-role-badge">{member.role === 'HR' ? 'HR' : member.role === 'MANAGER' ? 'MGR' : 'EMP'}</span>}
                          </div>
                          <div>
                            <strong>{member.name}</strong>
                            <span className="mgr-attendance-id">{member.employeeId}</span>
                            {member.checkInTime && <small>In: {member.checkInTime}</small>}
                            {member.checkOutTime && <small>Out: {member.checkOutTime}</small>}
                          </div>
                        </div>
                        <div className={`mgr-attendance-status ${getStatusClass(member.status)}`}>
                          {getStatusIcon(member.status)}
                          {getStatusText(member.status)}
                        </div>
                        <button
                          className="mgr-view-btn"
                          onClick={() => handleViewMember(member)}
                          disabled={member.status === 'HOLIDAY' || member.status === 'WEEKEND'}
                        >
                          <FaEye /> View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - Monthly Attendance Rates & Leaves */}
            <div className="mgr-right-col">

              {/* Monthly Attendance Rates */}
              {teamAttendanceRates && teamAttendanceRates.length > 0 && (
                <div className="mgr-card">
                  <div className="mgr-card__header">
                    <h3><FaChartLine /> Monthly Attendance Rate</h3>
                  </div>
                  <div className="mgr-rates-list">
                    {teamAttendanceRates.map((member, idx) => (
                      <div key={idx} className="mgr-rate-item">
                        <div className="mgr-rate-info">
                          <div className="mgr-rate-name-wrap">
                            {getRoleIcon(member.role)}
                            <span className="mgr-rate-name">{member.employeeName}</span>
                            {member.role && <span className="mgr-role-tag">{member.role}</span>}
                          </div>
                          <span className="mgr-rate-days">{member.presentDays}/{member.workingDays} days</span>
                        </div>
                        <div className="mgr-rate-bar-wrapper">
                          <div
                            className="mgr-rate-bar"
                            style={{ width: `${member.attendanceRate}%` }}
                          ></div>
                          <span className="mgr-rate-percent">{member.attendanceRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Leave Requests */}
              <div className="mgr-card">
                <div className="mgr-card__header">
                  <h3><FaCalendarAlt /> Pending Leave Requests</h3>
                  {pendingLeaves.length > 0 && (
                    <span className="mgr-card-badge mgr-badge-warning">{pendingLeaves.length} Pending</span>
                  )}
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="mgr-empty-state mgr-empty-small">
                    <FaCheckCircle />
                    <p>No pending leave requests</p>
                  </div>
                ) : (
                  <div className="mgr-leave-list">
                    {pendingLeaves.slice(0, 5).map((leave, idx) => (
                      <div key={idx} className="mgr-leave-item">
                        <div className="mgr-leave-avatar">
                          {leave.employeeName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="mgr-leave-info">
                          <strong>{leave.employeeName}</strong>
                          <small>{leave.fromDate} to {leave.toDate}</small>
                          <p className="mgr-leave-reason">{leave.reason?.substring(0, 50)}</p>
                        </div>
                        <div className="mgr-leave-status pending">
                          Pending
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Leaves */}
              {upcomingLeaves && upcomingLeaves.length > 0 && (
                <div className="mgr-card">
                  <div className="mgr-card__header">
                    <h3><FaBell /> Upcoming Leaves</h3>
                  </div>
                  <div className="mgr-upcoming-list">
                    {upcomingLeaves.slice(0, 5).map((leave, idx) => (
                      <div key={idx} className="mgr-upcoming-item">
                        <span className="mgr-upcoming-name">{leave.employeeName}</span>
                        <span className="mgr-upcoming-date">{leave.fromDate} - {leave.toDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="mgr-performance-tab">
            {/* Team Performance Ratings */}
            {performance && performance.teamRatings && performance.teamRatings.length > 0 && (
              <div className="mgr-card mgr-card-full">
                <div className="mgr-card__header">
                  <h3><FaStar /> Team Performance Ratings</h3>
                  <span className="mgr-card-badge">Average: {performance.averageRating}/5</span>
                </div>

                {performance.topPerformer && (
                  <div className="mgr-top-performer">
                    <FaTrophy className="mgr-trophy-icon" />
                    <div>
                      <span>🏆 Top Performer</span>
                      <strong>{performance.topPerformer.name}</strong>
                      <small>Rating: {performance.topPerformer.lastRating}/5</small>
                    </div>
                  </div>
                )}

                <div className="mgr-performance-grid">
                  {performance.teamRatings.map((member, idx) => (
                    <div key={idx} className="mgr-performance-card">
                      <div className="mgr-performance-avatar" style={{ background: `linear-gradient(135deg, ${member.lastRating ? '#FBBF24' : '#94A3B8'}, ${member.lastRating ? '#F59E0B' : '#CBD5E1'})` }}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="mgr-performance-details">
                        <h4>{member.name}</h4>
                        {member.role && <span className="mgr-role-tag">{member.role}</span>}
                        <div className="mgr-performance-stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < Math.floor(member.lastRating || 0) ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                          <span>{member.lastRating || 'Not reviewed'}/5</span>
                        </div>
                        {member.reviewMonth && (
                          <small>Last review: {member.reviewMonth}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="mgr-tasks-tab">
            <div className="mgr-two-column">

              {/* Tasks Summary */}
              <div className="mgr-left-col">
                <div className="mgr-card">
                  <div className="mgr-card__header">
                    <h3><FaTasks /> Tasks Overview</h3>
                  </div>
                  <div className="mgr-task-stats">
                    <div className="mgr-task-stat">
                      <span>Total Tasks</span>
                      <strong>{tasks.summary.total}</strong>
                    </div>
                    <div className="mgr-task-stat">
                      <span>Completed</span>
                      <strong className="text-success">{tasks.summary.completed}</strong>
                    </div>
                    <div className="mgr-task-stat">
                      <span>Pending</span>
                      <strong className="text-warning">{tasks.summary.pending}</strong>
                    </div>
                    <div className="mgr-task-stat">
                      <span>Overdue</span>
                      <strong className="text-danger">{tasks.summary.overdue}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="mgr-right-col">
                <div className="mgr-card">
                  <div className="mgr-card__header">
                    <h3><FaBell /> Recent Tasks</h3>
                  </div>
                  {tasks.recent && tasks.recent.length > 0 ? (
                    <div className="mgr-recent-tasks">
                      {tasks.recent.slice(0, 5).map((task, idx) => (
                        <div key={idx} className="mgr-recent-task">
                          <div className="mgr-recent-task-info">
                            <strong>{task.title}</strong>
                            <small>Assigned to: {task.assignedTo?.map(a => a.employeeName).join(', ')}</small>
                          </div>
                          <div className={`mgr-task-badge ${task.status === 'COMPLETE' ? 'badge-complete' : 'badge-pending'}`}>
                            {task.status === 'COMPLETE' ? 'Completed' : 'Pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mgr-empty-state mgr-empty-small">
                      <FaCheckCircle />
                      <p>No tasks assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {showModal && selectedMember && (
        <div className="mgr-modal-overlay" onClick={closeModal}>
          <div className="mgr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mgr-modal__header" style={{ background: selectedMember.status === 'HOLIDAY' ? 'linear-gradient(135deg, #10B981, #059669)' : selectedMember.status === 'WEEKEND' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : undefined }}>
              <div className="mgr-modal__avatar">
                {selectedMember.name?.charAt(0).toUpperCase()}
              </div>
              <button className="mgr-modal__close" onClick={closeModal}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="mgr-modal__body">
              <h2>{selectedMember.name}</h2>
              <p className="mgr-modal__id">{selectedMember.employeeId}</p>
              {selectedMember.role && (
                <span className="mgr-modal-role">{selectedMember.role}</span>
              )}

              <div className="mgr-modal__info">
                <div className="mgr-modal__info-item">
                  <FaClock />
                  <div>
                    <label>Status</label>
                    <p className={getStatusClass(selectedMember.status)}>
                      {getStatusIcon(selectedMember.status)} {getStatusText(selectedMember.status)}
                    </p>
                  </div>
                </div>
                {selectedMember.message && (
                  <div className="mgr-modal__info-item">
                    <FaExclamationTriangle />
                    <div>
                      <label>Message</label>
                      <p>{selectedMember.message}</p>
                    </div>
                  </div>
                )}
                {selectedMember.checkInTime && (
                  <div className="mgr-modal__info-item">
                    <FaCheckCircle />
                    <div>
                      <label>Check In Time</label>
                      <p>{selectedMember.checkInTime}</p>
                    </div>
                  </div>
                )}
                {selectedMember.checkOutTime && (
                  <div className="mgr-modal__info-item">
                    <FaArrowRight />
                    <div>
                      <label>Check Out Time</label>
                      <p>{selectedMember.checkOutTime}</p>
                    </div>
                  </div>
                )}
                {selectedMember.totalHours > 0 && (
                  <div className="mgr-modal__info-item">
                    <FaClock />
                    <div>
                      <label>Total Hours</label>
                      <p>{selectedMember.totalHours} hours</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;