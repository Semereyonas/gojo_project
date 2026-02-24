import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyInviteToken, joinProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/spinner.jsx';
import './AcceptInvitePage.css';

const AcceptInvitePage = () => {
    const { projectId, token } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [inviteData, setInviteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const data = await verifyInviteToken(token);
                setInviteData(data);
            } catch (err) {
                setError(err.message || 'Invitation is invalid or has expired.');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [token]);

    const handleJoin = async () => {
        if (!user) {
            // Redirect to login but save the current path to return after login
            navigate('/login', { state: { from: `/join/${projectId}/${token}` } });
            return;
        }

        setVerifying(true);
        try {
            await joinProject(projectId, token);
            navigate(`/projects/${projectId}`);
        } catch (err) {
            setError(err.message || 'Failed to join project.');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="accept-invite-container">
                <div className="invite-card error">
                    <div className="error-icon">⚠️</div>
                    <h2>Invitation Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/projects')} className="btn btn-secondary">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="accept-invite-container">
            <div className="invite-card">
                <div className="project-icon">📁</div>
                <h2>Project Invitation</h2>
                <p className="invite-text">
                    You've been invited to join the project:
                </p>
                <div className="project-preview">
                    <h3>{inviteData.project.title}</h3>
                    <p>{inviteData.project.description || 'No description provided.'}</p>
                </div>
                <div className="invite-role">
                    Role: <span className={`role-badge role-${inviteData.role}`}>{inviteData.role}</span>
                </div>

                <div className="invite-actions">
                    <button
                        onClick={handleJoin}
                        className="btn btn-primary join-btn"
                        disabled={verifying}
                    >
                        {verifying ? 'Joining...' : 'Join Project'}
                    </button>
                    {!user && (
                        <p className="login-hint">
                            You'll need to sign in or create an account to join.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitePage;
