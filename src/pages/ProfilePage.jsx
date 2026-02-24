import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile, uploadAvatar, updateSettings, changePassword, deleteAccount, getApiOrigin } from '../services/api';
import useNotification from '../hooks/useNotification';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import Spinner from '../components/spinner.jsx';
import './ProfilePage.css';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const { notification, showNotification, hideNotification } = useNotification();
    const { logout } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        website: ''
    });

    const [settingsData, setSettingsData] = useState({
        emailNotifications: true,
        theme: 'light'
    });

    const [previewavatar, setPreviewAvatar] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setUser(data);
            setFormData({
                name: data.name || '',
                bio: data.bio || '',
                location: data.location || '',
                website: data.website || ''
            });
            if (data.settings) {
                setSettingsData({
                    emailNotifications: data.settings.emailNotifications ?? true,
                    theme: data.settings.theme || 'light'
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await updateProfile(formData);
            setUser(updatedUser);
            setFormData({
                name: updatedUser.name || '',
                bio: updatedUser.bio || '',
                location: updatedUser.location || '',
                website: updatedUser.website || ''
            });
            setIsEditingInfo(false);
            showNotification('Profile updated successfully', 'success');
        } catch (err) {
            showNotification(err.message || 'Failed to update profile', 'error');
        }
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedSettings = await updateSettings(settingsData);
            setUser({ ...user, settings: updatedSettings });
            showNotification('Settings saved', 'success');
        } catch (err) {
            showNotification(err.message || 'Failed to save settings', 'error');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showNotification('New password must be at least 6 characters', 'error');
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showNotification('Password changed successfully', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showNotification(err.message || 'Failed to change password', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            logout();
        } catch (err) {
            showNotification(err.message || 'Failed to delete account', 'error');
            setShowDeleteModal(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewAvatar(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const res = await uploadAvatar(formData);
            setUser({ ...user, avatar: res.avatar });
            showNotification('Avatar uploaded', 'success');
        } catch (err) {
            showNotification(err.message || 'Upload failed', 'error');
            setPreviewAvatar(null); // Revert preview on error
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spinner /></div>;
    if (error) return <div className="error">Error: {error}</div>;

    const avatarBase = getApiOrigin();
    const avatarUrl = previewavatar || (user.avatar ? `${avatarBase}/${user.avatar}` : 'https://via.placeholder.com/150');

    return (
        <div className="profile-page">
            <Notification
                message={notification?.message}
                type={notification?.type}
                onClose={hideNotification}
            />

            <div className="profile-header-card">
                <div className="profile-avatar-container">
                    <img src={avatarUrl} alt="Profile" className="profile-avatar" />
                    <label htmlFor="avatar-upload" className="avatar-upload-btn">
                        {uploading ? '...' : '📷'}
                    </label>
                    <input
                        type="file"
                        id="avatar-upload"
                        name="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                    />
                </div>
                <div className="profile-identity">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--itdb-gold)' }}>
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>
                            ITDB Official Identity
                        </span>
                    </div>
                    <h1>{user.name}</h1>
                    <div className="profile-identity-sub">
                        <p style={{ fontFamily: 'var(--itdb-font-mono)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{user.email}</p>
                        <Link to="/activity" className="ua-link-btn">View My Activity</Link>
                    </div>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('info');
                        setIsEditingInfo(false);
                    }}
                >
                    Profile Info
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Account Settings
                </button>
                <button
                    className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    Appearance
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'info' && (
                    <>
                        {!isEditingInfo && (
                            <div className="profile-info-card">
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Full Name</span>
                                    <span className="profile-info-value">{user.name || 'Not set'}</span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Bio</span>
                                    <span className="profile-info-value">
                                        {user.bio && user.bio.trim() !== '' ? user.bio : 'Tell your team a bit about yourself.'}
                                    </span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Location</span>
                                    <span className="profile-info-value">{user.location || 'Add your location'}</span>
                                </div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Website</span>
                                    <span className="profile-info-value">
                                        {user.website ? (
                                            <a href={user.website} target="_blank" rel="noreferrer">
                                                {user.website}
                                            </a>
                                        ) : (
                                            'Add a personal or company site'
                                        )}
                                    </span>
                                </div>
                                <div className="profile-info-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setIsEditingInfo(true)}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {isEditingInfo && (
                            <form onSubmit={handleInfoSubmit} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="profile-name">Full Name</label>
                                    <input
                                        type="text"
                                        id="profile-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profile-bio">Bio</label>
                                    <textarea
                                        id="profile-bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        maxLength="500"
                                    />
                                    <small>{formData.bio.length}/500</small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profile-location">Location</label>
                                    <input
                                        type="text"
                                        id="profile-location"
                                        name="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profile-website">Website</label>
                                    <input
                                        type="text"
                                        id="profile-website"
                                        name="website"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    />
                                </div>
                                <div className="profile-info-form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditingInfo(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        )}
                    </>
                )}

                {activeTab === 'settings' && (
                    <form onSubmit={handleSettingsSubmit} className="profile-form">
                        <div className="form-group checkbox-group">
                            <label htmlFor="email-notifications">
                                <input
                                    type="checkbox"
                                    id="email-notifications"
                                    name="emailNotifications"
                                    checked={settingsData.emailNotifications}
                                    onChange={(e) => setSettingsData({ ...settingsData, emailNotifications: e.target.checked })}
                                />
                                Receive Email Notifications
                            </label>
                        </div>
                        <button type="submit" className="btn btn-primary">Save Settings</button>

                        <div className="danger-zone">
                            <h3>Danger Zone</h3>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete Account
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'appearance' && (
                    <form onSubmit={handleSettingsSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="profile-theme">Theme</label>
                            <select
                                id="profile-theme"
                                name="theme"
                                value={settingsData.theme}
                                onChange={(e) => setSettingsData({ ...settingsData, theme: e.target.value })}
                            >
                                <option value="light">Light Mode</option>
                                <option value="dark">Dark Mode</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Save Appearance</button>
                    </form>
                )}

                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="current-password">Current Password</label>
                            <input
                                type="password"
                                id="current-password"
                                name="currentPassword"
                                autoComplete="current-password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new-password">New Password</label>
                            <input
                                type="password"
                                id="new-password"
                                name="newPassword"
                                autoComplete="new-password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-new-password">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirm-new-password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                                minLength="6"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Change Password</button>
                    </form>
                )}
            </div>

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Delete Account</h2>
                        <p>Are you sure you want to delete your account? This action cannot be undone and you will lose all your projects and tasks.</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleDeleteAccount} className="btn btn-danger">Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
