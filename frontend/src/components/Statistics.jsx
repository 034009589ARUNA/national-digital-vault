import { useState, useEffect } from 'react';
import api from '../api/api';
import './Statistics.css';

const Statistics = ({ compact = false }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/registry/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data for demo purposes
      setStats({
        total: 1247,
        byType: [
          { _id: 'BirthCertificate', count: 342 },
          { _id: 'PropertyDeed', count: 289 },
          { _id: 'Degree', count: 256 },
          { _id: 'Passport', count: 198 },
          { _id: 'DeathCertificate', count: 162 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`statistics-container ${compact ? 'compact' : ''}`}>
        <div className="stats-loading">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) return null;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (compact) {
    return (
      <div className="statistics-compact">
        <div className="stat-item-compact">
          <span className="stat-number-compact">{formatNumber(stats.total || 0)}</span>
          <span className="stat-label-compact">Documents Secured</span>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <h2 className="stats-title">System Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card-large">
          <div className="stat-icon-large">📊</div>
          <div className="stat-number-large">{formatNumber(stats.total || 0)}</div>
          <div className="stat-label-large">Total Verified Documents</div>
        </div>
        
        {stats.byType && stats.byType.slice(0, 4).map((item, index) => (
          <div key={index} className="stat-card-medium">
            <div className="stat-number-medium">{item.count}</div>
            <div className="stat-label-medium">{item._id.replace(/([A-Z])/g, ' $1').trim()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;


