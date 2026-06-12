import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserTie, FaUsers, FaUserShield } from 'react-icons/fa';
import './EmployeeLogin.scss';

const EmployeeLogin = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.post(
                    `${apiUrl}/employee/login`,
                    { email: values.email, password: values.password },
                    { withCredentials: true }
                );
                if (response.data.success) {
                    toast.success(response.data.message || 'Login successful!');
                    localStorage.setItem('userRole', response.data.user.role);
                    localStorage.setItem('userName', response.data.user.name);
                    localStorage.setItem('userEmployeeId', response.data.user.employeeId);
                    setTimeout(() => {
                        const role = response.data.user.role;
                        if (role === 'HR') navigate('/hr/dashboard');
                        else if (role === 'MANAGER') navigate('/manager/dashboard');
                        else navigate('/employee/dashboard');
                    }, 1500);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Login failed. Please try again.');
            } finally {
                setLoading(false);
            }
        },
    });

    const roles = [
        { icon: <FaUserShield />, label: 'HR', cls: 'el-role--hr' },
        { icon: <FaUserTie />, label: 'Manager', cls: 'el-role--manager' },
        { icon: <FaUsers />, label: 'Employee', cls: 'el-role--employee' },
    ];

    return (
        <div className="el-container">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Background shapes */}
            <div className="el-bg">
                <span className="el-bg__blob el-bg__blob--1" />
                <span className="el-bg__blob el-bg__blob--2" />
                <span className="el-bg__blob el-bg__blob--3" />
            </div>

            <div className="el-card">

                {/* Top Brand */}
                <div className="el-brand">
                    <div className="el-brand__logo">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="12" fill="url(#el-grad)" />
                            <path d="M20 10L30 15.5V25L20 30.5L10 25V15.5L20 10Z" stroke="white" strokeWidth="1.8" fill="none" />
                            <circle cx="20" cy="20" r="3.5" fill="white" />
                            <defs>
                                <linearGradient id="el-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#5A67F2" />
                                    <stop offset="1" stopColor="#3D4ADB" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="el-brand__text">
                        <h2>HRMS Portal</h2>
                        <span>Workforce Management System</span>
                    </div>
                </div>

                {/* Role Pills */}
                <div className="el-roles">
                    {roles.map((r) => (
                        <div key={r.label} className={`el-role ${r.cls}`}>
                            {r.icon}
                            <span>{r.label}</span>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="el-header">
                    <h1>Welcome Back 👋</h1>
                    <p>Sign in to access your dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={formik.handleSubmit} className="el-form">

                    {/* Email */}
                    <div className={`el-field ${formik.touched.email && formik.errors.email ? 'el-field--error' : ''}`}>
                        <label>Email Address</label>
                        <div className="el-field__wrap">
                            <FaEnvelope className="el-field__icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="your@company.com"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.email && formik.errors.email && (
                            <span className="el-field__err">{formik.errors.email}</span>
                        )}
                    </div>

                    {/* Password */}
                    <div className={`el-field ${formik.touched.password && formik.errors.password ? 'el-field--error' : ''}`}>
                        <label>Password</label>
                        <div className="el-field__wrap">
                            <FaLock className="el-field__icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Min. 6 characters"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <button type="button" className="el-field__eye" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                            <span className="el-field__err">{formik.errors.password}</span>
                        )}
                    </div>

                    {/* Forgot */}
                    <div className="el-forgot">
                        <a href="#">Forgot Password? Contact HR</a>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="el-submit" disabled={loading}>
                        {loading ? <span className="el-spinner" /> : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <div className="el-footer">
                    <p>Don't have an account? <strong>Contact your HR Department</strong></p>
                    <span>© {new Date().getFullYear()} HRMS System. All rights reserved.</span>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;