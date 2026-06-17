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
  FaUserShield,
  FaDownload,
  FaExclamationTriangle,
  FaCalendarAlt
} from 'react-icons/fa';
import './AdminLeave.scss';

const AdminLeave = () => {
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
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // ========== MONTH/YEAR FILTER STATES ==========
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Years array for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalLeaveId, setModalLeaveId] = useState(null);
  const [modalReason, setModalReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalType, setModalType] = useState('reject'); // 'reject', 'override-approve', 'override-reject'
  const [overrideStatus, setOverrideStatus] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch pending leaves
  const fetchPendingLeaves = async () => {
    try {
      const response = await axios.get(`${apiUrl}/leave/all-requests?status=PENDING`, { withCredentials: true });
      if (response.data.success) {
        setPendingLeaves(response.data.leaves);
      }
    } catch (error) { console.error('Error:', error); }
  };

  // Fetch all history with filters
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

        const allLeaves = response.data.leaves;
        setStats({
          total: response.data.pagination.total,
          pending: allLeaves.filter(l => l.status === 'PENDING').length,
          approved: allLeaves.filter(l => l.status === 'APPROVED').length,
          rejected: allLeaves.filter(l => l.status === 'REJECTED').length,
        });
      }
    } catch (error) { console.error('Error:', error); }
  };

  // Reload when filters change
  useEffect(() => {
    if (activeTab === 'history') {
      fetchAllHistory(1);
    }
  }, [selectedMonth, selectedYear, selectedStatus, selectedRole]);

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

  // Open reject modal
  const openRejectModal = (leaveId) => {
    setModalLeaveId(leaveId);
    setModalReason('');
    setModalType('reject');
    setShowModal(true);
  };

  // Open override modal
  const openOverrideModal = (leaveId, status) => {
    setModalLeaveId(leaveId);
    setModalReason('');
    setModalType('override');
    setOverrideStatus(status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalLeaveId(null);
    setModalReason('');
    setModalLoading(false);
    setModalType('reject');
    setOverrideStatus('');
  };

  const handleConfirmAction = async () => {
    if (!modalReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setModalLoading(true);
    try {
      let response;

      if (modalType === 'reject') {
        response = await axios.put(`${apiUrl}/leave/${modalLeaveId}/reject`, {
          rejectionReason: modalReason
        }, { withCredentials: true });
      } else {
        const endpoint = overrideStatus === 'APPROVED' ? 'approve' : 'reject';
        const body = overrideStatus === 'REJECTED' ? { rejectionReason: modalReason } : {};
        response = await axios.put(`${apiUrl}/leave/${modalLeaveId}/${endpoint}`, body, { withCredentials: true });
      }

      if (response.data.success) {
        const actionText = modalType === 'reject' ? 'rejected' : `${overrideStatus.toLowerCase()}`;
        toast.success(`Leave ${actionText} successfully`);
        closeModal();
        await fetchPendingLeaves();
        await fetchAllHistory(historyPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setHistoryPage(newPage);
    fetchAllHistory(newPage);
  };

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
    return (
      <div className="admin-leave-loading">
        <div className="spinner"></div>
        <p>Loading leave data...</p>
      </div>
    );
  }

  return (
    <div className="admin-leave">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header */}
      <div className="admin-leave-header">
        <h1><FaUserShield /> Admin - Leave Management</h1>
        <p>View, approve, reject, and override all leave requests across the organization</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaUsers /></div>
          <div className="admin-stat-info"><h3>Total Requests</h3><p>{stats.total}</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaClock /></div>
          <div className="admin-stat-info"><h3>Pending</h3><p className="pending">{stats.pending}</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaCheckCircle /></div>
          <div className="admin-stat-info"><h3>Approved</h3><p className="approved">{stats.approved}</p></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><FaTimesCircle /></div>
          <div className="admin-stat-info"><h3>Rejected</h3><p className="rejected">{stats.rejected}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-leave-tabs">
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          <FaClock /> Pending Requests ({pendingLeaves.length})
        </button>
        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <FaHistory /> All Leave History
        </button>
      </div>

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="admin-pending-card">
          <h2>Pending Leave Requests Across Organization</h2>
          {pendingLeaves.length === 0 ? (
            <div className="empty-state"><FaUsers /><p>No pending leave requests</p><small>All leave requests have been processed</small></div>
          ) : (
            <div className="table-responsive">
              <table className="admin-pending-table">
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

      {/* All History Tab */}
      {activeTab === 'history' && (
        <div className="admin-history-card">
          <h2>Complete Leave History</h2>

          {/* Filters */}
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
              <FaUserShield />
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
                <table className="admin-history-table">
                  <thead>
                    <tr><th>Employee</th><th>Role</th><th>Date Range</th><th>Days</th><th>Leave Type</th><th>Reason</th><th>Status</th><th>Reviewed By</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">{leave.employeeName?.charAt(0).toUpperCase()}</div>
                            <div><span>{leave.employeeName}</span></div>
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
                          {/* For PENDING - show Approve/Reject buttons */}
                          {leave.status === 'PENDING' && (
                            <div className="action-buttons-small">
                              <button className="approve-small" onClick={() => handleApprove(leave._id)} disabled={processingId === leave._id}>
                                Approve
                              </button>
                              <button className="reject-small" onClick={() => openRejectModal(leave._id)} disabled={processingId === leave._id}>
                                Reject
                              </button>
                            </div>
                          )}

                          {/* For APPROVED - show ONLY Override Reject */}
                          {leave.status === 'APPROVED' && (
                            <button className="override-reject" onClick={() => openOverrideModal(leave._id, 'REJECTED')} disabled={processingId === leave._id}>
                              Override Reject
                            </button>
                          )}

                          {/* For REJECTED - show ONLY Override Approve */}
                          {leave.status === 'REJECTED' && (
                            <button className="override-approve" onClick={() => openOverrideModal(leave._id, 'APPROVED')} disabled={processingId === leave._id}>
                              Override Approve
                            </button>
                          )}

                          {/* For CANCELLED - show nothing */}
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
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div className="admin-modal__icon-warning">
                <FaExclamationTriangle />
              </div>
              <button className="admin-modal__close" onClick={closeModal}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="admin-modal__body">
              <h3>
                {modalType === 'reject' ? 'Reject Leave Request' : `Override to ${overrideStatus}`}
              </h3>
              <p>
                Please provide a reason for {modalType === 'reject' ? 'rejecting' : `overriding to ${overrideStatus.toLowerCase()}`} this leave request:
              </p>
              <textarea
                className="admin-modal__textarea"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Enter reason..."
                rows="4"
                autoFocus
              />
            </div>
            <div className="admin-modal__footer">
              <button className="admin-modal__cancel" onClick={closeModal}>
                Cancel
              </button>
              <button className="admin-modal__confirm" onClick={handleConfirmAction} disabled={modalLoading}>
                {modalLoading ? <FaSpinner className="spinning" /> : <FaTimesCircle />}
                {modalLoading ? 'Processing...' : (modalType === 'reject' ? 'Reject Leave' : `Override to ${overrideStatus}`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeave;