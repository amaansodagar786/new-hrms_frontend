import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import {
    FaUser, FaEnvelope, FaLock, FaUserTag, FaMoneyBillWave,
    FaUserTie, FaBuilding, FaBriefcase, FaPhone, FaMapMarkerAlt,
    FaPlus, FaRedo
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import './CreateUser.scss';

const CreateUser = () => {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingManagers, setLoadingManagers] = useState(false);

    useEffect(() => {
        const fetchManagers = async () => {
            setLoadingManagers(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${apiUrl}/admin/managers/list`, { withCredentials: true });
                if (response.data.success) setManagers(response.data.managers);
            } catch {
                toast.error('Failed to load managers list');
            } finally {
                setLoadingManagers(false);
            }
        };
        fetchManagers();
    }, []);

    const validationSchema = Yup.object({
        name: Yup.string().min(3).max(50).required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string()
            .min(6, 'Min 6 characters')
            .matches(/[a-zA-Z]/, 'Must contain a letter')
            .matches(/[0-9]/, 'Must contain a number')
            .required('Password is required'),
        role: Yup.string().oneOf(['HR', 'MANAGER', 'EMPLOYEE']).required('Role is required'),
        salary: Yup.number().positive().min(5000, 'Min salary is 5000').required('Salary is required'),
        managerId: Yup.string().when('role', {
            is: 'EMPLOYEE',
            then: (s) => s.required('Manager is required for Employee'),
            otherwise: (s) => s.notRequired(),
        }),
        department: Yup.string().max(100),
        designation: Yup.string().max(100),
        phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits'),
        address: Yup.string().max(200),
    });

    const formik = useFormik({
        initialValues: {
            name: '', email: '', password: '', role: 'EMPLOYEE',
            salary: '', managerId: '', department: '', designation: '',
            phone: '', address: '',
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.post(
                    `${apiUrl}/admin/users/create`,
                    { ...values, salary: Number(values.salary), managerId: values.managerId || null },
                    { withCredentials: true }
                );
                toast.success(response.data.message || 'User created successfully!');
                resetForm();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        },
    });

    const roleOptions = [
        { value: 'EMPLOYEE', label: '👤 Employee' },
        { value: 'MANAGER', label: '🧑‍💼 Manager' },
        { value: 'HR', label: '🏢 HR' },
    ];

    const isErr = (field) => formik.touched[field] && formik.errors[field];

    return (
        <div className="cu-container">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Page Header */}
            <div className="cu-page-header">
                <div className="cu-page-header__left">
                    <span className="cu-page-header__badge">User Management</span>
                    <h1>Create New User</h1>
                    <p>Add HR, Manager, or Employee to the HRMS system</p>
                </div>
            </div>

            {/* Card */}
            <div className="cu-card">

                {/* Section: Account Info */}
                <div className="cu-section">
                    <div className="cu-section__label">
                        <span className="cu-section__num">01</span>
                        <div>
                            <h3>Account Information</h3>
                            <p>Basic login credentials for the user</p>
                        </div>
                    </div>

                    <div className="cu-grid cu-grid--3">
                        {/* Name */}
                        <div className={`cu-field ${isErr('name') ? 'cu-field--error' : ''}`}>
                            <label>Full Name <span>*</span></label>
                            <div className="cu-field__wrap">
                                <FaUser className="cu-field__icon" />
                                <input
                                    type="text" name="name"
                                    placeholder="John Doe"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('name') && <span className="cu-field__err">{formik.errors.name}</span>}
                        </div>

                        {/* Email */}
                        <div className={`cu-field ${isErr('email') ? 'cu-field--error' : ''}`}>
                            <label>Email Address <span>*</span></label>
                            <div className="cu-field__wrap">
                                <FaEnvelope className="cu-field__icon" />
                                <input
                                    type="email" name="email"
                                    placeholder="user@company.com"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('email') && <span className="cu-field__err">{formik.errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className={`cu-field ${isErr('password') ? 'cu-field--error' : ''}`}>
                            <label>Password <span>*</span></label>
                            <div className="cu-field__wrap">
                                <FaLock className="cu-field__icon" />
                                <input
                                    type="password" name="password"
                                    placeholder="Min 6 chars + number"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('password') && <span className="cu-field__err">{formik.errors.password}</span>}
                        </div>
                    </div>
                </div>

                <div className="cu-divider" />

                {/* Section: Role & Salary */}
                <div className="cu-section">
                    <div className="cu-section__label">
                        <span className="cu-section__num">02</span>
                        <div>
                            <h3>Role & Compensation</h3>
                            <p>Assign role, salary and reporting manager</p>
                        </div>
                    </div>

                    <div className="cu-grid cu-grid--3">
                        {/* Role */}
                        <div className={`cu-field ${isErr('role') ? 'cu-field--error' : ''}`}>
                            <label>Role <span>*</span></label>
                            <div className="cu-field__wrap">
                                <FaUserTag className="cu-field__icon" />
                                <select
                                    name="role"
                                    value={formik.values.role}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        if (e.target.value !== 'EMPLOYEE') formik.setFieldValue('managerId', '');
                                    }}
                                    onBlur={formik.handleBlur}
                                >
                                    {roleOptions.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            {isErr('role') && <span className="cu-field__err">{formik.errors.role}</span>}
                        </div>

                        {/* Salary */}
                        <div className={`cu-field ${isErr('salary') ? 'cu-field--error' : ''}`}>
                            <label>Salary (₹) <span>*</span></label>
                            <div className="cu-field__wrap">
                                <FaMoneyBillWave className="cu-field__icon" />
                                <input
                                    type="number" name="salary"
                                    placeholder="e.g. 50000"
                                    value={formik.values.salary}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('salary') && <span className="cu-field__err">{formik.errors.salary}</span>}
                        </div>

                        {/* Manager — only for EMPLOYEE */}
                        {formik.values.role === 'EMPLOYEE' && (
                            <div className={`cu-field ${isErr('managerId') ? 'cu-field--error' : ''}`}>
                                <label>Assign Manager <span>*</span></label>
                                <div className="cu-field__wrap">
                                    <FaUserTie className="cu-field__icon" />
                                    <select
                                        name="managerId"
                                        value={formik.values.managerId}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={loadingManagers}
                                    >
                                        <option value="">
                                            {loadingManagers ? 'Loading...' : 'Select a manager'}
                                        </option>
                                        {managers.map(m => (
                                            <option key={m.employeeId} value={m.employeeId}>
                                                {m.name} — {m.employeeId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {isErr('managerId') && <span className="cu-field__err">{formik.errors.managerId}</span>}
                                {managers.length === 0 && !loadingManagers && (
                                    <span className="cu-field__warn">⚠ No managers found. Create one first.</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="cu-divider" />

                {/* Section: Work Details */}
                <div className="cu-section">
                    <div className="cu-section__label">
                        <span className="cu-section__num">03</span>
                        <div>
                            <h3>Work Details</h3>
                            <p>Department, designation and contact info</p>
                        </div>
                    </div>

                    <div className="cu-grid cu-grid--2">
                        {/* Department */}
                        <div className={`cu-field ${isErr('department') ? 'cu-field--error' : ''}`}>
                            <label>Department</label>
                            <div className="cu-field__wrap">
                                <FaBuilding className="cu-field__icon" />
                                <input
                                    type="text" name="department"
                                    placeholder="e.g. IT, Finance, HR"
                                    value={formik.values.department}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('department') && <span className="cu-field__err">{formik.errors.department}</span>}
                        </div>

                        {/* Designation */}
                        <div className={`cu-field ${isErr('designation') ? 'cu-field--error' : ''}`}>
                            <label>Designation</label>
                            <div className="cu-field__wrap">
                                <FaBriefcase className="cu-field__icon" />
                                <input
                                    type="text" name="designation"
                                    placeholder="e.g. Software Engineer"
                                    value={formik.values.designation}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('designation') && <span className="cu-field__err">{formik.errors.designation}</span>}
                        </div>

                        {/* Phone */}
                        <div className={`cu-field ${isErr('phone') ? 'cu-field--error' : ''}`}>
                            <label>Phone Number</label>
                            <div className="cu-field__wrap">
                                <FaPhone className="cu-field__icon" />
                                <input
                                    type="tel" name="phone"
                                    placeholder="10-digit number"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('phone') && <span className="cu-field__err">{formik.errors.phone}</span>}
                        </div>

                        {/* Address */}
                        <div className={`cu-field ${isErr('address') ? 'cu-field--error' : ''}`}>
                            <label>Address</label>
                            <div className="cu-field__wrap cu-field__wrap--textarea">
                                <FaMapMarkerAlt className="cu-field__icon cu-field__icon--top" />
                                <textarea
                                    name="address" rows="3"
                                    placeholder="Enter full address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {isErr('address') && <span className="cu-field__err">{formik.errors.address}</span>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="cu-actions">
                    <button type="button" className="cu-btn cu-btn--reset" onClick={() => formik.resetForm()}>
                        <FaRedo /> Reset Form
                    </button>
                    <button type="submit" className="cu-btn cu-btn--submit" disabled={loading} onClick={formik.handleSubmit}>
                        {loading
                            ? <><span className="cu-spinner" /> Creating...</>
                            : <><FaPlus /> Create User</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateUser;