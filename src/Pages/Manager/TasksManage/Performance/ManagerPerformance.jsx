import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaStar,
    FaPlus,
    FaUsers,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaChartLine,
    FaEye,
    FaChevronDown,
    FaChevronUp,
    FaUserTie,
    FaBriefcase,
    FaClock
} from 'react-icons/fa';
import './ManagerPerformance.scss';

const ManagerPerformance = () => {
    const [activeTab, setActiveTab] = useState('add');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [expandedReview, setExpandedReview] = useState(null);
    const [filters, setFilters] = useState({ year: new Date().getFullYear(), month: '', employeeId: '' });
    const [existingReview, setExistingReview] = useState(null);

    const [performanceForm, setPerformanceForm] = useState({
        employeeId: '',
        employeeName: '',
        reviewMonth: new Date().getMonth() + 1,
        reviewYear: new Date().getFullYear(),
        taskCompletion: 3,
        qualityOfWork: 3,
        deadlinesMet: 3,
        behaviorTeamwork: 3,
        comments: '',
        relatedTasks: []
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${apiUrl}/employee/team`, { withCredentials: true });
            if (response.data.success) setEmployees(response.data.employees);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to fetch team members');
        }
    };

    const fetchTeamReviews = async () => {
        setLoading(true);
        try {
            const { year, month, employeeId } = filters;
            let url = `${apiUrl}/performance/team-reviews?limit=50`;
            if (year) url += `&year=${year}`;
            if (month) url += `&month=${month}`;
            const response = await axios.get(url, { withCredentials: true });

            // console.log("API Response:", response.data);
            // console.log("Reviews array:", response.data.reviews);
            // console.log("First review:", response.data.reviews[0]);

            if (response.data.success) {
                let filteredReviews = response.data.reviews;
                if (employeeId) {
                    filteredReviews = filteredReviews.filter(r => r.employeeId === employeeId);
                }
                setReviews(filteredReviews);
            }
        } catch (error) {
            toast.error('Failed to fetch performance reviews');
        } finally {
            setLoading(false);
        }
    };

    const checkExistingReview = async () => {
        if (!performanceForm.employeeId || !performanceForm.reviewMonth || !performanceForm.reviewYear) {
            setExistingReview(null);
            return;
        }
        try {
            const response = await axios.get(`${apiUrl}/performance/team-reviews`, {
                withCredentials: true,
                params: { year: performanceForm.reviewYear, month: performanceForm.reviewMonth }
            });
            if (response.data.success) {
                const existing = response.data.reviews.find(r => r.employeeId === performanceForm.employeeId);
                setExistingReview(existing);
                if (existing) toast.warning(`Performance review already exists`);
            }
        } catch (error) { console.error('Error:', error); }
    };

    useEffect(() => { fetchEmployees(); fetchTeamReviews(); }, []);
    useEffect(() => { fetchTeamReviews(); }, [filters]);
    useEffect(() => { checkExistingReview(); }, [performanceForm.employeeId, performanceForm.reviewMonth, performanceForm.reviewYear]);

    const handleEmployeeSelect = (employeeId) => {
        const employee = employees.find(emp => emp.employeeId === employeeId);
        setPerformanceForm({ ...performanceForm, employeeId, employeeName: employee?.name || '' });
    };

    const handleRatingChange = (field, value) => {
        setPerformanceForm({ ...performanceForm, [field]: parseInt(value) });
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!performanceForm.employeeId) { toast.error('Please select an employee'); return; }
        if (existingReview) { toast.error('Performance review already exists for this month'); return; }
        setSubmitting(true);
        try {
            const response = await axios.post(`${apiUrl}/performance/add`, {
                employeeId: performanceForm.employeeId,
                employeeName: performanceForm.employeeName,
                reviewMonth: performanceForm.reviewMonth,
                reviewYear: performanceForm.reviewYear,
                taskCompletion: performanceForm.taskCompletion,
                qualityOfWork: performanceForm.qualityOfWork,
                deadlinesMet: performanceForm.deadlinesMet,
                behaviorTeamwork: performanceForm.behaviorTeamwork,
                comments: performanceForm.comments,
                relatedTasks: performanceForm.relatedTasks
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success('Performance review added successfully');
                setPerformanceForm({
                    employeeId: '', employeeName: '', reviewMonth: new Date().getMonth() + 1,
                    reviewYear: new Date().getFullYear(), taskCompletion: 3, qualityOfWork: 3,
                    deadlinesMet: 3, behaviorTeamwork: 3, comments: '', relatedTasks: []
                });
                fetchTeamReviews();
                setActiveTab('list');
            }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to add performance review'); }
        finally { setSubmitting(false); }
    };

    const toggleExpandReview = (reviewId) => {
        setExpandedReview(expandedReview === reviewId ? null : reviewId);
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

    // Safe function to extract month from reviewMonth
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

    // Get unique key for each review
    const getReviewKey = (review, index) => {
        return review.performanceId || review._id || `review-${index}`;
    };

    if (loading && reviews.length === 0 && activeTab === 'list') {
        return (
            <div className="manager-performance-loading">
                <div className="spinner"></div>
                <p>Loading performance data...</p>
            </div>
        );
    }

    return (
        <div className="manager-performance">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="performance-header">
                <h1><FaStar /> Performance Management</h1>
                <p>Add performance reviews and track your team's progress</p>
            </div>

            <div className="performance-tabs">
                <button className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}><FaPlus /> Add Review</button>
                <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}><FaUsers /> Team Reviews ({reviews.length})</button>
            </div>

            {activeTab === 'add' && (
                <div className="add-review-card">
                    <h2>Add Performance Review</h2>
                    <form onSubmit={handleSubmitReview} className="add-review-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Select Employee *</label>
                                <select value={performanceForm.employeeId} onChange={(e) => handleEmployeeSelect(e.target.value)} required>
                                    <option value="">Select an employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.employeeId})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Review Month *</label>
                                <select value={performanceForm.reviewMonth} onChange={(e) => setPerformanceForm({ ...performanceForm, reviewMonth: parseInt(e.target.value) })} required>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month}>{getMonthName(month)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Review Year *</label>
                                <select value={performanceForm.reviewYear} onChange={(e) => setPerformanceForm({ ...performanceForm, reviewYear: parseInt(e.target.value) })} required>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {existingReview && (
                            <div className="warning-box">
                                <FaTimesCircle />
                                <span>Performance review already exists for {getMonthName(performanceForm.reviewMonth)} {performanceForm.reviewYear}!</span>
                            </div>
                        )}
                        <div className="ratings-section">
                            <h3>Ratings (1-5 Scale)</h3>
                            <div className="rating-group"><label>Task Completion</label><div className="rating-input"><input type="range" min="1" max="5" step="1" value={performanceForm.taskCompletion} onChange={(e) => handleRatingChange('taskCompletion', e.target.value)} /><div className="rating-value">{renderStars(performanceForm.taskCompletion)}<span>{performanceForm.taskCompletion}/5</span></div></div></div>
                            <div className="rating-group"><label>Quality of Work</label><div className="rating-input"><input type="range" min="1" max="5" step="1" value={performanceForm.qualityOfWork} onChange={(e) => handleRatingChange('qualityOfWork', e.target.value)} /><div className="rating-value">{renderStars(performanceForm.qualityOfWork)}<span>{performanceForm.qualityOfWork}/5</span></div></div></div>
                            <div className="rating-group"><label>Deadlines Met</label><div className="rating-input"><input type="range" min="1" max="5" step="1" value={performanceForm.deadlinesMet} onChange={(e) => handleRatingChange('deadlinesMet', e.target.value)} /><div className="rating-value">{renderStars(performanceForm.deadlinesMet)}<span>{performanceForm.deadlinesMet}/5</span></div></div></div>
                            <div className="rating-group"><label>Behavior & Teamwork</label><div className="rating-input"><input type="range" min="1" max="5" step="1" value={performanceForm.behaviorTeamwork} onChange={(e) => handleRatingChange('behaviorTeamwork', e.target.value)} /><div className="rating-value">{renderStars(performanceForm.behaviorTeamwork)}<span>{performanceForm.behaviorTeamwork}/5</span></div></div></div>
                        </div>
                        <div className="form-group"><label>Comments / Feedback</label><textarea value={performanceForm.comments} onChange={(e) => setPerformanceForm({ ...performanceForm, comments: e.target.value })} placeholder="Provide additional feedback..." rows="4" /></div>
                        <div className="form-actions">
                            <button type="button" className="reset-btn" onClick={() => setPerformanceForm({ employeeId: '', employeeName: '', reviewMonth: new Date().getMonth() + 1, reviewYear: new Date().getFullYear(), taskCompletion: 3, qualityOfWork: 3, deadlinesMet: 3, behaviorTeamwork: 3, comments: '', relatedTasks: [] })}>Reset</button>
                            <button type="submit" className="submit-btn" disabled={submitting || existingReview}>{submitting ? <FaSpinner className="spinning" /> : <FaStar />}{submitting ? 'Adding...' : 'Add Performance Review'}</button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="reviews-list-card">
                    <div className="card-header">
                        <h2><FaUsers /> Team Performance Reviews</h2>
                        <div className="filters">
                            <div className="filter-group"><FaCalendarAlt /><select value={filters.year} onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}>{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (<option key={year} value={year}>{year}</option>))}</select></div>
                            <div className="filter-group"><FaFilter /><select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}><option value="">All Months</option>{Array.from({ length: 12 }, (_, i) => i + 1).map(month => (<option key={month} value={month}>{getMonthName(month)}</option>))}</select></div>
                            <div className="filter-group"><FaUserTie /><select value={filters.employeeId} onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}><option value="">All Employees</option>{employees.map(emp => (<option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>))}</select></div>
                        </div>
                    </div>
                    {reviews.length === 0 ? (
                        <div className="empty-state">
                            <FaStar />
                            <p>No performance reviews found</p>
                            <small>Click "Add Review" to create your first performance review</small>
                        </div>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review, index) => (
                                <div key={getReviewKey(review, index)} className="review-item">
                                    <div className="review-header" onClick={() => toggleExpandReview(review.performanceId || review._id || index)}>
                                        <div className="review-info">
                                            <div className="review-employee">
                                                <div className="employee-avatar">
                                                    {review.employeeName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3>{review.employeeName}</h3>
                                                    <span className="review-date">
                                                        {getSafeMonthFromReview(review.reviewMonth)} {review.reviewYear || ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`overall-rating ${getRatingColor(review.overallRating)}`}>
                                                <strong>{review.overallRating}</strong>
                                                <span>/5</span>
                                            </div>
                                        </div>
                                        <button className="expand-btn">
                                            {expandedReview === (review.performanceId || review._id || index) ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>

                                    {expandedReview === (review.performanceId || review._id || index) && (
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
                </div>
            )}
        </div>
    );
};

export default ManagerPerformance;