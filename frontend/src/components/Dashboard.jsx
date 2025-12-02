import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import api from "../api/api"
import Toast from "./Toast"
import { DocumentCardSkeleton } from "./LoadingSkeleton"
import DashboardStats from "./DashboardStats"
import ActivityFeed from "./ActivityFeed"
import "./Dashboard.css"

function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    let filtered = [...documents]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.hash.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.documentType === filterType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.timestamp) - new Date(a.timestamp)
      } else if (sortBy === "oldest") {
        return new Date(a.timestamp) - new Date(b.timestamp)
      } else if (sortBy === "name") {
        return a.filename.localeCompare(b.filename)
      }
      return 0
    })

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, filterType, sortBy])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/documents")
      setDocuments(response.data)
      setToast({ message: "Documents loaded successfully", type: "success" })
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to fetch documents"
      setError(errorMsg)
      setToast({ message: errorMsg, type: "error" })
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

  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setSortBy("newest")
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="card">
          <h1>My Documents</h1>
          <p className="subtitle">View all your uploaded documents</p>
          <div className="documents-grid">
            {[...Array(3)].map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {documents.length > 0 && <DashboardStats documents={documents} />}

      <div className="dashboard-layout">
        <div className="dashboard-main">
          <div className="card">
        <h1>My Documents</h1>
        <p className="subtitle">View all your uploaded documents</p>

        {documents.length > 0 && (
          <div className="filter-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by filename or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="all">All Types</option>
                <option value="BirthCertificate">Birth Certificate</option>
                <option value="DeathCertificate">Death Certificate</option>
                <option value="PropertyDeed">Property Deed</option>
                <option value="Degree">Degree</option>
                <option value="Passport">Passport</option>
                <option value="CourtDocument">Court Document</option>
                <option value="Other">Other</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
              {(searchTerm || filterType !== "all" || sortBy !== "newest") && (
                <button onClick={clearFilters} className="clear-btn">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {documents.length > 0 && filteredDocuments.length < documents.length && (
          <p className="filter-results">
            Showing {filteredDocuments.length} of {documents.length} documents
          </p>
        )}

        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents uploaded yet.</p>
            <a href="/" className="link-btn">
              Upload your first document
            </a>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="empty-state">
            <p>No documents match your search criteria.</p>
            <button onClick={clearFilters} className="link-btn">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="documents-grid">
            {filteredDocuments.map((doc) => (
              <div key={doc._id} className="document-card">
                <div className="document-header">
                  <h3>{doc.filename}</h3>
                  <button className="qr-btn" onClick={() => setSelectedDoc(selectedDoc === doc._id ? null : doc._id)}>
                    {selectedDoc === doc._id ? "Hide QR" : "Show QR"}
                  </button>
                </div>

                {selectedDoc === doc._id && (
                  <div className="qr-container">
                    <QRCodeSVG value={doc.verificationUrl} size={200} />
                    <p className="qr-label">Scan to verify</p>
                  </div>
                )}

                <div className="document-details">
                  <p>
                    <strong>Uploaded:</strong> {formatDate(doc.timestamp)}
                  </p>
                  <p>
                    <strong>Hash:</strong> <code>{formatHash(doc.hash)}</code>
                  </p>
                  <p>
                    <strong>TX Hash:</strong> <code>{formatHash(doc.txHash)}</code>
                  </p>
                  <p>
                    <strong>Size:</strong> {(doc.fileSize / 1024).toFixed(2)} KB
                  </p>
                  <a href={doc.verificationUrl} target="_blank" rel="noopener noreferrer" className="verify-link">
                    View Verification Page →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
        
        {documents.length > 0 && (
          <div className="dashboard-sidebar">
            <ActivityFeed limit={5} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
