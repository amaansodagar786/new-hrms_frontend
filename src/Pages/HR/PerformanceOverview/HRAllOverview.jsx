import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaTasks,
    FaStar,
    FaSpinner,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaUserTie,
    FaUsers,
    FaEye,
    FaChevronDown,
    FaChevronUp,
    FaClock,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import './HRAllOverview.scss';

const HRAllOverview = () => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [loading, setLoading] = useState(true);

    // Tasks State
    const [tasks, setTasks] = useState([]);
    const [tasksFilters, setTasksFilters] = useState({ status: '', search: '', createdBy: '' });
    const [expandedTask, setExpandedTask] = useState(null);
    const [tasksPage, setTasksPage] = useState(1);
    const [tasksTotal, setTasksTotal] = useState(0);

    // Performance State
    const [reviews, setReviews] = useState([]);
    const [reviewsFilters, setReviewsFilters] = useState({ year: new Date().getFullYear(), month: '', employeeId: '', role: '' });
    const [expandedReview, setExpandedReview] = useState(null);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsTotal, setReviewsTotal] = useState(0);

    // Employees list for filters
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch all employees
    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${apiUrl}/employee/all-employees`, { withCredentials: true }); if (response.data.success) {
                setEmployees(response.data.users);
                setManagers(response.data.users.filter(u => u.role === 'MANAGER'));
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Fetch all tasks
    const fetchAllTasks = async () => {
        setLoading(true);
        try {
            const { status, search, createdBy } = tasksFilters;
            let url = `${apiUrl}/tasks/all?page=${tasksPage}&limit=20`;
            if (status) url += `&status=${status}`;
            if (createdBy) url += `&createdBy=${createdBy}`;
            const response = await axios.get(url, { withCredentials: true });
            if (response.data.success) {
                let filteredTasks = response.data.tasks;
                if (search) {
                    filteredTasks = filteredTasks.filter(task =>
                        task.title?.toLowerCase().includes(search.toLowerCase()) ||
                        task.createdByName?.toLowerCase().includes(search.toLowerCase()) ||
                        task.assignedTo?.some(emp => emp.employeeName?.toLowerCase().includes(search.toLowerCase()))
                    );
                }
                setTasks(filteredTasks);
                setTasksTotal(response.data.pagination.total);
            }
        } catch (error) {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all performance reviews
    const fetchAllReviews = async () => {
        setLoading(true);
        try {
            const { year, month, employeeId, role } = reviewsFilters;
            let url = `${apiUrl}/performance/all?page=${reviewsPage}&limit=20`;
            if (year) url += `&year=${year}`;
            if (month) url += `&month=${month}`;
            if (employeeId) url += `&employeeId=${employeeId}`;
            const response = await axios.get(url, { withCredentials: true });
            if (response.data.success) {
                let filteredReviews = response.data.reviews;
                if (role) {
                    filteredReviews = filteredReviews.filter(r => r.role === role);
                }
                setReviews(filteredReviews);
                setReviewsTotal(response.data.pagination.total);
            }
        } catch (error) {
            toast.error('Failed to fetch performance reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchAllTasks();
    }, [tasksFilters, tasksPage]);

    useEffect(() => {
        fetchAllReviews();
    }, [reviewsFilters, reviewsPage]);

    const toggleExpandTask = (taskId) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };

    const toggleExpandReview = (reviewId) => {
        setExpandedReview(expandedReview === reviewId ? null : reviewId);
    };

    const getStatusBadge = (status) => {
        if (status === 'COMPLETE') {
            return <span className="task-status status-complete"><FaCheckCircle /> Complete</span>;
        }
        return <span className="task-status status-incomplete"><FaClock /> Incomplete</span>;
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<FaStar key={i} className={i <= rating ? 'star-filled' : 'star-empty'} />);
        }
        return stars;
    };

    const getMonthName = (monthNum) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[parseInt(monthNum) - 1];
    };

    const getSafeMonthFromReview = (reviewMonth) => {
        if (!reviewMonth) return 'Unknown';
        const parts = reviewMonth.split('-');
        if (parts.length !== 2) return 'Unknown';
        const monthNum = parseInt(parts[1]);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return 'Unknown';
        return getMonthName(monthNum);
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'rating-excellent';
        if (rating >= 3.5) return 'rating-good';
        if (rating >= 2.5) return 'rating-average';
        return 'rating-poor';
    };

    const getEmployeeName = (employeeId) => {
        const emp = employees.find(e => e.employeeId === employeeId);
        return emp?.name || employeeId;
    };

    if (loading && tasks.length === 0 && reviews.length === 0) {
        return (
            <div className="hr-overview-loading">
                <div className="spinner"></div>
                <p>Loading data...</p>
            </div>
        );
    }

    return (
        <div className="hr-overview">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Header */}
            <div className="overview-header">
                <h1><FaUsers /> Organization Overview</h1>
                <p>View all tasks and performance reviews across the organization</p>
            </div>

            {/* Tabs */}
            <div className="overview-tabs">
                <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    <FaTasks /> All Tasks ({tasksTotal})
                </button>
                <button className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
                    <FaStar /> All Performance ({reviewsTotal})
                </button>
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="tasks-card">
                    <div className="card-header">
                        <h2><FaTasks /> All Tasks</h2>
                        <div className="filters">
                            <div className="search-box">
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Search by title, manager, employee..."
                                    value={tasksFilters.search}
                                    onChange={(e) => setTasksFilters({ ...tasksFilters, search: e.target.value, page: 1 })}
                                />
                            </div>
                            <div className="filter-group">
                                <FaFilter />
                                <select value={tasksFilters.status} onChange={(e) => setTasksFilters({ ...tasksFilters, status: e.target.value, page: 1 })}>
                                    <option value="">All Status</option>
                                    <option value="INCOMPLETE">Incomplete</option>
                                    <option value="COMPLETE">Complete</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <FaUserTie />
                                <select value={tasksFilters.createdBy} onChange={(e) => setTasksFilters({ ...tasksFilters, createdBy: e.target.value, page: 1 })}>
                                    <option value="">All Managers</option>
                                    {managers.map(m => (
                                        <option key={m.employeeId} value={m.employeeId}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="empty-state">
                            <FaTasks />
                            <p>No tasks found</p>
                        </div>
                    ) : (
                        <div className="tasks-list">
                            {tasks.map((task) => (
                                <div key={task.taskId} className="task-item">
                                    <div className="task-header" onClick={() => toggleExpandTask(task.taskId)}>
                                        <div className="task-info">
                                            <div className="task-title">
                                                <h3>{task.title}</h3>
                                                {getStatusBadge(task.status)}
                                            </div>
                                            <div className="task-meta">
                                                <span><FaUserTie /> Created by: {task.createdByName}</span>
                                                <span><FaCalendarAlt /> Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                                <span><FaUsers /> Assigned: {task.assignedTo?.length || 0} employees</span>
                                            </div>
                                        </div>
                                        <button className="expand-btn">
                                            {expandedTask === task.taskId ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>

                                    {expandedTask === task.taskId && (
                                        <div className="task-details">
                                            {task.description && (
                                                <div className="detail-section">
                                                    <h4>Description</h4>
                                                    <p>{task.description}</p>
                                                </div>
                                            )}
                                            {task.assignedTo && task.assignedTo.length > 0 && (
                                                <div className="detail-section">
                                                    <h4>Assigned Employees</h4>
                                                    <div className="assigned-list">
                                                        {task.assignedTo.map(emp => (
                                                            <div key={emp.employeeId} className="assigned-item">
                                                                <span className="assigned-name">{emp.employeeName}</span>
                                                                <span className="assigned-date">Assigned: {new Date(emp.assignedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {tasksTotal > 20 && (
                        <div className="pagination">
                            <button onClick={() => setTasksPage(p => Math.max(1, p - 1))} disabled={tasksPage === 1}>Previous</button>
                            <span>Page {tasksPage} of {Math.ceil(tasksTotal / 20)}</span>
                            <button onClick={() => setTasksPage(p => p + 1)} disabled={tasksPage === Math.ceil(tasksTotal / 20)}>Next</button>
                        </div>
                    )}
                </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
                <div className="performance-card">
                    <div className="card-header">
                        <h2><FaStar /> All Performance Reviews</h2>
                        <div className="filters">
                            <div className="filter-group">
                                <FaCalendarAlt />
                                <select value={reviewsFilters.year} onChange={(e) => setReviewsFilters({ ...reviewsFilters, year: parseInt(e.target.value), page: 1 })}>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <FaFilter />
                                <select value={reviewsFilters.month} onChange={(e) => setReviewsFilters({ ...reviewsFilters, month: e.target.value, page: 1 })}>
                                    <option value="">All Months</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month}>{getMonthName(month)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <FaUserTie />
                                <select value={reviewsFilters.employeeId} onChange={(e) => setReviewsFilters({ ...reviewsFilters, employeeId: e.target.value, page: 1 })}>
                                    <option value="">All Employees</option>
                                    {employees.map(emp => (
                                        <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="empty-state">
                            <FaStar />
                            <p>No performance reviews found</p>
                        </div>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review, index) => (
                                <div key={review.performanceId || index} className="review-item">
                                    <div className="review-header" onClick={() => toggleExpandReview(review.performanceId || index)}>
                                        <div className="review-info">
                                            <div className="review-employee">
                                                <div className="employee-avatar">
                                                    {review.employeeName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3>{review.employeeName}</h3>
                                                    <span className="review-date">
                                                        {getSafeMonthFromReview(review.reviewMonth)} {review.reviewYear}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`overall-rating ${getRatingColor(review.overallRating)}`}>
                                                <strong>{review.overallRating || 0}</strong>
                                                <span>/5</span>
                                            </div>
                                        </div>
                                        <button className="expand-btn">
                                            {expandedReview === (review.performanceId || index) ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>

                                    {expandedReview === (review.performanceId || index) && (
                                        <div className="review-details">
                                            <div className="ratings-grid">
                                                <div className="rating-item">
                                                    <span>Task Completion</span>
                                                    <div className="rating-stars">{renderStars(review.taskCompletion)}</div>
                                                    <strong>{review.taskCompletion}/5</strong>
                                                </div>
                                                <div className="rating-item">
                                                    <span>Quality of Work</span>
                                                    <div className="rating-stars">{renderStars(review.qualityOfWork)}</div>
                                                    <strong>{review.qualityOfWork}/5</strong>
                                                </div>
                                                <div className="rating-item">
                                                    <span>Deadlines Met</span>
                                                    <div className="rating-stars">{renderStars(review.deadlinesMet)}</div>
                                                    <strong>{review.deadlinesMet}/5</strong>
                                                </div>
                                                <div className="rating-item">
                                                    <span>Behavior & Teamwork</span>
                                                    <div className="rating-stars">{renderStars(review.behaviorTeamwork)}</div>
                                                    <strong>{review.behaviorTeamwork}/5</strong>
                                                </div>
                                            </div>
                                            {review.comments && (
                                                <div className="comments-section">
                                                    <h4>Comments</h4>
                                                    <p>{review.comments}</p>
                                                </div>
                                            )}
                                            <div className="review-meta">
                                                <span><FaUserTie /> Reviewed by: {review.reviewedByName}</span>
                                                <span><FaClock /> Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {reviewsTotal > 20 && (
                        <div className="pagination">
                            <button onClick={() => setReviewsPage(p => Math.max(1, p - 1))} disabled={reviewsPage === 1}>Previous</button>
                            <span>Page {reviewsPage} of {Math.ceil(reviewsTotal / 20)}</span>
                            <button onClick={() => setReviewsPage(p => p + 1)} disabled={reviewsPage === Math.ceil(reviewsTotal / 20)}>Next</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HRAllOverview;