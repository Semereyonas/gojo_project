import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getTaskComments, createComment, updateComment, deleteComment, getApiOrigin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import './CommentSidebar.css';

const CommentSidebar = ({ task, teamMembers, onClose, onCommentAdded }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const { user } = useAuth();
    const origin = getApiOrigin();

    useEffect(() => {
        if (task) {
            fetchComments();
        }
    }, [task?._id]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await getTaskComments(task._id);
            setComments(data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            alert('Max 5 files per comment');
            return;
        }
        setSelectedFiles([...selectedFiles, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleTextareaChange = (e) => {
        const value = e.target.value;
        const pos = e.target.selectionStart;
        setNewComment(value);
        setCursorPosition(pos);

        const lastAtIndex = value.lastIndexOf('@', pos - 1);
        if (lastAtIndex !== -1 && !/\s/.test(value.slice(lastAtIndex + 1, pos))) {
            setMentionSearch(value.slice(lastAtIndex + 1, pos).toLowerCase());
            setShowMentions(true);
        } else {
            setShowMentions(false);
        }
    };

    const selectMention = (memberName) => {
        const lastAtIndex = newComment.lastIndexOf('@', cursorPosition - 1);
        const normalizedName = memberName.replace(/\s+/g, '');
        const newValue =
            newComment.slice(0, lastAtIndex + 1) +
            normalizedName + ' ' +
            newComment.slice(cursorPosition);

        setNewComment(newValue);
        setShowMentions(false);
        textareaRef.current.focus();
    };

    const filteredTeam = useMemo(() => {
        if (!teamMembers) return [];
        return teamMembers.filter(m =>
            m.user?.name?.toLowerCase().replace(/\s+/g, '').includes(mentionSearch)
        );
    }, [teamMembers, mentionSearch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && selectedFiles.length === 0) return;

        setSubmitting(true);
        setUploadProgress(10); // Start progress

        try {
            const formData = new FormData();
            formData.append('content', newComment);
            selectedFiles.forEach(file => {
                formData.append('attachments', file);
            });

            setUploadProgress(40); // Midway

            const comment = await createComment(task._id, formData);

            setUploadProgress(90);
            setComments([...comments, comment]);
            setNewComment('');
            setSelectedFiles([]);
            if (onCommentAdded) onCommentAdded();
        } catch (err) {
            console.error('Failed to add comment:', err);
            alert('Failed to post comment. Check file types and sizes.');
        } finally {
            setSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;
        try {
            const updated = await updateComment(editingCommentId, { content: editContent });
            setComments(comments.map(c => c._id === editingCommentId ? updated : c));
            setEditingCommentId(null);
        } catch (err) {
            console.error('Failed to update comment:', err);
        }
    };

    const handleDelete = async (commentId) => {
        setConfirmDialog({
            title: 'Delete Comment?',
            message: 'This comment will be permanently deleted.',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    await deleteComment(commentId);
                    setComments(comments.filter(c => c._id !== commentId));
                    if (onCommentAdded) onCommentAdded();
                    setConfirmDialog(null);
                } catch (err) {
                    console.error('Failed to delete comment:', err);
                    setConfirmDialog(null);
                }
            },
            onCancel: () => setConfirmDialog(null)
        });
    };

    const formatContent = (content) => {
        if (!content) return '';
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="mention-highlight">{part}</span>;
            }
            return part;
        });
    };

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

    if (!task) return null;

    return (
        <div className="comment-sidebar-overlay" onClick={onClose}>
            <div className="comment-sidebar" onClick={e => e.stopPropagation()}>
                <div className="sidebar-header">
                    <h3>Discussions</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="task-info">
                    <h4>{task.title}</h4>
                </div>

                <div className="comments-list">
                    {loading ? (
                        <div className="loading-state">Syncing messages...</div>
                    ) : comments.length === 0 ? (
                        <div className="empty-state">No comments yet. @mention someone to start!</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment._id} className="comment-item">
                                <div className="comment-header">
                                    <div className="comment-author">
                                        <div className="author-avatar">
                                            {comment.userId?.name?.charAt(0)}
                                        </div>
                                        <div className="author-info">
                                            <span className="author-name">{comment.userId?.name}</span>
                                            <span className="comment-date">{formatTimeAgo(comment.createdAt)}</span>
                                        </div>
                                    </div>
                                    {user?._id === comment.userId?._id && !editingCommentId && (
                                        <div className="comment-actions">
                                            <button onClick={() => { setEditingCommentId(comment._id); setEditContent(comment.content); }}>Edit</button>
                                            <button onClick={() => handleDelete(comment._id)}>Delete</button>
                                        </div>
                                    )}
                                </div>

                                {editingCommentId === comment._id ? (
                                    <form onSubmit={handleUpdate} className="edit-form">
                                        <textarea id="edit-comment" name="editContent" value={editContent} onChange={e => setEditContent(e.target.value)} />
                                        <div className="edit-actions">
                                            <button type="submit" className="btn-save">Save</button>
                                            <button type="button" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="comment-body">
                                            {formatContent(comment.content)}
                                        </div>
                                        {comment.attachments && comment.attachments.length > 0 && (
                                            <div className="comment-attachments">
                                                {comment.attachments.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={`${origin}/uploads/${file.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="attachment-link"
                                                        title={`${file.filename} (${Math.round(file.size / 1024)} KB)`}
                                                    >
                                                        📎 {file.filename}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="comment-form-container">
                    {showMentions && filteredTeam.length > 0 && (
                        <div className="mention-autocomplete">
                            {filteredTeam.map(m => (
                                <div
                                    key={m.user._id}
                                    className="mention-option"
                                    onClick={() => selectMention(m.user.name)}
                                >
                                    <span className="m-avatar">{m.user.name[0]}</span>
                                    <span className="m-name">{m.user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedFiles.length > 0 && (
                        <div className="selected-files-preview">
                            {selectedFiles.map((file, i) => (
                                <div key={i} className="file-preview-item">
                                    <span className="file-name">{file.name}</span>
                                    <button type="button" onClick={() => removeFile(i)}>&times;</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {uploadProgress > 0 && (
                        <div className="upload-progress-bar">
                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}

                    <form className="comment-form" onSubmit={handleSubmit}>
                        <div className="textarea-wrapper">
                            <textarea
                                ref={textareaRef}
                                id="new-comment"
                                name="newComment"
                                placeholder="Write a comment... use @ to mention team"
                                value={newComment}
                                onChange={handleTextareaChange}
                                disabled={submitting}
                            />
                            <div className="form-tools">
                                <label className="attachment-btn">
                                    📎 <input
                                        type="file"
                                        id="comment-attachment"
                                        name="attachments"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                </label>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting || (!newComment.trim() && selectedFiles.length === 0)}>
                            {submitting ? 'Sharing...' : 'Post Comment'}
                        </button>
                    </form>
                </div>
            </div>

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

export default CommentSidebar;
