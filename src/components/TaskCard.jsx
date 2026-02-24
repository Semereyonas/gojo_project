import React, { useState } from 'react';
import { updateTask, deleteTask, getApiOrigin } from '../services/api';
import './TaskCard.css';

const TaskCard = ({ task, onTaskUpdated, onTaskDeleted, onEdit }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const origin = getApiOrigin();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                setIsUpdating(true);
                await deleteTask(task._id);
                onTaskDeleted(task._id);
            } catch (error) {
                console.error('Failed to delete task:', error);
                alert('Failed to delete task');
                setIsUpdating(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className={`task-card status-${task.status.toLowerCase()}`}>
            <div className="task-header">
                <div className="task-header-left">
                    <button
                        className="btn btn-secondary task-drag-handle"
                        onMouseDown={(e) => e.stopPropagation()}
                        aria-label="Drag handle (visual)"
                        title="Drag handle (visual)"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h4 className="task-title">{task.title}</h4>
                </div>
                <div className="task-actions">
                </div>
            </div>

            {task.description && <p className="task-description">{task.description}</p>}

            {task.dueDate && (
                <div className="task-meta">
                    <span className="due-date">Due: {formatDate(task.dueDate)}</span>
                    <div className="task-assignees">
                        {(task.assignedTo || []).map(user => (
                            <div key={user._id} className="assignee-avatar" title={user.name}>
                                {user.avatar
                                    ? <img src={`${origin}/${user.avatar}`} alt={user.name} />
                                    : user.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
