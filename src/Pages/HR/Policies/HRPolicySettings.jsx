import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaClock, FaCalendarAlt, FaPlus, FaEdit, FaTrash,
    FaTimes, FaSave, FaExclamationTriangle, FaRegCalendarAlt,
    FaBriefcase, FaUserTie, FaUsers, FaShieldAlt, FaEye
} from 'react-icons/fa';
import './HRPolicySettings.scss';

const HRPolicySettings = () => {
    const [loading, setLoading] = useState(true);
    const [policy, setPolicy] = useState(null);
    const [activeTab, setActiveTab] = useState('attendance');

    const [attendanceRules, setAttendanceRules] = useState({
        workingHoursStart: '09:00', workingHoursEnd: '18:00',
        gracePeriodMinutes: 15, halfDayAfterMinutes: 60,
        halfDayEndTime: '12:00', breakStart: '13:00',
        breakEnd: '14:00', weeklyOffDays: [0], saturdayRule: 'half_day'
    });

    const [holidays, setHolidays] = useState([]);
    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [holidayForm, setHolidayForm] = useState({
        name: '', type: 'public', date: '',
        startDate: '', endDate: '', isRange: false, description: ''
    });

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [leaveForm, setLeaveForm] = useState({
        name: '', code: '', description: '', yearlyLimit: '',
        minDaysToApply: 1, maxDaysAtOnce: 5,
        applicableRoles: ['HR', 'MANAGER', 'EMPLOYEE']
    });

    const [confirmModal, setConfirmModal] = useState({
        show: false, title: '', message: '', onConfirm: null
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchPolicy = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/policies`, { withCredentials: true });
            if (response.data.success) {
                setPolicy(response.data.policy);
                setAttendanceRules(response.data.policy.attendanceRules || attendanceRules);
                setHolidays(response.data.policy.holidays || []);
                setLeaveTypes(response.data.policy.leaveTypes || []);
            }
        } catch { toast.error('Failed to fetch policy data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPolicy(); }, []);

    // Attendance Rules are VIEW ONLY for HR - no update function
    // const handleUpdateAttendanceRules is NOT created for HR

    const handleAddHoliday = () => {
        setEditingHoliday(null);
        setHolidayForm({ name: '', type: 'public', date: '', startDate: '', endDate: '', isRange: false, description: '' });
        setShowHolidayModal(true);
    };

    const handleEditHoliday = (holiday) => {
        setEditingHoliday(holiday);
        setHolidayForm({
            name: holiday.name, type: holiday.type,
            date: holiday.date ? holiday.date.split('T')[0] : '',
            startDate: holiday.startDate ? holiday.startDate.split('T')[0] : '',
            endDate: holiday.endDate ? holiday.endDate.split('T')[0] : '',
            isRange: holiday.isRange || false, description: holiday.description || ''
        });
        setShowHolidayModal(true);
    };

    const handleSaveHoliday = async () => {
        try {
            if (editingHoliday) {
                const res = await axios.put(`${apiUrl}/policies/holidays/${editingHoliday._id}`, holidayForm, { withCredentials: true });
                if (res.data.success) { toast.success('Holiday updated successfully'); fetchPolicy(); setShowHolidayModal(false); }
            } else {
                const res = await axios.post(`${apiUrl}/policies/holidays`, holidayForm, { withCredentials: true });
                if (res.data.success) { toast.success('Holiday added successfully'); fetchPolicy(); setShowHolidayModal(false); }
            }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to save holiday'); }
    };

    const handleDeleteHoliday = (holiday) => {
        setConfirmModal({
            show: true, title: 'Delete Holiday',
            message: `Are you sure you want to delete "${holiday.name}"?`,
            onConfirm: async () => {
                try {
                    const res = await axios.delete(`${apiUrl}/policies/holidays/${holiday._id}`, { withCredentials: true });
                    if (res.data.success) { toast.success('Holiday deleted'); fetchPolicy(); setConfirmModal({ show: false, title: '', message: '', onConfirm: null }); }
                } catch (error) { toast.error(error.response?.data?.message || 'Failed to delete holiday'); }
            }
        });
    };

    const handleAddLeaveType = () => {
        setEditingLeave(null);
        setLeaveForm({ name: '', code: '', description: '', yearlyLimit: '', minDaysToApply: 1, maxDaysAtOnce: 5, applicableRoles: ['HR', 'MANAGER', 'EMPLOYEE'] });
        setShowLeaveModal(true);
    };

    const handleEditLeaveType = (leave) => {
        setEditingLeave(leave);
        setLeaveForm({
            name: leave.name, code: leave.code, description: leave.description || '',
            yearlyLimit: leave.yearlyLimit, minDaysToApply: leave.minDaysToApply || 1,
            maxDaysAtOnce: leave.maxDaysAtOnce || 5,
            applicableRoles: leave.applicableRoles || ['HR', 'MANAGER', 'EMPLOYEE']
        });
        setShowLeaveModal(true);
    };

    const handleSaveLeaveType = async () => {
        try {
            if (editingLeave) {
                const res = await axios.put(`${apiUrl}/policies/leave-types/${editingLeave.code}`, leaveForm, { withCredentials: true });
                if (res.data.success) { toast.success('Leave type updated'); fetchPolicy(); setShowLeaveModal(false); }
            } else {
                const res = await axios.post(`${apiUrl}/policies/leave-types`, leaveForm, { withCredentials: true });
                if (res.data.success) { toast.success('Leave type added'); fetchPolicy(); setShowLeaveModal(false); }
            }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to save leave type'); }
    };

    const handleDeleteLeaveType = (leave) => {
        setConfirmModal({
            show: true, title: 'Delete Leave Type',
            message: `Are you sure you want to delete "${leave.name}" (${leave.code})?`,
            onConfirm: async () => {
                try {
                    const res = await axios.delete(`${apiUrl}/policies/leave-types/${leave.code}`, { withCredentials: true });
                    if (res.data.success) { toast.success('Leave type disabled'); fetchPolicy(); setConfirmModal({ show: false, title: '', message: '', onConfirm: null }); }
                } catch (error) { toast.error(error.response?.data?.message || 'Failed to delete leave type'); }
            }
        });
    };

    const toggleRole = (role) => {
        setLeaveForm({
            ...leaveForm,
            applicableRoles: leaveForm.applicableRoles.includes(role)
                ? leaveForm.applicableRoles.filter(r => r !== role)
                : [...leaveForm.applicableRoles, role]
        });
    };

    const getRoleBadge = (roles) => {
        const roleNames = { HR: 'HR', MANAGER: 'Manager', EMPLOYEE: 'Employee' };
        return roles.map(r => roleNames[r]).join(', ');
    };

    const getSaturdayRuleText = (rule) => {
        const rules = { full_day: 'Full Day', half_day: 'Half Day', alternate_half_day: 'Alternate Half Day', off: 'Off' };
        return rules[rule] || rule;
    };

    const tabs = [
        { key: 'attendance', label: 'Attendance Rules', icon: <FaClock />, viewOnly: true },
        { key: 'holidays', label: 'Holidays', icon: <FaCalendarAlt />, viewOnly: false },
        { key: 'leavetypes', label: 'Leave Types', icon: <FaBriefcase />, viewOnly: false },
    ];

    const holidayTypeConfig = {
        public: { label: 'Public', cls: 'hps-badge--public' },
        festival: { label: 'Festival', cls: 'hps-badge--festival' },
        company_event: { label: 'Company Event', cls: 'hps-badge--company' },
        optional: { label: 'Optional', cls: 'hps-badge--optional' },
    };

    if (loading) return (
        <div className="hps-loading">
            <div className="hps-spinner" />
            <p>Loading policy settings...</p>
        </div>
    );

    return (
        <div className="hps-container">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Page Header */}
            <div className="hps-page-header">
                <div className="hps-page-header__left">
                    <span className="hps-page-header__badge">
                        <FaShieldAlt /> HR - Policies
                    </span>
                    <h1>Policy Settings</h1>
                    <p>View company policies, manage holidays and leave types</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="hps-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`hps-tab ${activeTab === tab.key ? 'hps-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.viewOnly && <span className="hps-viewonly-badge"><FaEye /> View Only</span>}
                    </button>
                ))}
            </div>

            {/* ── ATTENDANCE TAB (VIEW ONLY) ──────────────────────── */}
            {activeTab === 'attendance' && (
                <div className="hps-card">
                    <div className="hps-card__header">
                        <div className="hps-card__title-wrap">
                            <div className="hps-card__icon"><FaClock /></div>
                            <div>
                                <h3>Working Hours & Attendance Rules</h3>
                                <p>View-only — Contact Admin for changes</p>
                            </div>
                        </div>
                        <div className="hps-viewonly-tag">
                            <FaEye /> View Only Mode
                        </div>
                    </div>

                    <div className="hps-form-grid">
                        <div className="hps-field hps-field--readonly">
                            <label>Working Hours Start</label>
                            <input type="time" value={attendanceRules.workingHoursStart} readOnly disabled />
                        </div>
                        <div className="hps-field hps-field--readonly">
                            <label>Working Hours End</label>
                            <input type="time" value={attendanceRules.workingHoursEnd} readOnly disabled />
                        </div>
                        <div className="hps-field hps-field--readonly">
                            <label>Break Start</label>
                            <input type="time" value={attendanceRules.breakStart} readOnly disabled />
                        </div>
                        <div className="hps-field hps-field--readonly">
                            <label>Break End</label>
                            <input type="time" value={attendanceRules.breakEnd} readOnly disabled />
                        </div>
                        <div className="hps-field hps-field--readonly">
                            <label>Grace Period <span>(minutes)</span></label>
                            <input type="number" value={attendanceRules.gracePeriodMinutes} readOnly disabled />
                            <small>After this, mark as Late</small>
                        </div>
                        <div className="hps-field hps-field--readonly">
                            <label>Half Day After <span>(minutes)</span></label>
                            <input type="number" value={attendanceRules.halfDayAfterMinutes} readOnly disabled />
                            <small>After this, mark as Half Day</small>
                        </div>
                        <div className="hps-field hps-field--readonly">
                            <label>Half Day Cutoff Time</label>
                            <input type="time" value={attendanceRules.halfDayEndTime} readOnly disabled />
                            <small>After this time, check-in = Absent</small>
                        </div>
                        <div className="hps-field hps-field--readonly">
                            <label>Saturday Rule</label>
                            <select value={attendanceRules.saturdayRule} disabled>
                                <option value="full_day">Full Day</option>
                                <option value="half_day">Half Day</option>
                                <option value="alternate_half_day">Alternate Half Day</option>
                                <option value="off">Off</option>
                            </select>
                            <small>Current: {getSaturdayRuleText(attendanceRules.saturdayRule)}</small>
                        </div>
                    </div>

                    <div className="hps-card__footer">
                        <div className="hps-note">
                            <FaExclamationTriangle /> Attendance rules can only be modified by Admin.
                        </div>
                    </div>
                </div>
            )}

            {/* ── HOLIDAYS TAB (FULL CONTROL) ────────────────────── */}
            {activeTab === 'holidays' && (
                <div className="hps-card">
                    <div className="hps-card__header">
                        <div className="hps-card__title-wrap">
                            <div className="hps-card__icon hps-card__icon--green"><FaCalendarAlt /></div>
                            <div>
                                <h3>Holidays & Company Events</h3>
                                <p>Configure public holidays, festivals and company events</p>
                            </div>
                        </div>
                        <button onClick={handleAddHoliday} className="hps-btn hps-btn--primary">
                            <FaPlus /> Add Holiday
                        </button>
                    </div>

                    {holidays.length === 0 ? (
                        <div className="hps-empty">
                            <div className="hps-empty__icon"><FaRegCalendarAlt /></div>
                            <p>No holidays added yet.</p>
                            <span>Click "Add Holiday" to create one</span>
                        </div>
                    ) : (
                        <div className="hps-table-wrap">
                            <table className="hps-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Date / Range</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {holidays.map((holiday) => {
                                        const tc = holidayTypeConfig[holiday.type] || { label: holiday.type, cls: '' };
                                        return (
                                            <tr key={holiday._id}>
                                                <td className="hps-name-cell">
                                                    <span className="hps-name-cell__name">{holiday.name}</span>
                                                    {holiday.description && <span className="hps-name-cell__sub">{holiday.description}</span>}
                                                </td>
                                                <td><span className={`hps-badge ${tc.cls}`}>{tc.label}</span></td>
                                                <td className="hps-date-cell">
                                                    {holiday.isRange
                                                        ? `${new Date(holiday.startDate).toLocaleDateString()} — ${new Date(holiday.endDate).toLocaleDateString()}`
                                                        : new Date(holiday.date).toLocaleDateString()
                                                    }
                                                </td>
                                                <td>
                                                    <div className="hps-row-actions">
                                                        <button className="hps-btn-icon hps-btn-icon--edit" onClick={() => handleEditHoliday(holiday)}><FaEdit /></button>
                                                        <button className="hps-btn-icon hps-btn-icon--delete" onClick={() => handleDeleteHoliday(holiday)}><FaTrash /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── LEAVE TYPES TAB (FULL CONTROL) ─────────────────── */}
            {activeTab === 'leavetypes' && (
                <div className="hps-card">
                    <div className="hps-card__header">
                        <div className="hps-card__title-wrap">
                            <div className="hps-card__icon hps-card__icon--purple"><FaBriefcase /></div>
                            <div>
                                <h3>Leave Types</h3>
                                <p>Configure leave categories and their limits per role</p>
                            </div>
                        </div>
                        <button onClick={handleAddLeaveType} className="hps-btn hps-btn--primary">
                            <FaPlus /> Add Leave Type
                        </button>
                    </div>

                    {leaveTypes.filter(lt => lt.isActive !== false).length === 0 ? (
                        <div className="hps-empty">
                            <div className="hps-empty__icon"><FaBriefcase /></div>
                            <p>No leave types added yet.</p>
                            <span>Click "Add Leave Type" to create one</span>
                        </div>
                    ) : (
                        <div className="hps-table-wrap">
                            <table className="hps-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Code</th>
                                        <th>Yearly Limit</th>
                                        <th>Max at Once</th>
                                        <th>Applicable To</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveTypes.filter(lt => lt.isActive !== false).map((leave) => (
                                        <tr key={leave._id}>
                                            <td className="hps-name-cell">
                                                <span className="hps-name-cell__name">{leave.name}</span>
                                                {leave.description && <span className="hps-name-cell__sub">{leave.description}</span>}
                                            </td>
                                            <td><span className="hps-code-badge">{leave.code}</span></td>
                                            <td className="hps-limit-cell">{leave.yearlyLimit} <span>days/yr</span></td>
                                            <td className="hps-limit-cell">{leave.maxDaysAtOnce} <span>days</span></td>
                                            <td className="hps-roles-cell">{getRoleBadge(leave.applicableRoles || ['HR', 'MANAGER', 'EMPLOYEE'])}</td>
                                            <td>
                                                <div className="hps-row-actions">
                                                    <button className="hps-btn-icon hps-btn-icon--edit" onClick={() => handleEditLeaveType(leave)}><FaEdit /></button>
                                                    <button className="hps-btn-icon hps-btn-icon--delete" onClick={() => handleDeleteLeaveType(leave)}><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── HOLIDAY MODAL ──────────────────────────────────── */}
            {showHolidayModal && (
                <div className="hps-overlay" onClick={() => setShowHolidayModal(false)}>
                    <div className="hps-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="hps-modal__header">
                            <h3>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h3>
                            <button className="hps-modal__close" onClick={() => setShowHolidayModal(false)}><FaTimes /></button>
                        </div>
                        <div className="hps-modal__body">
                            <div className="hps-field">
                                <label>Holiday Name <span className="hps-req">*</span></label>
                                <input type="text" value={holidayForm.name}
                                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                                    placeholder="e.g., Diwali, Republic Day" />
                            </div>
                            <div className="hps-field">
                                <label>Type <span className="hps-req">*</span></label>
                                <select value={holidayForm.type}
                                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}>
                                    <option value="public">Public Holiday</option>
                                    <option value="festival">Festival</option>
                                    <option value="company_event">Company Event</option>
                                    <option value="optional">Optional Holiday</option>
                                </select>
                            </div>
                            <div className="hps-checkbox-toggle">
                                <label className="hps-checkbox-label">
                                    <input type="checkbox" checked={holidayForm.isRange}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, isRange: e.target.checked, date: '', startDate: '', endDate: '' })} />
                                    <span className="hps-checkbox-custom" />
                                    Date Range (Multiple Days)
                                </label>
                            </div>
                            {holidayForm.isRange ? (
                                <div className="hps-field-row">
                                    <div className="hps-field">
                                        <label>Start Date <span className="hps-req">*</span></label>
                                        <input type="date" value={holidayForm.startDate}
                                            onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })} />
                                    </div>
                                    <div className="hps-field">
                                        <label>End Date <span className="hps-req">*</span></label>
                                        <input type="date" value={holidayForm.endDate}
                                            onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })} />
                                    </div>
                                </div>
                            ) : (
                                <div className="hps-field">
                                    <label>Date <span className="hps-req">*</span></label>
                                    <input type="date" value={holidayForm.date}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} />
                                </div>
                            )}
                            <div className="hps-field">
                                <label>Description <span className="hps-optional">(optional)</span></label>
                                <textarea value={holidayForm.description} rows="2"
                                    onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                                    placeholder="Additional details about this holiday" />
                            </div>
                        </div>
                        <div className="hps-modal__footer">
                            <button className="hps-btn hps-btn--ghost" onClick={() => setShowHolidayModal(false)}>Cancel</button>
                            <button className="hps-btn hps-btn--primary" onClick={handleSaveHoliday}>
                                <FaSave /> {editingHoliday ? 'Update' : 'Add'} Holiday
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LEAVE TYPE MODAL ───────────────────────────────── */}
            {showLeaveModal && (
                <div className="hps-overlay" onClick={() => setShowLeaveModal(false)}>
                    <div className="hps-modal hps-modal--lg" onClick={(e) => e.stopPropagation()}>
                        <div className="hps-modal__header">
                            <h3>{editingLeave ? 'Edit Leave Type' : 'Add Leave Type'}</h3>
                            <button className="hps-modal__close" onClick={() => setShowLeaveModal(false)}><FaTimes /></button>
                        </div>
                        <div className="hps-modal__body">
                            <div className="hps-field">
                                <label>Leave Name <span className="hps-req">*</span></label>
                                <input type="text" value={leaveForm.name}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })}
                                    placeholder="e.g., Casual Leave, Sick Leave" />
                            </div>
                            <div className="hps-field">
                                <label>Leave Code <span className="hps-req">*</span></label>
                                <input type="text" value={leaveForm.code} disabled={!!editingLeave}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., CL, SL, PL" />
                                <small>Unique identifier — cannot edit after creation</small>
                            </div>
                            <div className="hps-field">
                                <label>Description</label>
                                <textarea value={leaveForm.description} rows="2"
                                    onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
                                    placeholder="Describe when this leave can be used" />
                            </div>
                            <div className="hps-field-row">
                                <div className="hps-field">
                                    <label>Yearly Limit <span className="hps-req">*</span></label>
                                    <input type="number" value={leaveForm.yearlyLimit} placeholder="e.g., 12"
                                        onChange={(e) => setLeaveForm({ ...leaveForm, yearlyLimit: parseInt(e.target.value) })} />
                                </div>
                                <div className="hps-field">
                                    <label>Max Days at Once <span className="hps-req">*</span></label>
                                    <input type="number" value={leaveForm.maxDaysAtOnce} placeholder="e.g., 5"
                                        onChange={(e) => setLeaveForm({ ...leaveForm, maxDaysAtOnce: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="hps-field">
                                <label>Applicable Roles <span className="hps-req">*</span></label>
                                <div className="hps-role-toggles">
                                    {['HR', 'MANAGER', 'EMPLOYEE'].map(role => (
                                        <label key={role} className={`hps-role-chip ${leaveForm.applicableRoles.includes(role) ? 'hps-role-chip--active' : ''}`}>
                                            <input type="checkbox" checked={leaveForm.applicableRoles.includes(role)}
                                                onChange={() => toggleRole(role)} />
                                            {role === 'HR' && <FaUserTie />}
                                            {role !== 'HR' && <FaUsers />}
                                            {role}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="hps-modal__footer">
                            <button className="hps-btn hps-btn--ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                            <button className="hps-btn hps-btn--primary" onClick={handleSaveLeaveType}>
                                <FaSave /> {editingLeave ? 'Update' : 'Add'} Leave Type
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CONFIRM MODAL ──────────────────────────────────── */}
            {confirmModal.show && (
                <div className="hps-overlay" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                    <div className="hps-modal hps-modal--confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="hps-modal__header hps-modal__header--borderless">
                            <button className="hps-modal__close" onClick={() => setConfirmModal({ ...confirmModal, show: false })}><FaTimes /></button>
                        </div>
                        <div className="hps-modal__body hps-modal__body--center">
                            <div className="hps-confirm__icon"><FaExclamationTriangle /></div>
                            <h3>{confirmModal.title}</h3>
                            <p>{confirmModal.message}</p>
                            <span className="hps-confirm__warn">This action cannot be undone.</span>
                        </div>
                        <div className="hps-modal__footer">
                            <button className="hps-btn hps-btn--ghost" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>Cancel</button>
                            <button className="hps-btn hps-btn--danger" onClick={confirmModal.onConfirm}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRPolicySettings;