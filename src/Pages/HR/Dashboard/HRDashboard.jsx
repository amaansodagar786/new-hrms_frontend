import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUsers, FaUserCheck, FaUserClock, FaTasks,
  FaCalendarAlt, FaStar, FaChartLine, FaClock,
  FaCheckCircle, FaTimesCircle, FaSpinner,
  FaArrowRight, FaBell, FaEye, FaPercentage,
  FaUmbrella, FaPlane, FaExclamationTriangle,
  FaMoneyBillWave, FaBuilding, FaEnvelope,
  FaPhone, FaIdCard, FaUserTie, FaChartBar,
  FaFilter, FaSearch, FaDownload, FaPrint
} from 'react-icons/fa';
import './HRDashboard.scss';

const HRDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

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
        const response = await axios.get(`${apiUrl}/hr/dashboard`, {
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

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'ON_TIME': 'status-on-time',
      'LATE': 'status-late',
      'ABSENT': 'status-absent',
      'HALF_DAY': 'status-half-day',
      'PENDING': 'status-pending',
      'APPROVED': 'status-approved',
      'REJECTED': 'status-rejected'
    };
    return statusMap[status] || 'status-default';
  };

  if (loading) {
    return (
      <div className="hr-dashboard-loading">
        <div className="hr-spinner"></div>
        <p>Loading HR Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-dashboard-error">
        <FaTimesCircle className="error-icon" />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="hr-retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { employeeOverview, leaveManagement, salaryManagement, performanceOverview, upcomingEvents } = dashboardData;

  // Filter employees by search and department
  const filteredEmployees = employeeOverview?.attendanceRates?.filter(emp => {
    const matchesSearch = emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
    return matchesSearch && matchesDept;
  }) || [];

  // Get unique departments for filter
  const departments = [...new Set(employeeOverview?.attendanceRates?.map(emp => emp.department).filter(Boolean))];

  return (
    <div className="hr-dashboard">
      {/* Welcome Header */}
      <div className="hr-welcome">
        <div className="hr-welcome__content">
          <span className="hr-welcome__greeting">HR Dashboard</span>
          <h1>Human Resources Overview</h1>
          <p>Manage employees, attendance, leaves, and performance</p>
        </div>
        <div className="hr-welcome__date">
          <FaCalendarAlt />
          <div>
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <small>{currentTime.toLocaleTimeString()}</small>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="hr-stats-grid">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-icon-total">
            <FaUsers />
          </div>
          <div className="hr-stat-card__info">
            <span className="hr-stat-card__label">Total Employees</span>
            <strong className="hr-stat-card__value">{employeeOverview?.total || 0}</strong>
            <small>{employeeOverview?.active || 0} active</small>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-icon-new">
            <FaUserCheck />
          </div>
          <div className="hr-stat-card__info">
            <span className="hr-stat-card__label">New Joiners</span>
            <strong className="hr-stat-card__value">{employeeOverview?.newJoinersThisMonth || 0}</strong>
            <small>this month</small>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-icon-pending">
            <FaUserClock />
          </div>
          <div className="hr-stat-card__info">
            <span className="hr-stat-card__label">Pending Leaves</span>
            <strong className="hr-stat-card__value">{leaveManagement?.pendingCount || 0}</strong>
            <small>awaiting approval</small>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-icon-absent">
            <FaTimesCircle />
          </div>
          <div className="hr-stat-card__info">
            <span className="hr-stat-card__label">Absent Today</span>
            <strong className="hr-stat-card__value">{leaveManagement?.absentToday?.length || 0}</strong>
            <small>not checked in</small>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-icon-salary">
            <FaMoneyBillWave />
          </div>
          <div className="hr-stat-card__info">
            <span className="hr-stat-card__label">Pending Salary</span>
            <strong className="hr-stat-card__value">{salaryManagement?.pendingCount || 0}</strong>
            <small>to process</small>
          </div>
        </div>

        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-icon-review">
            <FaStar />
          </div>
          <div className="hr-stat-card__info">
            <span className="hr-stat-card__label">Pending Reviews</span>
            <strong className="hr-stat-card__value">{performanceOverview?.pendingReviews || 0}</strong>
            <small>performance reviews</small>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="hr-tabs">
        <button
          className={`hr-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartBar /> Overview
        </button>
        <button
          className={`hr-tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <FaUsers /> Employees
        </button>
        <button
          className={`hr-tab ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <FaCalendarAlt /> Leave Requests
        </button>
        <button
          className={`hr-tab ${activeTab === 'salary' ? 'active' : ''}`}
          onClick={() => setActiveTab('salary')}
        >
          <FaMoneyBillWave /> Salary
        </button>
      </div>

      {/* Tab Content */}
      <div className="hr-tab-content">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="hr-two-column">

            {/* LEFT COLUMN */}
            <div className="hr-left-col">

              {/* Department Distribution */}
              <div className="hr-card">
                <div className="hr-card__header">
                  <h3><FaBuilding /> Department Distribution</h3>
                </div>
                <div className="hr-department-list">
                  {Object.entries(employeeOverview?.departmentDistribution || {}).map(([dept, count], idx) => (
                    <div key={idx} className="hr-department-item">
                      <span className="hr-dept-name">{dept}</span>
                      <div className="hr-dept-bar-wrapper">
                        <div
                          className="hr-dept-bar"
                          style={{ width: `${(count / employeeOverview?.total) * 100}%` }}
                        ></div>
                        <span className="hr-dept-count">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Trend */}
              <div className="hr-card">
                <div className="hr-card__header">
                  <h3><FaChartLine /> Salary Trend</h3>
                </div>
                <div className="hr-salary-trend">
                  {salaryManagement?.monthlyTrend?.map((item, idx) => (
                    <div key={idx} className="hr-trend-item">
                      <span className="hr-trend-month">{item.month}</span>
                      <div className="hr-trend-bar-wrapper">
                        <div
                          className="hr-trend-bar"
                          style={{ width: `${(item.total / Math.max(...salaryManagement.monthlyTrend.map(t => t.total))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="hr-trend-amount">₹{(item.total / 100000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="hr-right-col">

              {/* Pending Leave Requests Summary */}
              <div className="hr-card">
                <div className="hr-card__header">
                  <h3><FaCalendarAlt /> Recent Leave Requests</h3>
                  {leaveManagement?.pendingCount > 0 && (
                    <span className="hr-badge-warning">{leaveManagement.pendingCount} Pending</span>
                  )}
                </div>
                {leaveManagement?.pendingLeaves?.length === 0 ? (
                  <div className="hr-empty-state">
                    <FaCheckCircle />
                    <p>No pending leave requests</p>
                  </div>
                ) : (
                  <div className="hr-leave-summary">
                    {leaveManagement?.pendingLeaves?.slice(0, 5).map((leave, idx) => (
                      <div key={idx} className="hr-leave-summary-item">
                        <div className="hr-leave-summary-info">
                          <strong>{leave.employeeName}</strong>
                          <small>{leave.fromDate} to {leave.toDate}</small>
                        </div>
                        <span className="hr-status-badge pending">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Balance Alerts */}
              {leaveManagement?.lowBalanceAlerts?.length > 0 && (
                <div className="hr-card hr-alert-card">
                  <div className="hr-card__header">
                    <h3><FaExclamationTriangle /> Leave Balance Alerts</h3>
                  </div>
                  <div className="hr-alerts-list">
                    {leaveManagement.lowBalanceAlerts.map((alert, idx) => (
                      <div key={idx} className="hr-alert-item">
                        <span className="hr-alert-name">{alert.employeeName}</span>
                        <span className="hr-alert-balance">{alert.remainingBalance} days left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Overview */}
              <div className="hr-card">
                <div className="hr-card__header">
                  <h3><FaStar /> Performance Overview</h3>
                  <span className="hr-card-badge">Avg: {performanceOverview?.averageRating || 0}/5</span>
                </div>
                <div className="hr-performance-summary">
                  {performanceOverview?.recentReviews?.slice(0, 5).map((review, idx) => (
                    <div key={idx} className="hr-performance-item">
                      <div className="hr-performance-info">
                        <strong>{review.employeeName}</strong>
                        <div className="hr-performance-stars">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < Math.floor(review.overallRating) ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="hr-performance-rating">{review.overallRating}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEES TAB */}
        {activeTab === 'employees' && (
          <div className="hr-employees-tab">
            <div className="hr-card">
              <div className="hr-card__header">
                <h3><FaUsers /> Employee Attendance Rates</h3>
                <div className="hr-filters">
                  <div className="hr-search">
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="hr-filter-select"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hr-employees-list">
                <div className="hr-employees-header">
                  <span>Employee</span>
                  <span>Department</span>
                  <span>Role</span>
                  <span>Attendance Rate</span>
                  <span>Working Days</span>
                  <span>Action</span>
                </div>
                {filteredEmployees.map((emp, idx) => (
                  <div key={idx} className="hr-employee-item">
                    <div className="hr-employee-info">
                      <div className="hr-employee-avatar">
                        {emp.employeeName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{emp.employeeName}</strong>
                        <small>{emp.employeeId}</small>
                      </div>
                    </div>
                    <span className="hr-employee-dept">{emp.department || '—'}</span>
                    <span className="hr-employee-role">{emp.role || 'EMPLOYEE'}</span>
                    <div className="hr-attendance-rate-cell">
                      <div className="hr-rate-bar-small">
                        <div
                          className="hr-rate-fill"
                          style={{ width: `${emp.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="hr-rate-value">{emp.attendanceRate}%</span>
                    </div>
                    <span className="hr-working-days">{emp.presentDays}/{emp.workingDays}</span>
                    <button
                      className="hr-view-btn"
                      onClick={() => handleViewEmployee(emp)}
                    >
                      <FaEye /> View
                    </button>
                  </div>
                ))}
              </div>

              <div className="hr-employees-footer">
                <span>Total Employees: {filteredEmployees.length}</span>
                <span>Average Attendance: {(filteredEmployees.reduce((sum, e) => sum + parseFloat(e.attendanceRate), 0) / filteredEmployees.length || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          <div className="hr-leaves-tab">
            <div className="hr-two-column">
              <div className="hr-left-col">
                <div className="hr-card">
                  <div className="hr-card__header">
                    <h3><FaCalendarAlt /> Pending Leave Requests</h3>
                  </div>
                  {leaveManagement?.pendingLeaves?.length === 0 ? (
                    <div className="hr-empty-state">
                      <FaCheckCircle />
                      <p>No pending leave requests</p>
                    </div>
                  ) : (
                    <div className="hr-pending-leaves">
                      {leaveManagement?.pendingLeaves?.map((leave, idx) => (
                        <div key={idx} className="hr-pending-leave-item">
                          <div className="hr-pending-leave-header">
                            <strong>{leave.employeeName}</strong>
                            <span className="hr-status-badge pending">Pending</span>
                          </div>
                          <div className="hr-pending-leave-dates">
                            <FaCalendarAlt /> {leave.fromDate} to {leave.toDate}
                          </div>
                          <p className="hr-pending-leave-reason">{leave.reason}</p>
                          <div className="hr-pending-leave-actions">
                            <button className="hr-approve-btn">Approve</button>
                            <button className="hr-reject-btn">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="hr-right-col">
                <div className="hr-card">
                  <div className="hr-card__header">
                    <h3><FaTimesCircle /> Absent Today</h3>
                  </div>
                  {leaveManagement?.absentToday?.length === 0 ? (
                    <div className="hr-empty-state">
                      <FaCheckCircle />
                      <p>No absent employees today</p>
                    </div>
                  ) : (
                    <div className="hr-absent-list">
                      {leaveManagement.absentToday.map((emp, idx) => (
                        <div key={idx} className="hr-absent-item">
                          <div className="hr-absent-avatar">
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="hr-absent-info">
                            <strong>{emp.name}</strong>
                            <small>{emp.department || 'No department'}</small>
                          </div>
                          <span className="hr-absent-badge">Absent</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SALARY TAB */}
        {activeTab === 'salary' && (
          <div className="hr-salary-tab">
            <div className="hr-two-column">
              <div className="hr-left-col">
                <div className="hr-card">
                  <div className="hr-card__header">
                    <h3><FaMoneyBillWave /> Salary Summary</h3>
                  </div>
                  <div className="hr-salary-stats">
                    <div className="hr-salary-stat-item">
                      <label>Total to Process</label>
                      <strong>₹{(salaryManagement?.totalToProcess / 100000).toFixed(2)}L</strong>
                    </div>
                    <div className="hr-salary-stat-item">
                      <label>Processed</label>
                      <strong className="text-success">{salaryManagement?.processedCount || 0}</strong>
                      <small>employees</small>
                    </div>
                    <div className="hr-salary-stat-item">
                      <label>Pending</label>
                      <strong className="text-warning">{salaryManagement?.pendingCount || 0}</strong>
                      <small>employees</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hr-right-col">
                <div className="hr-card">
                  <div className="hr-card__header">
                    <h3><FaChartLine /> Monthly Trend</h3>
                  </div>
                  <div className="hr-salary-chart">
                    {salaryManagement?.monthlyTrend?.map((item, idx) => (
                      <div key={idx} className="hr-chart-bar">
                        <div
                          className="hr-chart-fill"
                          style={{ height: `${(item.total / Math.max(...salaryManagement.monthlyTrend.map(t => t.total))) * 100}%` }}
                        ></div>
                        <span>{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {showModal && selectedEmployee && (
        <div className="hr-modal-overlay" onClick={closeModal}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal__header">
              <div className="hr-modal__avatar">
                {selectedEmployee.employeeName?.charAt(0).toUpperCase()}
              </div>
              <button className="hr-modal__close" onClick={closeModal}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="hr-modal__body">
              <h2>{selectedEmployee.employeeName}</h2>
              <p className="hr-modal__id">{selectedEmployee.employeeId}</p>

              <div className="hr-modal__info">
                <div className="hr-modal__info-item">
                  <FaChartLine />
                  <div>
                    <label>Attendance Rate</label>
                    <p>{selectedEmployee.attendanceRate}%</p>
                  </div>
                </div>
                <div className="hr-modal__info-item">
                  <FaClock />
                  <div>
                    <label>Present Days</label>
                    <p>{selectedEmployee.presentDays} / {selectedEmployee.workingDays}</p>
                  </div>
                </div>
                <div className="hr-modal__info-item">
                  <FaBuilding />
                  <div>
                    <label>Department</label>
                    <p>{selectedEmployee.department || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="hr-modal__info-item">
                  <FaUserTie />
                  <div>
                    <label>Role</label>
                    <p>{selectedEmployee.role || 'EMPLOYEE'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;