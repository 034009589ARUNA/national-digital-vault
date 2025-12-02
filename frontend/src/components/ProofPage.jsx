import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/api'
import './ProofPage.css'

function ProofPage() {
  const { hash } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (hash) {
      verifyHash(hash)
    }
  }, [hash])

  const verifyHash = async (documentHash) => {
    try {
      setLoading(true)
      const response = await api.get(`/verify/hash/${documentHash}`)
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="proof-container">
        <div className="card">
          <p>Verifying document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="proof-container">
        <div className="card">
          <div className="alert alert-error">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="proof-container">
      <div className="card">
        <div className={`verification-result ${result?.verified ? 'verified' : 'not-verified'}`}>
          <div className="result-header">
            {result?.verified ? (
              <>
                <span className="status-icon">✅</span>
                <h1>DOCUMENT VERIFIED</h1>
                <p className="status-subtitle">This document is authentic and stored on the blockchain</p>
              </>
            ) : (
              <>
                <span className="status-icon">❌</span>
                <h1>DOCUMENT NOT VERIFIED</h1>
                <p className="status-subtitle">This document could not be verified</p>
              </>
            )}
          </div>

          {result && (
            <>
              <div className="qr-section">
                <QRCodeSVG value={window.location.href} size={250} />
                <p className="qr-label">Scan QR code to view this verification</p>
              </div>

              <div className="proof-details">
                <div className="detail-section">
                  <h2>Document Hash</h2>
                  <code>{result.hash}</code>
                </div>

                <div className="detail-section">
                  <h2>Blockchain Verification</h2>
                  <p className={result.blockchain.exists ? 'status-ok' : 'status-fail'}>
                    {result.blockchain.exists ? '✓ Document hash found on blockchain' : '✗ Document hash not found on blockchain'}
                  </p>
                  {result.blockchain.owner && (
                    <p><strong>Owner Address:</strong> <code>{result.blockchain.owner}</code></p>
                  )}
                </div>

                {result.database.exists && result.database.document && (
                  <>
                    <div className="detail-section">
                      <h2>Document Information</h2>
                      <p><strong>Filename:</strong> {result.database.document.filename}</p>
                      <p><strong>Uploaded:</strong> {new Date(result.database.document.timestamp).toLocaleString()}</p>
                    </div>

                    <div className="detail-section">
                      <h2>Blockchain Transaction</h2>
                      <p><strong>Transaction Hash:</strong></p>
                      <code>{result.database.document.txHash}</code>
                      <p className="tx-note">This transaction hash proves the document was stored on the blockchain</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProofPage
