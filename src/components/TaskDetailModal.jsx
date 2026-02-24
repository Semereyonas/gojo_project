import React, { useState, useEffect } from 'react';
import { getTaskComments, createComment, getTaskActivities } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskChecklist from './TaskChecklist';
import './TaskDetailModal.css';

const TaskDetailModal = ({ task, teamMembers, onClose, onTaskUpdated, initialTab }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (task) {
            fetchComments();
            fetchActivities();
            // If a parent passes an initial tab, use it
            if (typeof initialTab === 'string') setActiveTab(initialTab);
        }
    }, [task?._id, initialTab]);

    const fetchComments = async () => {
        try {
            const data = await getTaskComments(task._id);
            setComments(data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        }
    };

    const fetchActivities = async () => {
        try {
            const data = await getTaskActivities(task._id);
            setActivities(data);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            // Using a simple object for now, if files are needed we'd use FormData
            const comment = await createComment(task._id, { content: newComment });
            setComments([...comments, comment]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment:', err);
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    };

    if (!task) return null;

    return (
        <div className="task-detail-overlay" onClick={onClose}>
            <div className="task-detail-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="header-top">
                        <span className={`priority-pill ${task.priority}`}>{task.priority.toUpperCase()}</span>
                        <span className={`status-pill ${task.status}`}>{task.status.replace('-', ' ').toUpperCase()}</span>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                    <h1>{task.title}</h1>
                </header>

                <nav className="modal-tabs">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={activeTab === 'checklist' ? 'active' : ''}
                        onClick={() => setActiveTab('checklist')}
                    >
                        Checklist
                    </button>
                    <button
                        className={activeTab === 'comments' ? 'active' : ''}
                        onClick={() => setActiveTab('comments')}
                    >
                        Comments ({comments.length})
                    </button>
                    <button
                        className={activeTab === 'history' ? 'active' : ''}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </nav>

                <div className="modal-content">
                    {activeTab === 'overview' && (
                        <div className="tab-overview">
                            <section className="detail-section">
                                <h3>Description</h3>
                                <p className="description-text">
                                    {task.description || "No description provided."}
                                </p>
                            </section>

                            <div className="meta-grid">
                                <div className="meta-item">
                                    <label>Due Date</label>
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Created By</label>
                                    <span>{task.createdBy?.name || 'Unknown'}</span>
                                </div>
                                <div className="meta-item">
                                    <label>Assigned To</label>
                                    <div className="assignees-list">
                                        {task.assignedTo?.length > 0 ? (
                                            task.assignedTo.map(a => (
                                                <div key={a._id} className="mini-avatar" title={a.name}>
                                                    {a.name[0]}
                                                </div>
                                            ))
                                        ) : 'Unassigned'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'checklist' && (
                        <div className="tab-checklist">
                            <TaskChecklist
                                taskId={task._id}
                                initialItems={task.checklist}
                                onProgressChange={(p) => onTaskUpdated && onTaskUpdated({ ...task, progress: p })}
                            />
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="tab-comments">
                            <div className="comments-stream">
                                {comments.map(c => (
                                    <div key={c._id} className="detail-comment">
                                        <div className="comment-meta">
                                            <strong>{c.userId?.name}</strong>
                                            <span>{formatTime(c.createdAt)}</span>
                                        </div>
                                        <p>{c.content}</p>
                                    </div>
                                ))}
                                {comments.length === 0 && <div className="empty-state">No discussions yet.</div>}
                            </div>
                            <form className="modal-comment-form" onSubmit={handleCommentSubmit}>
                                <textarea
                                    id="modal-comment"
                                    name="newComment"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
                                    Post
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="tab-history">
                            <div className="history-timeline">
                                {activities.map(a => (
                                    <div key={a._id} className="history-entry">
                                        <div className="entry-point"></div>
                                        <div className="entry-content">
                                            <div className="entry-header">
                                                <strong>{a.userId?.name}</strong>
                                                <span className="entry-action">{a.action.replace('_', ' ')}</span>
                                                <span className="entry-time">{formatTime(a.createdAt)}</span>
                                            </div>
                                            {a.details?.changes && (
                                                <div className="entry-details">
                                                    Updated: {Object.keys(a.details.changes).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && <div className="empty-state">No history recorded.</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
