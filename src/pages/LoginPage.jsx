import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
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

        setLoading(true);

        // Call login
        const result = await login(formData.email, formData.password);

        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-side">
                <div className="auth-card">
                    <div style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--itdb-gold)' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 22H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M6 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M10 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M2 12H22L12 4L2 12Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 style={{ marginBottom: '0px', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'white', textAlign: 'center' }}>ጎጆ ቤቴ</h1>
                    <h2 style={{ marginBottom: '4px', fontSize: '1.2rem', fontWeight: '600', color: 'var(--itdb-gold)', textAlign: 'center', opacity: 0.9 }}>Login</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '16px', opacity: 0.5, fontSize: '0.9rem', textAlign: 'center' }}>Enter your workspace</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="you@company.com"
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
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-link">
                        Don't have an account? <Link to="/signup">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
