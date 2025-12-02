import { useState } from 'react'
import api from '../api/api'
import './Verify.css'

function Verify() {
  const [file, setFile] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file')
      return
    }

    setVerifying(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('document', file)

      const response = await api.post('/verify/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setResult(response.data)
      setFile(null)
      e.target.reset()
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="verify-container">
      <div className="card">
        <h1>Verify Document</h1>
        <p className="subtitle">Verify the authenticity of any document</p>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="verify-file"
              onChange={handleFileChange}
              className="file-input"
              disabled={verifying}
            />
            <label htmlFor="verify-file" className="file-label">
              {file ? file.name : 'Choose a file to verify...'}
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={verifying || !file}
          >
            {verifying ? 'Verifying...' : 'Verify Document'}
          </button>
        </form>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {result && (
          <div className={`verification-result ${result.verified ? 'verified' : 'not-verified'}`}>
            <div className="result-header">
              {result.verified ? (
                <>
                  <span className="status-icon">✅</span>
                  <h2>VERIFIED</h2>
                </>
              ) : (
                <>
                  <span className="status-icon">❌</span>
                  <h2>NOT VERIFIED</h2>
                </>
              )}
            </div>

            <div className="result-details">
              <div className="detail-section">
                <h3>Document Hash</h3>
                <code>{result.hash}</code>
              </div>

              <div className="detail-section">
                <h3>Blockchain Status</h3>
                <p className={result.blockchain.exists ? 'status-ok' : 'status-fail'}>
                  {result.blockchain.exists ? '✓ Found on blockchain' : '✗ Not found on blockchain'}
                </p>
                {result.blockchain.owner && (
                  <p><strong>Owner:</strong> <code>{result.blockchain.owner}</code></p>
                )}
              </div>

              <div className="detail-section">
                <h3>Database Status</h3>
                <p className={result.database.exists ? 'status-ok' : 'status-fail'}>
                  {result.database.exists ? '✓ Found in database' : '✗ Not found in database'}
                </p>
                {result.database.document && (
                  <>
                    <p><strong>Filename:</strong> {result.database.document.filename}</p>
                    <p><strong>Uploaded:</strong> {new Date(result.database.document.timestamp).toLocaleString()}</p>
                    <p><strong>TX Hash:</strong> <code>{result.database.document.txHash}</code></p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Verify

