import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { updateDashboardLayout, getProfile } from '../../services/api';
import {
    TaskCompletionWidget,
    UpcomingDeadlinesWidget,
    TeamWorkloadWidget,
    RecentActivityWidget,
    QuickStatsWidget
} from './DashboardWidgets';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './WidgetGrid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetGrid = ({ projectId }) => {
    const [layout, setLayout] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const user = await getProfile();
                if (user.dashboardLayout && user.dashboardLayout.length > 0) {
                    setLayout(user.dashboardLayout);
                } else {
                    // Default layout
                    setLayout([
                        { i: 'stats', x: 0, y: 0, w: 4, h: 2 },
                        { i: 'completion', x: 0, y: 2, w: 2, h: 4 },
                        { i: 'deadlines', x: 2, y: 2, w: 2, h: 4 },
                        { i: 'workload', x: 0, y: 6, w: 4, h: 4 },
                        { i: 'activity', x: 0, y: 10, w: 4, h: 4 }
                    ]);
                }
            } catch (err) {
                console.error('Failed to load layout', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLayout();
    }, []);

    const onLayoutChange = (currentLayout) => {
        setLayout(currentLayout);
        updateDashboardLayout(currentLayout).catch(err => console.error('Save failed', err));
    };

    if (loading) return <div className="widget-loading">Initializing Dashboard...</div>;

    const renderWidget = (id) => {
        switch (id) {
            case 'stats': return <QuickStatsWidget projectId={projectId} />;
            case 'completion': return <TaskCompletionWidget projectId={projectId} />;
            case 'deadlines': return <UpcomingDeadlinesWidget projectId={projectId} />;
            case 'workload': return <TeamWorkloadWidget projectId={projectId} />;
            case 'activity': return <RecentActivityWidget projectId={projectId} />;
            default: return null;
        }
    };

    return (
        <div className="dashboard-grid-container">
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
                rowHeight={100}
                draggableHandle=".widget-header"
                onLayoutChange={onLayoutChange}
            >
                {layout.map(item => (
                    <div key={item.i} className="widget-wrapper">
                        {renderWidget(item.i)}
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
};

export default WidgetGrid;
