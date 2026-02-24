import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from 'recharts';
import SafeChartContainer from './SafeChartContainer';

const COLORS = ['#4ecdc4', '#ff6b6b', '#f9dbbd', '#c7f9cc', '#a2d2ff'];

/**
 * ProjectStatusChart
 * Displays task distribution by status as a donut chart
 * Supports clicking slices for filtering
 */
const ProjectStatusChart = ({ data, onSliceClick }) => {
    // Custom label to show percentage in the middle for the active slice or total
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
        return `${name} (${(percent * 100).toFixed(0)}%)`;
    };

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="custom-legend" style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <span style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: entry.color,
                            borderRadius: '50%',
                            marginRight: '10px'
                        }}></span>
                        <span style={{ flex: 1 }}>{entry.value}</span>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{data[index].value}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <SafeChartContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    onClick={(entry) => onSliceClick && onSliceClick(entry.name)}
                    style={{ cursor: 'pointer' }}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{
                                filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}44)`
                            }}
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                        color: '#f8fafc'
                    }}
                />
                <Legend content={renderLegend} />
            </PieChart>
        </SafeChartContainer>
    );
};

export default ProjectStatusChart;
