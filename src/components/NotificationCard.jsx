import React from 'react';
import './NotificationCard.css';

const NotificationCard = ({ notification, onRead }) => {
    const { sender, type, message, createdAt, isRead } = notification;

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    const getIcon = () => {
        switch (type) {
            case 'mention': return '💬';
            case 'assignment': return '👤';
            case 'status_change': return '⚡';
            case 'project_invite': return '📩';
            default: return '🔔';
        }
    };

    return (
        <div
            className={`notification-card ${!isRead ? 'unread' : ''}`}
            onClick={() => !isRead && onRead(notification._id)}
        >
            <div className="notification-icon">
                {sender?.avatar ? (
                    <img src={sender.avatar} alt={sender.name} className="sender-avatar" />
                ) : (
                    <div className="icon-fallback">{getIcon()}</div>
                )}
            </div>
            <div className="notification-content">
                <p className="notification-message">
                    <span className="sender-name">{sender?.name}</span> {message.replace(sender?.name, '').trim()}
                </p>
                <span className="notification-time">{formatTime(createdAt)}</span>
            </div>
            {!isRead && <div className="unread-dot"></div>}
        </div>
    );
};

export default NotificationCard;
