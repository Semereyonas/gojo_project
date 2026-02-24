import React, { useState, useEffect } from 'react';
import { getApiOrigin } from '../services/api';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, onUpload, onRemove }) => {
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Reset preview when currentAvatar changes (e.g. after successful upload)
    useEffect(() => {
        setPreview(null);
        setSelectedFile(null);
    }, [currentAvatar]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadClick = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        setUploading(true);
        try {
            await onUpload(formData);
            // Parent handles state update via onUpload prop logic usually, 
            // but we reset local state via useEffect above
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const handleCancelPreview = () => {
        setPreview(null);
        setSelectedFile(null);
    };

    const origin = getApiOrigin();
    const avatarSrc = preview || (currentAvatar && !currentAvatar.startsWith('http') ? `${origin}/uploads/${currentAvatar}` : currentAvatar) || 'https://via.placeholder.com/150';

    return (
        <div className="avatar-upload-component">
            <div className="avatar-wrapper">
                <img src={avatarSrc} alt="Avatar" className="avatar-image" />
                <label htmlFor="avatar-input" className="avatar-overlay">
                    <span>📷 Change</span>
                </label>
                <input
                    type="file"
                    id="avatar-input"
                    name="avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="avatar-file-input"
                />
            </div>

            <div className="avatar-actions">
                {selectedFile ? (
                    <div className="upload-actions">
                        <button
                            onClick={handleUploadClick}
                            disabled={uploading}
                            className="btn-upload"
                        >
                            {uploading ? 'Uploading...' : 'Get New Look ✨'}
                        </button>
                        <button
                            onClick={handleCancelPreview}
                            className="btn-cancel"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    currentAvatar && (
                        <button onClick={onRemove} className="btn-remove">
                            Remove Avatar
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default AvatarUpload;
