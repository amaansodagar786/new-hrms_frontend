import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEye,
  FaHistory,
  FaUserTie,
  FaExclamationTriangle,
  FaCalendarAlt
} from 'react-icons/fa';
import './HRAllLeave.scss';

const HRAllLeave = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========== SEPARATE LOADING STATES ==========
  const [approveLoading, setApproveLoading] = useState(null); // Stores leaveId being approved
  const [rejectLoading, setRejectLoading] = useState(null); // Stores leaveId being rejected

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Reject Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectModalLoading, setRejectModalLoading] = useState(false);
  const [rejectType, setRejectType] = useState('reject');
  const [overrideStatus, setOverrideStatus] = useState('');

  // Month/Year Filter States
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Years array for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchPendingLeaves = async () => {
    try {
      const response = await axios.get(`${apiUrl}/leave/all-requests?status=PENDING`, { withCredentials: true });
      if (response.data.success) setPendingLeaves(response.data.leaves);
    } catch (error) { console.error('Error:', error); }
  };

  const fetchAllHistory = async (page = 1) => {
    try {
      let url = `${apiUrl}/leave/all-requests?page=${page}&limit=15`;
      if (selectedStatus) url += `&status=${selectedStatus}`;
      if (selectedMonth && selectedYear) {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      }
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setAllHistory(response.data.leaves);
        setHistoryTotal(response.data.pagination.total);
      }
    } catch (error) { console.error('Error:', error); }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPendingLeaves(), fetchAllHistory(1)]);
      setLoading(false);
    };
    loadData();
  }, [selectedMonth, selectedYear, selectedStatus, selectedRole, historyPage]);

  // ========== HANDLE APPROVE ==========
  const handleApprove = async (leaveId) => {
    setApproveLoading(leaveId); // ✅ Only this button shows spinner
    try {
      const response = await axios.put(`${apiUrl}/leave/${leaveId}/approve`, {}, { withCredentials: true });
      if (response.data.success) {
        toast.success('Leave approved successfully');
        await fetchPendingLeaves();
        await fetchAllHistory(historyPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    }
    finally {
      setApproveLoading(null);
    }
  };

  // ========== HANDLE REJECT (Modal) ==========
  const openRejectModal = (leaveId) => {
    setRejectLeaveId(leaveId);
    setRejectionReason('');
    setRejectType('reject');
    setShowRejectModal(true);
  };

  const openOverrideModal = (leaveId, newStatus) => {
    setRejectLeaveId(leaveId);
    setRejectionReason('');
    setRejectType('override');
    setOverrideStatus(newStatus);
    setShowRejectModal(true);
  };

  const closeModal = () => {
    setShowRejectModal(false);
    setRejectLeaveId(null);
    setRejectionReason('');
    setRejectModalLoading(false);
    setRejectType('reject');
    setOverrideStatus('');
  };

  // ========== HANDLE CONFIRM ACTION (Reject/Override) ==========
  const handleConfirmAction = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setRejectModalLoading(true);
    try {
      let response;

      if (rejectType === 'reject') {
        response = await axios.put(`${apiUrl}/leave/${rejectLeaveId}/reject`, {
          rejectionReason: rejectionReason
        }, { withCredentials: true });
      } else {
        const endpoint = overrideStatus === 'APPROVED' ? 'approve' : 'reject';
        const body = overrideStatus === 'REJECTED' ? { rejectionReason: rejectionReason } : {};
        response = await axios.put(`${apiUrl}/leave/${rejectLeaveId}/${endpoint}`, body, { withCredentials: true });
      }

      if (response.data.success) {
        const actionText = rejectType === 'reject' ? 'rejected' : `${overrideStatus.toLowerCase()}`;
        toast.success(`Leave ${actionText} successfully`);
        closeModal();
        await fetchPendingLeaves();
        await fetchAllHistory(historyPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setRejectModalLoading(false);
    }
  };

  const handlePageChange = (newPage) => { setHistoryPage(newPage); fetchAllHistory(newPage); };

  const getStatusBadge = (status) => {
    const map = { PENDING: 'status-pending', APPROVED: 'status-approved', REJECTED: 'status-rejected', CANCELLED: 'status-cancelled' };
    return map[status] || 'status-default';
  };
  const getStatusText = (status) => {
    const map = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled' };
    return map[status] || status;
  };
  const getRoleBadge = (role) => {
    const map = { HR: 'role-hr', MANAGER: 'role-manager', EMPLOYEE: 'role-employee' };
    return map[role] || 'role-default';
  };
  const formatLeaveSummary = (summary) => {
    if (!summary || summary.length === 0) return '—';
    return summary.map(s => `${s.leaveType}: ${s.daysCount}d`).join(', ');
  };

  const filteredHistory = allHistory.filter(leave => {
    const matchesSearch = leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus ? leave.status === selectedStatus : true;
    const matchesRole = selectedRole ? leave.role === selectedRole : true;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Check if user is ADMIN
  const isAdmin = userRole === 'ADMIN';

  if (loading) {
    return (<div className="hr-all-leave-loading"><div className="spinner"></div><p>Loading leave data...</p></div>);
  }

  return (
    <div className="hr-all-leave">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="all-leave-header">
        <h1><FaUserTie /> HR - All Leave Management</h1>
        <p>View, approve, reject all leave requests across the organization</p>
      </div>
      <div className="all-leave-tabs">
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          <FaClock /> Pending Requests ({pendingLeaves.length})
        </button>
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <FaHistory /> All Leave History
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="pending-card">
          <h2>Pending Leave Requests Across Organization</h2>
          {pendingLeaves.length === 0 ? (
            <div className="empty-state"><FaUsers /><p>No pending leave requests</p><small>All leave requests have been processed</small></div>
          ) : (
            <div className="table-responsive">
              <table className="pending-table">
                <thead>
                  <tr><th>Employee</th><th>Role</th><th>Date Range</th><th>Days</th><th>Leave Type</th><th>Reason</th><th>Applied On</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div className="employee-cell">
                          <div className="employee-avatar">{leave.employeeName?.charAt(0).toUpperCase()}</div>
                          <div><span>{leave.employeeName}</span><small>{leave.employeeId}</small></div>
                        </div>
                      </td>
                      <td><span className={`role-badge ${getRoleBadge(leave.role)}`}>{leave.role}</span></td>
                      <td>
                        {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                        <small>{leave.totalDays} day(s)</small>
                      </td>
                      <td>{leave.totalDays}</td>
                      <td>{formatLeaveSummary(leave.leaveTypeSummary)}</td>
                      <td className="reason-cell">{leave.reason}</td>
                      <td>{new Date(leave.appliedOn).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(leave._id)}
                            disabled={approveLoading === leave._id || rejectLoading === leave._id}
                          >
                            {approveLoading === leave._id ? <FaSpinner className="spinning" /> : <FaCheckCircle />} Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => openRejectModal(leave._id)}
                            disabled={approveLoading === leave._id || rejectLoading === leave._id}
                          >
                            {rejectLoading === leave._id ? <FaSpinner className="spinning" /> : <FaTimesCircle />} Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-card">
          <h2>Complete Leave History</h2>
          <div className="filters">
            <div className="search-box">
              <FaSearch />
              <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="filter-group">
              <FaFilter />
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <FaUserTie />
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="">All Roles</option>
                <option value="HR">HR</option>
                <option value="MANAGER">Manager</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>

            {/* ========== MONTH FILTER ========== */}
            <div className="filter-group">
              <FaCalendarAlt />
              <select value={selectedMonth} onChange={(e) => {
                setSelectedMonth(parseInt(e.target.value));
                setHistoryPage(1);
              }}>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* ========== YEAR FILTER ========== */}
            <div className="filter-group">
              <FaCalendarAlt />
              <select value={selectedYear} onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setHistoryPage(1);
              }}>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="empty-state"><FaHistory /><p>No leave history found</p></div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr><th>Employee</th><th>Role</th><th>Date Range</th><th>Days</th><th>Leave Type</th><th>Reason</th><th>Status</th><th>Reviewed By</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">{leave.employeeName?.charAt(0).toUpperCase()}</div>
                            <div><span>{leave.employeeName}</span><small>{leave.employeeId}</small></div>
                          </div>
                        </td>
                        <td><span className={`role-badge ${getRoleBadge(leave.role)}`}>{leave.role}</span></td>
                        <td>
                          {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          <small>{leave.totalDays} day(s)</small>
                        </td>
                        <td>{leave.totalDays}</td>
                        <td>{formatLeaveSummary(leave.leaveTypeSummary)}</td>
                        <td className="reason-cell">{leave.reason}</td>
                        <td><span className={`status-badge ${getStatusBadge(leave.status)}`}>{getStatusText(leave.status)}</span></td>
                        <td>{leave.approvedByName || '—'}</td>
                        <td>
                          {/* PENDING - Show Approve/Reject */}
                          {leave.status === 'PENDING' && (
                            <div className="action-buttons-small">
                              <button
                                className="approve-small"
                                onClick={() => handleApprove(leave._id)}
                                disabled={approveLoading === leave._id || rejectLoading === leave._id}
                              >
                                {approveLoading === leave._id ? <FaSpinner className="spinning" /> : 'Approve'}
                              </button>
                              <button
                                className="reject-small"
                                onClick={() => openRejectModal(leave._id)}
                                disabled={approveLoading === leave._id || rejectLoading === leave._id}
                              >
                                {rejectLoading === leave._id ? <FaSpinner className="spinning" /> : 'Reject'}
                              </button>
                            </div>
                          )}

                          {/* ✅ ONLY ADMIN CAN OVERRIDE */}
                          {leave.status !== 'PENDING' && leave.status !== 'CANCELLED' && isAdmin && (
                            <div className="override-buttons">
                              {leave.status !== 'APPROVED' && (
                                <button
                                  className="override-approve"
                                  onClick={() => openOverrideModal(leave._id, 'APPROVED')}
                                  disabled={approveLoading === leave._id || rejectLoading === leave._id}
                                >
                                  Override Approve
                                </button>
                              )}
                              {leave.status !== 'REJECTED' && (
                                <button
                                  className="override-reject"
                                  onClick={() => openOverrideModal(leave._id, 'REJECTED')}
                                  disabled={approveLoading === leave._id || rejectLoading === leave._id}
                                >
                                  Override Reject
                                </button>
                              )}
                            </div>
                          )}

                          {/* APPROVED/REJECTED but NOT ADMIN - Show nothing or status */}
                          {leave.status !== 'PENDING' && leave.status !== 'CANCELLED' && !isAdmin && (
                            <span className="no-action">—</span>
                          )}

                          {/* CANCELLED - Show nothing */}
                          {leave.status === 'CANCELLED' && (
                            <span className="no-action">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <button onClick={() => handlePageChange(historyPage - 1)} disabled={historyPage === 1}>Previous</button>
                <span>Page {historyPage} of {Math.ceil(historyTotal / 15)}</span>
                <button onClick={() => handlePageChange(historyPage + 1)} disabled={historyPage === Math.ceil(historyTotal / 15)}>Next</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showRejectModal && (
        <div className="hal-modal-overlay" onClick={closeModal}>
          <div className="hal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hal-modal__header">
              <div className="hal-modal__icon-warning">
                <FaExclamationTriangle />
              </div>
              <button className="hal-modal__close" onClick={closeModal}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="hal-modal__body">
              <h3>
                {rejectType === 'reject' ? 'Reject Leave Request' : `Override to ${overrideStatus}`}
              </h3>
              <p>
                Please provide a reason for {rejectType === 'reject' ? 'rejecting' : `overriding to ${overrideStatus.toLowerCase()}`} this leave request:
              </p>
              <textarea
                className="hal-modal__textarea"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason..."
                rows="4"
                autoFocus
              />
            </div>
            <div className="hal-modal__footer">
              <button className="hal-modal__cancel" onClick={closeModal}>
                Cancel
              </button>
              <button className="hal-modal__confirm" onClick={handleConfirmAction} disabled={rejectModalLoading}>
                {rejectModalLoading ? <FaSpinner className="spinning" /> : <FaTimesCircle />}
                {rejectModalLoading ? 'Processing...' : (rejectType === 'reject' ? 'Reject Leave' : `Override to ${overrideStatus}`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAllLeave;