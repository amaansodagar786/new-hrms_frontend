import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaBars, FaSearch } from 'react-icons/fa';
import HRSidebar from './Sidebar/HRSidebar';
import './HRLayout.scss';

const HRLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userName, setUserName] = useState('HR');
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthAndGetUser = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${apiUrl}/employee/me`, { withCredentials: true });
                if (response.data.success) {
                    if (response.data.user.role !== 'HR') { navigate('/login'); return; }
                    setUserName(response.data.user.name);
                    setUserRole(response.data.user.role);
                    setLoading(false);
                } else {
                    navigate('/login');
                }
            } catch {
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
        } catch (e) { console.error('Logout error:', e); }
    };

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    if (loading) return (
        <div className="hrl-loading">
            <div className="hrl-spinner" />
            <p>Loading...</p>
        </div>
    );

    return (
        <div className="hrl-layout">
            <HRSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
                userName={userName}
                userRole={userRole}
            />

            <main className={`hrl-main ${sidebarOpen ? 'hrl-main--shifted' : 'hrl-main--full'}`}>

                {/* Top Header */}
                <header className="hrl-topbar">
                    <div className="hrl-topbar__left">
                        {/* Mobile hamburger */}
                        <button className="hrl-mobile-toggle" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                        <div className="hrl-topbar__title">
                            <span className="hrl-topbar__badge">HR Portal</span>
                        </div>
                    </div>

                    <div className="hrl-topbar__right">
                        {/* Notification Bell with Unread Count */}
                        <button
                            className="hrl-notif"
                            onClick={() => navigate('/hr/announcements')}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="hrl-notif__dot">{unreadCount}</span>
                            )}
                        </button>

                        {/* Profile chip */}
                        <div className="hrl-profile">
                            <div className="hrl-profile__avatar">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hrl-profile__info">
                                <span className="hrl-profile__name">{userName}</span>
                                <span className="hrl-profile__role">HR</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="hrl-content">
                    <Outlet />
                </div>

            </main>
        </div>
    );
};

export default HRLayout;