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
            <div className="adm-loading">
                <div className="adm-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="adm-layout">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
            />

            <main className={`adm-main ${sidebarOpen ? 'adm-main--shifted' : 'adm-main--full'}`}>

                {/* Top Header */}
                <header className="adm-topbar">
                    <div className="adm-topbar__left">
                        {/* Mobile hamburger */}
                        <button className="adm-mobile-toggle" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                        <div className="adm-topbar__title">
                            <span className="adm-topbar__badge">Admin Portal</span>
                        </div>
                    </div>

                    <div className="adm-topbar__right">
                        {/* Notification Bell with Unread Count */}
                        <button
                            className="adm-notif"
                            onClick={() => navigate('/admin/announcements')}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="adm-notif__dot">{unreadCount}</span>
                            )}
                        </button>

                        {/* Profile chip */}
                        <div className="adm-profile">
                            <div className="adm-profile__avatar">
                                {adminName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="adm-profile__info">
                                <span className="adm-profile__name">{adminName}</span>
                                <span className="adm-profile__role">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="adm-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
};

export default AdminLayout;