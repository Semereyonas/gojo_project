import React, { useState, useEffect } from 'react';
import { getProjectMembers, inviteMember, removeMember, updateMemberRole, getApiOrigin } from '../services/api';
import './TeamManager.css';

const TeamManager = ({ projectId, currentUser }) => {
    const [members, setMembers] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const origin = getApiOrigin();

    useEffect(() => {
        if (projectId) {
            fetchMembers();
        }
    }, [projectId]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await getProjectMembers(projectId);
            setMembers(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch members');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await inviteMember(projectId, { email: inviteEmail, role: inviteRole });
            setSuccessMessage(`Invite sent to ${inviteEmail}`);
            setInviteEmail('');
            setInviteRole('member');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to send invite');
        }
    };

    const handleRemove = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await removeMember(projectId, userId);
            setMembers(members.filter(m => m.user._id !== userId));
            setSuccessMessage('Member removed successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to remove member');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateMemberRole(projectId, userId, newRole);
            setMembers(members.map(m =>
                m.user._id === userId ? { ...m, role: newRole } : m
            ));
            setSuccessMessage('Role updated');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update role');
        }
    };

    if (loading && members.length === 0) return <div className="team-loading">Loading members...</div>;

    // Check if current user has permission (Owner or Admin)
    const isOwnerOrAdmin = members.some(m =>
        m.user._id === currentUser?._id && (m.role === 'admin' || m.role === 'owner')
    );

    return (
        <div className="team-manager">
            <h3>Project Team</h3>

            {error && <div className="team-error">{error}</div>}
            {successMessage && <div className="team-success">{successMessage}</div>}

            <div className="member-list">
                {members.map(member => (
                    <div key={member.user._id} className="member-item">
                        <div className="member-info">
                            <img
                                src={member.user.avatar ? `${origin}/uploads/${member.user.avatar}` : 'https://via.placeholder.com/40'}
                                alt={member.user.name}
                                className="member-avatar"
                            />
                            <div className="member-details">
                                <span className="member-name">{member.user.name}</span>
                                <span className="member-email">{member.user.email}</span>
                            </div>
                        </div>

                        <div className="member-actions">
                            <span className={`role-badge role-${member.role}`}>
                                {member.role.charAt(0) + member.role.slice(1)}
                            </span>

                            {isOwnerOrAdmin && member.user._id !== currentUser?._id && (
                                <>
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                                        className="role-select"
                                        id={`role-${member.user._id}`}
                                        name="role"
                                        aria-label={`Role for ${member.user.name}`}
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        onClick={() => handleRemove(member.user._id)}
                                        className="remove-btn"
                                        title="Remove member"
                                    >
                                        &times;
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isOwnerOrAdmin && (
                <form onSubmit={handleInvite} className="invite-form">
                    <h4>Invite New Member</h4>
                    <div className="invite-inputs">
                        <label htmlFor="invite-email" className="sr-only">Email address</label>
                        <input
                            type="email"
                            id="invite-email"
                            name="inviteEmail"
                            placeholder="Email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="invite-role" className="sr-only">Role</label>
                        <select
                            id="invite-role"
                            name="inviteRole"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                        >
                            <option value="viewer">Viewer</option>
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="btn-invite">Invite</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default TeamManager;
