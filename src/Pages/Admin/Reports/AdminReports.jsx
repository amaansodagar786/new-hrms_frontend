import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import {
    FaUsers,
    FaClock,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaStar,
    FaTasks,
    
    FaChartBar,
    FaSpinner,
    FaDownload,
    FaSearch,
    FaFilter,
    FaBuilding,
    FaUserTie,
    FaCalendarDay,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaIdCard,
    FaCheckCircle,
    FaTimesCircle,
    FaClock as FaTimeIcon,
    FaRupeeSign,
    FaBriefcase,
    FaFileExcel,
    FaEye , 
     
} from 'react-icons/fa';
import './AdminReports.scss';

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('employees');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filters, setFilters] = useState({});
    const [summaryStats, setSummaryStats] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL;

    // ========== TAB CONFIGURATION ==========
    const tabs = [
        { key: 'employees', label: 'Employees', icon: <FaUsers />, hasDashboard: false },
        { key: 'attendance', label: 'Attendance', icon: <FaClock />, hasDashboard: false },
        { key: 'leave', label: 'Leave', icon: <FaCalendarAlt />, hasDashboard: false },
        { key: 'salary', label: 'Salary', icon: <FaMoneyBillWave />, hasDashboard: false },
        { key: 'performance', label: 'Performance', icon: <FaStar />, hasDashboard: false },
        { key: 'tasks', label: 'Tasks', icon: <FaTasks />, hasDashboard: false },
        { key: 'holidays', label: 'Holidays', icon: <FaEye />, hasDashboard: false },
        { key: 'dashboard', label: 'Dashboard', icon: <FaChartBar />, hasDashboard: true },
    ];

    // ========== COLUMN CONFIGURATION ==========
    const columnConfigs = {
        employees: [
            { key: 'EmployeeID', label: 'Employee ID', icon: <FaIdCard /> },
            { key: 'Name', label: 'Name', icon: <FaUser /> },
            { key: 'Email', label: 'Email', icon: <FaEnvelope /> },
            { key: 'Role', label: 'Role', icon: <FaUserTie /> },
            { key: 'Department', label: 'Department', icon: <FaBuilding /> },
            { key: 'Designation', label: 'Designation', icon: <FaBriefcase /> },
            { key: 'Status', label: 'Status', icon: <FaCheckCircle /> },
            { key: 'Phone', label: 'Phone', icon: <FaPhone /> }
        ],
        attendance: [
            { key: 'EmployeeID', label: 'Employee ID', icon: <FaIdCard /> },
            { key: 'Name', label: 'Name', icon: <FaUser /> },
            { key: 'Department', label: 'Department', icon: <FaBuilding /> },
            { key: 'Date', label: 'Date', icon: <FaCalendarDay /> },
            { key: 'CheckIn', label: 'Check In', icon: <FaClock /> },
            { key: 'CheckOut', label: 'Check Out', icon: <FaTimeIcon /> },
            { key: 'Status', label: 'Status', icon: <FaCheckCircle /> }
        ],
        leave: [
            { key: 'EmployeeID', label: 'Employee ID', icon: <FaIdCard /> },
            { key: 'Name', label: 'Name', icon: <FaUser /> },
            { key: 'Department', label: 'Department', icon: <FaBuilding /> },
            { key: 'Casual Leave', label: 'CL', icon: <FaCalendarAlt /> },
            { key: 'Sick Leave', label: 'SL', icon: <FaCalendarAlt /> },
            { key: 'Paid Leave', label: 'PL', icon: <FaCalendarAlt /> },
            { key: 'TotalLeavesTaken', label: 'Total', icon: <FaCalendarAlt /> }
        ],
        salary: [
            { key: 'EmployeeID', label: 'Employee ID', icon: <FaIdCard /> },
            { key: 'Name', label: 'Name', icon: <FaUser /> },
            { key: 'Department', label: 'Department', icon: <FaBuilding /> },
            { key: 'BasicSalary', label: 'Basic Salary', icon: <FaRupeeSign /> },
            { key: 'TotalAdditions', label: 'Additions', icon: <FaRupeeSign /> },
            { key: 'TotalDeductions', label: 'Deductions', icon: <FaRupeeSign /> },
            { key: 'NetSalary', label: 'Net Salary', icon: <FaRupeeSign /> },
            { key: 'Status', label: 'Status', icon: <FaCheckCircle /> }
        ],
        performance: [
            { key: 'EmployeeID', label: 'Employee ID', icon: <FaIdCard /> },
            { key: 'Name', label: 'Name', icon: <FaUser /> },
            { key: 'Department', label: 'Department', icon: <FaBuilding /> },
            { key: 'ReviewMonth', label: 'Month', icon: <FaCalendarDay /> },
            { key: 'OverallRating', label: 'Rating', icon: <FaStar /> },
            { key: 'ReviewedBy', label: 'Reviewed By', icon: <FaUserTie /> }
        ],
        tasks: [
            { key: 'TaskID', label: 'Task ID', icon: <FaIdCard /> },
            { key: 'Title', label: 'Title', icon: <FaTasks /> },
            { key: 'AssignedTo', label: 'Assigned To', icon: <FaUser /> },
            { key: 'Status', label: 'Status', icon: <FaCheckCircle /> },
            { key: 'Deadline', label: 'Deadline', icon: <FaCalendarDay /> }
        ],
        holidays: [
            { key: 'Name', label: 'Holiday Name', icon: <FaEye /> },
            { key: 'Date', label: 'Date', icon: <FaCalendarDay /> },
            { key: 'Type', label: 'Type', icon: <FaFilter /> }
        ]
    };

    // ========== FILTER CONFIGURATION ==========
    const filterConfigs = {
        employees: [
            { key: 'department', label: 'Department', type: 'select', options: ['All', 'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'] },
            { key: 'role', label: 'Role', type: 'select', options: ['All', 'HR', 'MANAGER', 'EMPLOYEE'] },
            { key: 'status', label: 'Status', type: 'select', options: ['All', 'active', 'inactive'] },
            { key: 'search', label: 'Search...', type: 'text' }
        ],
        attendance: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'month', label: 'Month', type: 'select', options: ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
            { key: 'year', label: 'Year', type: 'select', options: ['All', '2026', '2025', '2024', '2023', '2022'] },
            { key: 'department', label: 'Department', type: 'select', options: ['All', 'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'] },
            { key: 'search', label: 'Search...', type: 'text' }
        ],
        leave: [
            { key: 'month', label: 'Month', type: 'select', options: ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
            { key: 'year', label: 'Year', type: 'select', options: ['All', '2026', '2025', '2024', '2023', '2022'] },
            { key: 'department', label: 'Department', type: 'select', options: ['All', 'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'] },
            { key: 'leaveType', label: 'Leave Type', type: 'select', options: ['All', 'CL', 'SL', 'PL', 'EL', 'LOP'] },
            { key: 'search', label: 'Search...', type: 'text' }
        ],
        salary: [
            { key: 'month', label: 'Month', type: 'select', options: ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
            { key: 'year', label: 'Year', type: 'select', options: ['All', '2026', '2025', '2024', '2023', '2022'] },
            { key: 'department', label: 'Department', type: 'select', options: ['All', 'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'] },
            { key: 'status', label: 'Status', type: 'select', options: ['All', 'PAID', 'UNPAID'] },
            { key: 'search', label: 'Search...', type: 'text' }
        ],
        performance: [
            { key: 'month', label: 'Month', type: 'select', options: ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
            { key: 'year', label: 'Year', type: 'select', options: ['All', '2026', '2025', '2024', '2023', '2022'] },
            { key: 'department', label: 'Department', type: 'select', options: ['All', 'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'] },
            { key: 'search', label: 'Search...', type: 'text' }
        ],
        tasks: [
            { key: 'status', label: 'Status', type: 'select', options: ['All', 'COMPLETE', 'INCOMPLETE'] },
            { key: 'search', label: 'Search...', type: 'text' }
        ],
        holidays: [
            { key: 'year', label: 'Year', type: 'select', options: ['All', '2026', '2025', '2024', '2023', '2022'] },
            { key: 'month', label: 'Month', type: 'select', options: ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] }
        ]
    };

    // ========== API ENDPOINT CONFIGURATION ==========
    const getEndpoint = (tab) => {
        const endpoints = {
            employees: '/admin/reports/employees',
            attendance: '/admin/reports/attendance/daily',
            leave: '/admin/reports/leave/summary',
            salary: '/admin/reports/salary/monthly',
            performance: '/admin/reports/performance/reviews',
            tasks: '/admin/reports/tasks/completion',
            holidays: '/admin/reports/holidays',
            dashboard: '/admin/reports/company-summary'
        };
        return endpoints[tab];
    };

    // ========== FETCH DATA ==========
    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = getEndpoint(activeTab);
            const filterParams = { ...filters };
            
            // Clean empty filters
            Object.keys(filterParams).forEach(key => {
                if (filterParams[key] === '' || filterParams[key] === 'All' || filterParams[key] === undefined) {
                    delete filterParams[key];
                }
            });

            const response = await axios.get(endpoint, {
                params: filterParams,
                withCredentials: true
            });

            if (response.data.success) {
                setReportData(response.data.data || []);
                setTotalRecords(response.data.total || response.data.data?.length || 0);
                if (activeTab === 'dashboard') {
                    setSummaryStats(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, [activeTab, filters]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    // ========== HANDLE FILTER CHANGE ==========
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // ========== EXPORT TO EXCEL ==========
    const exportToExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning('No data to export');
            return;
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            
            const tabName = tabs.find(t => t.key === activeTab)?.label || 'Report';
            XLSX.writeFile(workbook, `${tabName}_Report.xlsx`);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report');
        }
    };

    // ========== GET COLUMNS FOR CURRENT TAB ==========
    const getColumns = () => {
        return columnConfigs[activeTab] || [];
    };

    // ========== GET FILTERS FOR CURRENT TAB ==========
    const getFiltersConfig = () => {
        return filterConfigs[activeTab] || [];
    };

    // ========== RENDER FILTERS ==========
    const renderFilters = () => {
        const filterConfig = getFiltersConfig();
        if (filterConfig.length === 0) return null;

        return (
            <div className="report-filters">
                {filterConfig.map(filter => {
                    if (filter.type === 'select') {
                        return (
                            <div className="filter-group" key={filter.key}>
                                <label>{filter.label}</label>
                                <select
                                    value={filters[filter.key] || 'All'}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                >
                                    {filter.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        );
                    } else if (filter.type === 'date') {
                        return (
                            <div className="filter-group" key={filter.key}>
                                <label>{filter.label}</label>
                                <input
                                    type="date"
                                    value={filters[filter.key] || ''}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div className="filter-group filter-search" key={filter.key}>
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder={filter.label}
                                    value={filters[filter.key] || ''}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                />
                            </div>
                        );
                    }
                })}
            </div>
        );
    };

    // ========== RENDER TABLE ==========
    const renderTable = () => {
        const columns = getColumns();
        if (reportData.length === 0) {
            return (
                <div className="empty-state">
                    <FaSearch />
                    <p>No data found</p>
                    <small>Try adjusting your filters</small>
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <table className="report-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key}>
                                    {col.icon} {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index}>
                                {columns.map(col => (
                                    <td key={col.key}>
                                        {col.key === 'Status' ? (
                                            <span className={`status-badge ${row[col.key]?.toLowerCase()}`}>
                                                {row[col.key] || '—'}
                                            </span>
                                        ) : col.key === 'OverallRating' ? (
                                            <div className="rating-display">
                                                {'★'.repeat(Math.floor(row[col.key] || 0))}
                                                {'☆'.repeat(5 - Math.floor(row[col.key] || 0))}
                                                <span>{row[col.key] || 0}</span>
                                            </div>
                                        ) : (
                                            row[col.key] || '—'
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // ========== RENDER DASHBOARD ==========
    const renderDashboard = () => {
        if (!summaryStats) return null;

        const { employeeStats, attendanceStats, leaveStats, salaryStats, taskStats } = summaryStats;

        return (
            <div className="dashboard-grid">
                {/* Employee Stats */}
                <div className="dashboard-card">
                    <h3><FaUsers /> Employee Overview</h3>
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span>Total</span>
                            <strong>{employeeStats?.total || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Active</span>
                            <strong className="text-success">{employeeStats?.active || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Inactive</span>
                            <strong className="text-danger">{employeeStats?.inactive || 0}</strong>
                        </div>
                    </div>
                    <div className="dashboard-role-dist">
                        <span>HR: {employeeStats?.roleDistribution?.HR || 0}</span>
                        <span>Manager: {employeeStats?.roleDistribution?.MANAGER || 0}</span>
                        <span>Employee: {employeeStats?.roleDistribution?.EMPLOYEE || 0}</span>
                    </div>
                </div>

                {/* Attendance Stats */}
                <div className="dashboard-card">
                    <h3><FaClock /> Attendance</h3>
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span>Present</span>
                            <strong className="text-success">{attendanceStats?.present || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Late</span>
                            <strong className="text-warning">{attendanceStats?.late || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Absent</span>
                            <strong className="text-danger">{attendanceStats?.absent || 0}</strong>
                        </div>
                    </div>
                    <div className="dashboard-attendance-rate">
                        Rate: <strong>{attendanceStats?.attendanceRate || 0}%</strong>
                    </div>
                </div>

                {/* Leave Stats */}
                <div className="dashboard-card">
                    <h3><FaCalendarAlt /> Leave</h3>
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span>Total Leaves</span>
                            <strong>{leaveStats?.totalLeavesTaken || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Pending</span>
                            <strong className="text-warning">{leaveStats?.pendingLeaves || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* Salary Stats */}
                <div className="dashboard-card">
                    <h3><FaMoneyBillWave /> Salary</h3>
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span>Total Salary</span>
                            <strong>₹{(salaryStats?.totalSalary || 0).toLocaleString()}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Paid</span>
                            <strong className="text-success">{salaryStats?.paidCount || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Unpaid</span>
                            <strong className="text-danger">{salaryStats?.unpaidCount || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* Task Stats */}
                <div className="dashboard-card">
                    <h3><FaTasks /> Tasks</h3>
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span>Total</span>
                            <strong>{taskStats?.total || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Completed</span>
                            <strong className="text-success">{taskStats?.completed || 0}</strong>
                        </div>
                    </div>
                    <div className="dashboard-completion-rate">
                        Completion: <strong>{taskStats?.completionRate || 0}%</strong>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-reports">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Header */}
            <div className="reports-header">
                <h1><FaChartBar /> Reports & Analytics</h1>
                <p>View and export all reports across the organization</p>
            </div>

            {/* Tabs */}
            <div className="reports-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setFilters({});
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            {!tabs.find(t => t.key === activeTab)?.hasDashboard && (
                <div className="reports-filters-wrapper">
                    <div className="filters-header">
                        <div className="filters-title">
                            <FaFilter /> Filters
                        </div>
                        <button 
                            className="export-btn" 
                            onClick={exportToExcel}
                            disabled={loading || reportData.length === 0}
                        >
                            <FaFileExcel /> Export Excel
                        </button>
                    </div>
                    {renderFilters()}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <FaSpinner className="spinning" />
                    <p>Loading report data...</p>
                </div>
            )}

            {/* Content */}
            {!loading && (
                <>
                    {tabs.find(t => t.key === activeTab)?.hasDashboard ? (
                        renderDashboard()
                    ) : (
                        <>
                            <div className="reports-table-wrapper">
                                <div className="table-header">
                                    <h3>{tabs.find(t => t.key === activeTab)?.label} Report</h3>
                                    <span className="total-count">Total: {totalRecords} records</span>
                                </div>
                                {renderTable()}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminReports;