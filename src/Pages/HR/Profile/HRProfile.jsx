import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaUser, FaEnvelope, FaBuilding, FaBriefcase,
    FaPhone, FaMapMarkerAlt, FaIdCard, FaMoneyBillWave,
    FaEdit, FaSave, FaTimes, FaShieldAlt, FaInfoCircle,
    FaCreditCard, FaUniversity, FaTint, FaFileAlt, FaIdCard as FaAadhar,
    FaKey, FaLock, FaEye, FaEyeSlash, FaSpinner
} from 'react-icons/fa';
import './HRProfile.scss';

const HRProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // ========== CHANGE PASSWORD STATE ==========
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.get(`${apiUrl}/employee/me`, { withCredentials: true });
            if (response.data.success) setUser(response.data.user);
        } catch {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUserProfile(); }, []);

    const validationSchema = Yup.object({
        phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
        address: Yup.string().max(200, 'Address too long'),
    });

    const formik = useFormik({
        initialValues: { phone: user?.phone || '', address: user?.address || '' },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.put(
                    `${apiUrl}/employee/profile`,
                    { phone: values.phone, address: values.address },
                    { withCredentials: true }
                );
                if (response.data.success) {
                    toast.success('Profile updated successfully');
                    setUser(response.data.user);
                    setIsEditing(false);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update profile');
            }
        },
    });

    const handleCancel = () => { setIsEditing(false); formik.resetForm(); };

    // ========== CHANGE PASSWORD HANDLERS ==========
    const handleOpenPasswordModal = () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        setShowPasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const validatePasswordForm = () => {
        const errors = {};
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        setChangingPassword(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.put(
                `${apiUrl}/employee/change-password`,
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                },
                { withCredentials: true }
            );
            if (response.data.success) {
                toast.success('Password changed successfully');
                handleClosePasswordModal();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
        if (passwordErrors[name]) {
            setPasswordErrors({ ...passwordErrors, [name]: '' });
        }
    };

    const getRoleConfig = (role) => ({
        HR: { cls: 'hp-role--hr', label: 'HR' },
        MANAGER: { cls: 'hp-role--manager', label: 'Manager' },
        EMPLOYEE: { cls: 'hp-role--employee', label: 'Employee' },
    }[role] || { cls: '', label: role });

    const maskString = (str, start = 2, end = 2) => {
        if (!str || str.length <= start + end) return str || '—';
        return str.slice(0, start) + '****' + str.slice(-end);
    };

    const viewFields = [
        // { icon: <FaIdCard />, label: 'Employee ID', value: user?.employeeId, locked: true },
        { icon: <FaUser />, label: 'Full Name', value: user?.name, locked: true },
        { icon: <FaEnvelope />, label: 'Email Address', value: user?.email, locked: true },
        { icon: <FaBuilding />, label: 'Department', value: user?.department || 'Not assigned', locked: true },
        { icon: <FaBriefcase />, label: 'Designation', value: user?.designation || 'Not assigned', locked: true },
        { icon: <FaMoneyBillWave />, label: 'Salary', value: `₹${user?.salary?.toLocaleString()}/month`, locked: true },
        { icon: <FaPhone />, label: 'Phone Number', value: user?.phone || 'Not added', locked: false },
        { icon: <FaMapMarkerAlt />, label: 'Address', value: user?.address || 'Not added', locked: false },
    ];

    if (loading) return (
        <div className="hp-loading">
            <div className="hp-spinner" />
            <p>Loading profile...</p>
        </div>
    );

    const rc = getRoleConfig(user?.role);

    return (
        <div className="hp-container">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Page Header */}
            <div className="hp-page-header">
                <div>
                    <span className="hp-page-header__badge"><FaUser /> HR Profile</span>
                    <h1>Profile Overview</h1>
                    <p>View and manage your personal information</p>
                </div>
                <div className="hp-header-actions">
                    {!isEditing && (
                        <>
                            <button className="hp-edit-trigger" onClick={() => setIsEditing(true)}>
                                <FaEdit /> Edit Profile
                            </button>
                            <button className="hp-password-trigger" onClick={handleOpenPasswordModal}>
                                <FaKey /> Change Password
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="hp-layout">

                {/* Left — Avatar Card */}
                <div className="hp-avatar-card">
                    <div className="hp-avatar-card__circle">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="hp-avatar-card__name">{user?.name}</h2>
                    <span className={`hp-role ${rc.cls}`}>{rc.label}</span>
                    <div className="hp-avatar-card__meta">
                        <div className="hp-avatar-card__meta-item">
                            <span>Employee ID</span>
                            <strong>{user?.employeeId}</strong>
                        </div>
                        <div className="hp-avatar-card__meta-item">
                            <span>Department</span>
                            <strong>{user?.department || '—'}</strong>
                        </div>
                        <div className="hp-avatar-card__meta-item">
                            <span>Designation</span>
                            <strong>{user?.designation || '—'}</strong>
                        </div>
                    </div>
                    <div className="hp-avatar-card__salary">
                        <FaMoneyBillWave />
                        <div>
                            <span>Monthly Salary</span>
                            <strong>₹{user?.salary?.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                {/* Right — Details */}
                <div className="hp-main">
                    <div className="hp-card">
                        <div className="hp-card__header">
                            <div className="hp-card__title-wrap">
                                <div className="hp-card__icon"><FaShieldAlt /></div>
                                <div>
                                    <h3>Personal Information</h3>
                                    <p>Your employment and contact details</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="hp-details-section">
                            <h4>Basic Information</h4>
                            <div className="hp-details-grid">
                                {viewFields.map((f, i) => (
                                    <div key={i} className="hp-detail-item">
                                        <div className="hp-detail-item__icon">{f.icon}</div>
                                        <div className="hp-detail-item__content">
                                            <label>
                                                {f.label}
                                                {/* {f.locked && <span className="hp-locked-badge">HR Only</span>} */}
                                            </label>
                                            <p>{f.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Documents & IDs Section */}
                        <div className="hp-details-section">
                            <h4>Documents & IDs</h4>
                            <div className="hp-details-grid">
                                <div className="hp-detail-item">
                                    <div className="hp-detail-item__icon"><FaIdCard /></div>
                                    <div className="hp-detail-item__content">
                                        <label>PAN Card Number</label>
                                        <p>{user?.panNumber ? maskString(user.panNumber, 2, 2) : 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="hp-detail-item">
                                    <div className="hp-detail-item__icon"><FaAadhar /></div>
                                    <div className="hp-detail-item__content">
                                        <label>Aadhar Number</label>
                                        <p>{user?.aadharNumber ? maskString(user.aadharNumber, 2, 2) : 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="hp-detail-item">
                                    <div className="hp-detail-item__icon"><FaTint /></div>
                                    <div className="hp-detail-item__content">
                                        <label>Blood Group</label>
                                        <p>{user?.bloodGroup || 'Not provided'}</p>
                                    </div>
                                </div>
                                {user?.joinLetter && (
                                    <div className="hp-detail-item">
                                        <div className="hp-detail-item__icon"><FaFileAlt /></div>
                                        <div className="hp-detail-item__content">
                                            <label>Join Letter</label>
                                            <a href={user.joinLetter} target="_blank" rel="noopener noreferrer" className="hp-file-link">
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="hp-details-section">
                            <h4>Bank Details</h4>
                            <div className="hp-details-grid">
                                <div className="hp-detail-item">
                                    <div className="hp-detail-item__icon"><FaUniversity /></div>
                                    <div className="hp-detail-item__content">
                                        <label>Bank Name</label>
                                        <p>{user?.bankName || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="hp-detail-item">
                                    <div className="hp-detail-item__icon"><FaCreditCard /></div>
                                    <div className="hp-detail-item__content">
                                        <label>Account Number</label>
                                        <p>{user?.bankAccountNo ? maskString(user.bankAccountNo, 2, 4) : 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="hp-detail-item">
                                    <div className="hp-detail-item__icon"><FaIdCard /></div>
                                    <div className="hp-detail-item__content">
                                        <label>IFSC Code</label>
                                        <p>{user?.bankIfsc || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="hp-detail-item">
                                    <div className="hp-detail-item__icon"><FaUser /></div>
                                    <div className="hp-detail-item__content">
                                        <label>Account Holder Name</label>
                                        <p>{user?.accountHolderName || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Mode (Only for phone & address) */}
                        {isEditing && (
                            <div className="hp-edit-section">
                                <div className="hp-notice">
                                    <FaInfoCircle />
                                    <p>Only <strong>phone</strong> and <strong>address</strong> can be updated. Contact Admin for other changes.</p>
                                </div>

                                <form onSubmit={formik.handleSubmit} className="hp-form">
                                    {/* Phone */}
                                    <div className={`hp-field ${formik.touched.phone && formik.errors.phone ? 'hp-field--error' : ''}`}>
                                        <label>Phone Number</label>
                                        <div className="hp-field__wrap">
                                            <FaPhone className="hp-field__icon" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Enter 10-digit mobile number"
                                                value={formik.values.phone}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                        </div>
                                        {formik.touched.phone && formik.errors.phone && (
                                            <span className="hp-field__err">{formik.errors.phone}</span>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className={`hp-field ${formik.touched.address && formik.errors.address ? 'hp-field--error' : ''}`}>
                                        <label>Address</label>
                                        <div className="hp-field__wrap hp-field__wrap--textarea">
                                            <FaMapMarkerAlt className="hp-field__icon hp-field__icon--top" />
                                            <textarea
                                                name="address"
                                                placeholder="Enter your full address"
                                                value={formik.values.address}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                rows="4"
                                            />
                                        </div>
                                        {formik.touched.address && formik.errors.address && (
                                            <span className="hp-field__err">{formik.errors.address}</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="hp-form__actions">
                                        <button type="button" className="hp-btn hp-btn--ghost" onClick={handleCancel}>
                                            <FaTimes /> Cancel
                                        </button>
                                        <button type="submit" className="hp-btn hp-btn--primary">
                                            <FaSave /> Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {!isEditing && (
                            <div className="hp-card__footer">
                                <button className="hp-edit-btn" onClick={() => setIsEditing(true)}>
                                    <FaEdit /> Edit Contact Info
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========== CHANGE PASSWORD MODAL ========== */}
            {showPasswordModal && (
                <div className="hp-modal-overlay" onClick={handleClosePasswordModal}>
                    <div className="hp-password-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="hp-modal-header">
                            <h3><FaLock /> Change Password</h3>
                            <button className="hp-modal-close" onClick={handleClosePasswordModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="hp-modal-body">
                            <div className="hp-modal-info">
                                <FaInfoCircle />
                                <p>Enter your current password and choose a new password.</p>
                            </div>

                            {/* Current Password */}
                            <div className="hp-password-field">
                                <label>Current Password</label>
                                <div className="hp-password-input-wrap">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordInputChange}
                                        placeholder="Enter current password"
                                        className={passwordErrors.currentPassword ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="hp-password-toggle"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <span className="hp-password-error">{passwordErrors.currentPassword}</span>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="hp-password-field">
                                <label>New Password</label>
                                <div className="hp-password-input-wrap">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordInputChange}
                                        placeholder="Enter new password (min 6 characters)"
                                        className={passwordErrors.newPassword ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="hp-password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <span className="hp-password-error">{passwordErrors.newPassword}</span>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="hp-password-field">
                                <label>Confirm New Password</label>
                                <div className="hp-password-input-wrap">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordInputChange}
                                        placeholder="Confirm new password"
                                        className={passwordErrors.confirmPassword ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="hp-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <span className="hp-password-error">{passwordErrors.confirmPassword}</span>
                                )}
                            </div>

                            <div className="hp-password-requirements">
                                <p>Password requirements:</p>
                                <ul>
                                    <li>Minimum 6 characters</li>
                                    <li>Should be different from your current password</li>
                                </ul>
                            </div>
                        </div>
                        <div className="hp-modal-footer">
                            <button className="hp-modal-cancel" onClick={handleClosePasswordModal}>
                                Cancel
                            </button>
                            <button
                                className="hp-modal-save"
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                            >
                                {changingPassword ? <FaSpinner className="spinning" /> : <FaSave />}
                                {changingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRProfile;