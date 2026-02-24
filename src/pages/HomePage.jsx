import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalOverview } from '../services/api';
import ProjectStatusChart from '../components/charts/ProjectStatusChart.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import Spinner from '../components/spinner.jsx';
import './AnalyticsDashboard.css';
import './HomePage.css';

const HomePage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const overviewData = await getGlobalOverview();
                setData(overviewData);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load dashboard overview');
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spinner /></div>;
    if (error) return <div className="analytics-error">{error}</div>;

    const pieData = data ? [
        { name: 'Todo', value: data.statusBreakdown?.todo || 0 },
        { name: 'In Progress', value: data.statusBreakdown?.inProgress || 0 },
        { name: 'Done', value: data.statusBreakdown?.done || 0 }
    ] : [];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Welcome back to your Workspace</h1>
                    <p className="welcome-subtitle">Here is what's happening across your projects today.</p>
                </div>
                <Link to="/projects" className="btn-primary">
                    View All Projects
                </Link>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Active Projects</h3>
                    <p className="stat-value">{data.summary?.totalProjects || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Tasks</h3>
                    <p className="stat-value">{data.summary?.totalTasks || 0}</p>
                </div>
                <div className="stat-card success">
                    <h3>Completion Rate</h3>
                    <p className="stat-value">{data.summary?.completionRate || 0}%</p>
                </div>
                <div className="stat-card danger">
                    <h3>Late Tasks</h3>
                    <p className="stat-value">{data.summary?.overdueTasks || 0}</p>
                </div>
            </div>

            <div className="dashboard-main-grid">
                <div className="dashboard-left-column">
                    <div className="chart-container">
                        <h3>Status Distribution (Global)</h3>
                        <div style={{ height: '300px' }}>
                            <ProjectStatusChart data={pieData} />
                        </div>
                    </div>

                    <div className="projects-overview-card mt-24">
                        <h3>Top Projects</h3>
                        <div className="project-list-summary">
                            {data.projectsStats?.map(project => (
                                <Link to={`/projects/${project.id}`} key={project.id} className="project-summary-item">
                                    <div className="project-info">
                                        <span className="project-name">
                                            <span className={`itdb-trend-dot ${project.progress > 80 ? 'itdb-trend-success' : project.progress > 40 ? 'itdb-trend-warning' : 'itdb-trend-danger'}`}></span>
                                            {project.name}
                                        </span>
                                        <span className="project-task-count" style={{ fontFamily: 'var(--itdb-font-mono)', fontSize: '0.75rem' }}>{project.done}/{project.total} tasks</span>
                                    </div>
                                    <div className="project-progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${project.progress}%`,
                                                background: project.progress > 80 ? 'var(--itdb-success)' : project.progress > 40 ? 'var(--itdb-warning)' : 'var(--itdb-danger)'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="progress-percent" style={{ fontFamily: 'var(--itdb-font-mono)' }}>{project.progress}%</span>
                                </Link>
                            ))}
                            {(!data.projectsStats || data.projectsStats.length === 0) && (
                                <p className="empty-msg">No active projects yet. <Link to="/projects">Create one!</Link></p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-right-column">
                    <div className="activity-card">
                        <h3>Recent Activity</h3>
                        <ActivityFeed activities={data.recentActivities} />
                        <Link to="/activity" className="view-all-link">View Full Activity Log</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
