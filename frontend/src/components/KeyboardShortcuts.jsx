import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const KeyboardShortcuts = () => {
  const navigate = useNavigate();

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
        const mobileMenu = document.querySelector('.mobile-menu-overlay.open');
        if (mobileMenu) {
          const closeButton = mobileMenu.querySelector('.mobile-menu-close');
          if (closeButton) closeButton.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
};

