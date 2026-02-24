import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        // Call signup
        const result = await signup(formData.name, formData.email, formData.password);

        setLoading(false);

        if (result.success) {
            setSuccess(true);
        } else {
            // Show error on failure
            setError(result.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-side">
                <div className="auth-card">
                    <div style={{ textAlign: 'center', marginBottom: '12px', color: 'var(--itdb-gold)' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 22H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M6 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M10 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M2 12H22L12 4L2 12Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {success ? (
                        <div className="signup-success-view" style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div className="success-icon-wrapper" style={{ marginBottom: '40px', position: 'relative', display: 'inline-block' }}>
                                <div style={{ position: 'absolute', inset: '-20px', background: 'var(--itdb-gold)', opacity: '0.15', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                                <svg className="floating-visual" width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', filter: 'drop-shadow(0 0 20px rgba(198, 161, 91, 0.4))' }}>
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="var(--itdb-gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 6L12 13L2 6" stroke="var(--itdb-gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 13V20" stroke="var(--itdb-gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 4" />
                                    <circle cx="18" cy="18" r="4" fill="var(--bg-primary)" stroke="var(--itdb-gold)" strokeWidth="1.2" />
                                    <path d="M16.5 18L17.5 19L19.5 17" stroke="var(--itdb-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <h1 style={{ color: 'var(--text-primary)', fontSize: '2.8rem', marginBottom: '16px', fontWeight: '900', letterSpacing: '-0.03em' }}>ጎጆ ቤቴ</h1>
                            <h2 style={{ color: 'var(--itdb-gold)', fontSize: '1.5rem', marginBottom: '24px', fontWeight: '700' }}>Access Granted</h2>
                            <p className="auth-subtitle" style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto 40px' }}>
                                Your official ITDB account has been <br />
                                <span style={{ color: 'var(--itdb-gold)', fontWeight: '700', fontSize: '1.3rem', display: 'block', marginTop: '12px' }}>Activated</span>
                            </p>

                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(198, 161, 91, 0.1)', marginBottom: '40px' }}>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                    Your credentials have been verified. <br />You are now authorized to enter the <strong>Bureau Workspace</strong>.
                                </p>
                            </div>

                            <Link to="/login" className="btn-primary" style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                textDecoration: 'none',
                                padding: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, var(--itdb-gold) 0%, #a68144 100%)',
                                boxShadow: '0 8px 25px rgba(198, 161, 91, 0.3)'
                            }}>
                                <span>Continue to Dashboard</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </Link>

                            <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Need to change something? <span style={{ color: 'var(--itdb-gold)', cursor: 'pointer', fontWeight: '600' }} onClick={() => setSuccess(false)}>Go back</span>
                            </p>
                        </div>
                    ) : (
                        <>
                            <h1 style={{ marginBottom: '0px', fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-0.04em' }}>ጎጆ ቤቴ</h1>
                            <h2 style={{ marginBottom: '8px', fontSize: '1.5rem', fontWeight: '700', color: 'var(--itdb-gold)' }}>Signup</h2>
                            <p className="auth-subtitle" style={{ marginBottom: '16px', opacity: 0.6 }}>Create your organizational workspace</p>

                            <div style={{ marginBottom: '24px', padding: '12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(198, 161, 91, 0.1)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0, fontStyle: 'italic' }}>
                                    "Complexity is the enemy, <span style={{ color: 'var(--itdb-gold)', fontWeight: '600' }}>ጎጆ ቤቴ</span> is the solution."
                                </p>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your name"
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Signing up...' : 'Sign Up'}
                                </button>
                            </form>

                            <p className="auth-link">
                                Already have an account? <Link to="/login">Log in</Link>
                            </p>

                            <div style={{ marginTop: '24px', display: 'flex', gap: '15px', justifyContent: 'center', opacity: 0.5 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--itdb-gold)' }}>100%</div>
                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Security</div>
                                </div>
                                <div style={{ width: '1px', background: 'var(--border-color)', opacity: 0.3 }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--itdb-gold)' }}>High</div>
                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Innovation</div>
                                </div>
                                <div style={{ width: '1px', background: 'var(--border-color)', opacity: 0.3 }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--itdb-gold)' }}>Peak</div>
                                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Velocity</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.3, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <span>Secured by ITDB Cyber-Security Framework</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="auth-visual-side">
                {/* Background Pattern */}
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }}>
                    <pattern id="bubbles" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#bubbles)" />
                </svg>

                <div className="auth-visual-content">
                    <div style={{ marginBottom: '50px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="glow-effect"></div>
                        {/* Abstract Team/Connectivity Illustration */}
                        <svg className="floating-visual" width="360" height="360" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 60px rgba(44, 122, 123, 0.2))', color: 'var(--itdb-teal)', position: 'relative', zIndex: 1 }}>
                            <defs>
                                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--itdb-teal)" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="var(--itdb-gold)" stopOpacity="0.8" />
                                </linearGradient>
                            </defs>

                            {/* Geometric Network Foundation */}
                            <path d="M80 20L140 50V110L80 140L20 110V50L80 20Z" stroke="currentColor" strokeWidth="0.5" opacity="0.3" strokeDasharray="4 4" />
                            <path d="M80 20V140M20 50L140 110M20 110L140 50" stroke="currentColor" strokeWidth="0.25" opacity="0.2" />

                            {/* Neural Nodes with Pulse */}
                            <g>
                                <circle cx="80" cy="20" r="3" fill="var(--itdb-gold)">
                                    <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="140" cy="50" r="3" fill="var(--itdb-teal)">
                                    <animate attributeName="r" values="3;5;3" dur="4s" repeatCount="indefinite" delay="1s" />
                                </circle>
                                <circle cx="140" cy="110" r="3" fill="var(--itdb-gold)">
                                    <animate attributeName="r" values="3;5;3" dur="3.5s" repeatCount="indefinite" delay="0.5s" />
                                </circle>
                                <circle cx="80" cy="140" r="3" fill="var(--itdb-teal)">
                                    <animate attributeName="r" values="3;5;3" dur="4.5s" repeatCount="indefinite" delay="1.5s" />
                                </circle>
                                <circle cx="20" cy="110" r="3" fill="var(--itdb-gold)">
                                    <animate attributeName="r" values="3;5;3" dur="3.2s" repeatCount="indefinite" delay="0.8s" />
                                </circle>
                                <circle cx="20" cy="50" r="3" fill="var(--itdb-teal)">
                                    <animate attributeName="r" values="3;5;3" dur="3.8s" repeatCount="indefinite" delay="1.2s" />
                                </circle>
                                <circle cx="80" cy="80" r="6" fill="url(#glowGradient)">
                                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                                </circle>
                            </g>

                            {/* High-Velocity Data Streams */}
                            <path d="M80 80L140 50" stroke="url(#glowGradient)" strokeWidth="1" strokeDasharray="5 50" opacity="0.8">
                                <animate attributeName="stroke-dashoffset" from="55" to="0" dur="2s" repeatCount="indefinite" />
                            </path>
                            <path d="M80 80L80 20" stroke="url(#glowGradient)" strokeWidth="1" strokeDasharray="5 50" opacity="0.8">
                                <animate attributeName="stroke-dashoffset" from="55" to="0" dur="1.5s" repeatCount="indefinite" />
                            </path>
                            <path d="M80 80L20 110" stroke="url(#glowGradient)" strokeWidth="1" strokeDasharray="5 50" opacity="0.8">
                                <animate attributeName="stroke-dashoffset" from="55" to="0" dur="2.5s" repeatCount="indefinite" />
                            </path>

                            {/* Inner Digital Lattice */}
                            <rect x="75" y="75" width="10" height="10" stroke="currentColor" strokeWidth="0.5" transform="rotate(45 80 80)" opacity="0.6" />
                        </svg>
                    </div>

                    <div style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginBottom: '1.5rem' }}>
                        ጎጆ ቤቴ Project
                    </div>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1', color: 'white', marginBottom: '1rem' }}>
                        Project <br />Management <br />App
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>Strategic innovation and bureaucratic excellence in one unified platform.</p>

                    <div style={{ marginTop: '40px', opacity: 0.4, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        Bureau Onboarding Portal
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
