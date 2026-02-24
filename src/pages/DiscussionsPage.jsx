import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllComments, getApiOrigin } from '../services/api';
import Spinner from '../components/spinner.jsx';
import './DiscussionsPage.css';

const DiscussionsPage = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const origin = getApiOrigin();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await getAllComments();
                setComments(data);
            } catch (err) {
                console.error('Failed to fetch discussions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, []);

    const formatTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spinner /></div>;

    return (
        <div className="discussions-container">
            <header className="discussions-header">
                <h1>Bureau Discussions</h1>
                <p>Collaborate across all strategic projects and initiatives.</p>
            </header>

            <div className="comments-feed">
                {comments.length === 0 ? (
                    <div className="empty-discussions">
                        <div className="empty-icon">💬</div>
                        <h3>No discussions yet</h3>
                        <p>Start a conversation by mentioning teammates in any task.</p>
                        <Link to="/projects" className="btn-primary">Go to Projects</Link>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment._id} className="discussion-card">
                            <div className="discussion-header">
                                <div className="comment-author">
                                    <div className="author-avatar">
                                        {comment.userId?.avatar ? (
                                            <img src={comment.userId.avatar.startsWith('http') ? comment.userId.avatar : `${origin}/${comment.userId.avatar}`} alt={comment.userId.name} />
                                        ) : (
                                            <span>{comment.userId?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="author-info">
                                        <span className="author-name">{comment.userId?.name}</span>
                                        <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="context-box">
                                    <span className="project-badge">{comment.taskId?.projectId?.name}</span>
                                    <Link to={`/projects/${comment.taskId?.projectId?._id}`} className="task-link">
                                        {comment.taskId?.title}
                                    </Link>
                                </div>
                            </div>
                            <div className="discussion-content">
                                {comment.content}
                            </div>
                            {comment.attachments && comment.attachments.length > 0 && (
                                <div className="discussion-attachments">
                                    {comment.attachments.map((file, idx) => (
                                        <span key={idx} className="attachment-pill">📎 {file.filename}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DiscussionsPage;
