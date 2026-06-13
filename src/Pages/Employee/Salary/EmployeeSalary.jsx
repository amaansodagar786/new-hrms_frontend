import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaMoneyBillWave,
    FaCalendarAlt,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaDownload,
    FaHistory,
    FaInfoCircle,
    FaUserCheck,
    FaCalendarCheck,
    FaClock as FaLateIcon,
    FaChevronDown,
    FaChevronUp,
    FaEye,
    FaUser,
    FaBriefcase,
    FaBuilding,
    FaIdCard,
    FaRupeeSign,
    FaPercentage,
    FaPlusCircle,
    FaMinusCircle
} from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import './EmployeeSalary.scss';

const EmployeeSalary = () => {
    const [loading, setLoading] = useState(true);
    const [currentSalary, setCurrentSalary] = useState(null);
    const [basicSalary, setBasicSalary] = useState(0);
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [expandedHistory, setExpandedHistory] = useState(null);
    const [leaveUsage, setLeaveUsage] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(null);

    // ========== PAYSLIP STATE ==========
    const [showPayslipModal, setShowPayslipModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [payslipData, setPayslipData] = useState(null);
    const [loadingPayslip, setLoadingPayslip] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Fetch current month salary
    const fetchCurrentSalary = async () => {
        try {
            const response = await axios.get(`${apiUrl}/salary/me`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setCurrentSalary(response.data.salary);
                setBasicSalary(response.data.basicSalary);
            }
        } catch (error) {
            console.error('Error fetching current salary:', error);
        }
    };

    // Fetch salary history
    const fetchSalaryHistory = async (page = 1) => {
        try {
            const response = await axios.get(`${apiUrl}/salary/me/history?page=${page}&limit=12`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setSalaryHistory(response.data.records);
                setHistoryTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching salary history:', error);
        }
    };

    // Fetch leave usage for current month
    const fetchLeaveUsage = async () => {
        try {
            const response = await axios.get(`${apiUrl}/leave/usage/${currentYear}/${currentMonth}`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setLeaveUsage(response.data.leaveUsage);
                setLeaveBalance(response.data.leaveBalance);
            }
        } catch (error) {
            console.error('Error fetching leave usage:', error);
        }
    };

    // ========== PAYSLIP FUNCTIONS ==========
    const fetchPayslip = async (year, month) => {
        setLoadingPayslip(true);
        try {
            const response = await axios.get(`${apiUrl}/salary/payslip/self/${year}/${month}`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setPayslipData(response.data.payslip);
                setShowPayslipModal(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch payslip');
        } finally {
            setLoadingPayslip(false);
        }
    };

    const handleViewPayslip = (record) => {
        const year = record.year;
        const month = record.month.split('-')[1];
        fetchPayslip(year, month);
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('payslip-content');
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `Payslip_${payslipData?.employee?.name?.replace(/\s/g, '_')}_${payslipData?.salaryMonth}_${payslipData?.salaryYear}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
        toast.success('Payslip downloaded successfully!');
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchCurrentSalary(),
                fetchSalaryHistory(1),
                fetchLeaveUsage(),
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    // Filter history by year
    const filteredHistory = salaryHistory.filter(record => record.year === selectedYear);

    // Get month name
    const getMonthName = (monthStr) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthNum = parseInt(monthStr.split('-')[1]);
        return months[monthNum - 1];
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        if (status === 'PAID') {
            return <span className="status-badge status-paid"><FaCheckCircle /> Paid</span>;
        }
        return <span className="status-badge status-unpaid"><FaClock /> Unpaid</span>;
    };

    // Toggle expand history
    const toggleExpandHistory = (recordId) => {
        setExpandedHistory(expandedHistory === recordId ? null : recordId);
    };

    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const years = [currentYear, currentYear - 1, currentYear - 2];

    if (loading) {
        return (
            <div className="employee-salary-loading">
                <div className="spinner"></div>
                <p>Loading salary details...</p>
            </div>
        );
    }

    return (
        <div className="employee-salary">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Header */}
            <div className="salary-header">
                <h1><FaMoneyBillWave /> My Salary</h1>
                <p>View your salary details, payment history, and download payslips</p>
            </div>

            {/* Current Month Salary Card */}
            <div className="current-salary-card">
                <div className="card-header">
                    <h2><FaCalendarAlt /> {currentMonthName} {currentYear} Salary</h2>
                    {currentSalary && getStatusBadge(currentSalary.status)}
                </div>

                {/* Salary Details - Only if calculated */}
                {currentSalary ? (
                    <>
                        <div className="salary-amount">
                            <div className="net-salary">
                                <span className="label">Net Salary</span>
                                <span className="amount">{formatCurrency(currentSalary.netSalary)}</span>
                            </div>
                            <div className="basic-salary">
                                <span className="label">Basic Salary</span>
                                <span className="amount">{formatCurrency(basicSalary)}</span>
                            </div>
                        </div>

                        {/* ========== SALARY COMPONENTS USED SECTION ========== */}
                        {currentSalary.usedComponents && currentSalary.usedComponents.length > 0 && (
                            <div className="components-used-section">
                                <h3>Salary Components Used</h3>
                                <div className="components-used-list">
                                    {/* Additions */}
                                    {currentSalary.usedComponents.filter(c => c.type === 'addition').length > 0 && (
                                        <div className="components-group">
                                            <h4 className="components-group-title additions">
                                                <FaPlusCircle /> Additions (Earnings)
                                            </h4>
                                            <div className="components-items">
                                                {currentSalary.usedComponents.filter(c => c.type === 'addition').map((comp, idx) => (
                                                    <div key={idx} className="component-item addition">
                                                        <div className="component-info">
                                                            <strong>{comp.name}</strong>
                                                            <span className="component-code">{comp.code}</span>
                                                            <small>({comp.calculationType === 'percentage' ? `${comp.value}% of basic` : `₹${comp.value} fixed`})</small>
                                                        </div>
                                                        <div className="component-amount">+ {formatCurrency(comp.amount)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="components-total addition-total">
                                                <span>Total Additions</span>
                                                <strong>+ {formatCurrency(currentSalary.totalAdditions || 0)}</strong>
                                            </div>
                                        </div>
                                    )}

                                    {/* Deductions */}
                                    {currentSalary.usedComponents.filter(c => c.type === 'deduction').length > 0 && (
                                        <div className="components-group">
                                            <h4 className="components-group-title deductions">
                                                <FaMinusCircle /> Deductions
                                            </h4>
                                            <div className="components-items">
                                                {currentSalary.usedComponents.filter(c => c.type === 'deduction').map((comp, idx) => (
                                                    <div key={idx} className="component-item deduction">
                                                        <div className="component-info">
                                                            <strong>{comp.name}</strong>
                                                            <span className="component-code">{comp.code}</span>
                                                            <small>({comp.calculationType === 'percentage' ? `${comp.value}% of basic` : `₹${comp.value} fixed`})</small>
                                                        </div>
                                                        <div className="component-amount">- {formatCurrency(comp.amount)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="components-total deduction-total">
                                                <span>Total Component Deductions</span>
                                                <strong>- {formatCurrency(currentSalary.totalDeductionsFromComponents || 0)}</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Attendance Summary */}
                        <div className="attendance-summary">
                            <h3>Attendance Summary</h3>
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <div className="summary-icon"><FaCalendarCheck /></div>
                                    <div className="summary-info">
                                        <span className="label">Working Days</span>
                                        <strong>{currentSalary.attendanceSummary?.totalWorkingDays || 0}</strong>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-icon"><FaUserCheck /></div>
                                    <div className="summary-info">
                                        <span className="label">Present Days</span>
                                        <strong>{currentSalary.attendanceSummary?.presentDays || 0}</strong>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-icon"><FaLateIcon /></div>
                                    <div className="summary-info">
                                        <span className="label">Late Days</span>
                                        <strong>{currentSalary.attendanceSummary?.lateDays || 0}</strong>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-icon"><FaClock /></div>
                                    <div className="summary-info">
                                        <span className="label">Half Days</span>
                                        <strong>{currentSalary.attendanceSummary?.halfDays || 0}</strong>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-icon"><FaTimesCircle /></div>
                                    <div className="summary-info">
                                        <span className="label">Absent Days</span>
                                        <strong>{currentSalary.attendanceSummary?.absentDays || 0}</strong>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-icon"><FaInfoCircle /></div>
                                    <div className="summary-info">
                                        <span className="label">Unpaid Leaves</span>
                                        <strong>{currentSalary.attendanceSummary?.unpaidLeaveDays || 0}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deductions Section */}
                        <div className="deductions-section">
                            <h3>Deductions Breakdown</h3>
                            <div className="deductions-list">
                                <div className="deduction-item">
                                    <span>Late Deduction (5 lates = 1 day)</span>
                                    <strong>{formatCurrency(currentSalary.lateDeduction || 0)}</strong>
                                </div>
                                <div className="deduction-item">
                                    <span>Half Day Deduction (50% per day)</span>
                                    <strong>{formatCurrency(currentSalary.halfDayDeduction || 0)}</strong>
                                </div>
                                <div className="deduction-item">
                                    <span>Absent Deduction (100% per day)</span>
                                    <strong>{formatCurrency(currentSalary.absentDeduction || 0)}</strong>
                                </div>
                                <div className="deduction-item">
                                    <span>Leave Deduction (Unpaid Leave)</span>
                                    <strong>{formatCurrency(currentSalary.leaveDeduction || 0)}</strong>
                                </div>
                                <div className="deduction-item total">
                                    <span>Total Deductions</span>
                                    <strong>{formatCurrency(currentSalary.totalDeductions || 0)}</strong>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-salary">
                        <FaInfoCircle />
                        <p>No salary record found for this month</p>
                        <small>Salary has not been calculated yet. Please contact HR.</small>
                    </div>
                )}

                {/* Leave Usage Section */}
                <div className="leave-usage-section">
                    <h3>Leave Usage for {currentMonthName} {currentYear}</h3>
                    <div className="leave-usage-grid">
                        <div className="leave-item">
                            <div className="leave-header">
                                <span className="leave-name">Casual Leave (CL)</span>
                                <span className="leave-days">{leaveUsage?.CL?.taken || 0} days</span>
                            </div>
                            <div className="leave-status paid">✅ Paid Leave - No Deduction</div>
                            {leaveBalance?.CL && (
                                <div className="leave-balance">Remaining: {leaveBalance.CL.remaining} / {leaveBalance.CL.total} days</div>
                            )}
                        </div>

                        <div className="leave-item">
                            <div className="leave-header">
                                <span className="leave-name">Sick Leave (SL)</span>
                                <span className="leave-days">{leaveUsage?.SL?.taken || 0} days</span>
                            </div>
                            <div className="leave-status paid">✅ Paid Leave - No Deduction</div>
                            {leaveBalance?.SL && (
                                <div className="leave-balance">Remaining: {leaveBalance.SL.remaining} / {leaveBalance.SL.total} days</div>
                            )}
                        </div>

                        <div className="leave-item">
                            <div className="leave-header">
                                <span className="leave-name">Paid Leave (PL)</span>
                                <span className="leave-days">{leaveUsage?.PL?.taken || 0} days</span>
                            </div>
                            <div className="leave-status paid">✅ Paid Leave - No Deduction</div>
                            {leaveBalance?.PL && (
                                <div className="leave-balance">Remaining: {leaveBalance.PL.remaining} / {leaveBalance.PL.total} days</div>
                            )}
                        </div>

                        <div className="leave-item">
                            <div className="leave-header">
                                <span className="leave-name">Earned Leave (EL)</span>
                                <span className="leave-days">{leaveUsage?.EL?.taken || 0} days</span>
                            </div>
                            <div className="leave-status paid">✅ Paid Leave - No Deduction</div>
                            {leaveBalance?.EL && (
                                <div className="leave-balance">Remaining: {leaveBalance.EL.remaining} / {leaveBalance.EL.total} days</div>
                            )}
                        </div>

                        <div className="leave-item warning">
                            <div className="leave-header">
                                <span className="leave-name">Unpaid Leave (LOP)</span>
                                <span className="leave-days">{leaveUsage?.LOP?.taken || 0} days</span>
                            </div>
                            <div className="leave-status unpaid">⚠️ Unpaid - Will be deducted from Salary</div>
                            {currentSalary && leaveUsage?.LOP?.taken > 0 && (
                                <div className="deduction-note">Deduction: {formatCurrency(currentSalary.leaveDeduction || 0)}</div>
                            )}
                            {!currentSalary && leaveUsage?.LOP?.taken > 0 && (
                                <div className="deduction-note warning-note">⚠️ This will be deducted when salary is calculated</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    {currentSalary && currentSalary.status === 'PAID' && (
                        <button
                            className="download-btn"
                            onClick={() => {
                                const year = currentYear;
                                const month = String(currentMonth).padStart(2, '0');
                                fetchPayslip(year, month);
                            }}
                        >
                            <FaDownload /> Download Payslip - {currentMonthName} {currentYear}
                        </button>
                    )}
                    {(!currentSalary || currentSalary.status !== 'PAID') && (
                        <button className="download-btn disabled" disabled>
                            <FaDownload /> Payslip Available After Payment
                        </button>
                    )}
                </div>
            </div>

            {/* Salary History Section */}
            <div className="history-card">
                <div className="card-header">
                    <h2><FaHistory /> Salary History</h2>
                    <div className="filter-group">
                        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredHistory.length === 0 ? (
                    <div className="empty-state">
                        <FaHistory />
                        <p>No salary history found for {selectedYear}</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {filteredHistory.map((record) => (
                            <div key={record._id} className="history-item">
                                <div className="history-header" onClick={() => toggleExpandHistory(record._id)}>
                                    <div className="history-left">
                                        <span className="month">{getMonthName(record.month)}</span>
                                        <span className="year">{record.year}</span>
                                    </div>
                                    <div className="history-right">
                                        <span className="net-amount">{formatCurrency(record.netSalary)}</span>
                                        {getStatusBadge(record.status)}
                                        <button className="expand-btn">
                                            {expandedHistory === record._id ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                {expandedHistory === record._id && (
                                    <div className="history-details">
                                        <div className="detail-section">
                                            <h4>Attendance Summary</h4>
                                            <div className="detail-grid">
                                                <div><span>Working Days:</span> <strong>{record.attendanceSummary?.totalWorkingDays || 0}</strong></div>
                                                <div><span>Present:</span> <strong>{record.attendanceSummary?.presentDays || 0}</strong></div>
                                                <div><span>Late:</span> <strong>{record.attendanceSummary?.lateDays || 0}</strong></div>
                                                <div><span>Half Day:</span> <strong>{record.attendanceSummary?.halfDays || 0}</strong></div>
                                                <div><span>Absent:</span> <strong>{record.attendanceSummary?.absentDays || 0}</strong></div>
                                                <div><span>Unpaid Leave:</span> <strong>{record.attendanceSummary?.unpaidLeaveDays || 0}</strong></div>
                                            </div>
                                        </div>

                                        {/* Used Components in History */}
                                        {record.usedComponents && record.usedComponents.length > 0 && (
                                            <div className="detail-section">
                                                <h4>Salary Components Used</h4>
                                                <div className="used-components-list">
                                                    {record.usedComponents.map((comp, idx) => (
                                                        <div key={idx} className={`used-component-item ${comp.type}`}>
                                                            <span>{comp.name} ({comp.code})</span>
                                                            <strong>{comp.type === 'addition' ? '+' : '-'} {formatCurrency(comp.amount)}</strong>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="detail-section">
                                            <h4>Deductions</h4>
                                            <div className="detail-grid">
                                                <div><span>Late Deduction:</span> <strong>{formatCurrency(record.lateDeduction || 0)}</strong></div>
                                                <div><span>Half Day Deduction:</span> <strong>{formatCurrency(record.halfDayDeduction || 0)}</strong></div>
                                                <div><span>Absent Deduction:</span> <strong>{formatCurrency(record.absentDeduction || 0)}</strong></div>
                                                <div><span>Leave Deduction:</span> <strong>{formatCurrency(record.leaveDeduction || 0)}</strong></div>
                                                <div><span>Total Deductions:</span> <strong>{formatCurrency(record.totalDeductions || 0)}</strong></div>
                                            </div>
                                        </div>
                                        {record.paidAt && (
                                            <div className="detail-section">
                                                <h4>Payment Info</h4>
                                                <div className="detail-grid">
                                                    <div><span>Paid On:</span> <strong>{new Date(record.paidAt).toLocaleDateString()}</strong></div>
                                                    <div><span>Paid By:</span> <strong>{record.paidByName || 'HR/Admin'}</strong></div>
                                                </div>
                                            </div>
                                        )}
                                        {/* View Payslip Button in History */}
                                        {record.status === 'PAID' && (
                                            <div className="history-action">
                                                <button
                                                    className="view-payslip-btn"
                                                    onClick={() => handleViewPayslip(record)}
                                                >
                                                    <FaEye /> View Payslip
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {historyTotal > 12 && (
                    <div className="pagination">
                        <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1}>
                            Previous
                        </button>
                        <span>Page {historyPage} of {Math.ceil(historyTotal / 12)}</span>
                        <button onClick={() => setHistoryPage(p => p + 1)} disabled={historyPage === Math.ceil(historyTotal / 12)}>
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* ========== PAYSLIP MODAL ========== */}
            {showPayslipModal && payslipData && (
                <div className="modal-overlay" onClick={() => setShowPayslipModal(false)}>
                    <div className="payslip-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaMoneyBillWave /> Payslip</h3>
                            <button className="modal-close" onClick={() => setShowPayslipModal(false)}>
                                <FaTimesCircle />
                            </button>
                        </div>
                        <div className="modal-body">
                            {loadingPayslip ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading payslip...</p>
                                </div>
                            ) : (
                                <div id="payslip-content" className="payslip-content">
                                    {/* Company Header */}
                                    <div className="payslip-header">
                                        <h1>{payslipData.company?.name || 'HRMS'}</h1>
                                        <p>{payslipData.company?.address || 'Your Company Address'}</p>
                                        <p>Email: {payslipData.company?.email || 'hr@hrms.com'} | Phone: {payslipData.company?.phone || '+91 XXXXXXXXXX'}</p>
                                        <div className="payslip-title">
                                            <h2>PAYSLIP</h2>
                                            <p>For the month of {payslipData.salaryMonth} {payslipData.salaryYear}</p>
                                        </div>
                                    </div>

                                    {/* Employee Details */}
                                    <div className="payslip-section">
                                        <h4>Employee Details</h4>
                                        <div className="payslip-grid">
                                            <div className="payslip-item">
                                                <label><FaUser /> Name:</label>
                                                <span>{payslipData.employee?.name}</span>
                                            </div>
                                            <div className="payslip-item">
                                                <label><FaIdCard /> Employee ID:</label>
                                                <span>{payslipData.employee?.employeeId}</span>
                                            </div>
                                            <div className="payslip-item">
                                                <label><FaBriefcase /> Designation:</label>
                                                <span>{payslipData.employee?.designation}</span>
                                            </div>
                                            <div className="payslip-item">
                                                <label><FaBuilding /> Department:</label>
                                                <span>{payslipData.employee?.department}</span>
                                            </div>
                                            <div className="payslip-item">
                                                <label><FaCalendarAlt /> Joining Date:</label>
                                                <span>{new Date(payslipData.employee?.joinDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="payslip-item">
                                                <label>PAN Number:</label>
                                                <span>{payslipData.employee?.panNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Earnings and Deductions */}
                                    <div className="payslip-salary">
                                        <div className="payslip-earnings">
                                            <h4>Earnings</h4>
                                            <table className="payslip-table">
                                                <thead>
                                                    <tr>
                                                        <th>Particulars</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Basic Salary</td>
                                                        <td>{formatCurrency(payslipData.basicSalary)}</td>
                                                    </tr>
                                                    {payslipData.additions?.map((add, idx) => (
                                                        <tr key={idx}>
                                                            <td>{add.name}</td>
                                                            <td>{formatCurrency(add.amount)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="payslip-total">
                                                        <td><strong>Total Earnings</strong></td>
                                                        <td><strong>{formatCurrency(payslipData.totalAdditions + payslipData.basicSalary)}</strong></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="payslip-deductions">
                                            <h4>Deductions</h4>
                                            <table className="payslip-table">
                                                <thead>
                                                    <tr>
                                                        <th>Particulars</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payslipData.deductions?.map((ded, idx) => (
                                                        <tr key={idx}>
                                                            <td>{ded.name}</td>
                                                            <td>{formatCurrency(ded.amount)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="payslip-total">
                                                        <td><strong>Total Deductions</strong></td>
                                                        <td><strong>{formatCurrency(payslipData.totalDeductions)}</strong></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Net Salary */}
                                    <div className="payslip-net">
                                        <div className="payslip-net-amount">
                                            <span>NET SALARY</span>
                                            <strong>{formatCurrency(payslipData.netSalary)}</strong>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="payslip-footer">
                                        <div className="payslip-payment">
                                            <p><strong>Payment Details:</strong></p>
                                            <p>Paid On: {new Date(payslipData.paymentInfo?.paidOn).toLocaleDateString()}</p>
                                            <p>Paid By: {payslipData.paymentInfo?.paidBy}</p>
                                            <p>Bank: {payslipData.employee?.bankName}</p>
                                            <p>Account: {payslipData.employee?.bankAccount}</p>
                                        </div>
                                        <div className="payslip-note">
                                            <p>This is a computer generated payslip. No signature required.</p>
                                            <p>Generated on: {new Date().toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="close-btn" onClick={() => setShowPayslipModal(false)}>Close</button>
                            <button className="download-btn" onClick={handleDownloadPDF}>
                                <FaDownload /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeSalary;