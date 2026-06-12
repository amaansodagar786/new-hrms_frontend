import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye, FaSearch, FaFilter, FaExclamationTriangle } from 'react-icons/fa';
import './ManagerTeamLeave.scss';

const ManagerTeamLeave = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [teamHistory, setTeamHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);

    // Reject Modal States
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectLeaveId, setRejectLeaveId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectLoading, setRejectLoading] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch team pending leaves
    const fetchPendingLeaves = async () => {
        try {
            const response = await axios.get(`${apiUrl}/leave/team-requests`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setPendingLeaves(response.data.leaves);
            }
        } catch (error) {
            console.error('Error fetching pending leaves:', error);
        }
    };

    // Fetch team history
    const fetchTeamHistory = async (page = 1) => {
        try {
            const response = await axios.get(`${apiUrl}/leave/team-history?page=${page}&limit=10`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setTeamHistory(response.data.leaves);
                setHistoryTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching team history:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchPendingLeaves(), fetchTeamHistory(1)]);
            setLoading(false);
        };
        loadData();
    }, []);

    // Handle approve leave
    const handleApprove = async (leaveId) => {
        setProcessingId(leaveId);
        try {
            const response = await axios.put(`${apiUrl}/leave/${leaveId}/approve`, {}, {
                withCredentials: true,
            });
            if (response.data.success) {
                toast.success('Leave approved successfully');
                await fetchPendingLeaves();
                await fetchTeamHistory(historyPage);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve leave');
        } finally {
            setProcessingId(null);
        }
    };

    // Open reject modal
    const openRejectModal = (leaveId) => {
        setRejectLeaveId(leaveId);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    // Close reject modal
    const closeRejectModal = () => {
        setShowRejectModal(false);
        setRejectLeaveId(null);
        setRejectionReason('');
        setRejectLoading(false);
    };

    // Handle reject leave with reason
    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setRejectLoading(true);
        try {
            const response = await axios.put(`${apiUrl}/leave/${rejectLeaveId}/reject`, {
                rejectionReason: rejectionReason,
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success('Leave rejected successfully');
                closeRejectModal();
                await fetchPendingLeaves();
                await fetchTeamHistory(historyPage);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject leave');
        } finally {
            setRejectLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setHistoryPage(newPage);
        fetchTeamHistory(newPage);
    };

    const getStatusBadge = (status) => {
        const statusMap = { PENDING: 'status-pending', APPROVED: 'status-approved', REJECTED: 'status-rejected', CANCELLED: 'status-cancelled' };
        return statusMap[status] || 'status-default';
    };

    const getStatusText = (status) => {
        const statusMap = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled' };
        return statusMap[status] || status;
    };

    const formatLeaveSummary = (summary) => {
        if (!summary || summary.length === 0) return '—';
        return summary.map(s => `${s.leaveType}: ${s.daysCount}d`).join(', ');
    };

    // Filter history
    const filteredHistory = teamHistory.filter(leave => {
        const matchesSearch = leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus ? leave.status === selectedStatus : true;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="manager-team-leave-loading">
                <div className="spinner"></div>
                <p>Loading team leave data...</p>
            </div>
        );
    }

    return (
        <div className="manager-team-leave">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="team-leave-header">
                <h1><FaUsers /> Team Leave Management</h1>
                <p>Manage and track your team's leave requests</p>
            </div>

            <div className="team-leave-tabs">
                <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                    <FaClock /> Pending Requests ({pendingLeaves.length})
                </button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <FaEye /> Team History
                </button>
            </div>

            {/* Pending Requests Tab */}
            {activeTab === 'pending' && (
                <div className="pending-card">
                    <h2>Pending Leave Requests</h2>
                    {pendingLeaves.length === 0 ? (
                        <div className="empty-state"><FaUsers /><p>No pending leave requests</p><small>All team leave requests have been processed</small></div>
                    ) : (
                        <div className="table-responsive">
                            <table className="pending-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Date Range</th>
                                        <th>Days</th>
                                        <th>Leave Type</th>
                                        <th>Reason</th>
                                        <th>Applied On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingLeaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>
                                                <div className="employee-cell">
                                                    <div className="employee-avatar">{leave.employeeName?.charAt(0).toUpperCase()}</div>
                                                    <span>{leave.employeeName}</span>
                                                    <small>{leave.employeeId}</small>
                                                </div>
                                            </td>
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

            {/* Team History Tab */}
            {activeTab === 'history' && (
                <div className="history-card">
                    <h2>Team Leave History</h2>
                    <div className="filters">
                        <div className="search-box">
                            <FaSearch />
                            <input type="text" placeholder="Search by employee name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                    </div>
                    {filteredHistory.length === 0 ? (
                        <div className="empty-state"><FaUsers /><p>No leave history found</p></div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Date Range</th>
                                            <th>Days</th>
                                            <th>Leave Type</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                            <th>Reviewed By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.map((leave) => (
                                            <tr key={leave._id}>
                                                <td>
                                                    <div className="employee-cell">
                                                        <div className="employee-avatar">{leave.employeeName?.charAt(0).toUpperCase()}</div>
                                                        <span>{leave.employeeName}</span>
                                                        <small>{leave.employeeId}</small>
                                                    </div>
                                                </td>
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
                                                <td>{leave.approvedByName || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="pagination">
                                <button onClick={() => handlePageChange(historyPage - 1)} disabled={historyPage === 1}>Previous</button>
                                <span>Page {historyPage} of {Math.ceil(historyTotal / 10)}</span>
                                <button onClick={() => handlePageChange(historyPage + 1)} disabled={historyPage === Math.ceil(historyTotal / 10)}>Next</button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Custom Reject Confirmation Modal */}
            {showRejectModal && (
                <div className="mtl-modal-overlay" onClick={closeRejectModal}>
                    <div className="mtl-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="mtl-modal__header">
                            <div className="mtl-modal__icon-warning">
                                <FaExclamationTriangle />
                            </div>
                            <button className="mtl-modal__close" onClick={closeRejectModal}>
                                <FaTimesCircle />
                            </button>
                        </div>
                        <div className="mtl-modal__body">
                            <h3>Reject Leave Request</h3>
                            <p>Please provide a reason for rejecting this leave request:</p>
                            <textarea
                                className="mtl-modal__textarea"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                rows="4"
                                autoFocus
                            />
                        </div>
                        <div className="mtl-modal__footer">
                            <button className="mtl-modal__cancel" onClick={closeRejectModal}>
                                Cancel
                            </button>
                            <button className="mtl-modal__confirm" onClick={handleConfirmReject} disabled={rejectLoading}>
                                {rejectLoading ? <FaSpinner className="spinning" /> : <FaTimesCircle />}
                                {rejectLoading ? 'Rejecting...' : 'Reject Leave'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTeamLeave;