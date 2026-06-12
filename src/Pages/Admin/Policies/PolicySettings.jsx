import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaClock, FaCalendarAlt, FaPlus, FaEdit, FaTrash,
    FaTimes, FaSave, FaExclamationTriangle, FaRegCalendarAlt,
    FaBriefcase, FaUserTie, FaUsers, FaShieldAlt
} from 'react-icons/fa';
import './PolicySettings.scss';

const PolicySettings = () => {
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

    const handleUpdateAttendanceRules = async () => {
        try {
            const response = await axios.put(`${apiUrl}/policies/attendance-rules`, attendanceRules, { withCredentials: true });
            if (response.data.success) { toast.success('Attendance rules updated successfully'); fetchPolicy(); }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to update attendance rules'); }
    };

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
        const rules = {
            full_day: 'Full Day',
            half_day: 'Half Day',
            alternate_half_day: 'Alternate Half Day',
            alternate_holiday_half: 'Alternate Holiday Half (1st & 3rd OFF, 2nd & 4th HALF)',
            off: 'Off'
        };
        return rules[rule] || rule;
    };

    const tabs = [
        { key: 'attendance', label: 'Attendance Rules', icon: <FaClock /> },
        { key: 'holidays', label: 'Holidays', icon: <FaCalendarAlt /> },
        { key: 'leavetypes', label: 'Leave Types', icon: <FaBriefcase /> },
    ];

    const holidayTypeConfig = {
        public: { label: 'Public', cls: 'ps-badge--public' },
        festival: { label: 'Festival', cls: 'ps-badge--festival' },
        company_event: { label: 'Company Event', cls: 'ps-badge--company' },
        optional: { label: 'Optional', cls: 'ps-badge--optional' },
    };

    if (loading) return (
        <div className="ps-loading">
            <div className="ps-spinner" />
            <p>Loading policy settings...</p>
        </div>
    );

    return (
        <div className="ps-container">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Page Header */}
            <div className="ps-page-header">
                <div className="ps-page-header__left">
                    <span className="ps-page-header__badge">
                        <FaShieldAlt /> Policies
                    </span>
                    <h1>Policy Settings</h1>
                    <p>Manage company policies, attendance rules, holidays, and leave types</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="ps-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`ps-tab ${activeTab === tab.key ? 'ps-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ── ATTENDANCE TAB ─────────────────────────────────── */}
            {activeTab === 'attendance' && (
                <div className="ps-card">
                    <div className="ps-card__header">
                        <div className="ps-card__title-wrap">
                            <div className="ps-card__icon"><FaClock /></div>
                            <div>
                                <h3>Working Hours & Attendance Rules</h3>
                                <p>Define office timings, grace periods, and weekly off rules</p>
                            </div>
                        </div>
                    </div>

                    <div className="ps-form-grid">
                        <div className="ps-field">
                            <label>Working Hours Start</label>
                            <input type="time" value={attendanceRules.workingHoursStart}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, workingHoursStart: e.target.value })} />
                        </div>
                        <div className="ps-field">
                            <label>Working Hours End</label>
                            <input type="time" value={attendanceRules.workingHoursEnd}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, workingHoursEnd: e.target.value })} />
                        </div>
                        <div className="ps-field">
                            <label>Break Start</label>
                            <input type="time" value={attendanceRules.breakStart}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, breakStart: e.target.value })} />
                        </div>
                        <div className="ps-field">
                            <label>Break End</label>
                            <input type="time" value={attendanceRules.breakEnd}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, breakEnd: e.target.value })} />
                        </div>
                        <div className="ps-field">
                            <label>Grace Period <span>(minutes)</span></label>
                            <input type="number" value={attendanceRules.gracePeriodMinutes}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, gracePeriodMinutes: parseInt(e.target.value) })} />
                            <small>After this, mark as Late</small>
                        </div>
                        <div className="ps-field">
                            <label>Half Day After <span>(minutes)</span></label>
                            <input type="number" value={attendanceRules.halfDayAfterMinutes}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, halfDayAfterMinutes: parseInt(e.target.value) })} />
                            <small>After this, mark as Half Day</small>
                        </div>
                        <div className="ps-field">
                            <label>Half Day Cutoff Time</label>
                            <input type="time" value={attendanceRules.halfDayEndTime}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, halfDayEndTime: e.target.value })} />
                            <small>After this time, check-in = Absent</small>
                        </div>
                        <div className="ps-field">
                            <label>Saturday Rule</label>
                            <select value={attendanceRules.saturdayRule}
                                onChange={(e) => setAttendanceRules({ ...attendanceRules, saturdayRule: e.target.value })}>
                                <option value="full_day">Full Day</option>
                                <option value="half_day">Half Day</option>
                                <option value="alternate_half_day">Alternate Half Day</option>
                                <option value="alternate_holiday_half">Alternate Holiday Half (1st & 3rd OFF, 2nd & 4th HALF)</option>
                                <option value="off">Off</option>
                            </select>
                            <small>Current: {getSaturdayRuleText(attendanceRules.saturdayRule)}</small>
                        </div>
                    </div>

                    <div className="ps-card__footer">
                        <button onClick={handleUpdateAttendanceRules} className="ps-btn ps-btn--primary">
                            <FaSave /> Save Attendance Rules
                        </button>
                    </div>
                </div>
            )}

            {/* ── HOLIDAYS TAB ───────────────────────────────────── */}
            {activeTab === 'holidays' && (
                <div className="ps-card">
                    <div className="ps-card__header">
                        <div className="ps-card__title-wrap">
                            <div className="ps-card__icon ps-card__icon--green"><FaCalendarAlt /></div>
                            <div>
                                <h3>Holidays & Company Events</h3>
                                <p>Configure public holidays, festivals and company events</p>
                            </div>
                        </div>
                        <button onClick={handleAddHoliday} className="ps-btn ps-btn--primary">
                            <FaPlus /> Add Holiday
                        </button>
                    </div>

                    {holidays.length === 0 ? (
                        <div className="ps-empty">
                            <div className="ps-empty__icon"><FaRegCalendarAlt /></div>
                            <p>No holidays added yet.</p>
                            <span>Click "Add Holiday" to create one</span>
                        </div>
                    ) : (
                        <div className="ps-table-wrap">
                            <table className="ps-table">
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
                                                <td className="ps-name-cell">
                                                    <span className="ps-name-cell__name">{holiday.name}</span>
                                                    {holiday.description && <span className="ps-name-cell__sub">{holiday.description}</span>}
                                                </td>
                                                <td><span className={`ps-badge ${tc.cls}`}>{tc.label}</span></td>
                                                <td className="ps-date-cell">
                                                    {holiday.isRange
                                                        ? `${new Date(holiday.startDate).toLocaleDateString()} — ${new Date(holiday.endDate).toLocaleDateString()}`
                                                        : new Date(holiday.date).toLocaleDateString()
                                                    }
                                                </td>
                                                <td>
                                                    <div className="ps-row-actions">
                                                        <button className="ps-btn-icon ps-btn-icon--edit" onClick={() => handleEditHoliday(holiday)}><FaEdit /></button>
                                                        <button className="ps-btn-icon ps-btn-icon--delete" onClick={() => handleDeleteHoliday(holiday)}><FaTrash /></button>
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

            {/* ── LEAVE TYPES TAB ────────────────────────────────── */}
            {activeTab === 'leavetypes' && (
                <div className="ps-card">
                    <div className="ps-card__header">
                        <div className="ps-card__title-wrap">
                            <div className="ps-card__icon ps-card__icon--purple"><FaBriefcase /></div>
                            <div>
                                <h3>Leave Types</h3>
                                <p>Configure leave categories and their limits per role</p>
                            </div>
                        </div>
                        <button onClick={handleAddLeaveType} className="ps-btn ps-btn--primary">
                            <FaPlus /> Add Leave Type
                        </button>
                    </div>

                    {leaveTypes.filter(lt => lt.isActive !== false).length === 0 ? (
                        <div className="ps-empty">
                            <div className="ps-empty__icon"><FaBriefcase /></div>
                            <p>No leave types added yet.</p>
                            <span>Click "Add Leave Type" to create one</span>
                        </div>
                    ) : (
                        <div className="ps-table-wrap">
                            <table className="ps-table">
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
                                            <td>
                                                <div className="ps-name-cell">
                                                    <span className="ps-name-cell__name">{leave.name}</span>
                                                    {leave.description && <span className="ps-name-cell__sub">{leave.description}</span>}
                                                </div>
                                            </td>
                                            <td><span className="ps-code-badge">{leave.code}</span></td>
                                            <td className="ps-limit-cell">{leave.yearlyLimit} <span>days/yr</span></td>
                                            <td className="ps-limit-cell">{leave.maxDaysAtOnce} <span>days</span></td>
                                            <td className="ps-roles-cell">{getRoleBadge(leave.applicableRoles || ['HR', 'MANAGER', 'EMPLOYEE'])}</td>
                                            <td>
                                                <div className="ps-row-actions">
                                                    <button className="ps-btn-icon ps-btn-icon--edit" onClick={() => handleEditLeaveType(leave)}><FaEdit /></button>
                                                    <button className="ps-btn-icon ps-btn-icon--delete" onClick={() => handleDeleteLeaveType(leave)}><FaTrash /></button>
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
                <div className="ps-overlay" onClick={() => setShowHolidayModal(false)}>
                    <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-modal__header">
                            <h3>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h3>
                            <button className="ps-modal__close" onClick={() => setShowHolidayModal(false)}><FaTimes /></button>
                        </div>
                        <div className="ps-modal__body">
                            <div className="ps-field">
                                <label>Holiday Name <span className="ps-req">*</span></label>
                                <input type="text" value={holidayForm.name}
                                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                                    placeholder="e.g., Diwali, Republic Day" />
                            </div>
                            <div className="ps-field">
                                <label>Type <span className="ps-req">*</span></label>
                                <select value={holidayForm.type}
                                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}>
                                    <option value="public">Public Holiday</option>
                                    <option value="festival">Festival</option>
                                    <option value="company_event">Company Event</option>
                                    <option value="optional">Optional Holiday</option>
                                </select>
                            </div>
                            <div className="ps-checkbox-toggle">
                                <label className="ps-checkbox-label">
                                    <input type="checkbox" checked={holidayForm.isRange}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, isRange: e.target.checked, date: '', startDate: '', endDate: '' })} />
                                    <span className="ps-checkbox-custom" />
                                    Date Range (Multiple Days)
                                </label>
                            </div>
                            {holidayForm.isRange ? (
                                <div className="ps-field-row">
                                    <div className="ps-field">
                                        <label>Start Date <span className="ps-req">*</span></label>
                                        <input type="date" value={holidayForm.startDate}
                                            onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })} />
                                    </div>
                                    <div className="ps-field">
                                        <label>End Date <span className="ps-req">*</span></label>
                                        <input type="date" value={holidayForm.endDate}
                                            onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })} />
                                    </div>
                                </div>
                            ) : (
                                <div className="ps-field">
                                    <label>Date <span className="ps-req">*</span></label>
                                    <input type="date" value={holidayForm.date}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} />
                                </div>
                            )}
                            <div className="ps-field">
                                <label>Description <span className="ps-optional">(optional)</span></label>
                                <textarea value={holidayForm.description} rows="2"
                                    onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                                    placeholder="Additional details about this holiday" />
                            </div>
                        </div>
                        <div className="ps-modal__footer">
                            <button className="ps-btn ps-btn--ghost" onClick={() => setShowHolidayModal(false)}>Cancel</button>
                            <button className="ps-btn ps-btn--primary" onClick={handleSaveHoliday}>
                                <FaSave /> {editingHoliday ? 'Update' : 'Add'} Holiday
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LEAVE TYPE MODAL ───────────────────────────────── */}
            {showLeaveModal && (
                <div className="ps-overlay" onClick={() => setShowLeaveModal(false)}>
                    <div className="ps-modal ps-modal--lg" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-modal__header">
                            <h3>{editingLeave ? 'Edit Leave Type' : 'Add Leave Type'}</h3>
                            <button className="ps-modal__close" onClick={() => setShowLeaveModal(false)}><FaTimes /></button>
                        </div>
                        <div className="ps-modal__body">
                            <div className="ps-field">
                                <label>Leave Name <span className="ps-req">*</span></label>
                                <input type="text" value={leaveForm.name}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })}
                                    placeholder="e.g., Casual Leave, Sick Leave" />
                            </div>
                            <div className="ps-field">
                                <label>Leave Code <span className="ps-req">*</span></label>
                                <input type="text" value={leaveForm.code} disabled={!!editingLeave}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., CL, SL, PL" />
                                <small>Unique identifier — cannot edit after creation</small>
                            </div>
                            <div className="ps-field">
                                <label>Description</label>
                                <textarea value={leaveForm.description} rows="2"
                                    onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
                                    placeholder="Describe when this leave can be used" />
                            </div>
                            <div className="ps-field-row">
                                <div className="ps-field">
                                    <label>Yearly Limit <span className="ps-req">*</span></label>
                                    <input type="number" value={leaveForm.yearlyLimit} placeholder="e.g., 12"
                                        onChange={(e) => setLeaveForm({ ...leaveForm, yearlyLimit: parseInt(e.target.value) })} />
                                </div>
                                <div className="ps-field">
                                    <label>Max Days at Once <span className="ps-req">*</span></label>
                                    <input type="number" value={leaveForm.maxDaysAtOnce} placeholder="e.g., 5"
                                        onChange={(e) => setLeaveForm({ ...leaveForm, maxDaysAtOnce: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="ps-field">
                                <label>Applicable Roles <span className="ps-req">*</span></label>
                                <div className="ps-role-toggles">
                                    {['HR', 'MANAGER', 'EMPLOYEE'].map(role => (
                                        <label key={role} className={`ps-role-chip ${leaveForm.applicableRoles.includes(role) ? 'ps-role-chip--active' : ''}`}>
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
                        <div className="ps-modal__footer">
                            <button className="ps-btn ps-btn--ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                            <button className="ps-btn ps-btn--primary" onClick={handleSaveLeaveType}>
                                <FaSave /> {editingLeave ? 'Update' : 'Add'} Leave Type
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CONFIRM MODAL ──────────────────────────────────── */}
            {confirmModal.show && (
                <div className="ps-overlay" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                    <div className="ps-modal ps-modal--confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-modal__header ps-modal__header--borderless">
                            <button className="ps-modal__close" onClick={() => setConfirmModal({ ...confirmModal, show: false })}><FaTimes /></button>
                        </div>
                        <div className="ps-modal__body ps-modal__body--center">
                            <div className="ps-confirm__icon"><FaExclamationTriangle /></div>
                            <h3>{confirmModal.title}</h3>
                            <p>{confirmModal.message}</p>
                            <span className="ps-confirm__warn">This action cannot be undone.</span>
                        </div>
                        <div className="ps-modal__footer">
                            <button className="ps-btn ps-btn--ghost" onClick={() => setConfirmModal({ ...confirmModal, show: false })}>Cancel</button>
                            <button className="ps-btn ps-btn--danger" onClick={confirmModal.onConfirm}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicySettings;