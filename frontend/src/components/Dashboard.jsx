import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/api'
import './Dashboard.css'

function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/documents')
      setDocuments(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatHash = (hash) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="card">
          <p>Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="card">
        <h1>My Documents</h1>
        <p className="subtitle">View all your uploaded documents</p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents uploaded yet.</p>
            <a href="/" className="link-btn">Upload your first document</a>
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map((doc) => (
              <div key={doc._id} className="document-card">
                <div className="document-header">
                  <h3>{doc.filename}</h3>
                  <button
                    className="qr-btn"
                    onClick={() => setSelectedDoc(selectedDoc === doc._id ? null : doc._id)}
                  >
                    {selectedDoc === doc._id ? 'Hide QR' : 'Show QR'}
                  </button>
                </div>

                {selectedDoc === doc._id && (
                  <div className="qr-container">
                    <QRCodeSVG value={doc.verificationUrl} size={200} />
                    <p className="qr-label">Scan to verify</p>
                  </div>
                )}

                <div className="document-details">
                  <p><strong>Uploaded:</strong> {formatDate(doc.timestamp)}</p>
                  <p><strong>Hash:</strong> <code>{formatHash(doc.hash)}</code></p>
                  <p><strong>TX Hash:</strong> <code>{formatHash(doc.txHash)}</code></p>
                  <p><strong>Size:</strong> {(doc.fileSize / 1024).toFixed(2)} KB</p>
                  <a 
                    href={doc.verificationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="verify-link"
                  >
                    View Verification Page →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

