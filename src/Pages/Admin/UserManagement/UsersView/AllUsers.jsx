import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import {
    FaEdit, FaTrash, FaUsers, FaSearch, FaTimes,
    FaUser, FaMoneyBillWave, FaBuilding, FaBriefcase,
    FaPhone, FaMapMarkerAlt, FaUserTie, FaSave,
    FaExclamationTriangle
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import './AllUsers.scss';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Confirmation modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '', salary: '', department: '',
        designation: '', phone: '', address: '', managerId: '',
    });
    const [managers, setManagers] = useState([]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.get(`${apiUrl}/admin/users/all`, { withCredentials: true });
            if (response.data.success) setUsers(response.data.users);
        } catch {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.get(`${apiUrl}/admin/managers/list`, { withCredentials: true });
            if (response.data.success) setManagers(response.data.managers);
        } catch (e) {
            console.error('Error fetching managers:', e);
        }
    };

    useEffect(() => { fetchUsers(); fetchManagers(); }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            salary: user.salary,
            department: user.department || '',
            designation: user.designation || '',
            phone: user.phone || '',
            address: user.address || '',
            managerId: user.managerId || '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.put(
                `${apiUrl}/admin/users/${editingUser.employeeId}`,
                { ...formData, salary: Number(formData.salary), managerId: formData.managerId || null },
                { withCredentials: true }
            );
            if (response.data.success) {
                toast.success('User updated successfully');
                setShowEditModal(false);
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setUpdateLoading(false);
        }
    };

    // Open confirmation modal instead of window.confirm
    const handleDeleteClick = (employeeId, name) => {
        setDeleteTarget({ employeeId, name });
        setShowConfirmModal(true);
    };

    // Execute delete after confirmation
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.delete(`${apiUrl}/admin/users/${deleteTarget.employeeId}`, { withCredentials: true });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers();
                setShowConfirmModal(false);
                setDeleteTarget(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowConfirmModal(false);
        setDeleteTarget(null);
        setDeleteLoading(false);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const roleConfig = {
        HR: { label: 'HR', cls: 'au-badge--hr' },
        MANAGER: { label: 'Manager', cls: 'au-badge--manager' },
        EMPLOYEE: { label: 'Employee', cls: 'au-badge--employee' },
    };

    return (
        <div className="au-container">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Page Header */}
            <div className="au-page-header">
                <div className="au-page-header__left">
                    <span className="au-page-header__badge">User Management</span>
                    <h1>All Users</h1>
                    <p>Manage HR, Managers, and Employees across your organization</p>
                </div>
                <div className="au-page-header__meta">
                    <div className="au-stat-pill">
                        <FaUsers />
                        <span>{users.length} Total Users</span>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="au-card">

                {/* Toolbar */}
                <div className="au-toolbar">
                    <div className="au-search">
                        <FaSearch className="au-search__icon" />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="au-search__clear" onClick={() => setSearchQuery('')}>
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    <div className="au-toolbar__count">
                        {filteredUsers.length} of {users.length} users
                    </div>
                </div>

                {/* Table */}
                <div className="au-table-wrap">
                    {loading ? (
                        <div className="au-state">
                            <div className="au-spinner" />
                            <p>Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="au-state">
                            <div className="au-state__icon"><FaUsers /></div>
                            <p>{searchQuery ? 'No users match your search.' : 'No users found. Create your first user!'}</p>
                        </div>
                    ) : (
                        <table className="au-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Salary</th>
                                    <th>Manager</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
                                    const rc = roleConfig[user.role] || { label: user.role, cls: '' };
                                    return (
                                        <tr key={user.employeeId}>
                                            <td>
                                                <div className="au-user-cell">
                                                    <div className="au-avatar">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="au-user-cell__info">
                                                        <span className="au-user-cell__name">{user.name}</span>
                                                        <span className="au-user-cell__desg">{user.designation || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="au-email">{user.email}</td>
                                            <td>
                                                <span className={`au-badge ${rc.cls}`}>{rc.label}</span>
                                            </td>
                                            <td className="au-salary">₹{user.salary?.toLocaleString()}</td>
                                            <td>
                                                {user.managerId
                                                    ? <span className="au-manager-id">{user.managerId}</span>
                                                    : <span className="au-dash">—</span>
                                                }
                                            </td>
                                            <td>
                                                <span className={`au-status ${user.isActive ? 'au-status--active' : 'au-status--inactive'}`}>
                                                    <span className="au-status__dot" />
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="au-actions">
                                                    <button className="au-btn-edit" onClick={() => handleEdit(user)} title="Edit">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="au-btn-delete" onClick={() => handleDeleteClick(user.employeeId, user.name)} title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="au-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="au-modal" onClick={(e) => e.stopPropagation()}>

                        <div className="au-modal__header">
                            <div className="au-modal__title">
                                <div className="au-modal__avatar">
                                    {editingUser?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3>Edit User</h3>
                                    <p>{editingUser?.employeeId} · {editingUser?.role}</p>
                                </div>
                            </div>
                            <button className="au-modal__close" onClick={() => setShowEditModal(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="au-modal__form">
                            <div className="au-modal__grid">

                                <div className="au-mfield">
                                    <label>Full Name</label>
                                    <div className="au-mfield__wrap">
                                        <FaUser className="au-mfield__icon" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Full name"
                                        />
                                    </div>
                                </div>

                                <div className="au-mfield">
                                    <label>Salary (₹)</label>
                                    <div className="au-mfield__wrap">
                                        <FaMoneyBillWave className="au-mfield__icon" />
                                        <input
                                            type="number"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                            required
                                            placeholder="e.g. 50000"
                                        />
                                    </div>
                                </div>

                                <div className="au-mfield">
                                    <label>Department</label>
                                    <div className="au-mfield__wrap">
                                        <FaBuilding className="au-mfield__icon" />
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g. IT, Finance"
                                        />
                                    </div>
                                </div>

                                <div className="au-mfield">
                                    <label>Designation</label>
                                    <div className="au-mfield__wrap">
                                        <FaBriefcase className="au-mfield__icon" />
                                        <input
                                            type="text"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            placeholder="e.g. Software Engineer"
                                        />
                                    </div>
                                </div>

                                <div className="au-mfield">
                                    <label>Phone</label>
                                    <div className="au-mfield__wrap">
                                        <FaPhone className="au-mfield__icon" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                </div>

                                {editingUser?.role === 'EMPLOYEE' && (
                                    <div className="au-mfield">
                                        <label>Assign Manager</label>
                                        <div className="au-mfield__wrap">
                                            <FaUserTie className="au-mfield__icon" />
                                            <select
                                                value={formData.managerId}
                                                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                            >
                                                <option value="">No Manager</option>
                                                {managers.map(m => (
                                                    <option key={m.employeeId} value={m.employeeId}>
                                                        {m.name} ({m.employeeId})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="au-mfield au-mfield--full">
                                    <label>Address</label>
                                    <div className="au-mfield__wrap au-mfield__wrap--textarea">
                                        <FaMapMarkerAlt className="au-mfield__icon au-mfield__icon--top" />
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows="2"
                                            placeholder="Full address"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="au-modal__footer">
                                <button type="button" className="au-modal__cancel" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="au-modal__save" disabled={updateLoading}>
                                    {updateLoading
                                        ? <><span className="au-spinner au-spinner--sm" /> Saving...</>
                                        : <><FaSave /> Save Changes</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal for Delete */}
            {showConfirmModal && (
                <div className="au-overlay" onClick={cancelDelete}>
                    <div className="au-modal au-modal--confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="au-modal__header au-modal__header--confirm">
                            <div className="au-modal__icon-warning">
                                <FaExclamationTriangle />
                            </div>
                            <button className="au-modal__close" onClick={cancelDelete}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="au-modal__body">
                            <h3>Confirm Delete</h3>
                            <p>
                                Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                            </p>
                            <p className="au-modal__warning">
                                This action cannot be undone. All data associated with this user will be permanently removed.
                            </p>
                        </div>

                        <div className="au-modal__footer au-modal__footer--confirm">
                            <button
                                type="button"
                                className="au-modal__cancel"
                                onClick={cancelDelete}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="au-modal__delete"
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <><span className="au-spinner au-spinner--sm" /> Deleting...</>
                                ) : (
                                    <>Yes, Delete User</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllUsers;