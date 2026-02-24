import React from 'react';
import './EmptyState.css';

const EmptyState = ({ title, message, buttonText, onButtonClick, image }) => {
    return (
        <div className="empty-state-container">
            <div className="empty-state-content">
                <div className="empty-state-image itdb-pulse">
                    {image || '📭'}
                </div>
                <h3 className="empty-state-title">{title}</h3>
                <p className="empty-state-message">{message}</p>
                {buttonText && onButtonClick && (
                    <button onClick={onButtonClick} className="btn btn-primary empty-state-btn">
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
