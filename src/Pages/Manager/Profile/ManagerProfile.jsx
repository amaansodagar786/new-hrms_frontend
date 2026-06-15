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
  FaCreditCard, FaUniversity, FaTint, FaFileAlt, FaIdCard as FaAadhar
} from 'react-icons/fa';
import './ManagerProfile.scss';

const ManagerProfile = () => {
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
    HR: { cls: 'mp-role--hr', label: 'HR' },
    MANAGER: { cls: 'mp-role--manager', label: 'Manager' },
    EMPLOYEE: { cls: 'mp-role--employee', label: 'Employee' },
  }[role] || { cls: '', label: role });

  const maskString = (str, start = 2, end = 2) => {
    if (!str || str.length <= start + end) return str || '—';
    return str.slice(0, start) + '****' + str.slice(-end);
  };

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
    <div className="mp-loading">
      <div className="mp-spinner" />
      <p>Loading profile...</p>
    </div>
  );

  const rc = getRoleConfig(user?.role);

  return (
    <div className="mp-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Page Header */}
      <div className="mp-page-header">
        <div>
          <span className="mp-page-header__badge"><FaUser /> Manager Profile</span>
          <h1>Profile Overview</h1>
          <p>View and manage your personal information</p>
        </div>
        {!isEditing && (
          <button className="mp-edit-trigger" onClick={() => setIsEditing(true)}>
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="mp-layout">

        {/* Left — Avatar Card */}
        <div className="mp-avatar-card">
          <div className="mp-avatar-card__circle">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mp-avatar-card__name">{user?.name}</h2>
          <span className={`mp-role ${rc.cls}`}>{rc.label}</span>
          <div className="mp-avatar-card__meta">
            <div className="mp-avatar-card__meta-item">
              <span>Employee ID</span>
              <strong>{user?.employeeId}</strong>
            </div>
            <div className="mp-avatar-card__meta-item">
              <span>Department</span>
              <strong>{user?.department || '—'}</strong>
            </div>
            <div className="mp-avatar-card__meta-item">
              <span>Designation</span>
              <strong>{user?.designation || '—'}</strong>
            </div>
          </div>
          <div className="mp-avatar-card__salary">
            <FaMoneyBillWave />
            <div>
              <span>Monthly Salary</span>
              <strong>₹{user?.salary?.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Right — Details */}
        <div className="mp-main">
          <div className="mp-card">
            <div className="mp-card__header">
              <div className="mp-card__title-wrap">
                <div className="mp-card__icon"><FaShieldAlt /></div>
                <div>
                  <h3>Personal Information</h3>
                  <p>Your employment and contact details</p>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="mp-details-section">
              <h4>Basic Information</h4>
              <div className="mp-details-grid">
                {viewFields.map((f, i) => (
                  <div key={i} className="mp-detail-item">
                    <div className="mp-detail-item__icon">{f.icon}</div>
                    <div className="mp-detail-item__content">
                      <label>
                        {f.label}
                        {f.locked && <span className="mp-locked-badge">HR Only</span>}
                      </label>
                      <p>{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents & IDs Section */}
            <div className="mp-details-section">
              <h4>Documents & IDs</h4>
              <div className="mp-details-grid">
                <div className="mp-detail-item">
                  <div className="mp-detail-item__icon"><FaIdCard /></div>
                  <div className="mp-detail-item__content">
                    <label>PAN Card Number</label>
                    <p>{user?.panNumber ? maskString(user.panNumber, 2, 2) : 'Not provided'}</p>
                  </div>
                </div>
                <div className="mp-detail-item">
                  <div className="mp-detail-item__icon"><FaAadhar /></div>
                  <div className="mp-detail-item__content">
                    <label>Aadhar Number</label>
                    <p>{user?.aadharNumber ? maskString(user.aadharNumber, 2, 2) : 'Not provided'}</p>
                  </div>
                </div>
                <div className="mp-detail-item">
                  <div className="mp-detail-item__icon"><FaTint /></div>
                  <div className="mp-detail-item__content">
                    <label>Blood Group</label>
                    <p>{user?.bloodGroup || 'Not provided'}</p>
                  </div>
                </div>
                {user?.joinLetter && (
                  <div className="mp-detail-item">
                    <div className="mp-detail-item__icon"><FaFileAlt /></div>
                    <div className="mp-detail-item__content">
                      <label>Join Letter</label>
                      <a href={user.joinLetter} target="_blank" rel="noopener noreferrer" className="mp-file-link">
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="mp-details-section">
              <h4>Bank Details</h4>
              <div className="mp-details-grid">
                <div className="mp-detail-item">
                  <div className="mp-detail-item__icon"><FaUniversity /></div>
                  <div className="mp-detail-item__content">
                    <label>Bank Name</label>
                    <p>{user?.bankName || 'Not provided'}</p>
                  </div>
                </div>
                <div className="mp-detail-item">
                  <div className="mp-detail-item__icon"><FaCreditCard /></div>
                  <div className="mp-detail-item__content">
                    <label>Account Number</label>
                    <p>{user?.bankAccountNo ? maskString(user.bankAccountNo, 2, 4) : 'Not provided'}</p>
                  </div>
                </div>
                <div className="mp-detail-item">
                  <div className="mp-detail-item__icon"><FaIdCard /></div>
                  <div className="mp-detail-item__content">
                    <label>IFSC Code</label>
                    <p>{user?.bankIfsc || 'Not provided'}</p>
                  </div>
                </div>
                <div className="mp-detail-item">
                  <div className="mp-detail-item__icon"><FaUser /></div>
                  <div className="mp-detail-item__content">
                    <label>Account Holder Name</label>
                    <p>{user?.accountHolderName || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Mode (Only for phone & address) */}
            {isEditing && (
              <div className="mp-edit-section">
                <div className="mp-notice">
                  <FaInfoCircle />
                  <p>Only <strong>phone</strong> and <strong>address</strong> can be updated. Contact HR for other changes.</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="mp-form">
                  {/* Phone */}
                  <div className={`mp-field ${formik.touched.phone && formik.errors.phone ? 'mp-field--error' : ''}`}>
                    <label>Phone Number</label>
                    <div className="mp-field__wrap">
                      <FaPhone className="mp-field__icon" />
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
                      <span className="mp-field__err">{formik.errors.phone}</span>
                    )}
                  </div>

                  {/* Address */}
                  <div className={`mp-field ${formik.touched.address && formik.errors.address ? 'mp-field--error' : ''}`}>
                    <label>Address</label>
                    <div className="mp-field__wrap mp-field__wrap--textarea">
                      <FaMapMarkerAlt className="mp-field__icon mp-field__icon--top" />
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
                      <span className="mp-field__err">{formik.errors.address}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mp-form__actions">
                    <button type="button" className="mp-btn mp-btn--ghost" onClick={handleCancel}>
                      <FaTimes /> Cancel
                    </button>
                    <button type="submit" className="mp-btn mp-btn--primary">
                      <FaSave /> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isEditing && (
              <div className="mp-card__footer">
                <button className="mp-edit-btn" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Contact Info
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;