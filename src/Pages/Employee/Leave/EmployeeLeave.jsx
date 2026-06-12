import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaCalendarAlt,
  FaHistory,
  FaBalanceScale,
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import './EmployeeLeave.scss';

const EmployeeLeave = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [policy, setPolicy] = useState(null);

  // Apply Leave State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveDays, setLeaveDays] = useState([]);
  const [workingDays, setWorkingDays] = useState(0);
  const [dateError, setDateError] = useState('');
  const [balanceError, setBalanceError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch leave balance
  const fetchLeaveBalance = async () => {
    try {
      const response = await axios.get(`${apiUrl}/leave/balance`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setLeaveBalance(response.data.balance.balances || []);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  // Fetch leave history
  const fetchLeaveHistory = async (page = 1) => {
    try {
      const response = await axios.get(`${apiUrl}/leave/my-requests?page=${page}&limit=10`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setLeaveHistory(response.data.leaves);
        setHistoryTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching leave history:', error);
    }
  };

  // Fetch policy (leave types)
  const fetchPolicy = async () => {
    try {
      const response = await axios.get(`${apiUrl}/policies`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setPolicy(response.data.policy);
        const activeLeaveTypes = response.data.policy.leaveTypes.filter(
          lt => lt.isActive !== false && lt.applicableRoles?.includes('EMPLOYEE')
        );
        setLeaveTypes(activeLeaveTypes);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeaveBalance(),
        fetchLeaveHistory(1),
        fetchPolicy(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // ========== HELPER: Determine Saturday type (for alternate_holiday_half) ==========
  const getSaturdayType = (date, saturdayRule) => {
    if (saturdayRule !== "alternate_holiday_half") return null;

    const dayOfMonth = date.getDate();
    const whichSaturday = Math.ceil(dayOfMonth / 7);

    // 1st and 3rd Saturday = OFF
    // 2nd and 4th Saturday = HALF DAY
    if (whichSaturday === 1 || whichSaturday === 3) return "OFF";
    if (whichSaturday === 2 || whichSaturday === 4) return "HALF_DAY";
    return "FULL_DAY";
  };

  // Check if date is holiday (from policy)
  const isHoliday = (dateStr) => {
    if (!policy?.holidays) return false;
    return policy.holidays.some(holiday => {
      if (holiday.isRange) {
        const start = new Date(holiday.startDate).toISOString().split('T')[0];
        const end = new Date(holiday.endDate).toISOString().split('T')[0];
        return dateStr >= start && dateStr <= end;
      } else {
        const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
        return dateStr === holidayDate;
      }
    });
  };

  // Check if date is weekend (UPDATED for alternate_holiday_half)
  const isWeekend = (dateStr) => {
    if (!policy?.attendanceRules) return false;
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const weeklyOffDays = policy.attendanceRules.weeklyOffDays || [0];

    if (dayOfWeek === 6) {
      const saturdayRule = policy.attendanceRules.saturdayRule || 'half_day';

      // Handle alternate_holiday_half rule
      if (saturdayRule === 'alternate_holiday_half') {
        const saturdayType = getSaturdayType(date, saturdayRule);
        return saturdayType === 'OFF'; // 1st & 3rd Saturdays are OFF
      }

      return saturdayRule === 'off';
    }
    return weeklyOffDays.includes(dayOfWeek);
  };

  // Generate date range between two dates
  const getDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Handle date change
  const handleDateChange = () => {
    if (!fromDate || !toDate) {
      setLeaveDays([]);
      setWorkingDays(0);
      setDateError('');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setDateError('From date cannot be after To date');
      setLeaveDays([]);
      setWorkingDays(0);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (fromDate < today) {
      setDateError('Cannot apply for leave in the past');
      setLeaveDays([]);
      setWorkingDays(0);
      return;
    }

    setDateError('');
    const dateRange = getDateRange(fromDate, toDate);

    // Filter out holidays and weekends (UPDATED isWeekend)
    const workingDayDates = dateRange.filter(date => !isHoliday(date) && !isWeekend(date));
    setWorkingDays(workingDayDates.length);

    // Initialize leave days for working days only
    const initialDays = workingDayDates.map(date => ({
      date,
      leaveType: leaveTypes[0]?.code || '',
      isHalfDay: false,
      halfDaySession: null,
    }));
    setLeaveDays(initialDays);
  };

  useEffect(() => {
    handleDateChange();
  }, [fromDate, toDate, leaveTypes]);

  // Update leave type for a specific day
  const updateLeaveDay = (index, field, value) => {
    const updatedDays = [...leaveDays];
    updatedDays[index][field] = value;
    if (field === 'isHalfDay' && !value) {
      updatedDays[index].halfDaySession = null;
    }
    setLeaveDays(updatedDays);
  };

  // Add a new day (if range already selected)
  const addCustomDay = () => {
    setLeaveDays([...leaveDays, {
      date: '',
      leaveType: leaveTypes[0]?.code || '',
      isHalfDay: false,
      halfDaySession: null,
    }]);
  };

  // Remove a day
  const removeDay = (index) => {
    const updatedDays = leaveDays.filter((_, i) => i !== index);
    setLeaveDays(updatedDays);
  };

  // Get remaining balance for a leave type
  const getRemainingBalance = (leaveType) => {
    const balance = leaveBalance.find(b => b.leaveType === leaveType);
    return balance ? balance.remaining : 0;
  };

  // Validate balance before submit
  const validateBalance = () => {
    const leaveTypeMap = new Map();
    for (const day of leaveDays) {
      leaveTypeMap.set(day.leaveType, (leaveTypeMap.get(day.leaveType) || 0) + 1);
    }

    for (const [leaveType, count] of leaveTypeMap) {
      const policyLt = leaveTypes.find(lt => lt.code === leaveType);
      if (policyLt && !policyLt.isUnpaid) {
        const remaining = getRemainingBalance(leaveType);
        if (count > remaining) {
          setBalanceError(`Insufficient ${leaveType} balance. Required: ${count}, Available: ${remaining}`);
          return false;
        }
      }
    }
    setBalanceError('');
    return true;
  };

  // Handle submit leave
  const handleSubmitLeave = async () => {
    if (!fromDate || !toDate || !reason || leaveDays.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!validateBalance()) {
      toast.error(balanceError);
      return;
    }

    const validDays = leaveDays.filter(day => day.date && day.leaveType);
    if (validDays.length === 0) {
      toast.error('Please select at least one valid working day');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${apiUrl}/leave/apply`, {
        fromDate,
        toDate,
        days: validDays,
        reason,
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success(response.data.message);
        setFromDate('');
        setToDate('');
        setReason('');
        setLeaveDays([]);
        setWorkingDays(0);
        await fetchLeaveBalance();
        await fetchLeaveHistory(1);
        setActiveTab('history');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel leave
  const handleCancelLeave = async (leaveId) => {
    const cancelReason = prompt('Please provide reason for cancellation:');
    if (!cancelReason) return;

    try {
      const response = await axios.put(`${apiUrl}/leave/${leaveId}/cancel`, {
        cancellationReason: cancelReason,
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success('Leave cancelled successfully');
        await fetchLeaveBalance();
        await fetchLeaveHistory(historyPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave');
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setHistoryPage(newPage);
    fetchLeaveHistory(newPage);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      CANCELLED: 'status-cancelled',
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  // Format leave type summary
  const formatLeaveSummary = (summary) => {
    if (!summary || summary.length === 0) return '—';
    return summary.map(s => `${s.leaveType}: ${s.daysCount}d`).join(', ');
  };

  if (loading) {
    return (
      <div className="employee-leave-loading">
        <div className="spinner"></div>
        <p>Loading leave data...</p>
      </div>
    );
  }

  return (
    <div className="employee-leave">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="leave-header">
        <div className="header-left">
          <h1>Leave Management</h1>
          <p>Apply for leave, track history, and manage your balance</p>
        </div>
      </div>

      <div className="leave-tabs">
        <button
          className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          <FaPlus /> Apply Leave
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> My History
        </button>
        <button
          className={`tab-btn ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          <FaBalanceScale /> My Balance
        </button>
      </div>

      {/* ========== TAB 1: APPLY LEAVE ========== */}
      {activeTab === 'apply' && (
        <div className="apply-card">
          <h2>Apply for Leave</h2>

          <div className="form-row">
            <div className="form-group">
              <label>From Date *</label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="form-group">
              <label>To Date *</label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {dateError && (
            <div className="error-message">{dateError}</div>
          )}

          {workingDays > 0 && (
            <div className="info-box">
              <FaInfoCircle />
              <div>
                <strong>{workingDays} working day(s)</strong> selected
                <small>(Holidays and weekends are automatically excluded)</small>
              </div>
            </div>
          )}

          {leaveDays.length > 0 && (
            <div className="leave-days-section">
              <div className="section-header">
                <h3>Leave Breakdown</h3>
                <button type="button" className="add-day-btn" onClick={addCustomDay}>
                  <FaPlus /> Add Custom Day
                </button>
              </div>

              <div className="leave-days-list">
                {leaveDays.map((day, index) => (
                  <div key={index} className="leave-day-item">
                    <div className="day-date">
                      <input
                        type="date"
                        value={day.date}
                        onChange={(e) => updateLeaveDay(index, 'date', e.target.value)}
                        min={fromDate}
                        max={toDate}
                        readOnly={!!fromDate && !!toDate}
                        disabled={!!fromDate && !!toDate}
                      />
                    </div>
                    <div className="day-type">
                      <select
                        value={day.leaveType}
                        onChange={(e) => updateLeaveDay(index, 'leaveType', e.target.value)}
                      >
                        {leaveTypes.map(lt => (
                          <option key={lt.code} value={lt.code}>
                            {lt.name} ({lt.code}) - {lt.isUnpaid ? 'Unpaid' : `${getRemainingBalance(lt.code)} left`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="day-halfday">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={day.isHalfDay}
                          onChange={(e) => updateLeaveDay(index, 'isHalfDay', e.target.checked)}
                        />
                        Half Day
                      </label>
                      {day.isHalfDay && (
                        <select
                          value={day.halfDaySession || ''}
                          onChange={(e) => updateLeaveDay(index, 'halfDaySession', e.target.value)}
                        >
                          <option value="">Select session</option>
                          <option value="FIRST_HALF">First Half (9 AM - 1 PM)</option>
                          <option value="SECOND_HALF">Second Half (2 PM - 6 PM)</option>
                        </select>
                      )}
                    </div>
                    <button
                      type="button"
                      className="remove-day-btn"
                      onClick={() => removeDay(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group full-width">
            <label>Reason for Leave *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
              placeholder="Please provide detailed reason for your leave request..."
            />
          </div>

          {balanceError && (
            <div className="warning-box">
              <FaExclamationTriangle />
              <span>{balanceError}</span>
            </div>
          )}

          <div className="action-buttons">
            <button
              className="submit-btn"
              onClick={handleSubmitLeave}
              disabled={submitting || !fromDate || !toDate || !reason || leaveDays.length === 0}
            >
              {submitting ? <FaSpinner className="spinning" /> : <FaSave />}
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
            <button
              className="reset-btn"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setReason('');
                setLeaveDays([]);
                setWorkingDays(0);
                setDateError('');
                setBalanceError('');
              }}
            >
              <FaTimes /> Reset
            </button>
          </div>

          {policy && (
            <div className="policy-info">
              <h4>Leave Policy Info</h4>
              <div className="policy-details">
                {leaveTypes.map(lt => (
                  <span key={lt.code}>
                    {lt.name} ({lt.code}): {lt.isUnpaid ? 'No limit' : `${lt.yearlyLimit} days/year`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== TAB 2: MY HISTORY ========== */}
      {activeTab === 'history' && (
        <div className="history-card">
          <h2><FaHistory /> My Leave History</h2>

          {leaveHistory.length === 0 ? (
            <div className="empty-state">
              <FaHistory />
              <p>No leave requests found</p>
              <small>Your leave history will appear here</small>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date Range</th>
                      <th>Days</th>
                      <th>Leave Type</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          <small>{leave.totalDays} day(s)</small>
                        </td>
                        <td>{leave.totalDays}</td>
                        <td>{formatLeaveSummary(leave.leaveTypeSummary)}</td>
                        <td className="reason-cell">{leave.reason}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(leave.status)}`}>
                            {getStatusText(leave.status)}
                          </span>
                        </td>
                        <td>
                          {leave.approvedByName ? (
                            <span className="approved-by">{leave.approvedByName}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {leave.status === 'PENDING' && (
                            <button
                              className="cancel-btn"
                              onClick={() => handleCancelLeave(leave._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {historyTotal > 10 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(historyPage - 1)}
                    disabled={historyPage === 1}
                  >
                    Previous
                  </button>
                  <span>Page {historyPage} of {Math.ceil(historyTotal / 10)}</span>
                  <button
                    onClick={() => handlePageChange(historyPage + 1)}
                    disabled={historyPage === Math.ceil(historyTotal / 10)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========== TAB 3: MY BALANCE ========== */}
      {activeTab === 'balance' && (
        <div className="balance-card">
          <h2><FaBalanceScale /> My Leave Balance</h2>
          <p className="year-info">Year: {new Date().getFullYear()} (Resets on Jan 1)</p>

          <div className="balance-grid">
            {leaveBalance.map((balance) => {
              const leaveTypeInfo = leaveTypes.find(lt => lt.code === balance.leaveType);
              const percentage = balance.total > 0 ? (balance.used / balance.total) * 100 : 0;

              return (
                <div key={balance.leaveType} className="balance-item">
                  <div className="balance-header">
                    <div className="balance-title">
                      <h3>{leaveTypeInfo?.name || balance.leaveType}</h3>
                      <span className="balance-code">{balance.leaveType}</span>
                    </div>
                    {leaveTypeInfo?.isUnpaid && (
                      <span className="unpaid-badge">Unpaid</span>
                    )}
                  </div>
                  <div className="balance-numbers">
                    <div className="balance-stat">
                      <span className="stat-label">Total</span>
                      <strong>{balance.total === null ? '∞' : balance.total}</strong>
                    </div>
                    <div className="balance-stat">
                      <span className="stat-label">Used</span>
                      <strong>{balance.used}</strong>
                    </div>
                    <div className="balance-stat">
                      <span className="stat-label">Remaining</span>
                      <strong className={balance.remaining < 3 ? 'warning' : ''}>
                        {balance.remaining === null ? '∞' : balance.remaining}
                      </strong>
                    </div>
                  </div>
                  {balance.total > 0 && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {leaveBalance.length === 0 && (
            <div className="empty-state">
              <FaBalanceScale />
              <p>No leave balance information found</p>
            </div>
          )}

          <div className="balance-footer">
            <small>Note: Leave balance resets every year on January 1st.</small>
            <small>Unpaid leave (LOP) has no limit and does not affect paid leave balance.</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;