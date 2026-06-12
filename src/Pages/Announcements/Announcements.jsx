import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaBullhorn,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSpinner,
    FaTimesCircle,
    FaCheckCircle,
    FaEye,
    FaCalendarAlt,
    FaClock,
    FaUsers,
    FaTag,
    FaFilter,
    FaSearch,
    FaBell,
    FaExclamationTriangle,
    FaRegCalendarAlt,
    FaUserTie,
    FaChartLine,
    FaSave
} from 'react-icons/fa';
import './Announcements.scss';

const Announcements = ({ userRole: propUserRole }) => {
    const [activeTab, setActiveTab] = useState('view');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState(propUserRole || 'EMPLOYEE');

    // View Tab State
    const [announcements, setAnnouncements] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [viewFilters, setViewFilters] = useState({ type: '', search: '' });
    const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

    // Manage Tab State (HR/Admin only)
    const [allAnnouncements, setAllAnnouncements] = useState([]);
    const [manageFilters, setManageFilters] = useState({ status: '', type: '', page: 1 });
    const [manageTotal, setManageTotal] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReadersModal, setShowReadersModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [readersData, setReadersData] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // Form State
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        type: 'general',
        priority: 'medium',
        targetAudience: ['HR', 'MANAGER', 'EMPLOYEE', 'ADMIN'],
        isPinned: false,
        expiresAt: '',
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch announcements for view tab
    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/announcements`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setAnnouncements(response.data.announcements);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all announcements for manage tab (HR/Admin only)
    const fetchAllAnnouncements = async () => {
        setLoading(true);
        try {
            const { status, type, page } = manageFilters;
            let url = `${apiUrl}/announcements/all?page=${page}&limit=10`;
            if (status) url += `&status=${status}`;
            if (type) url += `&type=${type}`;
            const response = await axios.get(url, { withCredentials: true });
            if (response.data.success) {
                setAllAnnouncements(response.data.announcements);
                setManageTotal(response.data.pagination.total);
            }
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`${apiUrl}/announcements/unread/count`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (activeTab === 'manage' && (userRole === 'HR' || userRole === 'ADMIN')) {
            fetchAllAnnouncements();
        }
    }, [activeTab, manageFilters, userRole]);

    // Mark announcement as read
    const markAsRead = async (announcementId) => {
        try {
            await axios.post(`${apiUrl}/announcements/${announcementId}/read`, {}, {
                withCredentials: true,
            });
            setAnnouncements(prev => prev.map(a =>
                a.announcementId === announcementId ? { ...a, isRead: true } : a
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Create announcement
    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementForm.title || !announcementForm.content) {
            toast.error('Title and content are required');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(`${apiUrl}/announcements`, announcementForm, {
                withCredentials: true,
            });
            if (response.data.success) {
                toast.success('Announcement created successfully');
                setShowCreateModal(false);
                setAnnouncementForm({
                    title: '',
                    content: '',
                    type: 'general',
                    priority: 'medium',
                    targetAudience: ['HR', 'MANAGER', 'EMPLOYEE', 'ADMIN'],
                    isPinned: false,
                    expiresAt: '',
                });
                fetchAnnouncements();
                fetchAllAnnouncements();
                fetchUnreadCount();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create announcement');
        } finally {
            setSubmitting(false);
        }
    };

    // Update announcement
    const handleUpdateAnnouncement = async (e) => {
        e.preventDefault();
        if (!selectedAnnouncement) return;

        setSubmitting(true);
        try {
            const response = await axios.put(`${apiUrl}/announcements/${selectedAnnouncement.announcementId}`, announcementForm, {
                withCredentials: true,
            });
            if (response.data.success) {
                toast.success('Announcement updated successfully');
                setShowEditModal(false);
                setSelectedAnnouncement(null);
                fetchAnnouncements();
                fetchAllAnnouncements();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update announcement');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete announcement
    const handleDeleteAnnouncement = async (announcementId) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        setProcessingId(announcementId);
        try {
            const response = await axios.delete(`${apiUrl}/announcements/${announcementId}`, {
                withCredentials: true,
            });
            if (response.data.success) {
                toast.success('Announcement deleted successfully');
                fetchAllAnnouncements();
                fetchAnnouncements();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete announcement');
        } finally {
            setProcessingId(null);
        }
    };

    // View readers
    const handleViewReaders = async (announcement) => {
        setSelectedAnnouncement(announcement);
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/announcements/${announcement.announcementId}/readers`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setReadersData(response.data);
                setShowReadersModal(true);
            }
        } catch (error) {
            toast.error('Failed to fetch readers data');
        } finally {
            setLoading(false);
        }
    };

    // Open edit modal
    const openEditModal = (announcement) => {
        setSelectedAnnouncement(announcement);
        setAnnouncementForm({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            priority: announcement.priority,
            targetAudience: announcement.targetAudience,
            isPinned: announcement.isPinned,
            expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '',
        });
        setShowEditModal(true);
    };

    // Toggle target audience
    const toggleTargetAudience = (role) => {
        setAnnouncementForm(prev => ({
            ...prev,
            targetAudience: prev.targetAudience.includes(role)
                ? prev.targetAudience.filter(r => r !== role)
                : [...prev.targetAudience, role]
        }));
    };

    // Get type config
    const getTypeConfig = (type) => {
        const config = {
            urgent: { label: 'Urgent', icon: <FaExclamationTriangle />, class: 'type-urgent' },
            holiday: { label: 'Holiday', icon: <FaRegCalendarAlt />, class: 'type-holiday' },
            event: { label: 'Event', icon: <FaCalendarAlt />, class: 'type-event' },
            policy: { label: 'Policy', icon: <FaUserTie />, class: 'type-policy' },
            general: { label: 'General', icon: <FaBullhorn />, class: 'type-general' },
        };
        return config[type] || config.general;
    };

    // Get priority config
    const getPriorityConfig = (priority) => {
        const config = {
            high: { label: 'High', class: 'priority-high' },
            medium: { label: 'Medium', class: 'priority-medium' },
            low: { label: 'Low', class: 'priority-low' },
        };
        return config[priority] || config.medium;
    };

    // Filter announcements for view tab
    const filteredAnnouncements = announcements.filter(a => {
        const matchesType = viewFilters.type ? a.type === viewFilters.type : true;
        const matchesSearch = viewFilters.search
            ? a.title.toLowerCase().includes(viewFilters.search.toLowerCase()) ||
            a.content.toLowerCase().includes(viewFilters.search.toLowerCase())
            : true;
        return matchesType && matchesSearch;
    });

    const canManage = userRole === 'HR' || userRole === 'ADMIN';

    if (loading && announcements.length === 0 && allAnnouncements.length === 0) {
        return (
            <div className="announcements-loading">
                <div className="spinner"></div>
                <p>Loading announcements...</p>
            </div>
        );
    }

    return (
        <div className="announcements">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Header */}
            <div className="announcements-header">
                <h1><FaBullhorn /> Announcements</h1>
                <p>Stay updated with the latest company announcements</p>
                {unreadCount > 0 && (
                    <div className="unread-badge">
                        <FaBell /> {unreadCount} new announcement{unreadCount !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="announcements-tabs">
                <button
                    className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                    onClick={() => setActiveTab('view')}
                >
                    <FaEye /> View Announcements
                </button>
                {canManage && (
                    <button
                        className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        <FaEdit /> Manage Announcements
                    </button>
                )}
            </div>

            {/* ========== VIEW TAB (same as before - keeping it short) ========== */}
            {activeTab === 'view' && (
                <div className="view-card">
                    <div className="card-header">
                        <h2><FaBullhorn /> All Announcements</h2>
                        <div className="filters">
                            <div className="search-box">
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Search announcements..."
                                    value={viewFilters.search}
                                    onChange={(e) => setViewFilters({ ...viewFilters, search: e.target.value })}
                                />
                            </div>
                            <div className="filter-group">
                                <FaFilter />
                                <select value={viewFilters.type} onChange={(e) => setViewFilters({ ...viewFilters, type: e.target.value })}>
                                    <option value="">All Types</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="holiday">Holiday</option>
                                    <option value="event">Event</option>
                                    <option value="policy">Policy</option>
                                    <option value="general">General</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {filteredAnnouncements.length === 0 ? (
                        <div className="empty-state">
                            <FaBullhorn />
                            <p>No announcements found</p>
                        </div>
                    ) : (
                        <div className="announcements-list">
                            {filteredAnnouncements.map((announcement) => {
                                const typeConfig = getTypeConfig(announcement.type);
                                const priorityConfig = getPriorityConfig(announcement.priority);
                                const isExpanded = expandedAnnouncement === announcement.announcementId;

                                return (
                                    <div
                                        key={announcement.announcementId}
                                        className={`announcement-item ${!announcement.isRead ? 'unread' : ''} ${announcement.isPinned ? 'pinned' : ''}`}
                                        onClick={() => {
                                            if (!announcement.isRead) {
                                                markAsRead(announcement.announcementId);
                                            }
                                        }}
                                    >
                                        <div className="announcement-header" onClick={() => setExpandedAnnouncement(isExpanded ? null : announcement.announcementId)}>
                                            <div className="announcement-left">
                                                <div className={`type-badge ${typeConfig.class}`}>
                                                    {typeConfig.icon} {typeConfig.label}
                                                </div>
                                                <div className={`priority-badge ${priorityConfig.class}`}>
                                                    {priorityConfig.label} Priority
                                                </div>
                                                {announcement.isPinned && <div className="pinned-badge">📌 Pinned</div>}
                                            </div>
                                            <div className="announcement-right">
                                                <span className="announcement-date">
                                                    <FaClock /> {new Date(announcement.createdAt).toLocaleDateString()}
                                                </span>
                                                {!announcement.isRead && <span className="unread-dot"></span>}
                                            </div>
                                        </div>

                                        <div className="announcement-body">
                                            <h3>{announcement.title}</h3>
                                            <p className={isExpanded ? 'expanded' : 'collapsed'}>
                                                {announcement.content}
                                            </p>
                                            {announcement.content.length > 200 && !isExpanded && (
                                                <button className="read-more" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedAnnouncement(announcement.announcementId);
                                                }}>
                                                    Read more...
                                                </button>
                                            )}
                                        </div>

                                        <div className="announcement-footer">
                                            <span className="created-by">
                                                Posted by: {announcement.createdByName} ({announcement.createdByRole})
                                            </span>
                                            {announcement.expiresAt && (
                                                <span className="expires-at">
                                                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ========== MANAGE TAB (HR/Admin only) ========== */}
            {activeTab === 'manage' && canManage && (
                <div className="manage-card">
                    <div className="card-header">
                        <h2><FaEdit /> Manage Announcements</h2>
                        <div className="header-actions">
                            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                                <FaPlus /> New Announcement
                            </button>
                        </div>
                    </div>

                    <div className="manage-filters">
                        <div className="filter-group">
                            <FaFilter />
                            <select value={manageFilters.status} onChange={(e) => setManageFilters({ ...manageFilters, status: e.target.value, page: 1 })}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <FaTag />
                            <select value={manageFilters.type} onChange={(e) => setManageFilters({ ...manageFilters, type: e.target.value, page: 1 })}>
                                <option value="">All Types</option>
                                <option value="urgent">Urgent</option>
                                <option value="holiday">Holiday</option>
                                <option value="event">Event</option>
                                <option value="policy">Policy</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                    </div>

                    {allAnnouncements.length === 0 ? (
                        <div className="empty-state">
                            <FaBullhorn />
                            <p>No announcements found</p>
                            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                                <FaPlus /> Create your first announcement
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="manage-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Type</th>
                                            <th>Priority</th>
                                            <th>Posted By</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allAnnouncements.map((announcement) => {
                                            const typeConfig = getTypeConfig(announcement.type);
                                            const priorityConfig = getPriorityConfig(announcement.priority);
                                            const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();
                                            const isActive = announcement.isActive && !isExpired;

                                            return (
                                                <tr key={announcement.announcementId}>
                                                    <td className="title-cell">
                                                        <div className="title-wrapper">
                                                            {announcement.isPinned && <span className="pin-icon">📌</span>}
                                                            <span>{announcement.title}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className={`type-badge-small ${typeConfig.class}`}>{typeConfig.label}</span></td>
                                                    <td><span className={`priority-badge-small ${priorityConfig.class}`}>{priorityConfig.label}</span></td>
                                                    <td>{announcement.createdByName}</td>
                                                    <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`}>
                                                            {isActive ? 'Active' : 'Expired'}
                                                        </span>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button className="view-readers" onClick={() => handleViewReaders(announcement)} title="View Readers">
                                                            <FaUsers />
                                                        </button>
                                                        <button className="edit" onClick={() => openEditModal(announcement)} title="Edit">
                                                            <FaEdit />
                                                        </button>
                                                        <button className="delete" onClick={() => handleDeleteAnnouncement(announcement.announcementId)} disabled={processingId === announcement.announcementId} title="Delete">
                                                            {processingId === announcement.announcementId ? <FaSpinner className="spinning" /> : <FaTrash />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {manageTotal > 10 && (
                                <div className="pagination">
                                    <button onClick={() => setManageFilters(prev => ({ ...prev, page: prev.page - 1 }))} disabled={manageFilters.page === 1}>
                                        Previous
                                    </button>
                                    <span>Page {manageFilters.page} of {Math.ceil(manageTotal / 10)}</span>
                                    <button onClick={() => setManageFilters(prev => ({ ...prev, page: prev.page + 1 }))} disabled={manageFilters.page === Math.ceil(manageTotal / 10)}>
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ========== CREATE ANNOUNCEMENT MODAL ========== */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaPlus /> Create New Announcement</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}><FaTimesCircle /></button>
                        </div>
                        <form onSubmit={handleCreateAnnouncement}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        value={announcementForm.title}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                        placeholder="Enter announcement title"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Content *</label>
                                    <textarea
                                        value={announcementForm.content}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                        placeholder="Write announcement content..."
                                        rows="6"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select value={announcementForm.type} onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}>
                                            <option value="general">General</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="holiday">Holiday</option>
                                            <option value="event">Event</option>
                                            <option value="policy">Policy</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={announcementForm.expiresAt}
                                            onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={announcementForm.isPinned}
                                            onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                                        />
                                        Pin to top (important announcement)
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label>Target Audience</label>
                                    <div className="audience-checkboxes">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={announcementForm.targetAudience.includes('HR')}
                                                onChange={() => toggleTargetAudience('HR')}
                                            />
                                            HR
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={announcementForm.targetAudience.includes('MANAGER')}
                                                onChange={() => toggleTargetAudience('MANAGER')}
                                            />
                                            Managers
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={announcementForm.targetAudience.includes('EMPLOYEE')}
                                                onChange={() => toggleTargetAudience('EMPLOYEE')}
                                            />
                                            Employees
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={announcementForm.targetAudience.includes('ADMIN')}
                                                onChange={() => toggleTargetAudience('ADMIN')}
                                            />
                                            Admin
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? <FaSpinner className="spinning" /> : <FaPlus />}
                                    {submitting ? 'Creating...' : 'Create Announcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== EDIT ANNOUNCEMENT MODAL ========== */}
            {showEditModal && selectedAnnouncement && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaEdit /> Edit Announcement</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}><FaTimesCircle /></button>
                        </div>
                        <form onSubmit={handleUpdateAnnouncement}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        value={announcementForm.title}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Content *</label>
                                    <textarea
                                        value={announcementForm.content}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                        rows="6"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select value={announcementForm.type} onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}>
                                            <option value="general">General</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="holiday">Holiday</option>
                                            <option value="event">Event</option>
                                            <option value="policy">Policy</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input
                                            type="date"
                                            value={announcementForm.expiresAt}
                                            onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={announcementForm.isPinned}
                                            onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                                        />
                                        Pin to top
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label>Target Audience</label>
                                    <div className="audience-checkboxes">
                                        <label><input type="checkbox" checked={announcementForm.targetAudience.includes('HR')} onChange={() => toggleTargetAudience('HR')} /> HR</label>
                                        <label><input type="checkbox" checked={announcementForm.targetAudience.includes('MANAGER')} onChange={() => toggleTargetAudience('MANAGER')} /> Managers</label>
                                        <label><input type="checkbox" checked={announcementForm.targetAudience.includes('EMPLOYEE')} onChange={() => toggleTargetAudience('EMPLOYEE')} /> Employees</label>
                                        <label><input type="checkbox" checked={announcementForm.targetAudience.includes('ADMIN')} onChange={() => toggleTargetAudience('ADMIN')} /> Admin</label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn" disabled={submitting}>
                                    {submitting ? <FaSpinner className="spinning" /> : <FaSave />}
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== READERS MODAL ========== */}
            {showReadersModal && readersData && selectedAnnouncement && (
                <div className="modal-overlay" onClick={() => setShowReadersModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaUsers /> Read Receipts - {selectedAnnouncement.title}</h3>
                            <button className="modal-close" onClick={() => setShowReadersModal(false)}><FaTimesCircle /></button>
                        </div>
                        <div className="modal-body">
                            <div className="readers-stats">
                                <div className="stat">
                                    <span className="stat-label">Target Audience:</span>
                                    <span className="stat-value">{readersData.totalTarget}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Read:</span>
                                    <span className="stat-value read">{readersData.readCount}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Unread:</span>
                                    <span className="stat-value unread">{readersData.unreadCount}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Read Rate:</span>
                                    <span className="stat-value">{readersData.totalTarget ? Math.round((readersData.readCount / readersData.totalTarget) * 100) : 0}%</span>
                                </div>
                            </div>

                            <div className="readers-tables">
                                <div className="readers-list">
                                    <h4>✓ Read ({readersData.readCount})</h4>
                                    {readersData.readers.length === 0 ? (
                                        <p className="no-data">No one has read this announcement yet</p>
                                    ) : (
                                        <ul>
                                            {readersData.readers.map(reader => (
                                                <li key={reader.employeeId}>
                                                    <span className="reader-name">{reader.name}</span>
                                                    <span className="reader-role">{reader.role}</span>
                                                    <span className="reader-date">{new Date(reader.readAt).toLocaleDateString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="non-readers-list">
                                    <h4>✗ Not Read ({readersData.unreadCount})</h4>
                                    {readersData.nonReaders.length === 0 ? (
                                        <p className="no-data">Everyone has read this announcement</p>
                                    ) : (
                                        <ul>
                                            {readersData.nonReaders.map(nonReader => (
                                                <li key={nonReader.employeeId}>
                                                    <span className="reader-name">{nonReader.name}</span>
                                                    <span className="reader-role">{nonReader.role}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowReadersModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;