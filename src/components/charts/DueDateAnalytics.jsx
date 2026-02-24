import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from 'recharts';
import SafeChartContainer from './SafeChartContainer';

/**
 * DueDateAnalytics
 * Visualizes tasks due by day, highlighting overdue ones
 * Includes predictive completion insights
 */
const DueDateAnalytics = ({ data }) => {
    const { dailyDistribution, predictedCompletionDate, overdueCount, velocity } = data;

    // Heatmap calculation (simplified grid)
    const renderHeatmap = () => {
        // Group by week for a simple calendar view
        const weeks = [];
        let currentWeek = [];

        dailyDistribution.forEach((day, index) => {
            currentWeek.push(day);
            if (currentWeek.length === 7 || index === dailyDistribution.length - 1) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        return (
            <div className="deadline-heatmap">
                <div className="heatmap-header">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div className="heatmap-grid">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="heatmap-week">
                            {week.map((day, dIndex) => {
                                const intensity = Math.min(day.total / 5, 1);
                                return (
                                    <div
                                        key={dIndex}
                                        className="heatmap-cell"
                                        title={`${day.date}: ${day.total} tasks`}
                                        style={{
                                            backgroundColor: day.total > 0 ? `rgba(78, 205, 196, ${0.2 + intensity * 0.8})` : 'rgba(255,255,255,0.05)',
                                            border: day.overdue > 0 ? '1px solid #ff6b6b' : 'none'
                                        }}
                                    >
                                        {day.total > 0 && <span>{day.total}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="due-date-analytics">
            <div className="predictions-banner">
                <div className="prediction-item">
                    <span className="label">Current Velocity</span>
                    <span className="value">{velocity} tasks/day</span>
                </div>
                <div className="prediction-item">
                    <span className="label">Projected Finish</span>
                    <span className="value accent">{predictedCompletionDate ? new Date(predictedCompletionDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="prediction-item">
                    <span className="label">Total Overdue</span>
                    <span className="value danger">{overdueCount}</span>
                </div>
            </div>

            <div className="chart-row">
                <div className="chart-container deadline-distribution">
                    <h3>Deadline Distribution (Next 14 Days)</h3>
                    <SafeChartContainer width="100%" height={300}>
                        <BarChart data={dailyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="remaining" name="Tasks Due" fill="#4ecdc4" radius={[4, 4, 0, 0]}>
                                {dailyDistribution.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.overdue > 0 ? '#ff6b6b' : '#4ecdc4'}
                                    />
                                ))}
                            </Bar>
                            <Bar dataKey="completed" name="Completed" fill="rgba(78, 205, 196, 0.2)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </SafeChartContainer>
                </div>

                <div className="chart-container heatmap-box">
                    <h3>Deadline Heatmap</h3>
                    {renderHeatmap()}
                    <div className="heatmap-legend">
                        <span>Less Tasks</span>
                        <div className="legend-scale">
                            <div style={{ background: 'rgba(78, 205, 196, 0.2)' }}></div>
                            <div style={{ background: 'rgba(78, 205, 196, 0.5)' }}></div>
                            <div style={{ background: 'rgba(78, 205, 196, 0.8)' }}></div>
                            <div style={{ background: 'rgba(78, 205, 196, 1)' }}></div>
                        </div>
                        <span>More Tasks</span>
                        <span className="overdue-key"><span className="dot"></span> Overdue items</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DueDateAnalytics;
