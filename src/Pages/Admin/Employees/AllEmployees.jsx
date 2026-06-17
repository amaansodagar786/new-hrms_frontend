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
    FaExclamationTriangle,
    FaCreditCard,
    FaUniversity,
    FaFileAlt,
    FaTint,
    FaIdCard as FaAadhar,
    FaFileUpload,
    FaLock,
    FaKey,
    FaInfoCircle,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaHistory,
    FaChartLine,
    FaStar,
    FaUser ,
    FaFilter as FaFilterIcon,
    FaCalendarCheck,
    FaUserClock,
    FaChartBar,
    FaDownload
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

    // View Details Modal (Enhanced with tabs)
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [completeDetails, setCompleteDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    // Detail filters
    const [attendanceFilters, setAttendanceFilters] = useState({ year: '', month: '' });
    const [leaveFilters, setLeaveFilters] = useState({ year: '', status: '' });

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [editForm, setEditForm] = useState({
        phone: '',
        address: '',
        department: '',
        designation: '',
        managerId: '',
        panNumber: '',
        aadharNumber: '',
        bankAccountNo: '',
        bankIfsc: '',
        bankName: '',
        accountHolderName: '',
        bloodGroup: '',
        joinLetter: '',
    });
    const [updating, setUpdating] = useState(false);
    const [managers, setManagers] = useState([]);

    // Password Reset Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordResetEmployee, setPasswordResetEmployee] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resettingPassword, setResettingPassword] = useState(false);

    // File upload state
    const [selectedFile, setSelectedFile] = useState(null);

    // Confirm Modal for Status Toggle
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
    });

    const apiUrl = import.meta.env.VITE_API_URL;
    const userRole = localStorage.getItem('userRole');

    // Blood group options
    const bloodGroupOptions = ['', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    // Years for filters
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

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

    // ========== ENHANCED VIEW DETAILS WITH COMPLETE DATA ==========
    const handleViewDetails = async (employee) => {
        setShowDetailModal(true);
        setSelectedEmployee(employee);
        setLoadingDetails(true);
        setActiveTab('personal');

        try {
            const response = await axios.get(
                `${apiUrl}/admin/employees/${employee.employeeId}/complete-details`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setCompleteDetails(response.data.data);
            } else {
                toast.error('Failed to fetch complete details');
                // Fallback to basic employee data
                const basicResponse = await axios.get(
                    `${apiUrl}/admin/employees/${employee.employeeId}`,
                    { withCredentials: true }
                );
                if (basicResponse.data.success) {
                    setCompleteDetails({ employee: basicResponse.data.employee });
                }
            }
        } catch (error) {
            console.error('Error fetching complete details:', error);
            toast.error('Failed to fetch complete details');
            // Fallback
            try {
                const basicResponse = await axios.get(
                    `${apiUrl}/admin/employees/${employee.employeeId}`,
                    { withCredentials: true }
                );
                if (basicResponse.data.success) {
                    setCompleteDetails({ employee: basicResponse.data.employee });
                }
            } catch (err) {
                toast.error('Failed to load employee data');
            }
        } finally {
            setLoadingDetails(false);
        }
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
            panNumber: employee.panNumber || '',
            aadharNumber: employee.aadharNumber || '',
            bankAccountNo: employee.bankAccountNo || '',
            bankIfsc: employee.bankIfsc || '',
            bankName: employee.bankName || '',
            accountHolderName: employee.accountHolderName || '',
            bloodGroup: employee.bloodGroup || '',
            joinLetter: employee.joinLetter || '',
        });
        setSelectedFile(null);
        setShowEditModal(true);
    };

    // Handle password reset click
    const handlePasswordResetClick = (employee) => {
        setPasswordResetEmployee(employee);
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(true);
    };

    // Handle password reset submit
    const handlePasswordReset = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setResettingPassword(true);
        try {
            const response = await axios.put(
                `${apiUrl}/admin/employees/${passwordResetEmployee.employeeId}/reset-password`,
                { newPassword: newPassword },
                { withCredentials: true }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setResettingPassword(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            toast.info(`Selected: ${file.name}`);
        } else {
            toast.error('Please select a PDF file');
            e.target.value = '';
        }
    };

    // Handle file upload
    const handleFileUpload = async (file) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('joinLetter', file);

        try {
            const response = await axios.post(`${apiUrl}/upload/join-letter`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                return response.data.fileUrl;
            }
            return null;
        } catch (error) {
            toast.error('Failed to upload file');
            return null;
        }
    };

    // Handle update employee
    const handleUpdateEmployee = async () => {
        if (!editEmployee) return;

        setUpdating(true);

        let joinLetterUrl = editForm.joinLetter;

        if (selectedFile) {
            const uploadedUrl = await handleFileUpload(selectedFile);
            if (uploadedUrl) {
                joinLetterUrl = uploadedUrl;
            }
        }

        try {
            const updateData = {
                ...editForm,
                joinLetter: joinLetterUrl,
            };

            const response = await axios.put(
                `${apiUrl}/admin/employees/${editEmployee.employeeId}`,
                updateData,
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

    const maskString = (str, start = 2, end = 2) => {
        if (!str || str.length <= start + end) return str || '—';
        return str.slice(0, start) + '****' + str.slice(-end);
    };

    const getStatusText = (status) => {
        const statusMap = {
            'ON_TIME': 'On Time',
            'LATE': 'Late',
            'ABSENT': 'Absent',
            'HALF_DAY': 'Half Day',
            'HOLIDAY': 'Holiday',
            'WEEKEND': 'Weekend'
        };
        return statusMap[status] || status || '—';
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'ON_TIME': 'status-on-time',
            'LATE': 'status-late',
            'ABSENT': 'status-absent',
            'HALF_DAY': 'status-half-day',
            'HOLIDAY': 'status-holiday',
            'WEEKEND': 'status-weekend'
        };
        return statusMap[status] || 'status-default';
    };

    const roles = ['HR', 'MANAGER', 'EMPLOYEE'];
    const statusOptions = [
        { value: '', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];
    const leaveStatusOptions = [
        { value: '', label: 'All' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];

    const tabs = [
        { key: 'personal', label: 'Personal', icon: <FaUser /> },
        { key: 'attendance', label: 'Attendance', icon: <FaClock /> },
        { key: 'leave', label: 'Leave', icon: <FaCalendarAlt /> },
        { key: 'salary', label: 'Salary', icon: <FaMoneyBillWave /> },
        { key: 'performance', label: 'Performance', icon: <FaStar /> },
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
                                        {/* <th>Employee ID</th> */}
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
                                            {/* <td className="employee-id">{emp.employeeId}</td> */}
                                            <td>{getRoleBadge(emp.role)}</td>
                                            <td>{emp.department || '—'}</td>
                                            <td>{emp.designation || '—'}</td>
                                            <td>{emp.managerName || '—'}</td>
                                            <td>{getStatusBadge(emp.isActive)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="action-view"
                                                    onClick={() => handleViewDetails(emp)}
                                                    title="View Complete Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="action-edit"
                                                    onClick={() => handleEditClick(emp)}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="action-toggle"
                                                    onClick={() => handleToggleStatus(emp)}
                                                    title={emp.isActive ? 'Deactivate' : 'Activate'}
                                                >
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

            {/* ========== ENHANCED EMPLOYEE DETAILS MODAL ========== */}
            {showDetailModal && selectedEmployee && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="detail-modal detail-modal--large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Employee Complete Details</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingDetails ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading complete details...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Header with Avatar */}
                                    <div className="employee-profile-header">
                                        <div className="profile-avatar-large">
                                            {selectedEmployee.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="profile-info">
                                            <h2>{selectedEmployee.name}</h2>
                                            <div className="profile-badges">
                                                {getRoleBadge(selectedEmployee.role)}
                                                {getStatusBadge(selectedEmployee.isActive)}
                                            </div>
                                            <div className="profile-meta">
                                                <span><FaIdCard /> {selectedEmployee.employeeId}</span>
                                                <span><FaEnvelope /> {selectedEmployee.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="details-tabs-nav">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.key}
                                                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                                                onClick={() => setActiveTab(tab.key)}
                                            >
                                                {tab.icon} {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="details-tab-content">
                                        {/* PERSONAL TAB */}
                                        {activeTab === 'personal' && (
                                            <div className="tab-panel">
                                                <div className="details-grid">
                                                    <div className="detail-item">
                                                        <FaIdCard />
                                                        <div>
                                                            <label>Employee ID</label>
                                                            <p>{completeDetails?.employee?.employeeId || '—'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaEnvelope />
                                                        <div>
                                                            <label>Email</label>
                                                            <p>{completeDetails?.employee?.email || '—'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaPhone />
                                                        <div>
                                                            <label>Phone</label>
                                                            <p>{completeDetails?.employee?.phone || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaMapMarkerAlt />
                                                        <div>
                                                            <label>Address</label>
                                                            <p>{completeDetails?.employee?.address || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaCalendarAlt />
                                                        <div>
                                                            <label>Join Date</label>
                                                            <p>{formatDate(completeDetails?.employee?.joinDate)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaTint />
                                                        <div>
                                                            <label>Blood Group</label>
                                                            <p>{completeDetails?.employee?.bloodGroup || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaBuilding />
                                                        <div>
                                                            <label>Department</label>
                                                            <p>{completeDetails?.employee?.department || 'Not assigned'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaBriefcase />
                                                        <div>
                                                            <label>Designation</label>
                                                            <p>{completeDetails?.employee?.designation || 'Not assigned'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaUserTie />
                                                        <div>
                                                            <label>Manager</label>
                                                            <p>{completeDetails?.employee?.managerName || 'No manager assigned'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaMoneyBillWave />
                                                        <div>
                                                            <label>Salary</label>
                                                            <p>{formatCurrency(completeDetails?.employee?.salary)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaIdCard />
                                                        <div>
                                                            <label>PAN Number</label>
                                                            <p>{completeDetails?.employee?.panNumber ? maskString(completeDetails.employee.panNumber, 2, 2) : 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaAadhar />
                                                        <div>
                                                            <label>Aadhar Number</label>
                                                            <p>{completeDetails?.employee?.aadharNumber ? maskString(completeDetails.employee.aadharNumber, 2, 2) : 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaUniversity />
                                                        <div>
                                                            <label>Bank Name</label>
                                                            <p>{completeDetails?.employee?.bankName || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaCreditCard />
                                                        <div>
                                                            <label>Account Number</label>
                                                            <p>{completeDetails?.employee?.bankAccountNo ? maskString(completeDetails.employee.bankAccountNo, 2, 4) : 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaIdCard />
                                                        <div>
                                                            <label>IFSC Code</label>
                                                            <p>{completeDetails?.employee?.bankIfsc || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="detail-item">
                                                        <FaUserTie />
                                                        <div>
                                                            <label>Account Holder</label>
                                                            <p>{completeDetails?.employee?.accountHolderName || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {completeDetails?.employee?.joinLetter && (
                                                    <div className="join-letter-section">
                                                        <FaFileAlt />
                                                        <a href={completeDetails.employee.joinLetter} target="_blank" rel="noopener noreferrer">
                                                            View Join Letter
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ATTENDANCE TAB */}
                                        {activeTab === 'attendance' && (
                                            <div className="tab-panel">
                                                <div className="tab-filters">
                                                    <div className="filter-group">
                                                        <label>Year</label>
                                                        <select
                                                            value={attendanceFilters.year}
                                                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, year: e.target.value })}
                                                        >
                                                            <option value="">All Years</option>
                                                            {years.map(y => (
                                                                <option key={y} value={y}>{y}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="filter-group">
                                                        <label>Month</label>
                                                        <select
                                                            value={attendanceFilters.month}
                                                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, month: e.target.value })}
                                                        >
                                                            <option value="">All Months</option>
                                                            {months.map(m => (
                                                                <option key={m.value} value={m.value}>{m.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="attendance-stats">
                                                    <div className="stat-card">
                                                        <span>Total Records</span>
                                                        <strong>{completeDetails?.attendance?.records?.length || 0}</strong>
                                                    </div>
                                                    <div className="stat-card">
                                                        <span>Present</span>
                                                        <strong className="text-success">
                                                            {completeDetails?.attendance?.records?.filter(r => r.checkInTime).length || 0}
                                                        </strong>
                                                    </div>
                                                    <div className="stat-card">
                                                        <span>Absent</span>
                                                        <strong className="text-danger">
                                                            {completeDetails?.attendance?.records?.filter(r => r.status === 'ABSENT').length || 0}
                                                        </strong>
                                                    </div>
                                                    <div className="stat-card">
                                                        <span>Late</span>
                                                        <strong className="text-warning">
                                                            {completeDetails?.attendance?.records?.filter(r => r.status === 'LATE').length || 0}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="attendance-table-wrap">
                                                    <table className="attendance-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th>Check In</th>
                                                                <th>Check Out</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {completeDetails?.attendance?.records?.length > 0 ? (
                                                                completeDetails.attendance.records.map((record, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{record.date}</td>
                                                                        <td>{record.checkInTime || '—'}</td>
                                                                        <td>{record.checkOutTime || '—'}</td>
                                                                        <td>
                                                                            <span className={`status-badge-small ${getStatusClass(record.status)}`}>
                                                                                {getStatusText(record.status)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="4" className="no-data">No attendance records found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* LEAVE TAB */}
                                        {activeTab === 'leave' && (
                                            <div className="tab-panel">
                                                <div className="tab-filters">
                                                    <div className="filter-group">
                                                        <label>Year</label>
                                                        <select
                                                            value={leaveFilters.year}
                                                            onChange={(e) => setLeaveFilters({ ...leaveFilters, year: e.target.value })}
                                                        >
                                                            <option value="">All Years</option>
                                                            {years.map(y => (
                                                                <option key={y} value={y}>{y}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="filter-group">
                                                        <label>Status</label>
                                                        <select
                                                            value={leaveFilters.status}
                                                            onChange={(e) => setLeaveFilters({ ...leaveFilters, status: e.target.value })}
                                                        >
                                                            {leaveStatusOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Leave Balance */}
                                                <div className="leave-balance-section">
                                                    <h4>Leave Balance</h4>
                                                    <div className="leave-balance-grid">
                                                        {completeDetails?.leave?.balance ? (
                                                            Object.entries(completeDetails.leave.balance).map(([key, val]) => (
                                                                <div key={key} className="balance-item">
                                                                    <span className="balance-type">{key}</span>
                                                                    <div className="balance-details">
                                                                        <span>Used: {val.used}</span>
                                                                        <span>Remaining: {val.remaining}</span>
                                                                        <span>Total: {val.total}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="no-data">No leave balance found</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Leave History */}
                                                <div className="leave-history-section">
                                                    <h4>Leave History</h4>
                                                    <div className="leave-table-wrap">
                                                        <table className="leave-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>From</th>
                                                                    <th>To</th>
                                                                    <th>Days</th>
                                                                    <th>Reason</th>
                                                                    <th>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {completeDetails?.leave?.history?.length > 0 ? (
                                                                    completeDetails.leave.history.map((leave, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>{leave.fromDate}</td>
                                                                            <td>{leave.toDate}</td>
                                                                            <td>{leave.totalDays}</td>
                                                                            <td>{leave.reason?.substring(0, 30)}...</td>
                                                                            <td>
                                                                                <span className={`leave-status ${leave.status.toLowerCase()}`}>
                                                                                    {leave.status}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="5" className="no-data">No leave records found</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* SALARY TAB */}
                                        {activeTab === 'salary' && (
                                            <div className="tab-panel">
                                                <div className="salary-stats">
                                                    <div className="stat-card">
                                                        <span>Total Records</span>
                                                        <strong>{completeDetails?.salary?.records?.length || 0}</strong>
                                                    </div>
                                                    <div className="stat-card">
                                                        <span>Basic Salary</span>
                                                        <strong>{formatCurrency(completeDetails?.employee?.salary)}</strong>
                                                    </div>
                                                    <div className="stat-card">
                                                        <span>Paid</span>
                                                        <strong className="text-success">
                                                            {completeDetails?.salary?.records?.filter(r => r.status === 'PAID').length || 0}
                                                        </strong>
                                                    </div>
                                                    <div className="stat-card">
                                                        <span>Unpaid</span>
                                                        <strong className="text-danger">
                                                            {completeDetails?.salary?.records?.filter(r => r.status === 'UNPAID').length || 0}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="salary-table-wrap">
                                                    <table className="salary-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Month</th>
                                                                <th>Year</th>
                                                                <th>Net Salary</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {completeDetails?.salary?.records?.length > 0 ? (
                                                                completeDetails.salary.records.map((record, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{record.month?.split('-')[1]}</td>
                                                                        <td>{record.year}</td>
                                                                        <td>{formatCurrency(record.netSalary)}</td>
                                                                        <td>
                                                                            <span className={`salary-status ${record.status.toLowerCase()}`}>
                                                                                {record.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="4" className="no-data">No salary records found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* PERFORMANCE TAB */}
                                        {activeTab === 'performance' && (
                                            <div className="tab-panel">
                                                <div className="performance-stats">
                                                    <div className="stat-card">
                                                        <span>Total Reviews</span>
                                                        <strong>{completeDetails?.performance?.reviews?.length || 0}</strong>
                                                    </div>
                                                    <div className="stat-card">
                                                        <span>Average Rating</span>
                                                        <strong>
                                                            {completeDetails?.performance?.reviews?.length > 0
                                                                ? (completeDetails.performance.reviews.reduce((sum, r) => sum + r.overallRating, 0) / completeDetails.performance.reviews.length).toFixed(1)
                                                                : '—'}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="performance-table-wrap">
                                                    <table className="performance-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Month</th>
                                                                <th>Quarter</th>
                                                                <th>Rating</th>
                                                                <th>Reviewed By</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {completeDetails?.performance?.reviews?.length > 0 ? (
                                                                completeDetails.performance.reviews.map((review, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{review.reviewMonth}</td>
                                                                        <td>{review.quarter}</td>
                                                                        <td>
                                                                            <div className="rating-stars">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <FaStar
                                                                                        key={i}
                                                                                        className={i < Math.floor(review.overallRating) ? 'star-filled' : 'star-empty'}
                                                                                    />
                                                                                ))}
                                                                                <span>{review.overallRating}/5</span>
                                                                            </div>
                                                                        </td>
                                                                        <td>{review.reviewedByName}</td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="4" className="no-data">No performance reviews found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
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

            {/* ========== EDIT EMPLOYEE MODAL ========== */}
            {showEditModal && editEmployee && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="edit-modal edit-modal--large" onClick={(e) => e.stopPropagation()}>
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

                            {/* Password Reset Button */}
                            <div className="password-reset-section">
                                <button
                                    className="password-reset-btn"
                                    onClick={() => handlePasswordResetClick(editEmployee)}
                                >
                                    <FaKey /> Reset Password
                                </button>
                            </div>

                            <div className="edit-tabs">
                                {/* Personal Information */}
                                <div className="edit-section">
                                    <h4>Personal Information</h4>
                                    <div className="form-row">
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
                                            <label><FaTint /> Blood Group</label>
                                            <select
                                                value={editForm.bloodGroup}
                                                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                                            >
                                                {bloodGroupOptions.map(bg => (
                                                    <option key={bg} value={bg}>{bg || 'Select Blood Group'}</option>
                                                ))}
                                            </select>
                                        </div>
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
                                </div>

                                {/* Professional Information */}
                                <div className="edit-section">
                                    <h4>Professional Information</h4>
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

                                {/* Documents & IDs */}
                                <div className="edit-section">
                                    <h4>Documents & IDs</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><FaIdCard /> PAN Card Number</label>
                                            <input
                                                type="text"
                                                value={editForm.panNumber}
                                                onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value.toUpperCase() })}
                                                placeholder="Enter PAN number (e.g., ABCDE1234F)"
                                                maxLength="10"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaAadhar /> Aadhar Number</label>
                                            <input
                                                type="text"
                                                value={editForm.aadharNumber}
                                                onChange={(e) => setEditForm({ ...editForm, aadharNumber: e.target.value })}
                                                placeholder="Enter 12-digit Aadhar number"
                                                maxLength="12"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label><FaFileUpload /> Join Letter (PDF)</label>
                                        <div className="file-upload-area">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileSelect}
                                                className="file-input"
                                            />
                                            {editForm.joinLetter && !selectedFile && (
                                                <div className="existing-file">
                                                    <FaFileAlt />
                                                    <a href={editForm.joinLetter} target="_blank" rel="noopener noreferrer">View existing join letter</a>
                                                    <small>Upload new file to replace</small>
                                                </div>
                                            )}
                                            {selectedFile && (
                                                <div className="selected-file">
                                                    <FaFileAlt />
                                                    <span>{selectedFile.name}</span>
                                                    <button onClick={() => setSelectedFile(null)}>Remove</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="edit-section">
                                    <h4>Bank Details</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><FaUniversity /> Bank Name</label>
                                            <input
                                                type="text"
                                                value={editForm.bankName}
                                                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                                                placeholder="Bank name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaCreditCard /> Account Number</label>
                                            <input
                                                type="text"
                                                value={editForm.bankAccountNo}
                                                onChange={(e) => setEditForm({ ...editForm, bankAccountNo: e.target.value })}
                                                placeholder="Bank account number"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label><FaIdCard /> IFSC Code</label>
                                            <input
                                                type="text"
                                                value={editForm.bankIfsc}
                                                onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value.toUpperCase() })}
                                                placeholder="IFSC code (e.g., SBIN0001234)"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><FaUserTie /> Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={editForm.accountHolderName}
                                                onChange={(e) => setEditForm({ ...editForm, accountHolderName: e.target.value })}
                                                placeholder="Name as per bank account"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
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

            {/* ========== PASSWORD RESET MODAL ========== */}
            {showPasswordModal && passwordResetEmployee && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="password-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaLock /> Reset Password</h3>
                            <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="password-reset-info">
                                <div className="reset-employee">
                                    <div className="reset-avatar">
                                        {passwordResetEmployee.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4>{passwordResetEmployee.name}</h4>
                                        <p>{passwordResetEmployee.employeeId} • {passwordResetEmployee.role}</p>
                                    </div>
                                </div>
                                <div className="reset-note">
                                    <FaInfoCircle />
                                    <p>The employee will receive an email notification that their password has been updated. <strong>The new password will NOT be shared in the email.</strong></p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label><FaKey /> New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 6 characters)"
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label><FaKey /> Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                            <button className="save-btn" onClick={handlePasswordReset} disabled={resettingPassword}>
                                {resettingPassword ? <FaSpinner className="spinning" /> : <FaSave />}
                                {resettingPassword ? 'Resetting...' : 'Reset Password'}
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