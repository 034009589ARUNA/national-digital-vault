import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import Statistics from './Statistics';
import './LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const stats = [
    { number: '1M+', label: 'Documents Secured', icon: '📄' },
    { number: '99.9%', label: 'Uptime', icon: '⚡' },
    { number: '50K+', label: 'Daily Verifications', icon: '✅' },
    { number: '24/7', label: 'Accessible', icon: '🌐' }
  ];

  const features = [
    {
      icon: '🔐',
      title: 'Blockchain Security',
      description: 'Immutable, tamper-proof storage on decentralized blockchain'
    },
    {
      icon: '🤖',
      title: 'AI Verification',
      description: 'Advanced AI detects forgeries and ensures document authenticity'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Verify documents anywhere, anytime with QR code scanning'
    },
    {
      icon: '🏛️',
      title: 'Government Verified',
      description: 'Multi-signature approval system by authorized agencies'
    },
    {
      icon: '🔒',
      title: 'End-to-End Encryption',
      description: 'Your documents encrypted with AES-256 before storage'
    },
    {
      icon: '⚡',
      title: 'Instant Verification',
      description: 'Verify document authenticity in seconds, not days'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🏆</span>
            <span>Trusted by Citizens Nationwide</span>
          </div>
          <h1 className="hero-title">
            Your Documents,
            <br />
            <span className="gradient-text">Protected Forever</span>
          </h1>
          <p className="hero-description">
            Store your most important documents—birth certificates, property deeds, degrees—in a secure, 
            blockchain-verified digital vault. Access them anywhere, anytime, with complete peace of mind.
          </p>
          <div className="hero-cta">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary-large">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary-large">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary-large">
                  Sign In
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card-mini">
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-content">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="section-container">
          <Statistics />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose DocVault?</h2>
            <p className="section-subtitle">
              The most secure, transparent, and accessible document storage solution
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple, secure, and transparent</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Upload Your Document</h3>
                <p>Upload a digital copy of your document. Our AI checks for authenticity.</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Stored on Blockchain</h3>
                <p>Document hash is immutably stored on blockchain for tamper-proof security.</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Government Verification</h3>
                <p>Authorized agencies verify and approve your document.</p>
              </div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Access Anytime</h3>
                <p>Verify authenticity instantly with QR codes or verification URLs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Secure Your Documents?</h2>
            <p className="cta-description">
              Join thousands of citizens who trust DocVault to protect their most important documents.
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn-primary-large">
                Get Started Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

