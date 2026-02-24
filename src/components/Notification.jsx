import React, { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!message) return null;

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    return (
        <div className={`notification-container ${type} ${isVisible ? 'slide-in' : 'slide-out'}`}>
            <div className="notification-icon">{icons[type] || icons.info}</div>
            <div className="notification-message">{message}</div>
            <button className="notification-close" onClick={() => {
                setIsVisible(false);
                if (onClose) onClose();
            }}>
                &times;
            </button>
        </div>
    );
};

export default Notification;
