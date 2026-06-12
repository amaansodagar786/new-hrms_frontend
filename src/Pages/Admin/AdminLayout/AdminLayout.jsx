import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaBars } from 'react-icons/fa';
import AdminSidebar from './Sidebar/AdminSidebar';
import './AdminLayout.scss';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [adminName, setAdminName] = useState('Admin');
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthAndGetAdmin = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${apiUrl}/admin/me`, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setAdminName(response.data.admin.name);
                    setLoading(false);
                } else {
                    navigate('/admin/login');
                }
            } catch (error) {
                navigate('/admin/login');
            }
        };

        checkAuthAndGetAdmin();
    }, [navigate]);

    // Fetch unread announcements count
    const fetchUnreadCount = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.get(`${apiUrl}/announcements/unread/count`, {
                withCredentials: true,
            });
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Poll for new announcements every 30 seconds
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            await axios.post(`${apiUrl}/admin/logout`, {}, { withCredentials: true });
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
            />

            <main className={`admin-main ${sidebarOpen ? 'shifted' : 'full'}`}>
                <header className="main-header">
                    <div className="header-left">
                        <button className="mobile-toggle" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                        <h1>Dashboard</h1>
                    </div>
                    <div className="header-right">
                        {/* Notification Bell with Unread Count */}
                        <button
                            className="notification-btn"
                            onClick={() => navigate('/admin/announcements')}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        <div className="admin-profile">
                            <div className="profile-avatar">
                                {adminName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="profile-name">{adminName}</span>
                        </div>
                    </div>
                </header>
                <div className="main-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;