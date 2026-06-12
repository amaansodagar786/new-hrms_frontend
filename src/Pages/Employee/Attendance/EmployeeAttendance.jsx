import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaCalendarAlt,
    FaHistory,
    FaSpinner,
    FaArrowRight,
    FaArrowLeft
} from 'react-icons/fa';
import './EmployeeAttendance.scss';

const EmployeeAttendance = () => {
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [policy, setPolicy] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch today's attendance
    const fetchTodayAttendance = async () => {
        try {
            const response = await axios.get(`${apiUrl}/attendance/today`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setTodayAttendance(response.data.attendance);
            }
        } catch (error) {
            console.error('Error fetching today attendance:', error);
        }
    };

    // Fetch attendance history
    const fetchHistory = async (page = 1) => {
        try {
            const response = await axios.get(`${apiUrl}/attendance/history?page=${page}&limit=10`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setHistory(response.data.attendance);
                setHistoryTotal(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    // Fetch policy
    const fetchPolicy = async () => {
        try {
            const response = await axios.get(`${apiUrl}/policies`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setPolicy(response.data.policy);
            }
        } catch (error) {
            console.error('Error fetching policy:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTodayAttendance(),
                fetchHistory(1),
                fetchPolicy(),
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    // Handle Check In
    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            const response = await axios.post(`${apiUrl}/attendance/checkin`, {}, {
                withCredentials: true,
            });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchTodayAttendance();
                await fetchHistory(historyPage);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-in failed');
        } finally {
            setCheckingIn(false);
        }
    };

    // Handle Check Out
    const handleCheckOut = async () => {
        setCheckingOut(true);
        try {
            const response = await axios.post(`${apiUrl}/attendance/checkout`, {}, {
                withCredentials: true,
            });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchTodayAttendance();
                await fetchHistory(historyPage);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-out failed');
        } finally {
            setCheckingOut(false);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setHistoryPage(newPage);
        fetchHistory(newPage);
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

    // Check if check-in is disabled (already checked out or holiday/weekend)
    const isCheckInDisabled = () => {
        if (!todayAttendance) return false;
        return todayAttendance.checkOutTime !== null;
    };

    // Check if check-out is disabled (not checked in or already checked out)
    const isCheckOutDisabled = () => {
        if (!todayAttendance) return true;
        return !todayAttendance.checkInTime || todayAttendance.checkOutTime !== null;
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
            <div className="attendance-loading">
                <div className="spinner"></div>
                <p>Loading attendance data...</p>
            </div>
        );
    }

    return (
        <div className="employee-attendance">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Page Header */}
            <div className="attendance-header">
                <div className="header-left">
                    <h1>Attendance</h1>
                    <p>Mark your daily attendance and view history</p>
                </div>
                <div className="header-right">
                    <div className="date-display">
                        <FaCalendarAlt />
                        <span>{currentDate}</span>
                    </div>
                </div>
            </div>

            {/* Today's Attendance Card */}
            <div className="today-card">
                <h2>Today's Status</h2>

                <div className="today-status">
                    {todayAttendance ? (
                        <div className="status-section">
                            <div className="status-icon">
                                {todayAttendance.status === 'ON_TIME' && <FaCheckCircle />}
                                {todayAttendance.status === 'LATE' && <FaClock />}
                                {todayAttendance.status === 'HALF_DAY' && <FaClock />}
                                {todayAttendance.status === 'ABSENT' && <FaTimesCircle />}
                            </div>
                            <div className="status-info">
                                <span className={`status-badge ${getStatusBadge(todayAttendance.status)}`}>
                                    {getStatusText(todayAttendance.status)}
                                </span>
                                {todayAttendance.checkInTime && (
                                    <div className="time-info">
                                        <span>Check In: {getTimeDisplay(todayAttendance.checkInTime)}</span>
                                        {todayAttendance.checkOutTime && (
                                            <span>Check Out: {getTimeDisplay(todayAttendance.checkOutTime)}</span>
                                        )}
                                        {todayAttendance.totalHours > 0 && (
                                            <span>Total Hours: {todayAttendance.totalHours} hrs</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="no-status">
                            <FaClock className="no-status-icon" />
                            <p>No attendance record for today</p>
                            <small>Click "Check In" to start your day</small>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <button
                        className="checkin-btn"
                        onClick={handleCheckIn}
                        disabled={checkingIn || isCheckInDisabled()}
                    >
                        {checkingIn ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
                        {checkingIn ? 'Checking In...' : 'Check In'}
                    </button>
                    <button
                        className="checkout-btn"
                        onClick={handleCheckOut}
                        disabled={checkingOut || isCheckOutDisabled()}
                    >
                        {checkingOut ? <FaSpinner className="spinning" /> : <FaArrowRight />}
                        {checkingOut ? 'Checking Out...' : 'Check Out'}
                    </button>
                </div>

                {/* Policy Info */}
                {policy && policy.attendanceRules && (
                    <div className="policy-info">
                        <h4>Attendance Rules</h4>
                        <div className="policy-details">
                            <span>Working Hours: {policy.attendanceRules.workingHoursStart} - {policy.attendanceRules.workingHoursEnd}</span>
                            <span>Grace Period: {policy.attendanceRules.gracePeriodMinutes} min</span>
                            <span>Half Day After: {policy.attendanceRules.halfDayAfterMinutes} min late</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Attendance History Table */}
            <div className="history-card">
                <div className="history-header">
                    <h2>
                        <FaHistory /> Attendance History
                    </h2>
                </div>

                {history.length === 0 ? (
                    <div className="empty-history">
                        <p>No attendance records found.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                        <th>Total Hours</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record, index) => (
                                        <tr key={record._id || index}>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td>{getTimeDisplay(record.checkInTime)}</td>
                                            <td>{getTimeDisplay(record.checkOutTime)}</td>
                                            <td>{record.totalHours || '—'}</td>
                                            <td>
                                                <span className={`status-badge-small ${getStatusBadge(record.status)}`}>
                                                    {getStatusText(record.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {historyTotal > 10 && (
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(historyPage - 1)}
                                    disabled={historyPage === 1}
                                >
                                    <FaArrowLeft /> Previous
                                </button>
                                <span>Page {historyPage} of {Math.ceil(historyTotal / 10)}</span>
                                <button
                                    onClick={() => handlePageChange(historyPage + 1)}
                                    disabled={historyPage === Math.ceil(historyTotal / 10)}
                                >
                                    Next <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EmployeeAttendance;