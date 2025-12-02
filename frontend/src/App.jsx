import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadForm from './components/UploadForm';
import Dashboard from './components/Dashboard';
import Verify from './components/Verify';
import ProofPage from './components/ProofPage';
import Login from './components/Login';
import Register from './components/Register';
import GovernmentPortal from './components/GovernmentPortal';
import PublicRegistry from './components/PublicRegistry';
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
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🏛️ National Digital Document Vault
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Upload</Link>
          <Link to="/registry" className="nav-link">Public Registry</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              {(user?.role === 'GovernmentOfficer' || user?.role === 'Admin') && (
                <Link to="/government" className="nav-link">Government Portal</Link>
              )}
              <Link to="/verify" className="nav-link">Verify</Link>
              <span className="nav-user">Welcome, {user?.name}</span>
              <button onClick={logout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<UploadForm />} />
              <Route path="/registry" element={<PublicRegistry />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/government" 
                element={
                  <GovernmentRoute>
                    <GovernmentPortal />
                  </GovernmentRoute>
                } 
              />
              <Route path="/verify" element={<Verify />} />
              <Route path="/verify/:hash" element={<ProofPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
