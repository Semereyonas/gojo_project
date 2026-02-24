import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceDot,
    Label
} from 'recharts';
import SafeChartContainer from './SafeChartContainer';

/**
 * BurndownChart
 * Compares actual remaining tasks vs ideal trajectory
 * Highlights project milestones with markers
 */
const BurndownChart = ({ data }) => {
    // Generate milestone markers for the chart
    const milestoneMarkers = data
        .filter(d => d.milestones)
        .map((d, index) => (
            <ReferenceDot
                key={`milestone-${index}`}
                x={d.date}
                y={d.remaining}
                r={6}
                fill="#ffb300"
                stroke="#fff"
                strokeWidth={2}
            >
                <Label
                    value={d.milestones}
                    position="top"
                    fill="#ffb300"
                    fontSize={10}
                    fontWeight={600}
                />
            </ReferenceDot>
        ));

    return (
        <SafeChartContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{ top: 30, right: 30, left: 20, bottom: 10 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                        color: '#f8fafc'
                    }}
                />
                <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="line"
                />

                {/* Ideal trajectory line */}
                <Line
                    type="monotone"
                    dataKey="ideal"
                    name="Ideal Trajectory"
                    stroke="rgba(255,255,255,0.2)"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    dot={false}
                    activeDot={false}
                />

                {/* Actual burndown line */}
                <Line
                    type="monotone"
                    dataKey="remaining"
                    name="Actual Remaining"
                    stroke="#4ecdc4"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#4ecdc4', strokeWidth: 0 }}
                    activeDot={{ r: 8, fill: '#4ecdc4', strokeWidth: 2, stroke: '#fff' }}
                />

                {/* Milestones */}
                {milestoneMarkers}
            </LineChart>
        </SafeChartContainer>
    );
};

export default BurndownChart;
