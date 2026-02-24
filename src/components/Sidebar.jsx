import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiOrigin } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const origin = getApiOrigin();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (!user) return null;

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12L12 3L21 12" stroke="var(--itdb-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 10V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10" stroke="var(--itdb-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'white' }}>ITDB</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <span className="nav-icon">📊</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📁</span>
                    <span>Projects</span>
                </NavLink>

                <NavLink to="/discussions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">💬</span>
                    <span>Discussions</span>
                </NavLink>

                <NavLink to="/activity" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📈</span>
                    <span>Activity</span>
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">👤</span>
                    <span>Profile</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile-preview">
                    {user.avatar ? (
                        <img
                            src={user.avatar.startsWith('http') ? user.avatar : `${origin}/${user.avatar}`}
                            alt={user.name}
                            className="user-avatar-mini"
                        />
                    ) : (
                        <div className="user-avatar-mini">{user.name.charAt(0)}</div>
                    )}
                    <div className="user-info-container">
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--itdb-font-sans)' }}>Contributor</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sidebar-logout-btn"
                        title="Terminate Session"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                            <line x1="12" y1="2" x2="12" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {showLogoutConfirm && (
                <ConfirmDialog
                    title="Logout?"
                    message="Are you sure you want to logout from your account?"
                    confirmText="Logout"
                    onConfirm={confirmLogout}
                    onCancel={() => setShowLogoutConfirm(false)}
                />
            )}
        </aside>
    );
};

export default Sidebar;
