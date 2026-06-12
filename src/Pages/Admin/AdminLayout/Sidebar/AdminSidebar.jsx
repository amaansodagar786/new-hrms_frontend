import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUsers,
    FaUserTie,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaCog,
    FaSignOutAlt,
    FaTimes,
    FaBars,
    FaChevronRight,
    FaUserPlus,
    FaListUl,
    FaChevronDown,
    FaLeaf,
    FaBullhorn
} from 'react-icons/fa';
import './AdminSidebar.scss';

const AdminSidebar = ({ sidebarOpen, toggleSidebar, handleLogout }) => {
    const location = useLocation();

    // Track which submenu is open
    const [openSubmenu, setOpenSubmenu] = useState(() => {
        // Auto-open if current route is under users
        if (location.pathname.startsWith('/admin/users')) return 'users';
        if (location.pathname.startsWith('/admin/leave')) return 'leave';
        return null;
    });

    const toggleSubmenu = (key) => {
        setOpenSubmenu(prev => prev === key ? null : key);
    };

    const menuItems = [
        {
            path: '/admin/dashboard',
            name: 'Dashboard',
            icon: <FaTachometerAlt />,
        },
        {
            key: 'users',
            name: 'User Management',
            icon: <FaUsers />,
            children: [
                { path: '/admin/users', name: 'All Users', icon: <FaListUl /> },
                { path: '/admin/users/create', name: 'Create User', icon: <FaUserPlus /> },
            ],
        },
        { path: '/admin/employees', name: 'Employees', icon: <FaUserTie /> },
        { path: '/admin/attendance', name: 'Attendance', icon: <FaCalendarAlt /> },
        {
            key: 'leave',
            name: 'Leave Management',
            icon: <FaLeaf />,
            children: [
                { path: '/admin/leave', name: 'All Leave Requests', icon: <FaListUl /> },
            ],
        },
        { path: '/admin/payroll', name: 'Payroll', icon: <FaMoneyBillWave /> },
        { path: '/admin/policies', name: 'Policies', icon: <FaCog /> },
        {
            path: '/admin/overview',
            name: 'Task Overview',
            icon: <FaUsers />,
        },
        { path: '/admin/announcements', name: 'Announcements', icon: <FaBullhorn /> },
        { path: '/admin/salary', name: 'Salary Manage', icon: <FaMoneyBillWave /> },
    ];

    const isUsersActive = location.pathname.startsWith('/admin/users');
    const isLeaveActive = location.pathname.startsWith('/admin/leave');

    return (
        <>
            {sidebarOpen && <div className="as-overlay" onClick={toggleSidebar} />}

            <aside className={`as-sidebar ${sidebarOpen ? 'as-sidebar--open' : 'as-sidebar--closed'}`}>

                {/* Header */}
                <div className="as-header">
                    <div className="as-brand">
                        <div className="as-brand__icon">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="12" fill="url(#sb-grad)" />
                                <path d="M20 10L30 15.5V25L20 30.5L10 25V15.5L20 10Z" stroke="white" strokeWidth="1.8" fill="none" />
                                <circle cx="20" cy="20" r="3.5" fill="white" />
                                <defs>
                                    <linearGradient id="sb-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#5A67F2" />
                                        <stop offset="1" stopColor="#3D4ADB" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <div className="as-brand__text">
                                <span className="as-brand__name">HRMS</span>
                                <span className="as-brand__sub">Admin Portal</span>
                            </div>
                        )}
                    </div>
                    <button className="as-toggle" onClick={toggleSidebar} title={sidebarOpen ? 'Collapse' : 'Expand'}>
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Nav Label */}
                {sidebarOpen && <p className="as-nav-label">Main Menu</p>}

                {/* Navigation */}
                <nav className="as-nav">
                    {menuItems.map((item, index) => {

                        // ── Item WITH submenu ──────────────────────────
                        if (item.children) {
                            const isOpen = openSubmenu === item.key;
                            const isActive = (item.key === 'users' && isUsersActive) || (item.key === 'leave' && isLeaveActive);

                            return (
                                <div key={item.key} className="as-nav__group">
                                    {/* Parent trigger */}
                                    <button
                                        className={`as-nav__item as-nav__item--parent ${isActive ? 'as-nav__item--active' : ''}`}
                                        onClick={() => {
                                            if (!sidebarOpen) toggleSidebar(); // expand sidebar first on collapsed
                                            toggleSubmenu(item.key);
                                        }}
                                        title={!sidebarOpen ? item.name : ''}
                                    >
                                        <span className="as-nav__icon">{item.icon}</span>
                                        {sidebarOpen && (
                                            <>
                                                <span className="as-nav__text">{item.name}</span>
                                                <FaChevronDown
                                                    className={`as-nav__chevron ${isOpen ? 'as-nav__chevron--open' : ''}`}
                                                />
                                            </>
                                        )}
                                        <span className="as-nav__active-bar" />
                                    </button>

                                    {/* Submenu */}
                                    {sidebarOpen && (
                                        <div className={`as-submenu ${isOpen ? 'as-submenu--open' : ''}`}>
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    end
                                                    className={({ isActive }) =>
                                                        `as-submenu__item ${isActive ? 'as-submenu__item--active' : ''}`
                                                    }
                                                >
                                                    <span className="as-submenu__icon">{child.icon}</span>
                                                    <span className="as-submenu__text">{child.name}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // ── Regular item ───────────────────────────────
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                title={!sidebarOpen ? item.name : ''}
                                className={({ isActive }) =>
                                    `as-nav__item ${isActive ? 'as-nav__item--active' : ''}`
                                }
                            >
                                <span className="as-nav__icon">{item.icon}</span>
                                {sidebarOpen && (
                                    <>
                                        <span className="as-nav__text">{item.name}</span>
                                        <FaChevronRight className="as-nav__arrow" />
                                    </>
                                )}
                                <span className="as-nav__active-bar" />
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="as-footer">
                    {sidebarOpen && (
                        <div className="as-footer__profile">
                            <div className="as-footer__avatar">A</div>
                            <div className="as-footer__info">
                                <span className="as-footer__name">Admin</span>
                                <span className="as-footer__role">Super Admin</span>
                            </div>
                        </div>
                    )}
                    <button className="as-logout" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}>
                        <FaSignOutAlt />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>

            </aside>
        </>
    );
};

export default AdminSidebar;