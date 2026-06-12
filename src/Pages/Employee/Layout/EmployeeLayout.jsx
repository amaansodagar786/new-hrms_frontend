import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaBars } from 'react-icons/fa';
import EmployeeSidebar from './EmployeeSidebar/EmployeeSidebar';
import './EmployeeLayout.scss';

const EmployeeLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userName, setUserName] = useState('Employee');
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
            <div className="employee-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="employee-layout">
            <EmployeeSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
                userName={userName}
                userRole={userRole}
            />

            <main className={`employee-main ${sidebarOpen ? 'shifted' : 'full'}`}>
                <header className="employee-header">
                    <div className="header-left">
                        <button className="mobile-toggle" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                        <h1>Employee Portal</h1>
                    </div>
                    <div className="header-right">
                        {/* Notification Bell with Unread Count */}
                        <button
                            className="notification-btn"
                            onClick={() => navigate('/employee/announcements')}
                        >
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>
                        <div className="employee-profile">
                            <div className="profile-avatar">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="profile-name">{userName}</span>
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

export default EmployeeLayout;