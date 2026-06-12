import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaBars } from 'react-icons/fa';
import ManagerSidebar from './ManagerSidebar/ManagerSidebar';
import './ManagerLayout.scss';

const ManagerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userName, setUserName] = useState('Manager');
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthAndGetUser = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${apiUrl}/employee/me`, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    if (response.data.user.role !== 'MANAGER') {
                        navigate('/login');
                        return;
                    }
                    setUserName(response.data.user.name);
                    setUserRole(response.data.user.role);
                    setLoading(false);
                } else {
                    navigate('/login');
                }
            } catch (error) {
                navigate('/login');
            }
        };

        checkAuthAndGetUser();
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
            await axios.post(`${apiUrl}/employee/logout`, {}, { withCredentials: true });
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return (
            <div className="mgr-loading">
                <div className="mgr-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="mgr-layout">
            <ManagerSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
                userName={userName}
                userRole={userRole}
            />

            <main className={`mgr-main ${sidebarOpen ? 'mgr-main--shifted' : 'mgr-main--full'}`}>

                {/* Top Header */}
                <header className="mgr-topbar">
                    <div className="mgr-topbar__left">
                        {/* Mobile hamburger */}
                        <button className="mgr-mobile-toggle" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                        <div className="mgr-topbar__title">
                            <span className="mgr-topbar__badge">Manager Portal</span>
                        </div>
                    </div>

                    <div className="mgr-topbar__right">
                        {/* Notification Bell with Unread Count */}
                        <button
                            className="mgr-notif"
                            onClick={() => navigate('/manager/announcements')}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="mgr-notif__dot">{unreadCount}</span>
                            )}
                        </button>

                        {/* Profile chip */}
                        <div className="mgr-profile">
                            <div className="mgr-profile__avatar">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="mgr-profile__info">
                                <span className="mgr-profile__name">{userName}</span>
                                <span className="mgr-profile__role">Manager</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="mgr-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
};

export default ManagerLayout;