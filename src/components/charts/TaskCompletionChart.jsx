import React from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import SafeChartContainer from './SafeChartContainer';

/**
 * TaskCompletionChart
 * Displays daily bars for created/completed tasks
 * Overlayed with a line for cumulative remaining tasks
 */
const TaskCompletionChart = ({ data }) => {
    return (
        <SafeChartContainer width="100%" height={400}>
            <ComposedChart
                data={data}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
                    iconType="circle"
                />

                {/* Daily activity bars */}
                <Bar
                    dataKey="created"
                    name="Created Today"
                    fill="#4ecdc4"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                />
                <Bar
                    dataKey="completed"
                    name="Completed Today"
                    fill="#c7f9cc"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                />

                {/* Cumulative trend line */}
                <Line
                    type="monotone"
                    dataKey="remaining"
                    name="Total Pending"
                    stroke="#ff6b6b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ff6b6b', strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </ComposedChart>
        </SafeChartContainer>
    );
};

export default TaskCompletionChart;
