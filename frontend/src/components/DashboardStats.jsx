import { useState, useEffect } from 'react';
import api from '../api/api';
import SimpleChart from './SimpleChart';
import './DashboardStats.css';

const DashboardStats = ({ documents = [] }) => {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    byType: {}
  });

  useEffect(() => {
    calculateStats();
  }, [documents]);

  const calculateStats = () => {
    const total = documents.length;
    const verified = documents.filter(doc => doc.isVerified).length;
    const pending = total - verified;
    
    // Count by document type
    const byType = {};
    documents.forEach(doc => {
      const type = doc.documentType || 'Other';
      byType[type] = (byType[type] || 0) + 1;
    });

    setStats({ total, verified, pending, byType });
  };

  const verificationRate = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  return (
    <div className="dashboard-stats">
      <h2 className="stats-heading">Your Document Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Documents</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.verified}</div>
            <div className="stat-label">Verified</div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${verificationRate}%` }}
              ></div>
            </div>
            <span className="progress-text">{verificationRate}%</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
        </div>

        {Object.keys(stats.byType).length > 0 && (
          <div className="stat-card info">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{Object.keys(stats.byType).length}</div>
              <div className="stat-label">Document Types</div>
            </div>
            <div className="type-list">
              {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => (
                <div key={type} className="type-item">
                  <span className="type-name">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {Object.keys(stats.byType).length > 0 && (
        <div className="charts-section">
          <SimpleChart
            title="Documents by Type"
            data={Object.entries(stats.byType).map(([type, count]) => ({
              label: type.replace(/([A-Z])/g, ' $1').trim(),
              value: count,
              _id: type
            }))}
            type="bar"
          />
        </div>
      )}
    </div>
  );
};

export default DashboardStats;

