import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import SafeChartContainer from './SafeChartContainer';

/**
 * TeamProductivityChart
 * Displays a leaderboard style bar chart for team members
 * Shows stacked status breakdown and productivity score labels
 */
const TeamProductivityChart = ({ data }) => {
    // Sort data by score (leaderboard style)
    const sortedData = [...data].sort((a, b) => b.score - a.score);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const memberData = payload[0].payload;
            return (
                <div className="custom-chart-tooltip" style={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
                }}>
                    <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '8px' }}>{label}</strong>
                    <div style={{ fontSize: '0.85rem' }}>
                        <p style={{ color: '#4ecdc4', margin: '4px 0' }}>Done: {memberData.done}</p>
                        <p style={{ color: '#ff6b6b', margin: '4px 0' }}>In Progress: {memberData.inProgress}</p>
                        <p style={{ color: '#94a3b8', margin: '4px 0' }}>Todo: {memberData.todo}</p>
                        <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0' }} />
                        <p style={{ color: '#f9dbbd', margin: '4px 0' }}>Avg. Clear Time: {memberData.avgCompletionTime} days</p>
                        <p style={{ color: '#4ecdc4', fontWeight: 600, margin: '4px 0' }}>Productivity: {memberData.score}%</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="team-productivity-chart" style={{ width: '100%', height: 450 }}>
            <SafeChartContainer width="100%" height={300}>
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />

                    {/* Stacked bars by status */}
                    <Bar dataKey="done" name="Done" stackId="a" fill="#4ecdc4" radius={[0, 0, 0, 0]} barSize={20} />
                    <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#ff6b6b" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="todo" name="Todo" stackId="a" fill="rgba(255,255,255,0.1)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </SafeChartContainer>

            <div className="productivity-leaderboard" style={{ marginTop: '2rem' }}>
                <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Performance Leaderboard</h4>
                <div className="leaderboard-list">
                    {sortedData.map((member, index) => (
                        <div key={member.name} className="leaderboard-item" style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            background: index === 0 ? 'rgba(78, 205, 196, 0.05)' : 'transparent',
                            borderRadius: '8px',
                            marginBottom: '4px',
                            border: index === 0 ? '1px solid rgba(78, 205, 196, 0.1)' : '1px solid transparent'
                        }}>
                            <span style={{ width: '24px', fontWeight: 700, color: index === 0 ? '#4ecdc4' : '#64748b' }}>#{index + 1}</span>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', marginRight: '12px', overflow: 'hidden' }}>
                                {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{member.name[0]}</div>}
                            </div>
                            <span style={{ flex: 1, fontWeight: 500, color: '#f8fafc' }}>{member.name}</span>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4ecdc4' }}>{member.score}%</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{member.avgCompletionTime}d avg</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamProductivityChart;
