import React, { useState, useEffect, useRef } from 'react';

/**
 * SafeChartContainer
 * 
 * Replaces Recharts' ResponsiveContainer to avoid the
 * "width(-1) and height(-1)" warning that fires when charts
 * render inside hidden/transitioning containers (e.g. tabs).
 * 
 * Uses ResizeObserver to measure the wrapper div and only
 * renders children once valid dimensions (> 0) are available.
 */
const SafeChartContainer = ({ width = '100%', height = 300, children, className, style }) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: w, height: h } = entry.contentRect;
                if (w > 0 && h > 0) {
                    setDimensions({ width: Math.floor(w), height: Math.floor(h) });
                }
            }
        });

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    const containerStyle = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
    };

    return (
        <div ref={containerRef} className={className} style={containerStyle}>
            {dimensions.width > 0 && dimensions.height > 0
                ? React.cloneElement(React.Children.only(children), {
                    width: dimensions.width,
                    height: dimensions.height,
                })
                : null}
        </div>
    );
};

export default SafeChartContainer;
