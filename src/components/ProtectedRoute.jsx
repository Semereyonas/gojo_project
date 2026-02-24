import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // If loading, show spinner
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // If no user, redirect to /login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user exists, render children
    return children;
};

export default ProtectedRoute;
