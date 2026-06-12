import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import './AdminAuth.scss';

const AdminAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const loginSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const registerSchema = Yup.object({
        name: Yup.string().min(3, 'Name must be at least 3 characters').required('Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits').required('Phone number is required'),
    });

    const formik = useFormik({
        initialValues: { name: '', email: '', password: '', phone: '' },
        validationSchema: isLogin ? loginSchema : registerSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                if (isLogin) {
                    const response = await axios.post(`${apiUrl}/admin/login`, { email: values.email, password: values.password }, { withCredentials: true });
                    toast.success(response.data.message || 'Login successful!');
                    setTimeout(() => navigate('/admin/dashboard'), 1500);
                } else {
                    const response = await axios.post(`${apiUrl}/admin/register`, { name: values.name, email: values.email, password: values.password, phone: values.phone }, { withCredentials: true });
                    toast.success(response.data.message || 'Registration successful! Please login.');
                    setTimeout(() => { setIsLogin(true); formik.resetForm(); }, 2000);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        },
    });

    const handleToggle = () => { setIsLogin(!isLogin); formik.resetForm(); };

    return (
        <div className="aa-container">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Left Panel */}
            <div className="aa-left">
                <div className="aa-left__overlay" />
                <div className="aa-left__shapes">
                    <span className="shape shape-1" />
                    <span className="shape shape-2" />
                    <span className="shape shape-3" />
                    <span className="shape shape-4" />
                </div>
                <div className="aa-left__content">
                    <div className="aa-brand">
                        <div className="aa-brand__icon">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="12" fill="white" fillOpacity="0.15" />
                                <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" stroke="white" strokeWidth="2" fill="none" />
                                <circle cx="20" cy="20" r="4" fill="white" />
                            </svg>
                        </div>
                        <h2 className="aa-brand__name">HRMS Portal</h2>
                    </div>
                    <div className="aa-left__tagline">
                        <h1>Manage your <br /><span>Workforce</span><br />Smarter.</h1>
                        <p>A unified platform for HR operations, payroll, attendance, and employee management.</p>
                    </div>
                    <div className="aa-stats">
                        <div className="aa-stat">
                            <strong>500+</strong>
                            <span>Employees</span>
                        </div>
                        <div className="aa-stat">
                            <strong>99.9%</strong>
                            <span>Uptime</span>
                        </div>
                        <div className="aa-stat">
                            <strong>24/7</strong>
                            <span>Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="aa-right">
                <div className={`aa-card ${!isLogin ? 'aa-card--register' : ''}`}>
                    <div className="aa-card__header">
                        <div className="aa-card__badge">Admin Access</div>
                        <h2>{isLogin ? 'Welcome Back 👋' : 'Create Account'}</h2>
                        <p>{isLogin ? 'Sign in to your admin dashboard' : 'Register to get started with HRMS'}</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="aa-form">
                        {!isLogin && (
                            <>
                                <div className={`aa-field ${formik.touched.name && formik.errors.name ? 'aa-field--error' : ''}`}>
                                    <label>Full Name</label>
                                    <div className="aa-field__input-wrap">
                                        <FaUser className="aa-field__icon" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                    </div>
                                    {formik.touched.name && formik.errors.name && <span className="aa-field__error">{formik.errors.name}</span>}
                                </div>

                                <div className={`aa-field ${formik.touched.phone && formik.errors.phone ? 'aa-field--error' : ''}`}>
                                    <label>Phone Number</label>
                                    <div className="aa-field__input-wrap">
                                        <FaPhone className="aa-field__icon" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="10-digit number"
                                            value={formik.values.phone}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                    </div>
                                    {formik.touched.phone && formik.errors.phone && <span className="aa-field__error">{formik.errors.phone}</span>}
                                </div>
                            </>
                        )}

                        <div className={`aa-field ${formik.touched.email && formik.errors.email ? 'aa-field--error' : ''}`}>
                            <label>Email Address</label>
                            <div className="aa-field__input-wrap">
                                <FaEnvelope className="aa-field__icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@company.com"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {formik.touched.email && formik.errors.email && <span className="aa-field__error">{formik.errors.email}</span>}
                        </div>

                        <div className={`aa-field ${formik.touched.password && formik.errors.password ? 'aa-field--error' : ''}`}>
                            <label>Password</label>
                            <div className="aa-field__input-wrap">
                                <FaLock className="aa-field__icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Min. 6 characters"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <button type="button" className="aa-field__eye" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && <span className="aa-field__error">{formik.errors.password}</span>}
                        </div>

                        {isLogin && (
                            <div className="aa-forgot">
                                <a href="#">Forgot Password?</a>
                            </div>
                        )}

                        <button type="submit" className="aa-submit-btn" disabled={loading}>
                            {loading ? <span className="aa-spinner" /> : isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="aa-card__footer">
                        <p>
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button type="button" onClick={handleToggle} className="aa-toggle-btn">
                                {isLogin ? ' Sign Up' : ' Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;