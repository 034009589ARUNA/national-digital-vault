import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Logo from './components/Logo';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastManager';
import MobileMenu from './components/MobileMenu';
import LoadingSpinner from './components/LoadingSpinner';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import {
  LazyLandingPage,
  LazyUploadForm,
  LazyDashboard,
  LazyVerify,
  LazyProofPage,
  LazyLogin,
  LazyRegister,
  LazyGovernmentPortal,
  LazyPublicRegistry
} from './utils/lazyLoad';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const GovernmentRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'GovernmentOfficer' && user?.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <Logo size="default" showText={true} />
        <div className="nav-links">
          <Link to="/upload" className="nav-link" aria-label="Upload documents">Upload</Link>
          <Link to="/registry" className="nav-link" aria-label="Public registry">Public Registry</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" aria-label="Dashboard">Dashboard</Link>
              {(user?.role === 'GovernmentOfficer' || user?.role === 'Admin') && (
                <Link to="/government" className="nav-link" aria-label="Government portal">Government Portal</Link>
              )}
              <Link to="/verify" className="nav-link" aria-label="Verify documents">Verify</Link>
              <span className="nav-user" aria-label={`Welcome, ${user?.name}`}>Welcome, {user?.name}</span>
              <button onClick={logout} className="nav-link logout-btn" aria-label="Logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" aria-label="Login">Login</Link>
              <Link to="/register" className="nav-link" aria-label="Register">Register</Link>
            </>
          )}
          <ThemeToggle />
        </div>
        <MobileMenu />
      </div>
    </nav>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <KeyboardShortcuts />
              <div className="app">
                <Navbar />
                <main className="main-content" role="main">
                  <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
                    <Routes>
                      <Route path="/login" element={<LazyLogin />} />
                      <Route path="/register" element={<LazyRegister />} />
                      <Route path="/" element={<LazyLandingPage />} />
                      <Route path="/upload" element={<LazyUploadForm />} />
                      <Route path="/registry" element={<LazyPublicRegistry />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <PrivateRoute>
                            <LazyDashboard />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/government" 
                        element={
                          <GovernmentRoute>
                            <LazyGovernmentPortal />
                          </GovernmentRoute>
                        } 
                      />
                      <Route path="/verify" element={<LazyVerify />} />
                      <Route path="/verify/:hash" element={<LazyProofPage />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
