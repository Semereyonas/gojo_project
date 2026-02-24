import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getUserActivities, getProjects } from '../services/api';
import Spinner from '../components/spinner.jsx';
import './UserActivityPage.css';

// Custom lightweight time-ago helper
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

const UserActivityPage = () => {
    const [activities, setActivities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [activityData, projectData] = await Promise.all([
                    getUserActivities(),
                    getProjects()
                ]);
                setActivities(activityData);
                setProjects(projectData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const matchesSearch =
                activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (activity.details?.title || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesProject = projectFilter === 'all' || activity.projectId?._id === projectFilter;

            return matchesSearch && matchesProject;
        });
    }, [activities, searchQuery, projectFilter]);

    const groupedActivities = useMemo(() => {
        const groups = {};
        filteredActivities.forEach(activity => {
            const date = new Date(activity.createdAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(activity);
        });
        return groups;
    }, [filteredActivities]);

    const renderActionDescription = (activity) => {
        const { action, details } = activity;
        const targetName = details?.title || details?.name || 'an item';

        switch (action) {
            case 'created_task': return <span>created task <strong className="ua-target">{targetName}</strong></span>;
            case 'updated_task': return <span>updated task <strong className="ua-target">{targetName}</strong></span>;
            case 'deleted_task': return <span>deleted task <strong className="ua-target">{targetName}</strong></span>;
            case 'created_project': return <span>created project <strong className="ua-target">{targetName}</strong></span>;
            case 'updated_project': return <span>updated project <strong className="ua-target">{targetName}</strong></span>;
            case 'invited_member': return <span>invited <strong className="ua-target">{details?.email}</strong></span>;
            case 'joined_project': return <span>joined project as <strong className="ua-target">{details?.role}</strong></span>;
            default: return <span>{action.replace('_', ' ')}</span>;
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spinner /></div>;
    if (error) return <div className="ua-page-error">Error: {error}</div>;

    return (
        <div className="ua-page-container">
            <header className="ua-header">
                <div className="ua-header-content">
                    <h1>My Activity</h1>
                    <p>Track your contributions across all projects</p>
                </div>
                <Link to="/profile" className="btn-back">Back to Profile</Link>
            </header>

            <div className="ua-filters-bar">
                <div className="ua-search-wrapper">
                    <input
                        type="text"
                        id="activity-search"
                        name="searchQuery"
                        aria-label="Search activity"
                        placeholder="Search activity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ua-search-input"
                    />
                </div>
                <label htmlFor="activity-project-filter" className="sr-only">Filter by project</label>
                <select
                    id="activity-project-filter"
                    name="projectFilter"
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="ua-project-select"
                >
                    <option value="all">All Projects</option>
                    {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div className="ua-content">
                {Object.keys(groupedActivities).length === 0 ? (
                    <div className="ua-empty">No activity found matching your criteria.</div>
                ) : (
                    Object.keys(groupedActivities).map(date => (
                        <div key={date} className="ua-date-group">
                            <h2 className="ua-date-header">{date}</h2>
                            <div className="ua-activity-list">
                                {groupedActivities[date].map(activity => (
                                    <div key={activity._id} className="ua-activity-item">
                                        <div className="ua-item-time">
                                            {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="ua-item-content">
                                            <div className="ua-item-desc">
                                                {renderActionDescription(activity)}
                                            </div>
                                            <div className="ua-item-meta">
                                                <span className="ua-project-tag">{activity.projectId?.title || 'Unknown Project'}</span>
                                                <span className="ua-time-ago">{formatTimeAgo(new Date(activity.createdAt))}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserActivityPage;
