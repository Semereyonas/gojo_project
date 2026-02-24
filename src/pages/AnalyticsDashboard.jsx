import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getProjectStats,
    getBurndownData,
    getTeamProductivity,
    getProject,
    getDueDateAnalytics
} from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell,
    BarChart, Bar, AreaChart, Area
} from 'recharts';
import TaskCompletionChart from '../components/charts/TaskCompletionChart.jsx';
import ProjectStatusChart from '../components/charts/ProjectStatusChart.jsx';
import TeamProductivityChart from '../components/charts/TeamProductivityChart.jsx';
import BurndownChart from '../components/charts/BurndownChart.jsx';
import DueDateAnalytics from '../components/charts/DueDateAnalytics.jsx';
import ExportButton from '../components/ExportButton.jsx';
import WidgetGrid from '../components/dashboard/WidgetGrid.jsx';
import Spinner from '../components/spinner.jsx';
import './AnalyticsDashboard.css';

const COLORS = ['#4ecdc4', '#ff6b6b', '#f9dbbd', '#c7f9cc', '#a2d2ff'];

const AnalyticsDashboard = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState(null);
    const [burndown, setBurndown] = useState([]);
    const [teamData, setTeamData] = useState([]);
    const [dueData, setDueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('14'); // Default 14 days
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [projRes, statsRes, burndownRes, teamRes, dueRes] = await Promise.all([
                getProject(projectId),
                getProjectStats(projectId),
                getBurndownData(projectId),
                getTeamProductivity(projectId),
                getDueDateAnalytics(projectId)
            ]);

            setProject(projRes);
            setStats(statsRes);
            setBurndown(burndownRes);
            setTeamData(teamRes);
            setDueData(dueRes);
            setLoading(false);
        } catch (err) {
            setError('Failed to load analytics data');
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spinner /></div>;
    if (error) return <div className="analytics-error">{error}</div>;

    const pieData = [
        { name: 'Todo', value: stats.todo },
        { name: 'In Progress', value: stats.inProgress },
        { name: 'Done', value: stats.done }
    ];

    return (
        <div className="analytics-page">
            <header className="analytics-header">
                <div className="header-left">
                    <Link to={`/projects/${projectId}`} className="back-link">← Back to Project</Link>
                    <h1>{project?.title} - Analytics</h1>
                </div>
                <div className="header-actions">
                    <select id="analytics-date-range" name="dateRange" aria-label="Date range" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="date-picker">
                        <option value="7">Last 7 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                    <ExportButton projectId={projectId} />
                </div>
            </header>

            <div className="analytics-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={activeTab === 'team' ? 'active' : ''}
                    onClick={() => setActiveTab('team')}
                >
                    Team Performance
                </button>
                <button
                    className={activeTab === 'trends' ? 'active' : ''}
                    onClick={() => setActiveTab('trends')}
                >
                    Trends
                </button>
                <button
                    className={activeTab === 'deadlines' ? 'active' : ''}
                    onClick={() => setActiveTab('deadlines')}
                >
                    Deadlines & Predictions
                </button>
                <button
                    className={activeTab === 'widgets' ? 'active' : ''}
                    onClick={() => setActiveTab('widgets')}
                >
                    Interactive Hub
                </button>
            </div>

            <div className="analytics-content">
                {activeTab === 'overview' && (
                    <div className="tab-pane overview-pane">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Tasks</h3>
                                <p className="stat-value">{stats.total}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Completed</h3>
                                <p className="stat-value">{stats.done}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Completion Rate</h3>
                                <p className="stat-value">{stats.completionRate}%</p>
                            </div>
                            <div className="stat-card urgent">
                                <h3>Overdue</h3>
                                <p className="stat-value">{stats.overdue}</p>
                            </div>
                        </div>

                        <div className="charts-row">
                            <div className="chart-container pie-chart-box">
                                <h3>Status Distribution</h3>
                                <ProjectStatusChart
                                    data={pieData}
                                    onSliceClick={(status) => alert(`Filtering by ${status} - (UI filtering to be implemented in ProjectDetailPage)`)}
                                />
                            </div>

                            <div className="chart-container burndown-box">
                                <h3>Project Burndown (Ideal vs Actual)</h3>
                                <BurndownChart data={burndown} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="tab-pane team-pane">
                        <div className="chart-container member-productivity-box full-width">
                            <h3>Member Performance & Leaderboard</h3>
                            <TeamProductivityChart data={teamData} />
                        </div>
                    </div>
                )}

                {activeTab === 'trends' && (
                    <div className="tab-pane trends-pane">
                        <div className="chart-container full-width">
                            <h3>Cumulative Completion & Daily Activity</h3>
                            <TaskCompletionChart data={burndown} />
                        </div>
                    </div>
                )}

                {activeTab === 'deadlines' && dueData && (
                    <div className="tab-pane deadlines-pane">
                        <DueDateAnalytics data={dueData} />
                    </div>
                )}

                {activeTab === 'widgets' && (
                    <div className="tab-pane widgets-pane">
                        <WidgetGrid projectId={projectId} />
                    </div>
                )}
            </div>
        </div >
    );
};

export default AnalyticsDashboard;
