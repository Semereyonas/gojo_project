import React, { useState, useEffect } from 'react';
import {
    getProjectStats,
    getDueDateAnalytics,
    getTeamProductivity,
    getBurndownData,
    fetchWithAuth
} from '../../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import SafeChartContainer from '../charts/SafeChartContainer';

const COLORS = ['#4ecdc4', '#ff6b6b', '#f9dbbd', '#c7f9cc'];

const WidgetContainer = ({ title, children, loading, error }) => (
    <div className="widget-inner">
        <div className="widget-header">
            <h4>{title}</h4>
            <span className="drag-handle">⠿</span>
        </div>
        <div className="widget-body">
            {loading ? <div className="widget-skeleton">Loading...</div> :
                error ? <div className="widget-error">{error}</div> : children}
        </div>
    </div>
);

export const QuickStatsWidget = ({ projectId }) => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        getProjectStats(projectId)
            .then(setStats)
            .catch(() => setError('Failed to load stats'));
    }, [projectId]);

    return (
        <WidgetContainer title="At a Glance" loading={!stats && !error} error={error}>
            {stats && (
                <div className="quick-stats-grid">
                    <div className="q-stat">
                        <span className="label">Total</span>
                        <span className="value">{stats.total}</span>
                    </div>
                    <div className="q-stat">
                        <span className="label">Done</span>
                        <span className="value accent">{stats.done}</span>
                    </div>
                    <div className="q-stat urgent">
                        <span className="label">Overdue</span>
                        <span className="value danger">{stats.overdue}</span>
                    </div>
                </div>
            )}
        </WidgetContainer>
    );
};

export const TaskCompletionWidget = ({ projectId }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        getProjectStats(projectId)
            .then(stats => {
                setData([
                    { name: 'Done', value: stats.done || 0 },
                    { name: 'Remaining', value: (stats.total || 0) - (stats.done || 0) }
                ]);
            })
            .catch(() => setError('Data unavailable'));
    }, [projectId]);

    return (
        <WidgetContainer title="Completion Rate" loading={data.length === 0 && !error} error={error}>
            <SafeChartContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </SafeChartContainer>
        </WidgetContainer>
    );
};

export const UpcomingDeadlinesWidget = ({ projectId }) => {
    const [deadlines, setDeadlines] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDueDateAnalytics(projectId)
            .then(res => {
                if (res && res.dailyDistribution) {
                    const upcoming = res.dailyDistribution
                        .filter(d => d.total > 0 && new Date(d.fullDate) >= new Date())
                        .slice(0, 5);
                    setDeadlines(upcoming);
                }
            })
            .catch(() => setError('Check deadlines failed'))
            .finally(() => setLoading(false));
    }, [projectId]);

    return (
        <WidgetContainer title="Upcoming Deadlines" loading={loading} error={error}>
            <div className="deadline-list">
                {deadlines.length > 0 ? deadlines.map((d, i) => (
                    <div key={i} className="deadline-row">
                        <span className="date">{d.date}</span>
                        <span className="count">{d.total} tasks</span>
                    </div>
                )) : <p className="empty-msg">No upcoming deadlines</p>}
            </div>
        </WidgetContainer>
    );
};

export const TeamWorkloadWidget = ({ projectId }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTeamProductivity(projectId)
            .then(setData)
            .catch(() => setError('Workload data error'))
            .finally(() => setLoading(false));
    }, [projectId]);

    return (
        <WidgetContainer title="Team Workload" loading={loading} error={error}>
            <SafeChartContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={10} stroke="#94a3b8" />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="total" fill="#4ecdc4" radius={[0, 4, 4, 0]} />
                </BarChart>
            </SafeChartContainer>
        </WidgetContainer>
    );
};

export const RecentActivityWidget = ({ projectId }) => {
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWithAuth(`/activities?projectId=${projectId}&limit=5`)
            .then(res => setActivities(res.activities || []))
            .catch(() => setError('Activity feed offline'))
            .finally(() => setLoading(false));
    }, [projectId]);

    return (
        <WidgetContainer title="Recent Activity" loading={loading} error={error}>
            <div className="mini-activity-feed">
                {activities.length > 0 ? activities.map((act, i) => (
                    <div key={i} className="mini-act-item">
                        <p className="msg"><strong>{act.userId?.name || 'User'}</strong> {act.action?.replace('_', ' ')}</p>
                        <span className="time">{new Date(act.createdAt).toLocaleDateString()}</span>
                    </div>
                )) : <p className="empty-msg">No recent activity</p>}
            </div>
        </WidgetContainer>
    );
};
