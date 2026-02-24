import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', isDanger = true }) => {
    return (
        <div className="confirm-overlay">
            <div className="confirm-modal">
                <div className="confirm-header">
                    <h2>{title}</h2>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-footer">
                    <button 
                        onClick={onCancel}
                        className="btn btn-secondary confirm-btn"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`btn confirm-btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
