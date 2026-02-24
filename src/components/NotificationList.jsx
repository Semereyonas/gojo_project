import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import NotificationCard from './NotificationCard';
import './NotificationList.css';

const NotificationList = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleReadAll = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notifications-dropdown" ref={dropdownRef}>
            <div className="notifications-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                    <button className="mark-all-btn" onClick={handleReadAll}>
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="notifications-body">
                {loading ? (
                    <div className="notif-loading">Syncing alerts...</div>
                ) : notifications.length === 0 ? (
                    <div className="notif-empty">
                        <span className="empty-icon">🔕</span>
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <NotificationCard
                            key={notif._id}
                            notification={notif}
                            onRead={handleRead}
                        />
                    ))
                )}
            </div>

            <div className="notifications-footer">
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default NotificationList;
