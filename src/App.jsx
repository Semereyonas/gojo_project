import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';
import Loader from './components/spinner.jsx';

// Lazy-loaded pages to keep initial bundle small and speed up navigation
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AcceptInvitePage = lazy(() => import('./pages/AcceptInvitePage.jsx'));
const UserActivityPage = lazy(() => import('./pages/UserActivityPage.jsx'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard.jsx'));
const ConfirmEmailPage = lazy(() => import('./pages/ConfirmEmailPage.jsx'));
const DiscussionsPage = lazy(() => import('./pages/DiscussionsPage.jsx'));

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {user && <Sidebar />}
        <div className={`main-wrapper ${!user ? 'full-width' : ''}`}>
          <Header />
          <main className="main-content">
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
                <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
                <Route path="/join/:projectId/:token" element={<AcceptInvitePage />} />
                <Route path="/confirm/:token" element={<ConfirmEmailPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <SearchResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <UserActivityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:projectId/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/discussions"
                  element={
                    <ProtectedRoute>
                      <DiscussionsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
