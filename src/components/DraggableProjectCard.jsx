import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import './DraggableProjectCard.css';

const DraggableProjectCard = ({ project, listeners, attributes, setNodeRef, transform, transition, onEdit }) => {
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`project-card border-status-${(project.status || 'pending').toLowerCase().replace(' ', '-')}`}
            {...attributes}
            {...listeners}
        >
            <div className="card-header">
                <div className="header-left">
                    <button
                        className="btn btn-secondary project-drag-handle"
                        onMouseDown={(e) => e.stopPropagation()}
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
                <span className={`status-badge status-${(project.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                    {project.status || 'Pending'}
                </span>
            </div>
            <div className="card-body">
                <p>{project.description}</p>
            </div>
            <div className="card-footer">
                <Link to={`/projects/${project._id}`} className="btn btn-outline">
                    View Details
                </Link>
                <button
                    onClick={() => onEdit(project)}
                    className="btn btn-secondary"
                    style={{ marginLeft: '10px' }}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

export default DraggableProjectCard;
