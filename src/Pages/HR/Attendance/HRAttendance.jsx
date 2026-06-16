import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaHistory,
  FaSpinner,
  FaArrowRight,
  FaArrowLeft,
  FaUsers,
  FaSearch,
  FaEdit,
  FaSave,
  FaTimes,
  FaFilter,
  FaDownload,
  FaUserTie,
  FaBuilding
} from 'react-icons/fa';
import './HRAttendance.scss';

const HRAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [policy, setPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRole, setSelectedRole] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    checkInTime: '',
    checkOutTime: '',
    notes: ''
  });
  const [updating, setUpdating] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch today's attendance for HR
  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get(`${apiUrl}/attendance/today`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setTodayAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  // Fetch HR's own history
  const fetchHistory = async (page = 1) => {
    try {
      const response = await axios.get(`${apiUrl}/attendance/history?page=${page}&limit=10`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setHistory(response.data.attendance);
        setHistoryTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Fetch all employees attendance
  const fetchAllAttendance = async () => {
    try {
      const response = await axios.get(`${apiUrl}/attendance/all?limit=200`, {
        withCredentials: true,
      });
      if (response.data.success) {
        // Flatten the records array for display
        const flattenedAttendance = [];
        response.data.attendance.forEach(employee => {
          if (employee.records && employee.records.length > 0) {
            employee.records.forEach(record => {
              flattenedAttendance.push({
                ...record,
                employeeId: employee.employeeId,
                employeeName: employee.employeeName,
                role: employee.role,
              });
            });
          }
        });
        setAllAttendance(flattenedAttendance);
        setFilteredAttendance(flattenedAttendance);
      }
    } catch (error) {
      console.error('Error fetching all attendance:', error);
    }
  };

  // Fetch policy
  const fetchPolicy = async () => {
    try {
      const response = await axios.get(`${apiUrl}/policies`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setPolicy(response.data.policy);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTodayAttendance(),
        fetchHistory(1),
        fetchAllAttendance(),
        fetchPolicy(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allAttendance];

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(record => record.date === selectedDate);
    }

    if (selectedRole) {
      filtered = filtered.filter(record => record.role === selectedRole);
    }

    setFilteredAttendance(filtered);
  }, [searchTerm, selectedDate, selectedRole, allAttendance]);

  // Handle Check In
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await axios.post(`${apiUrl}/attendance/checkin`, {}, {
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchTodayAttendance();
        await fetchHistory(historyPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const response = await axios.post(`${apiUrl}/attendance/checkout`, {}, {
        withCredentials: true,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchTodayAttendance();
        await fetchHistory(historyPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setHistoryPage(newPage);
    fetchHistory(newPage);
  };

  // Handle edit click
  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditForm({
      checkInTime: record.checkInTime || '',
      checkOutTime: record.checkOutTime || '',
      notes: record.notes || ''
    });
    setShowEditModal(true);
  };

  // Handle update attendance
  const handleUpdateAttendance = async () => {
    if (!editingRecord) return;

    setUpdating(true);
    try {
      const response = await axios.put(
        `${apiUrl}/attendance/${editingRecord.employeeId}/${editingRecord.date}`,
        {
          checkInTime: editForm.checkInTime,
          checkOutTime: editForm.checkOutTime,
          notes: editForm.notes
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Attendance updated successfully');
        setShowEditModal(false);
        await fetchAllAttendance();
        setEditingRecord(null);
        setEditForm({ checkInTime: '', checkOutTime: '', notes: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update attendance');
    } finally {
      setUpdating(false);
    }
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusMap = {
      ON_TIME: 'status-on-time',
      LATE: 'status-late',
      HALF_DAY: 'status-half-day',
      ABSENT: 'status-absent',
      HOLIDAY: 'status-holiday',
      WEEKEND: 'status-weekend',
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      ON_TIME: 'On Time',
      LATE: 'Late',
      HALF_DAY: 'Half Day',
      ABSENT: 'Absent',
      HOLIDAY: 'Holiday',
      WEEKEND: 'Weekend',
    };
    return statusMap[status] || status;
  };

  // Get time display
  const getTimeDisplay = (time) => {
    if (!time) return '—';
    return time;
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    const roleMap = {
      HR: 'role-hr',
      MANAGER: 'role-manager',
      EMPLOYEE: 'role-employee',
    };
    return roleMap[role] || 'role-default';
  };

  // Check if check-in is disabled
  const isCheckInDisabled = () => {
    if (!todayAttendance) return false;
    return todayAttendance.checkOutTime !== null;
  };

  // Check if check-out is disabled
  const isCheckOutDisabled = () => {
    if (!todayAttendance) return true;
    return !todayAttendance.checkInTime || todayAttendance.checkOutTime !== null;
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get stats
  const getTotalEmployees = () => {
    return new Set(allAttendance.map(a => a.employeeId)).size;
  };

  const getTodayPresentCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return allAttendance.filter(a => a.date === today && a.checkInTime).length;
  };

  const getPendingCorrections = () => {
    return allAttendance.filter(a => a.correctedBy).length;
  };

  if (loading) {
    return (
      <div className="hr-attendance-loading">
        <div className="spinner"></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="hr-attendance">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Page Header */}
      <div className="attendance-header">
        <div className="header-left">
          <h1>HR Attendance Management</h1>
          <p>Track your attendance and manage all employees</p>
        </div>
        <div className="header-right">
          <div className="date-display">
            <FaCalendarAlt />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="hr-stats-grid">
        <div className="hr-stat-card">
          <div className="hr-stat-icon">
            <FaUsers />
          </div>
          <div className="hr-stat-info">
            <h3>Total Employees</h3>
            <p>{getTotalEmployees()}</p>
          </div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-stat-icon">
            <FaClock />
          </div>
          <div className="hr-stat-info">
            <h3>Today's Present</h3>
            <p>{getTodayPresentCount()}</p>
          </div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-stat-icon">
            <FaEdit />
          </div>
          <div className="hr-stat-info">
            <h3>Corrections Made</h3>
            <p>{getPendingCorrections()}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="attendance-tabs">
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          <FaClock /> My Attendance
        </button>
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FaUsers /> All Employees
        </button>
      </div>

      {/* My Attendance Tab */}
      {activeTab === 'my' && (
        <>
          {/* Today's Attendance Card */}
          <div className="today-card">
            <h2>Today's Status</h2>

            <div className="today-status">
              {todayAttendance ? (
                <div className="status-section">
                  <div className="status-icon">
                    {todayAttendance.status === 'ON_TIME' && <FaCheckCircle />}
                    {todayAttendance.status === 'LATE' && <FaClock />}
                    {todayAttendance.status === 'HALF_DAY' && <FaClock />}
                    {todayAttendance.status === 'ABSENT' && <FaTimesCircle />}
                  </div>
                  <div className="status-info">
                    <span className={`status-badge ${getStatusBadge(todayAttendance.status)}`}>
                      {getStatusText(todayAttendance.status)}
                    </span>
                    {todayAttendance.checkInTime && (
                      <div className="time-info">
                        <span>Check In: {getTimeDisplay(todayAttendance.checkInTime)}</span>
                        {todayAttendance.checkOutTime && (
                          <span>Check Out: {getTimeDisplay(todayAttendance.checkOutTime)}</span>
                        )}
                        {todayAttendance.totalHours > 0 && (
                          <span>Total Hours: {todayAttendance.totalHours} hrs</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-status">
                  <FaClock className="no-status-icon" />
                  <p>No attendance record for today</p>
                  <small>Click "Check In" to start your day</small>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button
                className="checkin-btn"
                onClick={handleCheckIn}
                disabled={checkingIn || isCheckInDisabled()}
              >
                {checkingIn ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
                {checkingIn ? 'Checking In...' : 'Check In'}
              </button>
              <button
                className="checkout-btn"
                onClick={handleCheckOut}
                disabled={checkingOut || isCheckOutDisabled()}
              >
                {checkingOut ? <FaSpinner className="spinning" /> : <FaArrowRight />}
                {checkingOut ? 'Checking Out...' : 'Check Out'}
              </button>
            </div>

            {/* Policy Info */}
            {policy && policy.attendanceRules && (
              <div className="policy-info">
                <h4>Attendance Rules</h4>
                <div className="policy-details">
                  <span>Working Hours: {policy.attendanceRules.workingHoursStart} - {policy.attendanceRules.workingHoursEnd}</span>
                  <span>Grace Period: {policy.attendanceRules.gracePeriodMinutes} min</span>
                  <span>Half Day After: {policy.attendanceRules.halfDayAfterMinutes} min late</span>
                </div>
              </div>
            )}
          </div>

          {/* Attendance History Table */}
          <div className="history-card">
            <div className="history-header">
              <h2>
                <FaHistory /> My Attendance History
              </h2>
            </div>

            {history.length === 0 ? (
              <div className="empty-history">
                <p>No attendance records found.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Total Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((record, index) => (
                        <tr key={record._id || index}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{getTimeDisplay(record.checkInTime)}</td>
                          <td>{getTimeDisplay(record.checkOutTime)}</td>
                          <td>{record.totalHours || '—'}</td>
                          <td>
                            <span className={`status-badge-small ${getStatusBadge(record.status)}`}>
                              {getStatusText(record.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {historyTotal > 10 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(historyPage - 1)}
                      disabled={historyPage === 1}
                    >
                      <FaArrowLeft /> Previous
                    </button>
                    <span>Page {historyPage} of {Math.ceil(historyTotal / 10)}</span>
                    <button
                      onClick={() => handlePageChange(historyPage + 1)}
                      disabled={historyPage === Math.ceil(historyTotal / 10)}
                    >
                      Next <FaArrowRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* All Employees Attendance Tab */}
      {activeTab === 'all' && (
        <div className="all-employees-card">
          <div className="all-header">
            <h2>
              <FaUsers /> All Employees Attendance
            </h2>
            <div className="filters-section">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="HR">HR</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>
              <div className="filter-group">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  placeholder="Filter by date"
                />
              </div>
            </div>
          </div>

          {filteredAttendance.length === 0 ? (
            <div className="empty-history">
              <FaUsers />
              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="all-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Role</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>
                        <div className="employee-cell">
                          <div className="employee-avatar">
                            {record.employeeName?.charAt(0).toUpperCase()}
                          </div>
                          <span>{record.employeeName}</span>
                        </div>
                      </td>
                      <td>{record.employeeId}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(record.role)}`}>
                          {record.role || 'EMPLOYEE'}
                        </span>
                      </td>
                      <td>{getTimeDisplay(record.checkInTime)}</td>
                      <td>{getTimeDisplay(record.checkOutTime)}</td>
                      <td>{record.totalHours || '—'}</td>
                      <td>
                        <span className={`status-badge-small ${getStatusBadge(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditClick(record)}
                          title="Edit Attendance"
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="all-summary">
            <div className="summary-item">
              <span>Total Records:</span>
              <strong>{filteredAttendance.length}</strong>
            </div>
            <div className="summary-item">
              <span>Total Employees:</span>
              <strong>{new Set(filteredAttendance.map(a => a.employeeId)).size}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaEdit /> Edit Attendance
              </h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="employee-info">
                <div className="info-row">
                  <span>Employee:</span>
                  <strong>{editingRecord.employeeName}</strong>
                </div>
                <div className="info-row">
                  <span>Date:</span>
                  <strong>{new Date(editingRecord.date).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="form-group">
                <label>Check In Time</label>
                <input
                  type="time"
                  value={editForm.checkInTime}
                  onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
                  placeholder="HH:MM"
                />
              </div>

              <div className="form-group">
                <label>Check Out Time</label>
                <input
                  type="time"
                  value={editForm.checkOutTime}
                  onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })}
                  placeholder="HH:MM"
                />
              </div>

              <div className="form-group">
                <label>Notes / Reason for correction</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows="3"
                  placeholder="Enter reason for attendance correction..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleUpdateAttendance} disabled={updating}>
                {updating ? <FaSpinner className="spinning" /> : <FaSave />}
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAttendance;