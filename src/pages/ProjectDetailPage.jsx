import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { getProject, getTasksByProject, deleteTask, updateTask, deleteProject } from '../services/api';
import CreateTaskForm from '../components/CreateTaskForm';
import EditTaskForm from '../components/EditTaskForm';
import EditProjectForm from '../components/EditProjectForm';
import DraggableTaskCard from '../components/DraggableTaskCard';
import { SkeletonCard } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Notification from '../components/Notification';
import ConfirmDialog from '../components/ConfirmDialog';
import useNotification from '../hooks/useNotification';
import { useAuth } from '../context/AuthContext';
import TeamManager from '../components/TeamManager.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import TaskDetailModal from '../components/TaskDetailModal.jsx';
import Spinner from '../components/spinner.jsx';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [viewingTaskTab, setViewingTaskTab] = useState('overview');
    const [editingProject, setEditingProject] = useState(false);
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeTab, setActiveTab] = useState('tasks');
    const [activityRefreshKey, setActivityRefreshKey] = useState(0);
    const [savedScrollY, setSavedScrollY] = useState(null);
    const { user } = useAuth();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projectData, tasksData] = await Promise.all([
                getProject(id),
                getTasksByProject(id)
            ]);
            setProject(projectData);
            setTasks(tasksData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const { notification, showNotification, hideNotification } = useNotification();

    const restoreScroll = () => {
        if (savedScrollY !== null) {
            window.scrollTo(0, savedScrollY);
            setSavedScrollY(null);
        }
    };

    const handleTaskCreated = (newTask) => {
        setTasks([...tasks, newTask]);
        setShowTaskForm(false);
        setActivityRefreshKey(prev => prev + 1);
        showNotification('Task created successfully!', 'success');
        restoreScroll();
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
        setActivityRefreshKey(prev => prev + 1);
        showNotification('Task updated successfully!', 'success');
    };

    const handleTaskDeleted = (taskId) => {
        setConfirmDialog({
            title: 'Delete Task?',
            message: 'This task will be permanently deleted. This action cannot be undone.',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteTask(taskId);
                    setTasks(tasks.filter(t => t._id !== taskId));
                    setActivityRefreshKey(prev => prev + 1);
                    showNotification('Task deleted successfully', 'success');
                    setConfirmDialog(null);
                } catch (err) {
                    showNotification('Failed to delete task', 'error');
                    setConfirmDialog(null);
                }
            },
            onCancel: () => setConfirmDialog(null)
        });
    };

    const handleDeleteProject = async () => {
        setConfirmDialog({
            title: 'Delete Project?',
            message: 'This project and all its tasks will be permanently deleted. This action cannot be undone.',
            confirmText: 'Delete Project',
            onConfirm: async () => {
                try {
                    await deleteProject(id);
                    setConfirmDialog(null);
                    navigate('/projects');
                } catch (err) {
                    showNotification('Failed to delete project', 'error');
                    setConfirmDialog(null);
                }
            },
            onCancel: () => setConfirmDialog(null)
        });
    };

    const handleProjectUpdated = (updatedProject) => {
        setProject(updatedProject);
        setEditingProject(false);
        showNotification('Project updated successfully!', 'success');
        restoreScroll();
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeTask = tasks.find(t => t._id === activeId);
        if (!activeTask) return;

        // Helper to persist order for a list of tasks
        const persistOrder = async (taskList) => {
            try {
                await Promise.all(taskList.map((t, idx) => updateTask(t._id, { order: idx, status: t.status }))).catch(e => { throw e; });
            } catch (err) {
                console.error('Failed to persist task order:', err);
            }
        };

        // Determine if over is a column id
        const columnIds = ['col-todo', 'col-in-progress', 'col-done'];
        let targetStatus = null;
        let newTasks = [...tasks];

        if (columnIds.includes(overId)) {
            // Dropped onto an empty column area or the column container -> append to end
            targetStatus = overId.replace('col-', '');
            if (targetStatus === activeTask.status) return; // no-op if same column

            // Move activeTask to end of target column
            const sourceList = newTasks.filter(t => t.status === activeTask.status && t._id !== activeId);
            const targetList = newTasks.filter(t => t.status === targetStatus);

            const moved = { ...activeTask, status: targetStatus };

            const updatedList = [...targetList, moved];

            // Rebuild newTasks: remove active from source, keep others, update orders
            newTasks = newTasks.filter(t => t._id !== activeId).map(t => ({ ...t }));
            // Place updatedList items in order at the end by updating their status and order
            // We'll reassign orders when persisting
            newTasks = [
                ...newTasks.filter(t => t.status !== targetStatus),
                ...updatedList,
            ];

            setTasks(newTasks);
            setActivityRefreshKey(prev => prev + 1);

            try {
                await updateTask(activeId, { status: targetStatus });
                await persistOrder(newTasks.filter(t => t.status === targetStatus));
                showNotification(`Task moved to ${targetStatus.replace('-', ' ')}`, 'success', 2000);
            } catch (err) {
                console.error('Failed to move task on drag:', err);
                showNotification('Failed to move task', 'error');
                await fetchData();
            }

            return;
        }

        // Over is a task id (reorder within same column or move between columns at specific position)
        const overTask = tasks.find(t => t._id === overId);
        if (!overTask) return;

        const sourceStatus = activeTask.status;
        const destStatus = overTask.status;

        // Lists
        const sourceList = tasks.filter(t => t.status === sourceStatus && t._id !== activeId);
        const destList = tasks.filter(t => t.status === destStatus && t._id !== activeId);

        if (sourceStatus === destStatus) {
            // Reorder within same column
            const ordered = tasks.filter(t => t.status === sourceStatus).map(t => t._id);
            const oldIndex = ordered.indexOf(activeId);
            const newIndex = ordered.indexOf(overId);
            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

            const newOrderIds = arrayMove(ordered, oldIndex, newIndex);
            const orderedTasks = newOrderIds.map((id, idx) => ({ ...tasks.find(t => t._id === id), order: idx }));

            // Merge back with other tasks
            const otherTasks = tasks.filter(t => t.status !== sourceStatus);
            const merged = [...otherTasks, ...orderedTasks];
            setTasks(merged);
            setActivityRefreshKey(prev => prev + 1);

            try {
                await persistOrder(orderedTasks);
                showNotification('Task order updated', 'success', 1500);
            } catch (err) {
                console.error('Failed to persist reorder:', err);
                showNotification('Failed to save task order', 'error');
                await fetchData();
            }

            return;
        } else {
            // Moving between columns at position of overTask
            // Remove active from source list, insert into destList at index of overTask
            const destOrdered = tasks.filter(t => t.status === destStatus).map(t => t._id);
            const insertIndex = destOrdered.indexOf(overId);
            const newDestIds = [...destOrdered];
            // Insert activeId before overId
            newDestIds.splice(insertIndex, 0, activeId);

            // Build new orderedTasks for dest
            const newDestTasks = newDestIds.map((id, idx) => ({ ...tasks.find(t => t._id === id) || (id === activeId ? { ...activeTask, status: destStatus } : null), order: idx }));

            // Rebuild newTasks: other tasks not destStatus, plus newDestTasks
            const otherTasks = tasks.filter(t => t.status !== destStatus && t._id !== activeId);
            const merged = [...otherTasks, ...newDestTasks];
            setTasks(merged);
            setActivityRefreshKey(prev => prev + 1);

            try {
                await updateTask(activeId, { status: destStatus });
                await persistOrder(newDestTasks);
                showNotification(`Task moved to ${destStatus.replace('-', ' ')}`, 'success', 1500);
            } catch (err) {
                console.error('Failed to move task between columns:', err);
                showNotification('Failed to move task', 'error');
                await fetchData();
            }
        }
    };

    const getTasksByStatus = (status) => {
        const priorityOrder = { "high": 1, "medium": 2, "low": 3 };
        return tasks
            .filter(task => {
                const matchesStatus = task.status === status;
                const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
                return matchesStatus && matchesPriority;
            })
            .sort((a, b) => {
                const priorityA = priorityOrder[a.priority] || 4;
                const priorityB = priorityOrder[b.priority] || 4;
                return priorityA - priorityB;
            });
    };

    const todoTasks = getTasksByStatus('todo');
    const inProgressTasks = getTasksByStatus('in-progress');
    const doneTasks = getTasksByStatus('done');

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spinner />
            </div>
        );
    }
    if (error) return <div className="error">Error: {error}</div>;
    if (!project) return <div className="not-found">Project not found</div>;

    return (
        <div className="project-detail-container">
            <Notification
                message={notification?.message}
                type={notification?.type}
                onClose={hideNotification}
            />
            <header className="project-header">
                <Link to="/projects" className="back-link">&larr; Back to Projects</Link>
                <h1>{project.title}</h1>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                    <span className={`status-badge status-${(project.status || 'pending').toLowerCase()}`}>
                        {project.status || 'Pending'}
                    </span>
                    <Link
                        to={`/projects/${id}/analytics`}
                        className="btn btn-secondary"
                        style={{ marginRight: '10px' }}
                    >
                        📊 Analytics
                    </Link>
                    <button
                        onClick={() => {
                            setSavedScrollY(window.scrollY);
                            window.scrollTo(0, 0);
                            setEditingProject(true);
                        }}
                        className="btn btn-secondary"
                        style={{ marginRight: '10px' }}
                    >
                        Edit Project
                    </button>
                    <button
                        onClick={() => { handleDeleteProject(); }}
                        className="delete-project-btn"
                        title="Delete Project"
                    >
                        Delete Project
                    </button>
                </div>
            </header>

            <nav className="project-tabs">
                <button
                    className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    Tasks
                </button>
                {(project.owner === user?._id || project.team?.some(m => m.user === user?._id && m.role === 'admin')) && (
                    <button
                        className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
                        onClick={() => setActiveTab('team')}
                    >
                        Add Team
                    </button>
                )}
                <button
                    className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    Activity
                </button>
            </nav>

            {activeTab === 'tasks' && (
                <div className="tasks-section">
                    <div className="tasks-header">
                        <h2>Tasks</h2>
                        <button onClick={() => {
                            setSavedScrollY(window.scrollY);
                            window.scrollTo(0, 0);
                            setShowTaskForm(true);
                        }} className="btn btn-primary">
                            + Add Task
                        </button>
                    </div>

                    <div className="filter-section">
                        <div className="filter-group">
                            <span className="filter-label">Priority:</span>
                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${priorityFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setPriorityFilter('all')}
                                >All</button>
                                <button
                                    className={`filter-btn ${priorityFilter === 'high' ? 'active' : ''}`}
                                    onClick={() => setPriorityFilter('high')}
                                >High 🔴</button>
                                <button
                                    className={`filter-btn ${priorityFilter === 'medium' ? 'active' : ''}`}
                                    onClick={() => setPriorityFilter('medium')}
                                >Medium 🟡</button>
                                <button
                                    className={`filter-btn ${priorityFilter === 'low' ? 'active' : ''}`}
                                    onClick={() => setPriorityFilter('low')}
                                >Low 🟢</button>
                            </div>
                        </div>

                        <div className="filter-group">
                            <span className="filter-label">Status:</span>
                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('all')}
                                >All</button>
                                <button
                                    className={`filter-btn ${statusFilter === 'todo' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('todo')}
                                >To Do</button>
                                <button
                                    className={`filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('in-progress')}
                                >In Progress</button>
                                <button
                                    className={`filter-btn ${statusFilter === 'done' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('done')}
                                >Done</button>
                            </div>
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="task-columns" style={{ gridTemplateColumns: statusFilter === 'all' ? 'repeat(3, 1fr)' : '1fr' }}>
                            {[
                                { id: 'col-todo', title: 'To Do', status: 'todo', items: todoTasks },
                                { id: 'col-in-progress', title: 'In Progress', status: 'in-progress', items: inProgressTasks },
                                { id: 'col-done', title: 'Done', status: 'done', items: doneTasks }
                            ]
                                .filter(column => statusFilter === 'all' || column.status === statusFilter)
                                .map((column) => (
                                    <div key={column.id} className="task-column">
                                        <h3>{column.title} ({column.items.length})</h3>
                                        <SortableContext
                                            items={column.items.map(t => t._id)}
                                            strategy={verticalListSortingStrategy}
                                            id={column.id}
                                        >
                                            <div className="task-list" id={column.id}>
                                                {column.items.map(task => (
                                                    <DraggableTaskCard
                                                        key={task._id}
                                                        task={task}
                                                        onEdit={(t) => {
                                                            setSavedScrollY(window.scrollY);
                                                            window.scrollTo(0, 0);
                                                            setEditingTask(t);
                                                        }}
                                                        onDetails={(t) => {
                                                            setSavedScrollY(window.scrollY);
                                                            window.scrollTo(0, 0);
                                                            setViewingTask(t);
                                                            setViewingTaskTab('overview');
                                                        }}
                                                        onDelete={handleTaskDeleted}
                                                    />
                                                ))}
                                                {column.items.length === 0 && (
                                                    <div className="drop-zone-placeholder">
                                                        <EmptyState
                                                            title=""
                                                            message="No tasks here"
                                                            image={column.title === 'Done' ? '✨' : '📝'}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </SortableContext>
                                    </div>
                                ))}
                        </div>
                    </DndContext>
                </div>
            )}

            {activeTab === 'team' && (
                <TeamManager projectId={id} currentUser={user} />
            )}

            {activeTab === 'activity' && (
                <div className="activity-section">
                    <ActivityFeed projectId={id} refreshKey={activityRefreshKey} />
                </div>
            )}

            {showTaskForm && (
                <CreateTaskForm
                    projectId={id}
                    teamMembers={project.team}
                    onClose={() => {
                        setShowTaskForm(false);
                        restoreScroll();
                    }}
                    onTaskCreated={handleTaskCreated}
                />
            )}

            {editingTask && (
                <EditTaskForm
                    task={editingTask}
                    teamMembers={project.team}
                    onClose={() => {
                        setEditingTask(null);
                        restoreScroll();
                    }}
                    onTaskUpdated={(updatedTask) => {
                        handleTaskUpdated(updatedTask);
                        setEditingTask(null);
                    }}
                />
            )}

            {viewingTask && (
                <TaskDetailModal
                    task={viewingTask}
                    teamMembers={project.team}
                    initialTab={viewingTaskTab}
                    onClose={() => {
                        setViewingTask(null);
                        restoreScroll();
                    }}
                    onTaskUpdated={(updatedTask) => {
                        handleTaskUpdated(updatedTask);
                        setViewingTask(updatedTask);
                    }}
                />
            )}

            {editingProject && (
                <EditProjectForm
                    project={project}
                    onClose={() => {
                        setEditingProject(false);
                        restoreScroll();
                    }}
                    onProjectUpdated={handleProjectUpdated}
                />
            )}

            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmText={confirmDialog.confirmText}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </div>
    );
};

export default ProjectDetailPage;
