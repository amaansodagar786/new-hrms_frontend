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
  FaExclamationTriangle
} from 'react-icons/fa';
import './HRAllLeave.scss';

const HRAllLeave = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Reject Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectType, setRejectType] = useState('reject'); // 'reject' or 'override-reject' or 'override-approve'
  const [overrideStatus, setOverrideStatus] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchPendingLeaves = async () => {
    try {
      const response = await axios.get(`${apiUrl}/leave/all-requests?status=PENDING`, { withCredentials: true });
      if (response.data.success) setPendingLeaves(response.data.leaves);
    } catch (error) { console.error('Error:', error); }
  };

  const fetchAllHistory = async (page = 1) => {
    try {
      const response = await axios.get(`${apiUrl}/leave/all-requests?page=${page}&limit=15`, { withCredentials: true });
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
  }, []);

  const handleApprove = async (leaveId) => {
    setProcessingId(leaveId);
    try {
      const response = await axios.put(`${apiUrl}/leave/${leaveId}/approve`, {}, { withCredentials: true });
      if (response.data.success) {
        toast.success('Leave approved successfully');
        await fetchPendingLeaves();
        await fetchAllHistory(historyPage);
      }
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve leave'); }
    finally { setProcessingId(null); }
  };

  // Open reject modal for normal reject
  const openRejectModal = (leaveId) => {
    setRejectLeaveId(leaveId);
    setRejectionReason('');
    setRejectType('reject');
    setShowRejectModal(true);
  };

  // Open override modal for override actions
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
    setRejectLoading(false);
    setRejectType('reject');
    setOverrideStatus('');
  };

  const handleConfirmAction = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setRejectLoading(true);
    try {
      let response;

      if (rejectType === 'reject') {
        // Normal reject
        response = await axios.put(`${apiUrl}/leave/${rejectLeaveId}/reject`, {
          rejectionReason: rejectionReason
        }, { withCredentials: true });
      } else {
        // Override action
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
      setRejectLoading(false);
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

  if (loading) {
    return (<div className="hr-all-leave-loading"><div className="spinner"></div><p>Loading leave data...</p></div>);
  }

  return (
    <div className="hr-all-leave">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="all-leave-header">
        <h1><FaUserTie /> HR - All Leave Management</h1>
        <p>View, approve, reject, and override all leave requests across the organization</p>
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
                          <button className="approve-btn" onClick={() => handleApprove(leave._id)} disabled={processingId === leave._id}>
                            {processingId === leave._id ? <FaSpinner className="spinning" /> : <FaCheckCircle />} Approve
                          </button>
                          <button className="reject-btn" onClick={() => openRejectModal(leave._id)} disabled={processingId === leave._id}>
                            {processingId === leave._id ? <FaSpinner className="spinning" /> : <FaTimesCircle />} Reject
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
            <div className="search-box"><FaSearch /><input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="filter-group"><FaFilter /><select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}><option value="">All Status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="CANCELLED">Cancelled</option></select></div>
            <div className="filter-group"><FaUserTie /><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}><option value="">All Roles</option><option value="HR">HR</option><option value="MANAGER">Manager</option><option value="EMPLOYEE">Employee</option></select></div>
          </div>
          {filteredHistory.length === 0 ? (<div className="empty-state"><FaHistory /><p>No leave history found</p></div>) : (
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
                          {leave.status === 'PENDING' && (
                            <div className="action-buttons-small">
                              <button className="approve-small" onClick={() => handleApprove(leave._id)} disabled={processingId === leave._id}>Approve</button>
                              <button className="reject-small" onClick={() => openRejectModal(leave._id)} disabled={processingId === leave._id}>Reject</button>
                            </div>
                          )}
                          {leave.status !== 'PENDING' && leave.status !== 'CANCELLED' && (
                            <div className="override-buttons">
                              <button className="override-approve" onClick={() => openOverrideModal(leave._id, 'APPROVED')} disabled={processingId === leave._id}>
                                Override Approve
                              </button>
                              <button className="override-reject" onClick={() => openOverrideModal(leave._id, 'REJECTED')} disabled={processingId === leave._id}>
                                Override Reject
                              </button>
                            </div>
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
              <button className="hal-modal__confirm" onClick={handleConfirmAction} disabled={rejectLoading}>
                {rejectLoading ? <FaSpinner className="spinning" /> : <FaTimesCircle />}
                {rejectLoading ? 'Processing...' : (rejectType === 'reject' ? 'Reject Leave' : `Override to ${overrideStatus}`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAllLeave;