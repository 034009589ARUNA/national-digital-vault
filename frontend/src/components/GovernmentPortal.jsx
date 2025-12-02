import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './GovernmentPortal.css';

const GovernmentPortal = () => {
  const { user } = useAuth();
  const [pendingDocs, setPendingDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        api.get('/government/pending'),
        api.get('/government/dashboard')
      ]);
      setPendingDocs(pendingRes.data.documents);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId) => {
    try {
      await api.post(`/government/approve/${documentId}`);
      alert('Document approved successfully!');
      fetchData();
    } catch (error) {
      alert('Error approving document: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="government-portal">
      <div className="portal-header">
        <h1>🏛️ Government Agency Portal</h1>
        <p>Welcome, {user?.name} ({user?.agency})</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Documents</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card verified">
            <h3>Verified</h3>
            <p className="stat-number">{stats.verified}</p>
          </div>
          <div className="stat-card pending">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </div>
      )}

      <div className="pending-section">
        <h2>Pending Approvals</h2>
        {pendingDocs.length === 0 ? (
          <p>No pending documents</p>
        ) : (
          <div className="documents-list">
            {pendingDocs.map((doc) => (
              <div key={doc._id} className="document-card">
                <div className="doc-info">
                  <h3>{doc.filename}</h3>
                  <p><strong>Type:</strong> {doc.documentType}</p>
                  <p><strong>Owner:</strong> {doc.owner?.name || 'N/A'}</p>
                  <p><strong>Hash:</strong> {doc.hash.substring(0, 20)}...</p>
                  <p><strong>Approvals:</strong> {doc.approvalCount} / {doc.requiredApprovals}</p>
                  <p><strong>Uploaded:</strong> {new Date(doc.timestamp).toLocaleString()}</p>
                </div>
                <div className="doc-actions">
                  <button 
                    onClick={() => handleApprove(doc._id)}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <a 
                    href={`/verify/${doc.hash}`}
                    target="_blank"
                    className="view-btn"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentPortal;

