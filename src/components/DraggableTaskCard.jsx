import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { getTaskComments } from '../services/api';
import './DraggableTaskCard.css';

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high':
            return '#fee2e2'; // Light red
        case 'medium':
            return '#fef3c7'; // Light yellow
        case 'low':
            return '#dcfce7'; // Light green
        default:
            return 'var(--glass-bg)';
    }
};

const getPriorityLabel = (priority) => {
    switch (priority) {
        case 'high':
            return 'High 🔴';
        case 'medium':
            return 'Medium 🟡';
        case 'low':
            return 'Low 🟢';
        default:
            return '';
    }
};

const DraggableTaskCard = ({ task, onEdit, onDetails, onDelete }) => {
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        const fetchCommentCount = async () => {
            try {
                const comments = await getTaskComments(task._id);
                setCommentCount(comments.length);
            } catch (err) {
                console.error('Failed to fetch comment count:', err);
            }
        };
        fetchCommentCount();
    }, [task._id]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task._id, data: { task } });

    const priorityColor = getPriorityColor(task.priority);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        marginBottom: '16px', // Add space between spacing
    };

    const totalChecklistItems = task.checklist?.length || 0;
    const completedChecklistItems = task.checklist?.filter(item => item.completed).length || 0;
    const checklistProgress = totalChecklistItems === 0 ? 0 : Math.round((completedChecklistItems / totalChecklistItems) * 100);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="draggable-task-wrapper"
        >
            <div
                className="priority-indicator-wrapper"
                style={{
                    backgroundColor: priorityColor,
                    borderRadius: 'var(--itdb-radius-md)',
                    border: task.priority === 'high' ? '1px solid #ef9a9a' : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div className="priority-badge">
                    {getPriorityLabel(task.priority)}
                </div>
                <TaskCard task={task} onEdit={onEdit} />

                {totalChecklistItems > 0 && (
                    <div className="mini-progress-container">
                        <div
                            className="mini-progress-bar"
                            style={{ width: `${checklistProgress}%` }}
                        ></div>
                    </div>
                )}
            </div>

            {/* ITDB Styled Action Buttons */}
            <div className="task-actions-btn">
                <button
                    className="btn btn-secondary task-action-icon"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onEdit(task)}
                    title="Edit task"
                >
                    Edit
                </button>
                <button
                    className="btn btn-secondary task-action-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDetails && onDetails(task)}
                    title="View details and comments"
                >
                    Details
                </button>
                <button
                    className="btn btn-secondary task-action-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDetails && onDetails(task)}
                    title="View Comments"
                >
                    Comment {commentCount > 0 && <span className="action-count">{commentCount}</span>}
                </button>
                <button
                    className="btn btn-danger task-action-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDelete(task._id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default DraggableTaskCard;
