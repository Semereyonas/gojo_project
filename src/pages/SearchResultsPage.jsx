import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getProjects, getTasksByProject } from '../services/api';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/spinner.jsx';

const SearchResultsPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query.trim()) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // 1. Fetch all projects
                const allProjects = await getProjects();

                // 2. Filter projects locally
                const matchingProjects = allProjects.filter(p =>
                    p.title.toLowerCase().includes(query.toLowerCase()) ||
                    p.description.toLowerCase().includes(query.toLowerCase())
                );
                setProjects(matchingProjects);

                // 3. Fetch tasks for ALL projects to search them (inefficient but necessary without backend search)
                // We'll limit this to active projects to save some bandwidth if possible, but let's just do all for now.
                const tasksPromises = allProjects.map(p => getTasksByProject(p._id).then(tasks => tasks.map(t => ({ ...t, projectTitle: p.title, projectId: p._id }))));
                const allTasksArrays = await Promise.all(tasksPromises);
                const allTasks = allTasksArrays.flat();

                // 4. Filter tasks locally
                const matchingTasks = allTasks.filter(t =>
                    t.title.toLowerCase().includes(query.toLowerCase()) ||
                    (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
                );
                setTasks(matchingTasks);

            } catch (err) {
                console.error("Search failed:", err);
                setError("Failed to load search results.");
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    return (
        <div className="search-results-container" style={{ padding: '20px' }}>
            <h1>Search Results for "{query}"</h1>

            {projects.length === 0 && tasks.length === 0 ? (
                <EmptyState
                    title="No results found"
                    message={`We couldn't find anything matching "${query}"`}
                    image="🔍"
                />
            ) : (
                <>
                    {projects.length > 0 && (
                        <div className="results-section">
                            <h2 style={{ color: 'var(--itdb-gold)', marginTop: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                Projects ({projects.length})
                            </h2>
                            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                {projects.map(project => (
                                    <div key={project._id} className="project-card">
                                        <div className="card-header">
                                            <h3>{project.title}</h3>
                                            <span className={`status-badge status-${(project.status || 'pending').toLowerCase()}`}>
                                                {project.status || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <p>{project.description}</p>
                                        </div>
                                        <div className="card-footer">
                                            <Link to={`/projects/${project._id}`} className="btn btn-outline">
                                                View Project
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tasks.length > 0 && (
                        <div className="results-section">
                            <h2 style={{ color: 'var(--itdb-gold)', marginTop: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                Tasks ({tasks.length})
                            </h2>
                            <div className="tasks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                {tasks.map(task => (
                                    <div key={task._id} className="task-result-card" style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <h4 style={{ margin: 0, color: 'var(--itdb-text-light)' }}>{task.title}</h4>
                                            <span className={`status-badge status-${task.status}`}>{task.status}</span>
                                        </div>
                                        <p style={{ color: 'var(--itdb-text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                            {task.description || 'No description'}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                            <span>Project: {task.projectTitle}</span>
                                            <Link to={`/projects/${task.projectId}`} style={{ color: 'var(--itdb-teal)' }}>
                                                Go to Project &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResultsPage;
