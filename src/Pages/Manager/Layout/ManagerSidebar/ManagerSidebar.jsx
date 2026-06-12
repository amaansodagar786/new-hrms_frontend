import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUsers,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaTasks,
    FaStar,
    FaSignOutAlt,
    FaTimes,
    FaBars,
    FaChevronRight,
    FaUserTie,
    FaUser,
    FaChevronDown,
    FaLeaf,
    FaBullhorn
} from 'react-icons/fa';
import './ManagerSidebar.scss';

const ManagerSidebar = ({ sidebarOpen, toggleSidebar, handleLogout, userName, userRole }) => {

    const location = useLocation();
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (key) => {
        if (!sidebarOpen) {
            toggleSidebar();
            setOpenDropdown(key);
        } else {
            setOpenDropdown(openDropdown === key ? null : key);
        }
    };

    // Check if any leave page is active
    const isLeaveActive = location.pathname.startsWith('/manager/leave');
    // Check if tasks page is active
    const isTasksActive = location.pathname.startsWith('/manager/tasks');
    // Check if performance page is active
    const isPerformanceActive = location.pathname.startsWith('/manager/performance');

    const menuItems = [
        {
            path: '/manager/dashboard',
            name: 'Dashboard',
            icon: <FaTachometerAlt />,
        },
        {
            path: '/manager/profile',
            name: 'My Profile',
            icon: <FaUser />,
        },
        {
            path: '/manager/team',
            name: 'My Team',
            icon: <FaUsers />,
        },
        {
            path: '/manager/attendance',
            name: 'Attendance',
            icon: <FaCalendarAlt />,
        },
        {
            key: 'leave',
            name: 'Leave',
            icon: <FaLeaf />,
            children: [
                { path: '/manager/leave/self', name: 'My Leave', icon: <FaUser /> },
                { path: '/manager/leave/team', name: 'Team Leave', icon: <FaUsers /> },
            ]
        },
        {
            path: '/manager/tasks',
            name: 'Tasks',
            icon: <FaTasks />,
        },
       


        {
            path: '/manager/performance',
            name: 'Performance',
            icon: <FaStar />,
        },
        {
            path: '/manager/salary',
            name: 'Salary',
            icon: <FaMoneyBillWave />,
        },

        { path: '/manager/announcements', name: 'Announcements', icon: <FaBullhorn /> },
        { path: '/manager/salary', name: 'Salary', icon: <FaMoneyBillWave /> },

    ];

    return (
        <>
            {sidebarOpen && <div className="manager-overlay" onClick={toggleSidebar} />}

            <aside className={`manager-sidebar ${sidebarOpen ? 'manager-sidebar--open' : 'manager-sidebar--closed'}`}>

                {/* Header */}
                <div className="manager-header">
                    {sidebarOpen ? (
                        <>
                            <div className="manager-brand">
                                <div className="manager-brand__icon">
                                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="40" height="40" rx="12" fill="url(#mgr-grad)" />
                                        <path d="M20 10L30 15.5V25L20 30.5L10 25V15.5L20 10Z" stroke="white" strokeWidth="1.8" fill="none" />
                                        <circle cx="20" cy="20" r="3.5" fill="white" />
                                        <defs>
                                            <linearGradient id="mgr-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#5A67F2" />
                                                <stop offset="1" stopColor="#3D4ADB" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="manager-brand__text">
                                    <span className="manager-brand__name">HRMS</span>
                                    <span className="manager-brand__sub">Manager Portal</span>
                                </div>
                            </div>
                            <button className="manager-toggle" onClick={toggleSidebar}>
                                <FaTimes />
                            </button>
                        </>
                    ) : (
                        <button className="manager-toggle manager-toggle--alone" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                    )}
                </div>

                {/* Nav Label */}
                {sidebarOpen && <p className="manager-nav-label">Main Menu</p>}

                {/* Navigation */}
                <nav className="manager-nav">
                    {menuItems.map((item) => {
                        // ── Item WITH children (Dropdown) ───────────────────
                        if (item.children) {
                            const isOpen = openDropdown === item.key;
                            const isActive = item.key === 'leave' && isLeaveActive;

                            return (
                                <div key={item.key} className="manager-nav__group">
                                    <button
                                        className={`manager-nav__item manager-nav__item--parent ${isActive ? 'manager-nav__item--active-parent' : ''}`}
                                        onClick={() => toggleDropdown(item.key)}
                                        title={!sidebarOpen ? item.name : ''}
                                    >
                                        <span className="manager-nav__icon">{item.icon}</span>
                                        {sidebarOpen && (
                                            <>
                                                <span className="manager-nav__text">{item.name}</span>
                                                <FaChevronDown
                                                    className={`manager-nav__chevron ${isOpen ? 'manager-nav__chevron--open' : ''}`}
                                                />
                                            </>
                                        )}
                                        <span className="manager-nav__active-bar" />
                                    </button>

                                    {/* Submenu */}
                                    {sidebarOpen && (
                                        <div className={`manager-submenu ${isOpen ? 'manager-submenu--open' : ''}`}>
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `manager-submenu__item ${isActive ? 'manager-submenu__item--active' : ''}`
                                                    }
                                                >
                                                    <span className="manager-submenu__icon">{child.icon}</span>
                                                    <span className="manager-submenu__text">{child.name}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // ── Regular item ───────────────────────────────────
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                title={!sidebarOpen ? item.name : ''}
                                className={({ isActive }) =>
                                    `manager-nav__item ${isActive ? 'manager-nav__item--active' : ''}`
                                }
                            >
                                <span className="manager-nav__icon">{item.icon}</span>
                                {sidebarOpen && (
                                    <>
                                        <span className="manager-nav__text">{item.name}</span>
                                        <FaChevronRight className="manager-nav__arrow" />
                                    </>
                                )}
                                <span className="manager-nav__active-bar" />
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="manager-footer">
                    {sidebarOpen && (
                        <div className="manager-footer__profile">
                            <div className="manager-footer__avatar">
                                {userName?.charAt(0).toUpperCase() || 'M'}
                            </div>
                            <div className="manager-footer__info">
                                <span className="manager-footer__name">{userName || 'Manager'}</span>
                                <span className="manager-footer__role">{userRole || 'Manager'}</span>
                            </div>
                        </div>
                    )}
                    <button className="manager-logout" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}>
                        <FaSignOutAlt />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>

            </aside>
        </>
    );
};

export default ManagerSidebar;