import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './MobileMenu.css';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <span className={`hamburger ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div 
        className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      >
        <nav 
          className={`mobile-menu ${isOpen ? 'open' : ''}`}
          id="mobile-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-menu-header">
            <h3>Menu</h3>
            <button
              className="mobile-menu-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="mobile-menu-content">
            <Link to="/" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/upload" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
              Upload
            </Link>
            <Link to="/registry" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
              Public Registry
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                {(user?.role === 'GovernmentOfficer' || user?.role === 'Admin') && (
                  <Link to="/government" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
                    Government Portal
                  </Link>
                )}
                <Link to="/verify" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
                  Verify
                </Link>
                <div className="mobile-menu-divider"></div>
                <div className="mobile-menu-user">
                  <span className="mobile-menu-user-name">Welcome, {user?.name}</span>
                  <span className="mobile-menu-user-role">{user?.role}</span>
                </div>
                <button className="mobile-menu-link logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="mobile-menu-divider"></div>
                <Link to="/login" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="mobile-menu-link" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </>
            )}

            <div className="mobile-menu-divider"></div>
            <div className="mobile-menu-footer">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;

