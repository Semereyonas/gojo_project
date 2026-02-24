import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, updateProject } from '../services/api';
import CreateProjectForm from '../components/CreateProjectForm';
import EditProjectForm from '../components/EditProjectForm';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SkeletonProjectCard } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Notification from '../components/Notification';
import useNotification from '../hooks/useNotification';
import Spinner from '../components/spinner.jsx';
import './ProjectsPage.css';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableProjectWrapper = ({ project, setEditingProject, onPriorityChange }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project._id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className={`project-card border-status-${(project.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                <div className="card-header">
                    <div className="header-left">
                        <button
                            className="btn btn-secondary project-drag-handle"
                            {...listeners}
                            aria-label="Drag handle"
                            title="Drag to reorder projects"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <h3>{project.title}</h3>
                    </div>
                    <div className="header-right-controls">
                        <button className={`btn project-priority-btn priority-${(project.priority || 'normal')}`} title={`Priority: ${project.priority || 'Normal'}`}
                            onClick={() => onPriorityChange && onPriorityChange(project)}>
                            {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Normal'}
                        </button>
                        <span className={`status-badge status-${(project.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                            {project.status || 'Pending'}
                        </span>
                    </div>
                </div>
                <div className="card-body">
                    <p>{project.description}</p>
                </div>
                <div className="card-footer">
                    <Link to={`/projects/${project._id}`} className="btn btn-outline">
                        View Details
                    </Link>
                    <button
                        onClick={() => setEditingProject(project)}
                        className="btn btn-secondary"
                        style={{ marginLeft: '10px' }}
                    >
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [savedScrollY, setSavedScrollY] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { notification, showNotification, hideNotification } = useNotification();

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch projects');
            showNotification(err.message || 'Failed to fetch projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const restoreScroll = () => {
        if (savedScrollY !== null) {
            window.scrollTo(0, savedScrollY);
            setSavedScrollY(null);
        }
    };

    const handleProjectCreated = (newProject) => {
        setProjects(prev => [...prev, newProject]);
        setShowForm(false);
        showNotification('Project created successfully!', 'success');
        restoreScroll();
    };

    const handleProjectUpdated = (updatedProject) => {
        setProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p));
        setEditingProject(null);
        showNotification('Project updated successfully!', 'success');
        restoreScroll();
    };

    const handlePriorityChange = (project) => {
        // Cycle priority: null/normal -> low -> medium -> high -> normal
        const order = [null, 'low', 'medium', 'high'];
        const current = project.priority || null;
        const next = order[(order.indexOf(current) + 1) % order.length];
        const nextPriority = next;
        // Optimistic UI
        setProjects(prev => prev.map(p => p._id === project._id ? { ...p, priority: nextPriority } : p));
        // Persist
        updateProject(project._id, { priority: nextPriority }).then(updated => {
            setProjects(prev => prev.map(p => p._id === updated._id ? updated : p));
        }).catch(err => {
            console.error('Failed to update project priority', err);
            showNotification('Failed to update project priority', 'error');
            // Revert
            setProjects(prev => prev.map(p => p._id === project._id ? project : p));
        });
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="projects-container error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={loadProjects} className="btn btn-secondary">Try Again</button>
            </div>
        );
    }

    return (
        <div className="projects-container">
            <Notification
                message={notification?.message}
                type={notification?.type}
                onClose={hideNotification}
            />
            <header className="projects-header">
                <div className="header-content">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--itdb-gold)' }}>
                            <path d="M4 4V20H20V4H4ZM12 8V12L15 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2.5" />
                        </svg>
                        Projects
                        <span className="projects-count" style={{ fontFamily: 'var(--itdb-font-mono)', color: 'var(--itdb-gold)', fontWeight: '600', opacity: 0.7 }}>
                            ({filteredProjects.length})
                        </span>
                    </h1>
                    <div className="search-container">
                        <input
                            type="text"
                            id="projects-search"
                            name="searchTerm"
                            aria-label="Search projects"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
                <button onClick={() => {
                    setSavedScrollY(window.scrollY);
                    window.scrollTo(0, 0);
                    setShowForm(true);
                }} className="btn btn-primary">
                    Create Project
                </button>
            </header>

            {showForm && (
                <CreateProjectForm
                    onClose={() => setShowForm(false)}
                    onProjectCreated={handleProjectCreated}
                />
            )}

            {projects.length === 0 ? (
                <EmptyState
                    title="No Projects Yet"
                    message="Create your first project to get started with your team."
                    buttonText="Create Project"
                    onButtonClick={() => {
                        setSavedScrollY(window.scrollY);
                        window.scrollTo(0, 0);
                        setShowForm(true);
                    }}
                    image={
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgba(255,255,255,0.1)' }}>
                            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                />
            ) : (
                <DndContext
                    onDragEnd={async (event) => {
                        const { active, over } = event;
                        if (!over || active.id === over.id) return;
                        const oldIndex = filteredProjects.findIndex(p => p._id === active.id);
                        const newIndex = filteredProjects.findIndex(p => p._id === over.id);
                        if (oldIndex === -1 || newIndex === -1) return;
                        const next = arrayMove(filteredProjects, oldIndex, newIndex);
                        // Update visible order
                        setProjects(next);
                        // Try persisting order (set `order` property for each project)
                        try {
                            await Promise.all(next.map((p, idx) => updateProject(p._id, { order: idx })));
                        } catch (err) {
                            console.error('Failed to persist project order:', err);
                        }
                    }}
                >
                    <SortableContext items={filteredProjects.map(p => p._id)} strategy={verticalListSortingStrategy}>
                        <div className="projects-grid">
                            {filteredProjects.map((project) => (
                                <SortableProjectWrapper key={project._id} project={project} setEditingProject={setEditingProject} onPriorityChange={handlePriorityChange} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {editingProject && (
                <EditProjectForm
                    project={editingProject}
                    onClose={() => {
                        setEditingProject(null);
                        restoreScroll();
                    }}
                    onProjectUpdated={handleProjectUpdated}
                />
            )}
        </div>
    );
};

export default ProjectsPage;
