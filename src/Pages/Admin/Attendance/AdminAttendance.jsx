import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaUsers,
    FaCalendarAlt,
    FaClock,
    FaSearch,
    FaFilter,
    FaEdit,
    FaSave,
    FaTimes,
    FaSpinner,
    FaEye,
    FaUserShield,
    FaBuilding,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import './AdminAttendance.scss';

const AdminAttendance = () => {
    const [allAttendance, setAllAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); const [selectedRole, setSelectedRole] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editForm, setEditForm] = useState({
        checkInTime: '',
        checkOutTime: '',
        notes: ''
    });
    const [updating, setUpdating] = useState(false);
    const [stats, setStats] = useState({ total: 0, present: 0, onTime: 0, late: 0, halfDay: 0, absent: 0 });

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch all attendance
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

                // Calculate stats
                const today = new Date().toISOString().split('T')[0];
                const todayRecords = flattenedAttendance.filter(r => r.date === today);
                setStats({
                    total: flattenedAttendance.length,
                    present: flattenedAttendance.filter(r => r.checkInTime).length,
                    onTime: flattenedAttendance.filter(r => r.status === 'ON_TIME').length,
                    late: flattenedAttendance.filter(r => r.status === 'LATE').length,
                    halfDay: flattenedAttendance.filter(r => r.status === 'HALF_DAY').length,
                    absent: flattenedAttendance.filter(r => r.status === 'ABSENT' && !r.isHoliday && !r.isWeekend).length,
                });
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to fetch attendance data');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchAllAttendance();
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

    // Get current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (loading) {
        return (
            <div className="admin-attendance-loading">
                <div className="spinner"></div>
                <p>Loading attendance data...</p>
            </div>
        );
    }

    return (
        <div className="admin-attendance">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Page Header */}
            <div className="attendance-header">
                <div className="header-left">
                    <h1>
                        <FaUserShield /> Attendance Management
                    </h1>
                    <p>View and manage attendance for all employees</p>
                </div>
                <div className="header-right">
                    <div className="date-display">
                        <FaCalendarAlt />
                        <span>{currentDate}</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon"><FaUsers /></div>
                    <div className="admin-stat-info">
                        <h3>Total Records</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon"><FaCheckCircle /></div>
                    <div className="admin-stat-info">
                        <h3>Present</h3>
                        <p className="present">{stats.present}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon"><FaClock /></div>
                    <div className="admin-stat-info">
                        <h3>On Time</h3>
                        <p className="on-time">{stats.onTime}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon"><FaClock /></div>
                    <div className="admin-stat-info">
                        <h3>Late</h3>
                        <p className="late">{stats.late}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon"><FaClock /></div>
                    <div className="admin-stat-info">
                        <h3>Half Day</h3>
                        <p className="half-day">{stats.halfDay}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon"><FaTimesCircle /></div>
                    <div className="admin-stat-info">
                        <h3>Absent</h3>
                        <p className="absent">{stats.absent}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
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

            {/* Attendance Table */}
            <div className="attendance-card">
                <div className="card-header">
                    <h2>
                        <FaUsers /> All Employees Attendance
                    </h2>
                </div>

                {filteredAttendance.length === 0 ? (
                    <div className="empty-state">
                        <FaUsers />
                        <p>No attendance records found.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="attendance-table">
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
                                        <td className="date-cell">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="employee-cell">
                                                <div className="employee-avatar">
                                                    {record.employeeName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="employee-info">
                                                    <span className="employee-name">{record.employeeName}</span>
                                                    {record.department && <small>{record.department}</small>}
                                                </div>
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

                <div className="attendance-summary">
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
                                    <span>Role:</span>
                                    <strong>{editingRecord.role}</strong>
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

export default AdminAttendance;