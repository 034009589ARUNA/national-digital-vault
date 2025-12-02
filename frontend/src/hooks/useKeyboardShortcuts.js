import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastManager';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { info } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger shortcuts when not typing in input fields
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K: Quick navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        info('Press / for search, u for upload, d for dashboard');
      }

      // Slash: Search/Focus search
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // u: Upload page
      if (e.key === 'u' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        navigate('/upload');
      }

      // d: Dashboard
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        navigate('/dashboard');
      }

      // h: Home
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        navigate('/');
      }

      // Escape: Close modals/menus
      if (e.key === 'Escape') {
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu-overlay.open');
        if (mobileMenu) {
          const closeButton = mobileMenu.querySelector('.mobile-menu-close');
          if (closeButton) closeButton.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, info]);
};

