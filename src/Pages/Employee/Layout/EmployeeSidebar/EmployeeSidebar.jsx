import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaUser,
    FaClock,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaBell,
    FaSignOutAlt,
    FaTimes,
    FaBars,
    FaChevronRight,
    FaTasks,
    FaStar,
    FaBullhorn 
} from 'react-icons/fa';
import './EmployeeSidebar.scss';

const EmployeeSidebar = ({ sidebarOpen, toggleSidebar, handleLogout, userName, userRole }) => {

    const menuItems = [
        { path: '/employee/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/employee/profile', name: 'My Profile', icon: <FaUser /> },
        { path: '/employee/attendance', name: 'Attendance', icon: <FaClock /> },
        { path: '/employee/leave', name: 'Apply Leave', icon: <FaCalendarAlt /> },
        { path: '/employee/performance', name: 'My Tasks', icon: <FaTasks /> },
        { path: '/employee/performance', name: 'Performance', icon: <FaStar /> },
        { path: '/employee/salary', name: 'Salary', icon: <FaMoneyBillWave /> },
        { path: '/employee/announcements', name: 'Announcements', icon: <FaBullhorn  /> },
    ];

    return (
        <>
            {sidebarOpen && <div className="es-overlay" onClick={toggleSidebar} />}

            <aside className={`es-sidebar ${sidebarOpen ? 'es-sidebar--open' : 'es-sidebar--closed'}`}>

                {/* Header */}
                <div className="es-header">
                    <div className="es-brand">
                        <div className="es-brand__icon">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="12" fill="url(#es-grad)" />
                                <path d="M20 10L30 15.5V25L20 30.5L10 25V15.5L20 10Z" stroke="white" strokeWidth="1.8" fill="none" />
                                <circle cx="20" cy="20" r="3.5" fill="white" />
                                <defs>
                                    <linearGradient id="es-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#10B981" />
                                        <stop offset="1" stopColor="#059669" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        {sidebarOpen && (
                            <div className="es-brand__text">
                                <span className="es-brand__name">HRMS</span>
                                <span className="es-brand__sub">Employee Portal</span>
                            </div>
                        )}
                    </div>
                    <button className="es-toggle" onClick={toggleSidebar} title={sidebarOpen ? 'Collapse' : 'Expand'}>
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Nav Label */}
                {sidebarOpen && <p className="es-nav-label">Quick Access</p>}

                {/* Navigation */}
                <nav className="es-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            title={!sidebarOpen ? item.name : ''}
                            className={({ isActive }) =>
                                `es-nav__item ${isActive ? 'es-nav__item--active' : ''}`
                            }
                        >
                            <span className="es-nav__icon">{item.icon}</span>
                            {sidebarOpen && (
                                <>
                                    <span className="es-nav__text">{item.name}</span>
                                    <FaChevronRight className="es-nav__arrow" />
                                </>
                            )}
                            <span className="es-nav__active-bar" />
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="es-footer">
                    {sidebarOpen && (
                        <div className="es-footer__profile">
                            <div className="es-footer__avatar">
                                {userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="es-footer__info">
                                <span className="es-footer__name">{userName || 'Employee'}</span>
                                <span className="es-footer__role">{userRole || 'Employee'}</span>
                            </div>
                        </div>
                    )}
                    <button className="es-logout" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}>
                        <FaSignOutAlt />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>

            </aside>
        </>
    );
};

export default EmployeeSidebar;