import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaPlus,
    FaTasks,
    FaUserCheck,
    FaCalendarAlt,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaUserPlus,
    FaSearch,
    FaFilter,
    FaClock,
    FaTrash,
    FaUsers,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import './ManagerTasks.scss';

const ManagerTasks = () => {
    const [activeTab, setActiveTab] = useState('create');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [filters, setFilters] = useState({ status: '', search: '' });
    const [expandedTask, setExpandedTask] = useState(null);

    // Task Form State
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        deadline: '',
        notes: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch manager's employees (team)
    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${apiUrl}/employee/team`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setEmployees(response.data.employees);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Fetch tasks created by manager
    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { status, search } = filters;
            let url = `${apiUrl}/tasks/created-by-me?limit=50`;
            if (status) url += `&status=${status}`;
            const response = await axios.get(url, { withCredentials: true });
            if (response.data.success) {
                let filteredTasks = response.data.tasks;
                if (search) {
                    filteredTasks = filteredTasks.filter(task =>
                        task.title.toLowerCase().includes(search.toLowerCase()) ||
                        task.description?.toLowerCase().includes(search.toLowerCase())
                    );
                }
                setTasks(filteredTasks);
            }
        } catch (error) {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchTasks();
    }, []);

    // Handle create task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!taskForm.title.trim()) {
            toast.error('Task title is required');
            return;
        }

        setCreating(true);
        try {
            const response = await axios.post(`${apiUrl}/tasks/create`, {
                title: taskForm.title,
                description: taskForm.description,
                deadline: taskForm.deadline || null,
                notes: taskForm.notes,
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success('Task created successfully');
                setTaskForm({ title: '', description: '', deadline: '', notes: '' });
                fetchTasks();
                setActiveTab('list');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    // Open assign modal
    const openAssignModal = (task) => {
        setSelectedTask(task);
        setSelectedEmployees(task.assignedTo?.map(a => a.employeeId) || []);
        setShowAssignModal(true);
    };

    // Handle assign task
    const handleAssignTask = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        setAssigning(true);
        try {
            const response = await axios.put(`${apiUrl}/tasks/${selectedTask.taskId}/assign`, {
                employeeIds: selectedEmployees,
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success(response.data.message);
                setShowAssignModal(false);
                fetchTasks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign task');
        } finally {
            setAssigning(false);
        }
    };

    // Handle mark complete
    const handleMarkComplete = async (taskId) => {
        try {
            const response = await axios.put(`${apiUrl}/tasks/${taskId}/complete`, {}, {
                withCredentials: true,
            });
            if (response.data.success) {
                toast.success('Task marked as complete');
                fetchTasks();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark task as complete');
        }
    };

    // Toggle employee selection
    const toggleEmployeeSelection = (employeeId) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    // Toggle expand task
    const toggleExpandTask = (taskId) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        if (status === 'COMPLETE') {
            return <span className="status-badge status-complete"><FaCheckCircle /> Complete</span>;
        }
        return <span className="status-badge status-incomplete"><FaClock /> Incomplete</span>;
    };

    if (loading && tasks.length === 0) {
        return (
            <div className="manager-tasks-loading">
                <div className="spinner"></div>
                <p>Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="manager-tasks">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Header */}
            <div className="tasks-header">
                <h1><FaTasks /> Task Management</h1>
                <p>Create, assign, and manage tasks for your team</p>
            </div>

            {/* Tabs */}
            <div className="tasks-tabs">
                <button
                    className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    <FaPlus /> Create Task
                </button>
                <button
                    className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <FaTasks /> My Tasks ({tasks.length})
                </button>
            </div>

            {/* Create Task Tab */}
            {activeTab === 'create' && (
                <div className="create-task-card">
                    <h2>Create New Task</h2>

                    <form onSubmit={handleCreateTask} className="create-task-form">
                        <div className="form-group">
                            <label>Task Title *</label>
                            <input
                                type="text"
                                value={taskForm.title}
                                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={taskForm.description}
                                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                placeholder="Describe the task in detail..."
                                rows="4"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label><FaCalendarAlt /> Deadline (Optional)</label>
                                <input
                                    type="date"
                                    value={taskForm.deadline}
                                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Additional Notes</label>
                            <textarea
                                value={taskForm.notes}
                                onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                                placeholder="Any additional notes..."
                                rows="2"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="reset-btn" onClick={() => setTaskForm({ title: '', description: '', deadline: '', notes: '' })}>
                                Reset
                            </button>
                            <button type="submit" className="submit-btn" disabled={creating}>
                                {creating ? <FaSpinner className="spinning" /> : <FaPlus />}
                                {creating ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* My Tasks Tab */}
            {activeTab === 'list' && (
                <div className="tasks-list-card">
                    <div className="card-header">
                        <h2><FaTasks /> My Created Tasks</h2>
                        <div className="filters">
                            <div className="search-box">
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div className="filter-group">
                                <FaFilter />
                                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                                    <option value="">All Status</option>
                                    <option value="INCOMPLETE">Incomplete</option>
                                    <option value="COMPLETE">Complete</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="empty-state">
                            <FaTasks />
                            <p>No tasks created yet</p>
                            <small>Click "Create Task" to create your first task</small>
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
                                                <span><FaCalendarAlt /> Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                                {task.deadline && <span><FaClock /> Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                                                <span><FaUsers /> Assigned: {task.assignedTo?.length || 0} employees</span>
                                            </div>
                                        </div>
                                        <div className="task-actions">
                                            {task.status !== 'COMPLETE' && (
                                                <button
                                                    className="complete-btn"
                                                    onClick={(e) => { e.stopPropagation(); handleMarkComplete(task.taskId); }}
                                                    title="Mark Complete"
                                                >
                                                    <FaCheckCircle /> Complete
                                                </button>
                                            )}
                                            <button
                                                className="assign-btn"
                                                onClick={(e) => { e.stopPropagation(); openAssignModal(task); }}
                                                title="Assign to Employees"
                                            >
                                                <FaUserPlus /> Assign
                                            </button>
                                            <button className="expand-btn">
                                                {expandedTask === task.taskId ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedTask === task.taskId && (
                                        <div className="task-details">
                                            {task.description && (
                                                <div className="detail-section">
                                                    <h4>Description</h4>
                                                    <p>{task.description}</p>
                                                </div>
                                            )}

                                            {task.notes && (
                                                <div className="detail-section">
                                                    <h4>Notes</h4>
                                                    <p>{task.notes}</p>
                                                </div>
                                            )}

                                            {task.assignedTo && task.assignedTo.length > 0 && (
                                                <div className="detail-section">
                                                    <h4>Assigned Employees ({task.assignedTo.length})</h4>
                                                    <div className="assigned-employees">
                                                        {task.assignedTo.map((emp) => (
                                                            <div key={emp.employeeId} className="assigned-employee">
                                                                <div className="employee-avatar">
                                                                    {emp.employeeName?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="employee-info">
                                                                    <span className="employee-name">{emp.employeeName}</span>
                                                                    <span className="assigned-date">Assigned: {new Date(emp.assignedAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {task.completedAt && (
                                                <div className="detail-section">
                                                    <h4>Completion Info</h4>
                                                    <p>Completed on: {new Date(task.completedAt).toLocaleDateString()}</p>
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

            {/* Assign Task Modal */}
            {showAssignModal && selectedTask && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><FaUserPlus /> Assign Task: {selectedTask.title}</h3>
                            <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                                <FaTimesCircle />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-subtitle">Select employees to assign this task:</p>

                            {employees.length === 0 ? (
                                <div className="no-employees">
                                    <p>No employees found in your team.</p>
                                    <small>Please contact HR to assign employees to your team.</small>
                                </div>
                            ) : (
                                <div className="employees-list">
                                    {employees.map((emp) => (
                                        <label key={emp.employeeId} className="employee-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.includes(emp.employeeId)}
                                                onChange={() => toggleEmployeeSelection(emp.employeeId)}
                                            />
                                            <div className="employee-avatar">
                                                {emp.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="employee-info">
                                                <span className="employee-name">{emp.name}</span>
                                                <span className="employee-id">{emp.employeeId}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowAssignModal(false)}>
                                Cancel
                            </button>
                            <button className="assign-submit-btn" onClick={handleAssignTask} disabled={assigning}>
                                {assigning ? <FaSpinner className="spinning" /> : <FaUserPlus />}
                                {assigning ? 'Assigning...' : 'Assign Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerTasks;