import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './UploadForm.css';

function UploadForm() {
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    documentType: 'Other',
    requiredApprovals: 0,
    encrypt: false,
    metadataName: '',
    metadataDescription: '',
    skipAICheck: false
  });
  const [aiCheckResult, setAiCheckResult] = useState(null);
  const [checkingAI, setCheckingAI] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setAiCheckResult(null);
    
    if (selectedFile && formData.metadataName === '') {
      setFormData({ ...formData, metadataName: selectedFile.name });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const performAICheck = async (file) => {
    if (formData.skipAICheck) return null;
    
    setCheckingAI(true);
    try {
      // In a real implementation, this would call a backend endpoint
      // For now, we'll simulate or the backend will handle it
      return null;
    } catch (error) {
      console.error('AI check error:', error);
      return null;
    } finally {
      setCheckingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to upload documents');
      return;
    }
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('document', file);
      uploadFormData.append('documentType', formData.documentType);
      uploadFormData.append('requiredApprovals', formData.requiredApprovals);
      uploadFormData.append('encrypt', formData.encrypt);
      uploadFormData.append('metadataName', formData.metadataName);
      uploadFormData.append('metadataDescription', formData.metadataDescription);
      uploadFormData.append('skipAICheck', formData.skipAICheck);

      const response = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
      setAiCheckResult(response.data.document?.aiCheck);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      if (err.response?.data?.aiCheck) {
        setAiCheckResult(err.response.data.aiCheck);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="card">
        <h1>Upload Document</h1>
        <p className="subtitle">Securely store your official documents on the blockchain</p>

        {!isAuthenticated && (
          <div className="alert alert-warning">
            Please <a href="/login">login</a> to upload documents
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="file-input"
              disabled={uploading}
            />
            <label htmlFor="file" className="file-label">
              {file ? file.name : 'Choose a file...'}
            </label>
          </div>

          <div className="form-group">
            <label>Document Type</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Other">Other</option>
              <option value="BirthCertificate">Birth Certificate</option>
              <option value="DeathCertificate">Death Certificate</option>
              <option value="PropertyDeed">Property Deed</option>
              <option value="Degree">Degree</option>
              <option value="Passport">Passport</option>
              <option value="CourtDocument">Court Document</option>
            </select>
          </div>

          <div className="form-group">
            <label>Document Name</label>
            <input
              type="text"
              name="metadataName"
              value={formData.metadataName}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter document name"
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              name="metadataDescription"
              value={formData.metadataDescription}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Enter document description"
            />
          </div>

          <div className="form-group">
            <label>Required Approvals (for multi-signature)</label>
            <input
              type="number"
              name="requiredApprovals"
              value={formData.requiredApprovals}
              onChange={handleChange}
              className="form-control"
              min="0"
              max="10"
            />
            <small>Set to 0 for no approval required, or specify number of government approvals needed</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="encrypt"
                checked={formData.encrypt}
                onChange={handleChange}
              />
              Encrypt document before upload (AES-256)
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="skipAICheck"
                checked={formData.skipAICheck}
                onChange={handleChange}
              />
              Skip AI authenticity pre-check
            </label>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={uploading || !file || !isAuthenticated}
          >
            {uploading ? 'Uploading...' : 'Upload & Store on Blockchain'}
          </button>
        </form>

        {checkingAI && (
          <div className="ai-check-status">
            <p>🔍 Performing AI authenticity check...</p>
          </div>
        )}

        {aiCheckResult && (
          <div className={`ai-check-result ${aiCheckResult.passed ? 'passed' : 'failed'}`}>
            <h4>AI Pre-Check Results</h4>
            <p><strong>Status:</strong> {aiCheckResult.passed ? '✅ Passed' : '❌ Failed'}</p>
            <p><strong>Confidence:</strong> {(aiCheckResult.confidence * 100).toFixed(1)}%</p>
            {aiCheckResult.issues.length > 0 && (
              <div>
                <strong>Issues:</strong>
                <ul>
                  {aiCheckResult.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiCheckResult.warnings.length > 0 && (
              <div>
                <strong>Warnings:</strong>
                <ul>
                  {aiCheckResult.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {result && (
          <div className="alert alert-success">
            <h3>✅ Upload Successful!</h3>
            <div className="result-details">
              <p><strong>Filename:</strong> {result.document.filename}</p>
              <p><strong>Hash:</strong> <code>{result.document.hash}</code></p>
              <p><strong>Transaction Hash:</strong> <code>{result.document.txHash}</code></p>
              <p><strong>Document Type:</strong> {result.document.documentType}</p>
              <p><strong>Required Approvals:</strong> {result.document.requiredApprovals}</p>
              <p><strong>Verification URL:</strong> 
                <a href={result.document.verificationUrl} target="_blank" rel="noopener noreferrer">
                  {result.document.verificationUrl}
                </a>
              </p>
              {result.encryptionKey && (
                <p className="encryption-warning">
                  <strong>⚠️ Encryption Key:</strong> <code>{result.encryptionKey}</code>
                  <br />
                  <small>Save this key securely! You'll need it to decrypt the document.</small>
                </p>
              )}
              <div className="action-buttons">
                <a 
                  href={`/api/upload/certificate/${result.document.id}`}
                  className="btn btn-primary"
                  target="_blank"
                >
                  Download PDF Certificate
                </a>
                <a 
                  href={result.document.verificationUrl}
                  className="btn btn-secondary"
                >
                  View Verification Page
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadForm;
