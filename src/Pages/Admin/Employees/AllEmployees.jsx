import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaUsers,
    FaSearch,
    FaFilter,
    FaEye,
    FaEdit,
    FaSave,
    FaTimes,
    FaSpinner,
    FaUserCheck,
    FaUserTimes,
    FaChevronDown,
    FaChevronUp,
    FaUserTie,
    FaBuilding,
    FaBriefcase,
    FaPhone,
    FaMapMarkerAlt,
    FaEnvelope,
    FaIdCard,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaExclamationTriangle
} from 'react-icons/fa';
import './AllEmployees.scss';

const AllEmployees = () => {
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    
    // Filters
    const [filters, setFilters] = useState({
        role: '',
        department: '',
        status: '',
        search: '',
        page: 1,
    });
    
    // View Details Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [editForm, setEditForm] = useState({
        phone: '',
        address: '',
        department: '',
        designation: '',
        managerId: '',
    });
    const [updating, setUpdating] = useState(false);
    const [managers, setManagers] = useState([]);
    
    // Confirm Modal for Status Toggle
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
    });
    
    const apiUrl = import.meta.env.VITE_API_URL;
    const userRole = localStorage.getItem('userRole');

    // Fetch all employees
    const fetchAllEmployees = async () => {
        setLoading(true);
        try {
            const { role, department, status, search, page } = filters;
            let url = `${apiUrl}/admin/employees/all?page=${page}&limit=15`;
            if (role) url += `&role=${role}`;
            if (department) url += `&department=${department}`;
            if (status) url += `&status=${status}`;
            if (search) url += `&search=${search}`;
            
            const response = await axios.get(url, { withCredentials: true });
            if (response.data.success) {
                setEmployees(response.data.employees);
                setPagination(response.data.pagination);
                setDepartments(response.data.filters?.departments || []);
            }
        } catch (error) {
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch managers for dropdown
    const fetchManagers = async () => {
        try {
            const response = await axios.get(`${apiUrl}/admin/managers/list`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setManagers(response.data.managers);
            }
        } catch (error) {
            console.error('Error fetching managers:', error);
        }
    };
    
    useEffect(() => {
        fetchAllEmployees();
        fetchManagers();
    }, [filters]);
    
    // Handle page change
    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };
    
    // Handle view details
    const handleViewDetails = async (employee) => {
        setSelectedEmployee(employee);
        setShowDetailModal(true);
    };
    
    // Handle edit click
    const handleEditClick = (employee) => {
        setEditEmployee(employee);
        setEditForm({
            phone: employee.phone || '',
            address: employee.address || '',
            department: employee.department || '',
            designation: employee.designation || '',
            managerId: employee.managerId || '',
        });
        setShowEditModal(true);
    };
    
    // Handle update employee
    const handleUpdateEmployee = async () => {
        if (!editEmployee) return;
        
        setUpdating(true);
        try {
            const response = await axios.put(
                `${apiUrl}/admin/employees/${editEmployee.employeeId}`,
                editForm,
                { withCredentials: true }
            );
            if (response.data.success) {
                toast.success('Employee updated successfully');
                setShowEditModal(false);
                fetchAllEmployees();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update employee');
        } finally {
            setUpdating(false);
        }
    };
    
    // Handle toggle status
    const handleToggleStatus = (employee) => {
        const newStatus = !employee.isActive;
        setConfirmModal({
            show: true,
            title: newStatus ? 'Activate Employee' : 'Deactivate Employee',
            message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${employee.name}?`,
            onConfirm: async () => {
                try {
                    const response = await axios.patch(
                        `${apiUrl}/admin/employees/${employee.employeeId}/toggle-status`,
                        {},
                        { withCredentials: true }
                    );
                    if (response.data.success) {
                        toast.success(response.data.message);
                        fetchAllEmployees();
                        setConfirmModal({ ...confirmModal, show: false });
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to toggle status');
                }
            }
        });
    };
    
    const getRoleBadge = (role) => {
        const config = {
            HR: { class: 'role-hr', label: 'HR' },
            MANAGER: { class: 'role-manager', label: 'Manager' },
            EMPLOYEE: { class: 'role-employee', label: 'Employee' },
        };
        const c = config[role] || { class: 'role-default', label: role };
        return <span className={`role-badge ${c.class}`}>{c.label}</span>;
    };
    
    const getStatusBadge = (isActive) => {
        if (isActive) {
            return <span className="status-badge status-active"><FaUserCheck /> Active</span>;
        }
        return <span className="status-badge status-inactive"><FaUserTimes /> Inactive</span>;
    };
    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };
    
    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString();
    };
    
    const roles = ['HR', 'MANAGER', 'EMPLOYEE'];
    const statusOptions = [
        { value: '', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];
    
    if (loading && employees.length === 0) {
        return (
            <div className="all-employees-loading">
                <div className="spinner"></div>
                <p>Loading employees...</p>
            </div>
        );
    }
    
    return (
        <div className="all-employees">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            
            {/* Header */}
            <div className="employees-header">
                <h1><FaUsers /> Employee Information</h1>
                <p>View and manage all employees across the organization</p>
            </div>
            
            {/* Filters */}
            <div className="filters-card">
                <div className="filters-grid">
                    <div className="filter-group search-group">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search by name, email, ID..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        />
                    </div>
                    <div className="filter-group">
                        <FaUserTie />
                        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}>
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <FaBuilding />
                        <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}>
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <FaFilter />
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Employees Table */}
            <div className="employees-card">
                <div className="table-header">
                    <h2><FaUsers /> All Employees</h2>
                    <div className="table-stats">
                        Total: {pagination.total} employees
                    </div>
                </div>
                
                {employees.length === 0 ? (
                    <div className="empty-state">
                        <FaUsers />
                        <p>No employees found</p>
                        <small>Try adjusting your filters</small>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="employees-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Employee ID</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Designation</th>
                                        <th>Manager</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.employeeId}>
                                            <td className="employee-cell">
                                                <div className="employee-avatar">
                                                    {emp.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="employee-name">{emp.name}</div>
                                                    <div className="employee-email">{emp.email}</div>
                                                </div>
                                            </td>
                                            <td className="employee-id">{emp.employeeId}</td>
                                            <td>{getRoleBadge(emp.role)}</td>
                                            <td>{emp.department || '—'}</td>
                                            <td>{emp.designation || '—'}</td>
                                            <td>{emp.managerName || '—'}</td>
                                            <td>{getStatusBadge(emp.isActive)}</td>
                                            <td className="actions-cell">
                                                <button className="action-view" onClick={() => handleViewDetails(emp)} title="View Details">
                                                    <FaEye />
                                                </button>
                                                <button className="action-edit" onClick={() => handleEditClick(emp)} title="Edit">
                                                    <FaEdit />
                                                </button>
                                                <button className="action-toggle" onClick={() => handleToggleStatus(emp)} title={emp.isActive ? 'Deactivate' : 'Activate'}>
                                                    {emp.isActive ? <FaUserTimes /> : <FaUserCheck />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
                                    Previous
                                </button>
                                <span>Page {pagination.page} of {pagination.totalPages}</span>
                                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Employee Details Modal */}
            {showDetailModal && selectedEmployee && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Employee Details</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="employee-profile-header">
                                <div className="profile-avatar-large">
                                    {selectedEmployee.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-info">
                                    <h2>{selectedEmployee.name}</h2>
                                    {getRoleBadge(selectedEmployee.role)}
                                    {getStatusBadge(selectedEmployee.isActive)}
                                </div>
                            </div>
                            
                            <div className="details-grid">
                                <div className="detail-item">
                                    <FaIdCard />
                                    <div>
                                        <label>Employee ID</label>
                                        <p>{selectedEmployee.employeeId}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaEnvelope />
                                    <div>
                                        <label>Email</label>
                                        <p>{selectedEmployee.email}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaPhone />
                                    <div>
                                        <label>Phone</label>
                                        <p>{selectedEmployee.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaMapMarkerAlt />
                                    <div>
                                        <label>Address</label>
                                        <p>{selectedEmployee.address || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaBuilding />
                                    <div>
                                        <label>Department</label>
                                        <p>{selectedEmployee.department || 'Not assigned'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaBriefcase />
                                    <div>
                                        <label>Designation</label>
                                        <p>{selectedEmployee.designation || 'Not assigned'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaUserTie />
                                    <div>
                                        <label>Manager</label>
                                        <p>{selectedEmployee.managerName || 'No manager assigned'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaMoneyBillWave />
                                    <div>
                                        <label>Salary</label>
                                        <p>{formatCurrency(selectedEmployee.salary)}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <FaCalendarAlt />
                                    <div>
                                        <label>Join Date</label>
                                        <p>{formatDate(selectedEmployee.joinDate)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedEmployee.role === 'MANAGER' && selectedEmployee.assignedEmployeesCount > 0 && (
                                <div className="assigned-section">
                                    <h4>Team Members ({selectedEmployee.assignedEmployeesCount})</h4>
                                    <div className="team-list">
                                        {selectedEmployee.assignedEmployees?.map(member => (
                                            <div key={member.employeeId} className="team-member">
                                                <div className="team-avatar">
                                                    {member.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="team-name">{member.name}</div>
                                                    <div className="team-role">{member.designation || member.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>Close</button>
                            <button className="edit-btn" onClick={() => {
                                setShowDetailModal(false);
                                handleEditClick(selectedEmployee);
                            }}>
                                <FaEdit /> Edit Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Employee Modal */}
            {showEditModal && editEmployee && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaEdit /> Edit Employee</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="employee-info">
                                <div className="employee-avatar-large">
                                    {editEmployee.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4>{editEmployee.name}</h4>
                                    <p>{editEmployee.employeeId} • {editEmployee.role}</p>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label><FaPhone /> Phone Number</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label><FaMapMarkerAlt /> Address</label>
                                <textarea
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    rows="2"
                                    placeholder="Enter address"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaBuilding /> Department</label>
                                    <input
                                        type="text"
                                        value={editForm.department}
                                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                        placeholder="Department"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FaBriefcase /> Designation</label>
                                    <input
                                        type="text"
                                        value={editForm.designation}
                                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                        placeholder="Designation"
                                    />
                                </div>
                            </div>
                            
                            {editEmployee.role === 'EMPLOYEE' && (
                                <div className="form-group">
                                    <label><FaUserTie /> Assign Manager</label>
                                    <select
                                        value={editForm.managerId}
                                        onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
                                    >
                                        <option value="">No Manager</option>
                                        {managers.map(mgr => (
                                            <option key={mgr.employeeId} value={mgr.employeeId}>
                                                {mgr.name} ({mgr.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="save-btn" onClick={handleUpdateEmployee} disabled={updating}>
                                {updating ? <FaSpinner className="spinning" /> : <FaSave />}
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal__header">
                            <div className="confirm-modal__icon">
                                <FaExclamationTriangle />
                            </div>
                            <button className="confirm-modal__close" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="confirm-modal__body">
                            <h3>{confirmModal.title}</h3>
                            <p>{confirmModal.message}</p>
                        </div>
                        <div className="confirm-modal__footer">
                            <button className="confirm-modal__cancel" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                                Cancel
                            </button>
                            <button className="confirm-modal__confirm" onClick={confirmModal.onConfirm}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllEmployees;