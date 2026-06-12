import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaUsers, FaCalendarAlt, FaMoneyBillWave,
    FaCog, FaBell, FaSignOutAlt, FaTimes, FaBars,
    FaChevronRight, FaUser, FaChevronDown, FaLeaf ,  
} from 'react-icons/fa';
import './HRSidebar.scss';

const HRSidebar = ({ sidebarOpen, toggleSidebar, handleLogout, userName, userRole }) => {

    const location = useLocation();
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (key) => {
        if (!sidebarOpen) {
            // If sidebar is closed, open it first
            toggleSidebar();
            setOpenDropdown(key);
        } else {
            setOpenDropdown(openDropdown === key ? null : key);
        }
    };

    const menuItems = [
        { path: '/hr/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/hr/profile', name: 'My Profile', icon: <FaUser /> },
        { path: '/hr/employees', name: 'All Employees', icon: <FaUsers /> },
        { path: '/hr/attendance', name: 'Attendance', icon: <FaCalendarAlt /> },
        {
            key: 'leave',
            name: 'Leave',
            icon: <FaLeaf />,
            children: [
                { path: '/hr/leave/self', name: 'My Leave', icon: <FaUser /> },
                { path: '/hr/leave/all', name: 'Leave Management', icon: <FaUsers /> },
            ]
        },
        { path: '/hr/payroll', name: 'Payroll', icon: <FaMoneyBillWave /> },
        { path: '/hr/policies', name: 'Policies', icon: <FaCog /> },
        { path: '/hr/announcements', name: 'Announcements', icon: <FaBell /> },
        {
            path: '/hr/overview',
            name: 'Task Overview',
            icon: <FaUsers />,
        },
        {
            path: '/hr/salary',
            name: 'Salary',
            icon: <FaUsers />,
        },
        {
    path: '/hr/policies',
    name: 'Policies',
    icon: <FaCog />,
},
    ];

    // Check if any child of leave is active
    const isLeaveActive = location.pathname.startsWith('/hr/leave');

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && <div className="hrs-overlay" onClick={toggleSidebar} />}

            <aside className={`hrs-sidebar ${sidebarOpen ? 'hrs-sidebar--open' : 'hrs-sidebar--closed'}`}>

                {/* Header */}
                <div className="hrs-header">
                    {sidebarOpen ? (
                        <>
                            <div className="hrs-brand">
                                <div className="hrs-brand__icon">
                                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="40" height="40" rx="12" fill="url(#hrs-grad)" />
                                        <path d="M20 10L30 15.5V25L20 30.5L10 25V15.5L20 10Z" stroke="white" strokeWidth="1.8" fill="none" />
                                        <circle cx="20" cy="20" r="3.5" fill="white" />
                                        <defs>
                                            <linearGradient id="hrs-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#5A67F2" />
                                                <stop offset="1" stopColor="#3D4ADB" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="hrs-brand__text">
                                    <span className="hrs-brand__name">HRMS</span>
                                    <span className="hrs-brand__sub">HR Portal</span>
                                </div>
                            </div>
                            <button className="hrs-toggle" onClick={toggleSidebar} title="Collapse">
                                <FaTimes />
                            </button>
                        </>
                    ) : (
                        /* Closed — hamburger only, centered */
                        <button className="hrs-toggle hrs-toggle--alone" onClick={toggleSidebar} title="Expand">
                            <FaBars />
                        </button>
                    )}
                </div>

                {/* Nav Label */}
                {/* {sidebarOpen && <p className="hrs-nav-label">Main Menu</p>} */}

                {/* Navigation */}
                <nav className="hrs-nav">
                    {menuItems.map((item) => {
                        // ── Item WITH children (Dropdown) ───────────────────
                        if (item.children) {
                            const isOpen = openDropdown === item.key;
                            const isActive = item.key === 'leave' && isLeaveActive;

                            return (
                                <div key={item.key} className="hrs-nav__group">
                                    <button
                                        className={`hrs-nav__item hrs-nav__item--parent ${isActive ? 'hrs-nav__item--active-parent' : ''}`}
                                        onClick={() => toggleDropdown(item.key)}
                                        title={!sidebarOpen ? item.name : ''}
                                    >
                                        <span className="hrs-nav__icon">{item.icon}</span>
                                        {sidebarOpen && (
                                            <>
                                                <span className="hrs-nav__text">{item.name}</span>
                                                <FaChevronDown
                                                    className={`hrs-nav__chevron ${isOpen ? 'hrs-nav__chevron--open' : ''}`}
                                                />
                                            </>
                                        )}
                                        <span className="hrs-nav__active-bar" />
                                    </button>

                                    {/* Submenu */}
                                    {sidebarOpen && (
                                        <div className={`hrs-submenu ${isOpen ? 'hrs-submenu--open' : ''}`}>
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `hrs-submenu__item ${isActive ? 'hrs-submenu__item--active' : ''}`
                                                    }
                                                >
                                                    <span className="hrs-submenu__icon">{child.icon}</span>
                                                    <span className="hrs-submenu__text">{child.name}</span>
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
                                    `hrs-nav__item ${isActive ? 'hrs-nav__item--active' : ''}`
                                }
                            >
                                <span className="hrs-nav__icon">{item.icon}</span>
                                {sidebarOpen && (
                                    <>
                                        <span className="hrs-nav__text">{item.name}</span>
                                        <FaChevronRight className="hrs-nav__arrow" />
                                    </>
                                )}
                                <span className="hrs-nav__active-bar" />
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="hrs-footer">
                    {sidebarOpen && (
                        <div className="hrs-footer__profile">
                            <div className="hrs-footer__avatar">
                                {userName?.charAt(0).toUpperCase() || 'H'}
                            </div>
                            <div className="hrs-footer__info">
                                <span className="hrs-footer__name">{userName || 'HR User'}</span>
                                <span className="hrs-footer__role">{userRole || 'HR'}</span>
                            </div>
                        </div>
                    )}
                    <button className="hrs-logout" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}>
                        <FaSignOutAlt />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>

            </aside>
        </>
    );
};

export default HRSidebar;