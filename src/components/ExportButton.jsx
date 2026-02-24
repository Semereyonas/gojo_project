import React, { useState, useRef, useEffect } from 'react';
import './ExportButton.css';

/**
 * ExportButton Component
 * Advanced multi-format export tool with section and date range selection
 */
const ExportButton = ({ projectId, onExportStart }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('pdf');
    const [sections, setSections] = useState({
        summary: true,
        tasks: true,
        activity: true,
        metrics: true
    });

    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const selectedSections = Object.keys(sections).filter(k => sections[k]);

            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

            const response = await fetch(`${API_BASE}/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    format,
                    sections: selectedSections
                })
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Project_Report_${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setIsOpen(false);
        } catch (err) {
            alert('Failed to generate report: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-dropdown-wrapper" ref={dropdownRef}>
            <button
                className="btn-export-main"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="icon">📥</span> Export Report
            </button>

            {isOpen && (
                <div className="export-menu">
                    <div className="export-section">
                        <h4>Format</h4>
                        <div className="format-options">
                            <label className={format === 'pdf' ? 'active' : ''}>
                                <input type="radio" name="exportFormat" value="pdf" checked={format === 'pdf'} onChange={(e) => setFormat(e.target.value)} />
                                PDF
                            </label>
                            <label className={format === 'csv' ? 'active' : ''}>
                                <input type="radio" name="exportFormat" value="csv" checked={format === 'csv'} onChange={(e) => setFormat(e.target.value)} />
                                CSV (Data Only)
                            </label>
                        </div>
                    </div>

                    {format === 'pdf' && (
                        <div className="export-section">
                            <h4>Include Sections</h4>
                            <div className="section-options">
                                <label>
                                    <input type="checkbox" name="section-summary" checked={sections.summary} onChange={() => toggleSection('summary')} />
                                    Executive Summary
                                </label>
                                <label>
                                    <input type="checkbox" name="section-tasks" checked={sections.tasks} onChange={() => toggleSection('tasks')} />
                                    Task Details
                                </label>
                                <label>
                                    <input type="checkbox" name="section-activity" checked={sections.activity} onChange={() => toggleSection('activity')} />
                                    Activity History
                                </label>
                                <label>
                                    <input type="checkbox" name="section-metrics" checked={sections.metrics} onChange={() => toggleSection('metrics')} />
                                    Chart Data
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="export-footer">
                        <button
                            className="btn-generate"
                            onClick={handleExport}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Download Report'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportButton;
