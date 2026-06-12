import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaUsers,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaCalculator,
  FaMoneyBillWave,
  FaUserTie,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaExclamationTriangle,
  FaClock,
  FaLock,
  FaCalendarCheck
} from 'react-icons/fa';
import EmployeeSalary from '../../Employee/Salary/EmployeeSalary';
import './HRSalary.scss';

const HRSalary = () => {
  const [activeTab, setActiveTab] = useState('mySalary');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [windowInfo, setWindowInfo] = useState(null); // For showing time window info

  // Filters
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: '',
    search: '',
    page: 1,
  });

  // Data
  const [salaries, setSalaries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalSalary: 0,
    paid: 0,
    unpaid: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [leaveUsage, setLeaveUsage] = useState(null);

  // Current user (HR) info
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState(null);

  // ========== CUSTOM CONFIRMATION MODAL STATE ==========
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
  });

  // ========== TIME WINDOW BANNER STATE ==========
  const [timeWindowBanner, setTimeWindowBanner] = useState({
    show: false,
    message: '',
    type: 'warning',
    allowedWindow: null
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  // Get current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/employee/me`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setCurrentUserEmployeeId(response.data.user.employeeId);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // ========== CONFIRMATION HELPER ==========
  const showConfirm = (title, message, onConfirm, type = 'danger', confirmText = 'Confirm') => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, show: false });
        onConfirm();
      },
      confirmText,
      cancelText: 'Cancel',
      type,
    });
  };

  // ========== CHECK IF SALARY PROCESSING IS ALLOWED ==========
  const isSalaryProcessingAllowed = (year, month) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();

    const lastDayOfTargetMonth = new Date(year, month, 0).getDate();

    // Case 1: We are in the target month AND date is between 26th and end of month
    if (currentYear === year && currentMonth === month) {
      return currentDate >= 26 && currentDate <= lastDayOfTargetMonth;
    }

    // Case 2: We are in next month AND date is between 1st and 5th
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = year + 1;
    }

    if (currentYear === nextYear && currentMonth === nextMonth) {
      return currentDate >= 1 && currentDate <= 5;
    }

    return false;
  };

  // ========== GET ALLOWED WINDOW INFO ==========
  const getAllowedWindowInfo = (year, month) => {
    const monthName = getMonthName(month);
    const lastDay = new Date(year, month, 0).getDate();

    let nextMonth = month + 1;
    let nextYear = year;
    let nextMonthName = getMonthName(nextMonth);
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = year + 1;
      nextMonthName = getMonthName(nextMonth);
    }

    return {
      message: `${monthName} ${year} salary can only be processed between ${monthName} 26th-${lastDay} and ${nextMonthName} 1st-5th.`,
      currentWindow: `Current allowed window: ${monthName} 26th-${lastDay} or ${nextMonthName} 1st-5th`,
      fromDate: `${year}-${String(month).padStart(2, '0')}-26`,
      toDate: `${year}-${String(month).padStart(2, '0')}-${lastDay}`,
      fromNextDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
      toNextDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-05`,
      targetMonth: monthName,
      targetYear: year
    };
  };

  // ========== CHECK AND SHOW WINDOW BANNER ==========
  const checkAndShowWindowBanner = () => {
    const { year, month } = filters;
    const isAllowed = isSalaryProcessingAllowed(year, month);

    if (!isAllowed) {
      const windowInfo = getAllowedWindowInfo(year, month);
      setTimeWindowBanner({
        show: true,
        message: windowInfo.message,
        type: 'warning',
        allowedWindow: windowInfo
      });
    } else {
      setTimeWindowBanner({
        show: false,
        message: '',
        type: 'warning',
        allowedWindow: null
      });
    }
  };

  // Fetch all salaries
  const fetchAllSalaries = async () => {
    setLoading(true);
    try {
      const { month, year, status, search, page } = filters;
      let url = `${apiUrl}/salary/all?page=${page}&limit=15`;
      if (month) url += `&month=${month}`;
      if (year) url += `&year=${year}`;
      if (status) url += `&status=${status}`;

      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        let filteredSalaries = response.data.salaries;

        if (search) {
          filteredSalaries = filteredSalaries.filter(s =>
            s.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
            s.employeeId?.toLowerCase().includes(search.toLowerCase())
          );
        }

        setSalaries(filteredSalaries);
        setPagination(response.data.pagination);

        const totalSalary = filteredSalaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
        setStats({
          total: filteredSalaries.length,
          totalSalary,
          paid: filteredSalaries.filter(s => s.status === 'PAID').length,
          unpaid: filteredSalaries.filter(s => s.status === 'UNPAID').length,
        });

        // Check time window after fetching
        checkAndShowWindowBanner();
      }
    } catch (error) {
      toast.error('Failed to fetch salaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'allEmployees') {
      fetchAllSalaries();
    }
  }, [activeTab, filters.month, filters.year, filters.status, filters.page]);

  // Calculate salary for an employee
  const handleCalculateSalary = async (employeeId, employeeName) => {
    const { year, month } = filters;
    const isAllowed = isSalaryProcessingAllowed(year, month);

    if (!isAllowed) {
      const windowInfo = getAllowedWindowInfo(year, month);
      toast.warning(windowInfo.message, {
        autoClose: 8000,
        position: "top-center"
      });
      return;
    }

    showConfirm(
      'Calculate Salary',
      `Calculate salary for ${employeeName} for ${getMonthName(month)} ${year}?`,
      async () => {
        setProcessingId(employeeId);
        try {
          const response = await axios.post(
            `${apiUrl}/salary/calculate/${employeeId}/${year}/${month}`,
            {},
            { withCredentials: true }
          );
          if (response.data.success) {
            toast.success(`Salary calculated for ${employeeName}`);
            fetchAllSalaries();
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Failed to calculate salary';
          toast.error(errorMsg);
          // If it's a time window error, show the banner
          if (error.response?.data?.error === 'SALARY_CALCULATION_WINDOW_CLOSED') {
            const allowedWindow = error.response?.data?.allowedWindow;
            setTimeWindowBanner({
              show: true,
              message: errorMsg,
              type: 'error',
              allowedWindow: allowedWindow
            });
          }
        } finally {
          setProcessingId(null);
        }
      },
      'info',
      'Calculate'
    );
  };

  // Mark salary as paid
  const handleMarkPaid = async (employeeId, employeeName) => {
    const { year, month } = filters;
    const isAllowed = isSalaryProcessingAllowed(year, month);

    if (!isAllowed) {
      const windowInfo = getAllowedWindowInfo(year, month);
      toast.warning(windowInfo.message, {
        autoClose: 8000,
        position: "top-center"
      });
      return;
    }

    if (employeeId === currentUserEmployeeId) {
      toast.error("You cannot mark your own salary as paid. Please contact Admin.");
      return;
    }

    showConfirm(
      'Mark as Paid',
      `Mark salary as paid for ${employeeName} for ${getMonthName(month)} ${year}?`,
      async () => {
        setProcessingId(employeeId);
        try {
          const response = await axios.put(
            `${apiUrl}/salary/${employeeId}/${year}/${month}/mark-paid`,
            {},
            { withCredentials: true }
          );
          if (response.data.success) {
            toast.success(`Salary marked as paid for ${employeeName}`);
            fetchAllSalaries();
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Failed to mark as paid';
          toast.error(errorMsg);
          if (error.response?.data?.error === 'SALARY_MARK_PAID_WINDOW_CLOSED') {
            const allowedWindow = error.response?.data?.allowedWindow;
            setTimeWindowBanner({
              show: true,
              message: errorMsg,
              type: 'error',
              allowedWindow: allowedWindow
            });
          }
        } finally {
          setProcessingId(null);
        }
      },
      'success',
      'Mark Paid'
    );
  };

  // Bulk calculate all salaries
  const handleBulkCalculate = async () => {
    const { year, month } = filters;
    const isAllowed = isSalaryProcessingAllowed(year, month);

    if (!isAllowed) {
      const windowInfo = getAllowedWindowInfo(year, month);
      toast.warning(windowInfo.message, {
        autoClose: 8000,
        position: "top-center"
      });
      return;
    }

    showConfirm(
      'Bulk Calculate',
      `Calculate salary for ALL employees for ${getMonthName(month)} ${year}? This may take a moment.`,
      async () => {
        setBulkProcessing(true);
        try {
          const employeesResponse = await axios.get(`${apiUrl}/employee/all-employees`, {
            withCredentials: true,
          });
          const employees = employeesResponse.data.users.filter(u => u.role !== 'ADMIN');

          let successCount = 0;
          let failCount = 0;
          let windowClosedCount = 0;

          for (const emp of employees) {
            try {
              await axios.post(
                `${apiUrl}/salary/calculate/${emp.employeeId}/${year}/${month}`,
                {},
                { withCredentials: true }
              );
              successCount++;
            } catch (error) {
              failCount++;
              if (error.response?.data?.error === 'SALARY_CALCULATION_WINDOW_CLOSED') {
                windowClosedCount++;
              }
            }
          }

          let successMsg = `Calculated: ${successCount} successful, ${failCount} failed`;
          if (windowClosedCount > 0) {
            successMsg += ` (${windowClosedCount} failed due to time window)`;
          }
          toast.success(successMsg);
          fetchAllSalaries();
        } catch (error) {
          toast.error('Failed to bulk calculate');
        } finally {
          setBulkProcessing(false);
        }
      },
      'info',
      'Calculate All'
    );
  };

  // Bulk mark all as paid
  const handleBulkMarkPaid = async () => {
    const { year, month } = filters;
    const isAllowed = isSalaryProcessingAllowed(year, month);

    if (!isAllowed) {
      const windowInfo = getAllowedWindowInfo(year, month);
      toast.warning(windowInfo.message, {
        autoClose: 8000,
        position: "top-center"
      });
      return;
    }

    showConfirm(
      'Bulk Mark Paid',
      `Mark ALL as paid for ${getMonthName(month)} ${year}? This action cannot be undone.`,
      async () => {
        setBulkProcessing(true);
        try {
          const unpaidSalaries = salaries.filter(s => s.status === 'UNPAID' && s.employeeId !== currentUserEmployeeId);
          let successCount = 0;
          let failCount = 0;

          for (const salary of unpaidSalaries) {
            try {
              await axios.put(
                `${apiUrl}/salary/${salary.employeeId}/${year}/${month}/mark-paid`,
                {},
                { withCredentials: true }
              );
              successCount++;
            } catch (error) {
              failCount++;
            }
          }

          toast.success(`Marked: ${successCount} successful, ${failCount} failed (HR's own salary excluded)`);
          fetchAllSalaries();
        } catch (error) {
          toast.error('Failed to bulk mark paid');
        } finally {
          setBulkProcessing(false);
        }
      },
      'danger',
      'Mark All Paid'
    );
  };

  // View employee details
  const handleViewDetails = async (employee) => {
    setSelectedEmployee(employee);
    setLoading(true);
    try {
      const [salaryRes, leaveRes] = await Promise.all([
        axios.get(`${apiUrl}/salary/employee/${employee.employeeId}`, { withCredentials: true }),
        axios.get(`${apiUrl}/leave/usage/${filters.year}/${filters.month}?employeeId=${employee.employeeId}`, { withCredentials: true })
      ]);

      if (salaryRes.data.success) {
        const record = salaryRes.data.records.find(r =>
          r.month === `${filters.year}-${String(filters.month).padStart(2, '0')}`
        );
        setEmployeeDetails(record);
      }
      if (leaveRes.data.success) {
        setLeaveUsage(leaveRes.data.leaveUsage);
      }
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    if (status === 'PAID') {
      return <span className="status-badge status-paid"><FaCheckCircle /> Paid</span>;
    }
    return <span className="status-badge status-unpaid"><FaClock /> Unpaid</span>;
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="hr-salary">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="salary-header">
        <h1><FaMoneyBillWave /> Salary Management</h1>
        <p>View your salary and manage employee payroll</p>
      </div>

      {/* Tabs */}
      <div className="salary-tabs">
        <button
          className={`tab-btn ${activeTab === 'mySalary' ? 'active' : ''}`}
          onClick={() => setActiveTab('mySalary')}
        >
          <FaUserTie /> My Salary
        </button>
        <button
          className={`tab-btn ${activeTab === 'allEmployees' ? 'active' : ''}`}
          onClick={() => setActiveTab('allEmployees')}
        >
          <FaUsers /> All Employees
        </button>
      </div>

      {/* Tab 1: My Salary */}
      {activeTab === 'mySalary' && (
        <div className="my-salary-tab">
          <EmployeeSalary />
        </div>
      )}

      {/* Tab 2: All Employees Management */}
      {activeTab === 'allEmployees' && (
        <div className="all-employees-tab">

          {/* ========== TIME WINDOW BANNER ========== */}
          {timeWindowBanner.show && (
            <div className={`time-window-banner time-window-banner--${timeWindowBanner.type}`}>
              <div className="time-window-banner__icon">
                <FaLock />
              </div>
              <div className="time-window-banner__content">
                <h4>⚠️ Salary Processing Window</h4>
                <p>{timeWindowBanner.message}</p>
                {timeWindowBanner.allowedWindow && (
                  <div className="time-window-banner__details">
                    <span><FaCalendarCheck /> Allowed: {timeWindowBanner.allowedWindow.fromDate} to {timeWindowBanner.allowedWindow.toDate}</span>
                    <span>OR</span>
                    <span>{timeWindowBanner.allowedWindow.fromNextDate} to {timeWindowBanner.allowedWindow.toNextDate}</span>
                  </div>
                )}
              </div>
              <button
                className="time-window-banner__close"
                onClick={() => setTimeWindowBanner({ ...timeWindowBanner, show: false })}
              >
                <FaTimesCircle />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="filters-card">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Month</label>
                <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value), page: 1 })}>
                  {months.map(m => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Year</label>
                <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value), page: 1 })}>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Status</label>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                  <option value="">All</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
              </div>
              <div className="filter-group search-group">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FaUsers /></div>
              <div className="stat-info">
                <h3>Total Employees</h3>
                <p>{stats.total}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaMoneyBillWave /></div>
              <div className="stat-info">
                <h3>Total Salary</h3>
                <p>{formatCurrency(stats.totalSalary)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaCheckCircle /></div>
              <div className="stat-info">
                <h3>Paid</h3>
                <p className="paid">{stats.paid}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaClock /></div>
              <div className="stat-info">
                <h3>Unpaid</h3>
                <p className="unpaid">{stats.unpaid}</p>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="bulk-actions">
            <button className="bulk-calc-btn" onClick={handleBulkCalculate} disabled={bulkProcessing}>
              {bulkProcessing ? <FaSpinner className="spinning" /> : <FaCalculator />}
              {bulkProcessing ? 'Processing...' : 'Calculate All'}
            </button>
            <button className="bulk-paid-btn" onClick={handleBulkMarkPaid} disabled={bulkProcessing}>
              {bulkProcessing ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
              {bulkProcessing ? 'Processing...' : 'Mark All Paid'}
            </button>
          </div>

          {/* Employees Table */}
          <div className="employees-table-card">
            <div className="table-header">
              <h2><FaUsers /> Employees Salary for {getMonthName(filters.month)} {filters.year}</h2>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading salaries...</p>
              </div>
            ) : salaries.length === 0 ? (
              <div className="empty-state">
                <FaUsers />
                <p>No salary records found</p>
                <small>Click "Calculate All" to generate salaries</small>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="salary-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Role</th>
                        <th>Basic Salary</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaries.map((salary) => {
                        const isSelf = salary.employeeId === currentUserEmployeeId;
                        const hasRecord = salary.hasRecord || salary.netSalary > 0;
                        const isProcessingAllowed = isSalaryProcessingAllowed(filters.year, filters.month);

                        return (
                          <tr key={salary.employeeId}>
                            <td className="employee-cell">
                              <div className="employee-avatar">
                                {salary.employeeName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="employee-name">{salary.employeeName}</div>
                                <div className="employee-id">{salary.employeeId}</div>
                              </div>
                            </td>
                            <td><span className="role-badge">{salary.role || 'EMPLOYEE'}</span></td>
                            <td>{formatCurrency(salary.basicSalary)}</td>
                            <td className="net-salary">{formatCurrency(salary.netSalary)}</td>
                            <td>{getStatusBadge(salary.status)}</td>
                            <td className="actions-cell">
                              {/* Calculate button */}
                              <button
                                className={`action-calc ${!isProcessingAllowed ? 'disabled' : ''}`}
                                onClick={() => handleCalculateSalary(salary.employeeId, salary.employeeName)}
                                disabled={processingId === salary.employeeId || !isProcessingAllowed}
                                title={!isProcessingAllowed ? "Salary calculation window is closed" : "Calculate Salary"}
                              >
                                {processingId === salary.employeeId ? <FaSpinner className="spinning" /> : <FaCalculator />}
                                Calculate
                              </button>

                              {/* Mark Paid button */}
                              {hasRecord && salary.status !== 'PAID' && !isSelf && (
                                <button
                                  className={`action-paid ${!isProcessingAllowed ? 'disabled' : ''}`}
                                  onClick={() => handleMarkPaid(salary.employeeId, salary.employeeName)}
                                  disabled={processingId === salary.employeeId || !isProcessingAllowed}
                                  title={!isProcessingAllowed ? "Salary processing window is closed" : "Mark as Paid"}
                                >
                                  {processingId === salary.employeeId ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
                                  Mark Paid
                                </button>
                              )}

                              {/* Self note for HR */}
                              {hasRecord && isSelf && salary.status !== 'PAID' && (
                                <span className="self-note" title="HR cannot mark own salary as paid">
                                  <FaExclamationTriangle /> Contact Admin
                                </span>
                              )}

                              {/* View button */}
                              {hasRecord && (
                                <button
                                  className="action-view"
                                  onClick={() => handleViewDetails(salary)}
                                  title="View Details"
                                >
                                  <FaEye /> View
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page === 1}>
                      Previous
                    </button>
                    <span>Page {filters.page} of {pagination.totalPages}</span>
                    <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page === pagination.totalPages}>
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Salary Details - {selectedEmployee.employeeName}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="modal-loading"><div className="spinner"></div></div>
              ) : employeeDetails ? (
                <>
                  <div className="salary-summary">
                    <div className="summary-item">
                      <span>Basic Salary:</span>
                      <strong>{formatCurrency(selectedEmployee.basicSalary)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Net Salary:</span>
                      <strong className="net">{formatCurrency(employeeDetails.netSalary)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Status:</span>
                      {getStatusBadge(employeeDetails.status)}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Attendance Summary</h4>
                    <div className="detail-grid">
                      <div><span>Working Days:</span> <strong>{employeeDetails.attendanceSummary?.totalWorkingDays || 0}</strong></div>
                      <div><span>Present:</span> <strong>{employeeDetails.attendanceSummary?.presentDays || 0}</strong></div>
                      <div><span>Late:</span> <strong>{employeeDetails.attendanceSummary?.lateDays || 0}</strong></div>
                      <div><span>Half Day:</span> <strong>{employeeDetails.attendanceSummary?.halfDays || 0}</strong></div>
                      <div><span>Absent:</span> <strong>{employeeDetails.attendanceSummary?.absentDays || 0}</strong></div>
                      <div><span>Unpaid Leave:</span> <strong>{employeeDetails.attendanceSummary?.unpaidLeaveDays || 0}</strong></div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Leave Usage</h4>
                    <div className="leave-grid">
                      <div><span>Casual Leave:</span> <strong>{leaveUsage?.CL?.taken || 0} days</strong></div>
                      <div><span>Sick Leave:</span> <strong>{leaveUsage?.SL?.taken || 0} days</strong></div>
                      <div><span>Paid Leave:</span> <strong>{leaveUsage?.PL?.taken || 0} days</strong></div>
                      <div><span>Earned Leave:</span> <strong>{leaveUsage?.EL?.taken || 0} days</strong></div>
                      <div><span>Unpaid Leave:</span> <strong className="warning">{leaveUsage?.LOP?.taken || 0} days</strong></div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Deductions</h4>
                    <div className="detail-grid">
                      <div><span>Late Deduction:</span> <strong>{formatCurrency(employeeDetails.lateDeduction || 0)}</strong></div>
                      <div><span>Half Day Deduction:</span> <strong>{formatCurrency(employeeDetails.halfDayDeduction || 0)}</strong></div>
                      <div><span>Absent Deduction:</span> <strong>{formatCurrency(employeeDetails.absentDeduction || 0)}</strong></div>
                      <div><span>Leave Deduction:</span> <strong>{formatCurrency(employeeDetails.leaveDeduction || 0)}</strong></div>
                      <div><span>Total Deductions:</span> <strong className="deduction">{formatCurrency(employeeDetails.totalDeductions || 0)}</strong></div>
                    </div>
                  </div>

                  {employeeDetails.paidAt && (
                    <div className="detail-section">
                      <h4>Payment Info</h4>
                      <div className="detail-grid">
                        <div><span>Paid On:</span> <strong>{new Date(employeeDetails.paidAt).toLocaleDateString()}</strong></div>
                        <div><span>Paid By:</span> <strong>{employeeDetails.paidByName || 'HR/Admin'}</strong></div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-data">No salary record found for this month</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CUSTOM CONFIRMATION MODAL ========== */}
      {confirmModal.show && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
          <div className={`confirm-modal confirm-modal--${confirmModal.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal__header">
              <div className="confirm-modal__icon">
                <FaExclamationTriangle />
              </div>
              <button className="confirm-modal__close" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="confirm-modal__body">
              <h3>{confirmModal.title}</h3>
              <p>{confirmModal.message}</p>
            </div>
            <div className="confirm-modal__footer">
              <button className="confirm-modal__cancel" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                {confirmModal.cancelText}
              </button>
              <button className="confirm-modal__confirm" onClick={confirmModal.onConfirm}>
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRSalary;