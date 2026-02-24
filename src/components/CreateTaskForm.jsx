import React, { useState } from 'react';
import { createTask, getApiOrigin } from '../services/api';
import './CreateProjectForm.css'; // Reusing modal styles

const CreateTaskForm = ({ projectId, teamMembers, onClose, onTaskCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assignedTo: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const origin = getApiOrigin();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const newTask = await createTask(projectId, formData);

            if (onTaskCreated) {
                onTaskCreated(newTask);
            }

            setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                dueDate: '',
                assignedTo: []
            });
            onClose();

        } catch (err) {
            setError(err.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Task</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Task Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter task title"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter task description"
                            rows="3"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="low">Low 🟢</option>
                            <option value="medium">Medium 🟡</option>
                            <option value="high">High 🔴</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="dueDate">Due Date (Optional)</label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group assignment-group">
                        <label>Assign To</label>
                        <div className="custom-multi-select">
                            <div
                                className={`select-trigger ${showMemberDropdown ? 'active' : ''}`}
                                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                            >
                                <div className="selected-preview">
                                    {formData.assignedTo.length === 0 ? (
                                        <span className="placeholder">Unassigned</span>
                                    ) : (
                                        <div className="mini-avatar-stack">
                                            {formData.assignedTo.map(userId => {
                                                const member = (teamMembers || []).find(m => m.user._id === userId);
                                                if (!member) return null;
                                                return (
                                                    <div key={userId} className="trigger-avatar" title={member.user.name}>
                                                        {member.user.avatar
                                                            ? <img src={`${origin}/${member.user.avatar}`} alt="" />
                                                            : member.user.name.charAt(0)}
                                                    </div>
                                                );
                                            })}
                                            {formData.assignedTo.length > 5 && (
                                                <span className="more-count">+{formData.assignedTo.length - 5}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className="arrow">{showMemberDropdown ? '▲' : '▼'}</span>
                            </div>

                            {showMemberDropdown && (
                                <div className="select-dropdown">
                                    {(teamMembers || []).map(member => (
                                        <div key={member.user._id} className="member-option">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.assignedTo.includes(member.user._id)}
                                                    onChange={(e) => {
                                                        const userId = member.user._id;
                                                        const newAssignedTo = e.target.checked
                                                            ? [...formData.assignedTo, userId]
                                                            : formData.assignedTo.filter(id => id !== userId);
                                                        setFormData({ ...formData, assignedTo: newAssignedTo });
                                                    }}
                                                />
                                                <div className="member-info-small">
                                                    <span className="member-avatar-mini">
                                                        {member.user.avatar
                                                            ? <img src={`${origin}/${member.user.avatar}`} alt="" />
                                                            : member.user.name.charAt(0)}
                                                    </span>
                                                    <span>{member.user.name}</span>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                    {(teamMembers || []).length === 0 && (
                                        <div className="no-members-msg">No members to assign</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskForm;
