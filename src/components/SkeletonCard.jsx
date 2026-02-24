import React from 'react';
import './SkeletonCard.css';

export const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-header">
                <div className="skeleton-title"></div>
                <div className="skeleton-action"></div>
            </div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-meta"></div>
        </div>
    );
};

export const SkeletonProjectCard = () => {
    return (
        <div className="skeleton-project-card">
            <div className="skeleton-title medium"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-footer">
                <div className="skeleton-badge"></div>
                <div className="skeleton-date"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
