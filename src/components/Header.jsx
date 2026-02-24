import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationList from './NotificationList';
import { getNotifications } from '../services/api';

const Header = () => {
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const isAuthPage = ['/login', '/signup'].includes(location.pathname);

    // Fetch unread count periodically
    useEffect(() => {
        if (!user) return;

        const checkNotifications = async () => {
            try {
                const data = await getNotifications();
                const count = data.filter(n => !n.isRead).length;
                setUnreadCount(count);
            } catch (err) {
                console.error('Error polling notifications:', err);
            }
        };

        checkNotifications();
        const interval = setInterval(checkNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
        }
    };

    return (
        <nav className={`navbar ${isAuthPage ? 'navbar-auth' : ''}`}>
            <div className="navbar-brand">
                <Link to="/" className="navbar-brand-link">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-logo">
                        <path d="M3 12L12 3L21 12" stroke="var(--itdb-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 10V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V10" stroke="var(--itdb-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 21V12H15V21" stroke="var(--itdb-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="brand-name">ጎጆ ቤቴ <span className="brand-subtitle">Project manager</span></span>
                </Link>
            </div>

            {user && (
                <form className="navbar-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        id="global-search"
                        name="search"
                        aria-label="Search projects and tasks"
                        placeholder="Search projects & tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </form>
            )}
            <ul className="navbar-nav">
                {user ? (
                    <>
                        <li className="notification-item">
                            <button
                                className="nav-icon-btn"
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                            >
                                <span className="icon">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="badge">{unreadCount}</span>
                                )}
                            </button>
                            <NotificationList
                                isOpen={isNotifOpen}
                                onClose={() => setIsNotifOpen(false)}
                            />
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Signup</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Header;
