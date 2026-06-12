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
  FaCalendarCheck,
  FaPlusCircle,
  FaMinusCircle,
  FaPercentage,
  FaRupeeSign,
  FaUser,
  FaBriefcase,
  FaBuilding,
  FaIdCard
} from 'react-icons/fa';
import EmployeeSalary from '../../Employee/Salary/EmployeeSalary';
import html2pdf from 'html2pdf.js';
import './HRSalary.scss';

const HRSalary = () => {
  const [activeTab, setActiveTab] = useState('mySalary');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [windowInfo, setWindowInfo] = useState(null);

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

  // ========== PAYSLIP STATE ==========
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [payslipData, setPayslipData] = useState(null);
  const [loadingPayslip, setLoadingPayslip] = useState(false);

  // ========== NEW: Salary Component Selection ==========
  const [availableComponents, setAvailableComponents] = useState([]);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [currentCalculateEmployee, setCurrentCalculateEmployee] = useState(null);
  const [loadingComponents, setLoadingComponents] = useState(false);

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

  // ========== FETCH AVAILABLE COMPONENTS ==========
  const fetchAvailableComponents = async () => {
    setLoadingComponents(true);
    try {
      const response = await axios.get(`${apiUrl}/salary/components`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setAvailableComponents(response.data.components);
        const allCodes = response.data.components.map(c => c.code);
        setSelectedComponents(allCodes);
      }
    } catch (error) {
      console.error('Failed to fetch components:', error);
      toast.error('Failed to fetch salary components');
    } finally {
      setLoadingComponents(false);
    }
  };

  // ========== PAYSLIP FUNCTIONS ==========
  const fetchPayslip = async (employeeId, year, month, employeeName) => {
    setLoadingPayslip(true);
    try {
      const response = await axios.get(`${apiUrl}/salary/payslip/${employeeId}/${year}/${month}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setPayslipData(response.data.payslip);
        setShowPayslipModal(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch payslip');
    } finally {
      setLoadingPayslip(false);
    }
  };

  const handleViewPayslip = (employee) => {
    const year = filters.year;
    const month = String(filters.month).padStart(2, '0');
    fetchPayslip(employee.employeeId, year, month, employee.employeeName);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('hr-payslip-content');
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Payslip_${payslipData?.employee?.name?.replace(/\s/g, '_')}_${payslipData?.salaryMonth}_${payslipData?.salaryYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    toast.success('Payslip downloaded successfully!');
  };

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

    if (currentYear === year && currentMonth === month) {
      return currentDate >= 26 && currentDate <= lastDayOfTargetMonth;
    }

    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear = year + 1;
    }

    if (currentYear === nextYear && currentMonth === nextMonth) {
      return currentDate >= 1 && currentDate <= 15;
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
      message: `${monthName} ${year} salary can only be processed between ${monthName} 26th-${lastDay} and ${nextMonthName} 1st-15th.`,
      currentWindow: `Current allowed window: ${monthName} 26th-${lastDay} or ${nextMonthName} 1st-15th`,
      fromDate: `${year}-${String(month).padStart(2, '0')}-26`,
      toDate: `${year}-${String(month).padStart(2, '0')}-${lastDay}`,
      fromNextDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
      toNextDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-15`,
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
      fetchAvailableComponents();
    }
  }, [activeTab, filters.month, filters.year, filters.status, filters.page]);

  // ========== OPEN COMPONENT SELECTION MODAL ==========
  const openComponentSelection = (employeeId, employeeName) => {
    setCurrentCalculateEmployee({ employeeId, employeeName });
    setShowComponentModal(true);
  };

  // ========== TOGGLE COMPONENT SELECTION ==========
  const toggleComponent = (code) => {
    if (selectedComponents.includes(code)) {
      setSelectedComponents(selectedComponents.filter(c => c !== code));
    } else {
      setSelectedComponents([...selectedComponents, code]);
    }
  };

  // ========== SELECT ALL COMPONENTS ==========
  const selectAllComponents = () => {
    const allCodes = availableComponents.map(c => c.code);
    setSelectedComponents(allCodes);
  };

  // ========== DESELECT ALL COMPONENTS ==========
  const deselectAllComponents = () => {
    setSelectedComponents([]);
  };

  // ========== CALCULATE SALARY WITH SELECTED COMPONENTS ==========
  const handleCalculateSalaryWithComponents = async () => {
    if (!currentCalculateEmployee) return;

    const { year, month } = filters;
    const { employeeId, employeeName } = currentCalculateEmployee;

    setShowComponentModal(false);
    setProcessingId(employeeId);

    try {
      const response = await axios.post(
        `${apiUrl}/salary/calculate/${employeeId}/${year}/${month}`,
        { selectedComponents: selectedComponents },
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
      setCurrentCalculateEmployee(null);
    }
  };

  // Calculate salary for an employee (opens component selection)
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

    openComponentSelection(employeeId, employeeName);
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
                { selectedComponents: [] },
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

  const isProcessingAllowed = isSalaryProcessingAllowed(filters.year, filters.month);

  // Separate components by type
  const additionComponents = availableComponents.filter(c => c.type === 'addition');
  const deductionComponents = availableComponents.filter(c => c.type === 'deduction');

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
                              {/* Calculate button - only if NOT PAID */}
                              {salary.status !== 'PAID' && (
                                <button
                                  className={`action-calc ${!isProcessingAllowed ? 'disabled' : ''}`}
                                  onClick={() => handleCalculateSalary(salary.employeeId, salary.employeeName)}
                                  disabled={processingId === salary.employeeId || !isProcessingAllowed}
                                  title={!isProcessingAllowed ? "Salary calculation window is closed" : "Calculate Salary (Select Components)"}
                                >
                                  {processingId === salary.employeeId ? <FaSpinner className="spinning" /> : <FaCalculator />}
                                  Calculate
                                </button>
                              )}

                              {/* Mark Paid button - only if NOT PAID and NOT self */}
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

                              {/* View Payslip button - only if PAID */}
                              {salary.status === 'PAID' && (
                                <button
                                  className="action-payslip"
                                  onClick={() => handleViewPayslip(salary)}
                                  title="View Payslip"
                                >
                                  <FaDownload /> Payslip
                                </button>
                              )}

                              {/* Self note for HR */}
                              {hasRecord && isSelf && salary.status !== 'PAID' && (
                                <span className="self-note" title="HR cannot mark own salary as paid">
                                  <FaExclamationTriangle /> Contact Admin
                                </span>
                              )}

                              {/* View details button */}
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

      {/* ========== COMPONENT SELECTION MODAL ========== */}
      {showComponentModal && (
        <div className="modal-overlay" onClick={() => setShowComponentModal(false)}>
          <div className="component-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaCalculator /> Select Salary Components</h3>
              <button className="modal-close" onClick={() => setShowComponentModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              <div className="component-info">
                <p>Select which components to include for <strong>{currentCalculateEmployee?.employeeName}</strong></p>
                <small>Basic salary will be taken from employee profile</small>
              </div>

              <div className="component-actions">
                <button className="component-select-all" onClick={selectAllComponents}>
                  <FaPlusCircle /> Select All
                </button>
                <button className="component-deselect-all" onClick={deselectAllComponents}>
                  <FaMinusCircle /> Deselect All
                </button>
              </div>

              {loadingComponents ? (
                <div className="component-loading">
                  <div className="spinner"></div>
                  <p>Loading components...</p>
                </div>
              ) : (
                <>
                  {additionComponents.length > 0 && (
                    <div className="component-group">
                      <h4 className="component-group__title addition">
                        <FaPlusCircle /> Additions (Earnings)
                      </h4>
                      <div className="component-list">
                        {additionComponents.map(comp => (
                          <label key={comp.code} className="component-item">
                            <input
                              type="checkbox"
                              checked={selectedComponents.includes(comp.code)}
                              onChange={() => toggleComponent(comp.code)}
                            />
                            <div className="component-item__info">
                              <strong>{comp.name}</strong>
                              <span className="component-code">{comp.code}</span>
                            </div>
                            <div className="component-item__value">
                              {comp.calculationType === 'percentage' ? (
                                <><FaPercentage /> {comp.value}%</>
                              ) : (
                                <><FaRupeeSign /> {comp.value.toLocaleString()}</>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {deductionComponents.length > 0 && (
                    <div className="component-group">
                      <h4 className="component-group__title deduction">
                        <FaMinusCircle /> Deductions
                      </h4>
                      <div className="component-list">
                        {deductionComponents.map(comp => (
                          <label key={comp.code} className="component-item">
                            <input
                              type="checkbox"
                              checked={selectedComponents.includes(comp.code)}
                              onChange={() => toggleComponent(comp.code)}
                            />
                            <div className="component-item__info">
                              <strong>{comp.name}</strong>
                              <span className="component-code">{comp.code}</span>
                            </div>
                            <div className="component-item__value">
                              {comp.calculationType === 'percentage' ? (
                                <><FaPercentage /> {comp.value}%</>
                              ) : (
                                <><FaRupeeSign /> {comp.value.toLocaleString()}</>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowComponentModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleCalculateSalaryWithComponents} disabled={processingId !== null}>
                {processingId ? <FaSpinner className="spinning" /> : <FaCalculator />}
                Calculate Salary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== PAYSLIP MODAL ========== */}
      {showPayslipModal && payslipData && (
        <div className="modal-overlay" onClick={() => setShowPayslipModal(false)}>
          <div className="hr-payslip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaMoneyBillWave /> Payslip - {payslipData.employee?.name}</h3>
              <button className="modal-close" onClick={() => setShowPayslipModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              {loadingPayslip ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading payslip...</p>
                </div>
              ) : (
                <div id="hr-payslip-content" className="hr-payslip-content">
                  <div className="payslip-header">
                    <h1>{payslipData.company?.name || 'HRMS'}</h1>
                    <p>{payslipData.company?.address || 'Your Company Address'}</p>
                    <p>Email: {payslipData.company?.email || 'hr@hrms.com'} | Phone: {payslipData.company?.phone || '+91 XXXXXXXXXX'}</p>
                    <div className="payslip-title">
                      <h2>PAYSLIP</h2>
                      <p>For the month of {payslipData.salaryMonth} {payslipData.salaryYear}</p>
                    </div>
                  </div>

                  <div className="payslip-section">
                    <h4>Employee Details</h4>
                    <div className="payslip-grid">
                      <div className="payslip-item"><label><FaUser /> Name:</label><span>{payslipData.employee?.name}</span></div>
                      <div className="payslip-item"><label><FaIdCard /> Employee ID:</label><span>{payslipData.employee?.employeeId}</span></div>
                      <div className="payslip-item"><label><FaBriefcase /> Designation:</label><span>{payslipData.employee?.designation}</span></div>
                      <div className="payslip-item"><label><FaBuilding /> Department:</label><span>{payslipData.employee?.department}</span></div>
                    </div>
                  </div>

                  <div className="payslip-salary">
                    <div className="payslip-earnings">
                      <h4>Earnings</h4>
                      <table className="payslip-table">
                        <tbody>
                          <tr><td>Basic Salary</td><td>{formatCurrency(payslipData.basicSalary)}</td></tr>
                          {payslipData.additions?.map((add, idx) => (
                            <tr key={idx}><td>{add.name}</td><td>{formatCurrency(add.amount)}</td></tr>
                          ))}
                          <tr className="payslip-total"><td><strong>Total Earnings</strong></td><td><strong>{formatCurrency(payslipData.totalAdditions + payslipData.basicSalary)}</strong></td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="payslip-deductions">
                      <h4>Deductions</h4>
                      <table className="payslip-table">
                        <tbody>
                          {payslipData.deductions?.map((ded, idx) => (
                            <tr key={idx}><td>{ded.name}</td><td>{formatCurrency(ded.amount)}</td></tr>
                          ))}
                          <tr className="payslip-total"><td><strong>Total Deductions</strong></td><td><strong>{formatCurrency(payslipData.totalDeductions)}</strong></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="payslip-net">
                    <div className="payslip-net-amount">
                      <span>NET SALARY</span>
                      <strong>{formatCurrency(payslipData.netSalary)}</strong>
                    </div>
                  </div>

                  <div className="payslip-footer">
                    <div className="payslip-payment">
                      <p><strong>Payment Details:</strong></p>
                      <p>Paid On: {new Date(payslipData.paymentInfo?.paidOn).toLocaleDateString()}</p>
                      <p>Paid By: {payslipData.paymentInfo?.paidBy}</p>
                    </div>
                    <div className="payslip-note">
                      <p>Generated on: {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="close-btn" onClick={() => setShowPayslipModal(false)}>Close</button>
              <button className="download-btn" onClick={handleDownloadPDF}>
                <FaDownload /> Download PDF
              </button>
            </div>
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
                    <div className="summary-item"><span>Basic Salary:</span><strong>{formatCurrency(selectedEmployee.basicSalary)}</strong></div>
                    <div className="summary-item"><span>Net Salary:</span><strong className="net">{formatCurrency(employeeDetails.netSalary)}</strong></div>
                    <div className="summary-item"><span>Status:</span>{getStatusBadge(employeeDetails.status)}</div>
                  </div>

                  {employeeDetails.usedComponents && employeeDetails.usedComponents.length > 0 && (
                    <div className="detail-section">
                      <h4>Salary Components Used</h4>
                      <div className="components-used-grid">
                        {employeeDetails.usedComponents.map((comp, idx) => (
                          <div key={idx} className={`component-used-item ${comp.type}`}>
                            <div className="component-used-info"><strong>{comp.name}</strong><span className="component-used-code">{comp.code}</span></div>
                            <div className="component-used-amount">{comp.type === 'addition' ? '+' : '-'} {formatCurrency(comp.amount)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="detail-section">
                    <h4>Attendance Summary</h4>
                    <div className="detail-grid">
                      <div><span>Working Days:</span><strong>{employeeDetails.attendanceSummary?.totalWorkingDays || 0}</strong></div>
                      <div><span>Present:</span><strong>{employeeDetails.attendanceSummary?.presentDays || 0}</strong></div>
                      <div><span>Late:</span><strong>{employeeDetails.attendanceSummary?.lateDays || 0}</strong></div>
                      <div><span>Half Day:</span><strong>{employeeDetails.attendanceSummary?.halfDays || 0}</strong></div>
                      <div><span>Absent:</span><strong>{employeeDetails.attendanceSummary?.absentDays || 0}</strong></div>
                      <div><span>Unpaid Leave:</span><strong>{employeeDetails.attendanceSummary?.unpaidLeaveDays || 0}</strong></div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Deductions</h4>
                    <div className="detail-grid">
                      <div><span>Late Deduction:</span><strong>{formatCurrency(employeeDetails.lateDeduction || 0)}</strong></div>
                      <div><span>Half Day Deduction:</span><strong>{formatCurrency(employeeDetails.halfDayDeduction || 0)}</strong></div>
                      <div><span>Absent Deduction:</span><strong>{formatCurrency(employeeDetails.absentDeduction || 0)}</strong></div>
                      <div><span>Leave Deduction:</span><strong>{formatCurrency(employeeDetails.leaveDeduction || 0)}</strong></div>
                      <div><span>Total Deductions:</span><strong className="deduction">{formatCurrency(employeeDetails.totalDeductions || 0)}</strong></div>
                    </div>
                  </div>

                  {employeeDetails.paidAt && (
                    <div className="detail-section">
                      <h4>Payment Info</h4>
                      <div className="detail-grid">
                        <div><span>Paid On:</span><strong>{new Date(employeeDetails.paidAt).toLocaleDateString()}</strong></div>
                        <div><span>Paid By:</span><strong>{employeeDetails.paidByName || 'HR/Admin'}</strong></div>
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
              <div className="confirm-modal__icon"><FaExclamationTriangle /></div>
              <button className="confirm-modal__close" onClick={() => setConfirmModal({ ...confirmModal, show: false })}><FaTimesCircle /></button>
            </div>
            <div className="confirm-modal__body">
              <h3>{confirmModal.title}</h3>
              <p>{confirmModal.message}</p>
            </div>
            <div className="confirm-modal__footer">
              <button className="confirm-modal__cancel" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>{confirmModal.cancelText}</button>
              <button className="confirm-modal__confirm" onClick={confirmModal.onConfirm}>{confirmModal.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRSalary;