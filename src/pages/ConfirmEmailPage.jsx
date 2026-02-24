import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApiUrl } from '../services/api';

const ConfirmEmailPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('confirming'); // confirming, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                const response = await fetch(`${getApiUrl()}/auth/confirm/${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Something went wrong. Please try again or contact support.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Connection error. Please try again later.');
            }
        };

        if (token) {
            confirmEmail();
        }
    }, [token]);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--itdb-gold)' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 22H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M10 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M14 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M18 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M2 12H22L12 4L2 12Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                </div>

                {status === 'confirming' && (
                    <>
                        <h1>Confirming Email...</h1>
                        <p className="auth-subtitle">Please wait a moment while we verify your account.</p>
                        <div className="loading-spinner" style={{ margin: '20px auto' }}></div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h1 style={{ color: '#48bb78' }}>Success!</h1>
                        <p className="auth-subtitle">{message}</p>
                        <Link to="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none', marginTop: '20px' }}>
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h1 style={{ color: '#f56565' }}>Verification Failed</h1>
                        <p className="auth-subtitle">{message}</p>
                        <Link to="/signup" className="btn-primary" style={{ display: 'block', textDecoration: 'none', marginTop: '20px' }}>
                            Try Signing Up Again
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmailPage;
