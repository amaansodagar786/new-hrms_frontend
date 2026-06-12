import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaTasks, 
  FaStar, 
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaUserTie,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaEye
} from 'react-icons/fa';
import './EmployeePerformance.scss';

const EmployeePerformance = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [expandedReview, setExpandedReview] = useState(null);
  const [taskFilters, setTaskFilters] = useState({ status: '' });
  const [reviewFilters, setReviewFilters] = useState({ year: new Date().getFullYear(), month: '' });
  const [summary, setSummary] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch tasks assigned to me
  const fetchMyTasks = async () => {
    try {
      const { status } = taskFilters;
      let url = `${apiUrl}/tasks/assigned-to-me?limit=50`;
      if (status) url += `&status=${status}`;
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  // Fetch my performance reviews
  const fetchMyReviews = async () => {
    try {
      const { year, month } = reviewFilters;
      let url = `${apiUrl}/performance/my-reviews?limit=50`;
      if (year) url += `&year=${year}`;
      if (month) url += `&month=${month}`;
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch performance reviews');
    }
  };

  // Fetch performance summary
  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${apiUrl}/performance/summary`, {
        withCredentials: true,
        params: { year: new Date().getFullYear() }
      });
      if (response.data.success) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMyTasks(),
        fetchMyReviews(),
        fetchSummary()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchMyTasks();
  }, [taskFilters]);

  useEffect(() => {
    fetchMyReviews();
  }, [reviewFilters]);

  // Toggle expand task
  const toggleExpandTask = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  // Toggle expand review
  const toggleExpandReview = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'COMPLETE') {
      return <span className="task-status status-complete"><FaCheckCircle /> Complete</span>;
    }
    return <span className="task-status status-incomplete"><FaClock /> Incomplete</span>;
  };

  // Get month name
  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNum) - 1];
  };

  // Get rating star display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? 'star-filled' : 'star-empty'} 
        />
      );
    }
    return stars;
  };

  // Get rating color class
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'rating-excellent';
    if (rating >= 3.5) return 'rating-good';
    if (rating >= 2.5) return 'rating-average';
    return 'rating-poor';
  };

  if (loading && tasks.length === 0 && reviews.length === 0) {
    return (
      <div className="employee-performance-loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="employee-performance">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Header */}
      <div className="performance-header">
        <h1>My Performance Center</h1>
        <p>Track your tasks and view your performance reviews</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon"><FaTasks /></div>
            <div className="summary-info">
              <h3>Total Tasks</h3>
              <p>{tasks.length}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon"><FaCheckCircle /></div>
            <div className="summary-info">
              <h3>Completed Tasks</h3>
              <p>{tasks.filter(t => t.status === 'COMPLETE').length}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon"><FaStar /></div>
            <div className="summary-info">
              <h3>Overall Rating</h3>
              <p className={getRatingColor(summary.averageOverallRating)}>
                {summary.averageOverallRating}/5
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon"><FaChartLine /></div>
            <div className="summary-info">
              <h3>Reviews Received</h3>
              <p>{summary.totalReviews}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="performance-tabs">
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FaTasks /> My Tasks ({tasks.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <FaStar /> My Performance ({reviews.length})
        </button>
      </div>

      {/* My Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="tasks-card">
          <div className="card-header">
            <h2><FaTasks /> Tasks Assigned to Me</h2>
            <div className="filter-group">
              <select 
                value={taskFilters.status}
                onChange={(e) => setTaskFilters({...taskFilters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="INCOMPLETE">Incomplete</option>
                <option value="COMPLETE">Complete</option>
              </select>
            </div>
          </div>
          
          {tasks.length === 0 ? (
            <div className="empty-state">
              <FaTasks />
              <p>No tasks assigned to you</p>
              <small>Tasks assigned by your manager will appear here</small>
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
                        <span><FaCalendarAlt /> Assigned: {new Date(task.createdAt).toLocaleDateString()}</span>
                        {task.deadline && <span><FaClock /> Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button className="expand-btn">
                      {expandedTask === task.taskId ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                  
                  {expandedTask === task.taskId && (
                    <div className="task-details">
                      <div className="detail-section">
                        <h4>Description</h4>
                        <p>{task.description || 'No description provided'}</p>
                      </div>
                      
                      {task.notes && (
                        <div className="detail-section">
                          <h4>Additional Notes</h4>
                          <p>{task.notes}</p>
                        </div>
                      )}
                      
                      <div className="detail-section">
                        <h4>Assigned By</h4>
                        <p>{task.createdByName}</p>
                      </div>
                      
                      {task.completedAt && (
                        <div className="detail-section">
                          <h4>Completed On</h4>
                          <p>{new Date(task.completedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Performance Tab */}
      {activeTab === 'performance' && (
        <div className="performance-card">
          <div className="card-header">
            <h2><FaStar /> My Performance Reviews</h2>
            <div className="filters">
              <select 
                value={reviewFilters.year}
                onChange={(e) => setReviewFilters({...reviewFilters, year: parseInt(e.target.value)})}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select 
                value={reviewFilters.month}
                onChange={(e) => setReviewFilters({...reviewFilters, month: e.target.value})}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{getMonthName(month)}</option>
                ))}
              </select>
            </div>
          </div>
          
          {reviews.length === 0 ? (
            <div className="empty-state">
              <FaStar />
              <p>No performance reviews found</p>
              <small>Your manager will add performance reviews here</small>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.performanceId} className="review-item">
                  <div className="review-header" onClick={() => toggleExpandReview(review.performanceId)}>
                    <div className="review-info">
                      <div className="review-date-badge">
                        <span className="month">{getMonthName(review.reviewMonth.split('-')[1])}</span>
                        <span className="year">{review.reviewYear}</span>
                      </div>
                      <div className={`review-rating ${getRatingColor(review.overallRating)}`}>
                        <strong>{review.overallRating}</strong>
                        <span>/5</span>
                      </div>
                    </div>
                    <button className="expand-btn">
                      {expandedReview === review.performanceId ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                  
                  {expandedReview === review.performanceId && (
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
                          <h4>Manager's Comments</h4>
                          <p>{review.comments}</p>
                        </div>
                      )}
                      
                      <div className="review-meta">
                        <span><FaUserTie /> Reviewed by: {review.reviewedByName}</span>
                        <span><FaCalendarAlt /> Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</span>
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

export default EmployeePerformance;