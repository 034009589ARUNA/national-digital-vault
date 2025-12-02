import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ size = 'default', showText = true, onClick }) => {
  const Component = onClick ? 'div' : Link;
  const props = onClick ? { onClick, className: 'logo-link clickable' } : { to: '/', className: 'logo-link' };

  return (
    <Component {...props}>
      <div className={`logo-container logo-${size}`}>
        <svg 
          className="logo-icon" 
          viewBox="0 0 64 64" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield Base */}
          <path
            d="M32 8L12 18V36C12 46.5 19 55.5 32 58C45 55.5 52 46.5 52 36V18L32 8Z"
            stroke="url(#shieldGradient)"
            strokeWidth="3"
            fill="url(#shieldFill)"
            className="logo-shield"
          />
          
          {/* Document inside shield */}
          <path
            d="M28 30H36M28 36H40M28 42H40"
            stroke="url(#documentGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            className="logo-document"
          />
          
          {/* Lock icon */}
          <path
            d="M32 24C30.8954 24 30 24.8954 30 26V28H34V26C34 24.8954 33.1046 24 32 24Z"
            fill="url(#lockGradient)"
            className="logo-lock"
          />
          <rect
            x="26"
            y="28"
            width="12"
            height="8"
            rx="2"
            fill="url(#lockGradient)"
            className="logo-lock-body"
          />
          
          {/* Blockchain chain links */}
          <circle cx="20" cy="20" r="3" fill="url(#chainGradient)" className="logo-chain" />
          <circle cx="44" cy="20" r="3" fill="url(#chainGradient)" className="logo-chain" />
          <path
            d="M23 20L28 18M36 18L41 20"
            stroke="url(#chainGradient)"
            strokeWidth="1.5"
            className="logo-chain-link"
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="shieldGradient" x1="32" y1="8" x2="32" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
            <linearGradient id="shieldFill" x1="32" y1="8" x2="32" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="documentGradient" x1="28" y1="30" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--text-primary)" />
              <stop offset="100%" stopColor="var(--text-secondary)" />
            </linearGradient>
            <linearGradient id="lockGradient" x1="30" y1="24" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-primary-hover)" />
            </linearGradient>
            <linearGradient id="chainGradient" x1="20" y1="17" x2="44" y2="23" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-secondary)" />
              <stop offset="100%" stopColor="var(--accent-primary)" />
            </linearGradient>
          </defs>
        </svg>
        {showText && (
          <div className="logo-text">
            <span className="logo-brand">DocVault</span>
            <span className="logo-tagline">Secure • Immutable • Accessible</span>
          </div>
        )}
      </div>
    </Component>
  );
};

export default Logo;


