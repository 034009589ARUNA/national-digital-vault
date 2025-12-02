import { useState, useEffect } from 'react';
import api from '../api/api';
import './PublicRegistry.css';

const PublicRegistry = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      const params = {};
      if (searchTerm) params.name = searchTerm;
      if (documentType) params.documentType = documentType;
      
      const response = await api.get('/registry/search', { params });
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/registry/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="public-registry">
      <div className="registry-header">
        <h1>📋 Public Registry of Verified Documents</h1>
        <p>Search and verify official documents stored in the National Digital Document Vault</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="type-select"
          >
            <option value="">All Document Types</option>
            <option value="BirthCertificate">Birth Certificate</option>
            <option value="DeathCertificate">Death Certificate</option>
            <option value="PropertyDeed">Property Deed</option>
            <option value="Degree">Degree</option>
            <option value="Passport">Passport</option>
            <option value="CourtDocument">Court Document</option>
          </select>
          <button type="submit" className="search-btn">Search</button>
        </form>
      </div>

      {stats && (
        <div className="stats-section">
          <h3>Document Statistics</h3>
          <div className="stats-list">
            {stats.byType.map((stat) => (
              <div key={stat._id} className="stat-item">
                <span className="stat-label">{stat._id || 'Other'}:</span>
                <span className="stat-value">{stat.count}</span>
              </div>
            ))}
            <div className="stat-item total">
              <span className="stat-label">Total Verified:</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>
        </div>
      )}

      <div className="documents-section">
        <h3>Verified Documents ({documents.length})</h3>
        {documents.length === 0 ? (
          <p className="no-results">No documents found</p>
        ) : (
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc._id} className="registry-card">
                <h4>{doc.metadata?.name || doc.filename || 'Document'}</h4>
                <p><strong>Type:</strong> {doc.documentType}</p>
                <p><strong>Hash:</strong> {doc.hash.substring(0, 16)}...</p>
                <p><strong>Verified:</strong> {new Date(doc.timestamp).toLocaleDateString()}</p>
                <a 
                  href={`/verify/${doc.hash}`}
                  className="verify-link"
                >
                  View Verification
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRegistry;

