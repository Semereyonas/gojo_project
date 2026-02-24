import React, { useState, useEffect, useCallback } from 'react';
import { getProjectActivities, getUserActivities } from '../services/api';
import './ActivityFeed.css';

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const ActivityFeed = ({ projectId, refreshKey, activities: initialActivities }) => {
    const [activities, setActivities] = useState(initialActivities || []);
    const [loading, setLoading] = useState(!initialActivities);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchActivities = useCallback(
        async (pageNum, isLoadMore = false) => {
            if (initialActivities && !isLoadMore) return;
            try {
                if (isLoadMore) setLoadingMore(true);
                else setLoading(true);

                let data;
                if (projectId) {
                    data = await getProjectActivities(projectId, pageNum);
                    setHasMore(data.currentPage < data.pages);
                    setActivities(prev =>
                        isLoadMore ? [...prev, ...data.activities] : data.activities
                    );
                    setPage(pageNum);
                } else {
                    data = await getUserActivities();
                    setActivities(data);
                    setHasMore(false);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [projectId, initialActivities]
    );

    useEffect(() => {
        if (initialActivities) {
            setActivities(initialActivities);
            setLoading(false);
        } else {
            fetchActivities(1, false);
        }
    }, [projectId, refreshKey, initialActivities, fetchActivities]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchActivities(nextPage, true);
    };

    const renderActionDescription = (activity) => {
        const { action, details } = activity;
        const targetName = details?.title || details?.name || 'an item';
        switch (action) {
            case 'created_task': return <span>created task <strong className="activity-target">{targetName}</strong></span>;
            case 'updated_task': return <span>updated task <strong className="activity-target">{targetName}</strong></span>;
            case 'deleted_task': return <span>deleted task <strong className="activity-target">{targetName}</strong></span>;
            case 'created_project': return <span>created project <strong className="activity-target">{targetName}</strong></span>;
            case 'updated_project': return <span>updated project <strong className="activity-target">{targetName}</strong></span>;
            case 'invited_member': return <span>invited <strong className="activity-target">{details?.email}</strong></span>;
            case 'joined_project': return <span>joined the project</span>;
            default: return <span>performed action: {action.replace('_', ' ')}</span>;
        }
    };

    const getActionIcon = (action) => {
        if (action.includes('created')) return '+';
        if (action.includes('updated')) return 'U';
        if (action.includes('deleted')) return 'X';
        return 'i';
    };

    if (loading && page === 1) return <div className="activity-loading">Loading activity...</div>;
    if (error) return <div className="activity-error">Error: {error}</div>;

    return (
        <div className="activity-feed-container">
            <div className="activity-list">
                {activities.length === 0 ? (
                    <div className="activity-empty">No recent activity.</div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity._id} className="activity-item">
                            <div className="activity-icon-column">
                                <div className="activity-icon-wrapper">{getActionIcon(activity.action)}</div>
                                <div className="activity-line"></div>
                            </div>
                            <div className="activity-content">
                                <div className="activity-user-row">
                                    <span className="activity-user-name">{activity.userId?.name}</span>
                                    <span className="activity-time">{formatTimeAgo(new Date(activity.createdAt))}</span>
                                </div>
                                <div className="activity-description">
                                    {renderActionDescription(activity)}
                                    {activity.projectId?.title && !projectId && (
                                        <span className="activity-project-tag"> in {activity.projectId.title}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {hasMore && (
                <div className="activity-footer">
                    <button className="btn-load-more" onClick={handleLoadMore} disabled={loadingMore}>
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
