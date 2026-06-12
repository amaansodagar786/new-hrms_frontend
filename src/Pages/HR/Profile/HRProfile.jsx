import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaUser, FaEnvelope, FaBuilding, FaBriefcase,
    FaPhone, FaMapMarkerAlt, FaIdCard, FaMoneyBillWave,
    FaEdit, FaSave, FaTimes, FaShieldAlt, FaInfoCircle
} from 'react-icons/fa';
import './HRProfile.scss';

const HRProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

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

    const getRoleConfig = (role) => ({
        HR: { cls: 'hp-role--hr', label: 'HR' },
        MANAGER: { cls: 'hp-role--manager', label: 'Manager' },
        EMPLOYEE: { cls: 'hp-role--employee', label: 'Employee' },
    }[role] || { cls: '', label: role });

    const viewFields = [
        { icon: <FaIdCard />, label: 'Employee ID', value: user?.employeeId, locked: true },
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
                {!isEditing && (
                    <button className="hp-edit-trigger" onClick={() => setIsEditing(true)}>
                        <FaEdit /> Edit Profile
                    </button>
                )}
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

                {/* Right — Details / Edit */}
                <div className="hp-main">

                    {!isEditing ? (
                        // ── VIEW MODE ─────────────────────────────────
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

                            <div className="hp-details-grid">
                                {viewFields.map((f, i) => (
                                    <div key={i} className="hp-detail-item">
                                        <div className="hp-detail-item__icon">{f.icon}</div>
                                        <div className="hp-detail-item__content">
                                            <label>
                                                {f.label}
                                                {f.locked && <span className="hp-locked-badge">HR Only</span>}
                                            </label>
                                            <p>{f.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    ) : (
                        // ── EDIT MODE ─────────────────────────────────
                        <div className="hp-card">
                            <div className="hp-card__header">
                                <div className="hp-card__title-wrap">
                                    <div className="hp-card__icon hp-card__icon--edit"><FaEdit /></div>
                                    <div>
                                        <h3>Edit Profile</h3>
                                        <p>Update your contact information</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info notice */}
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
                </div>
            </div>
        </div>
    );
};

export default HRProfile;