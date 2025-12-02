import { useState, useEffect } from 'react';
import './DocumentPreview.css';

const DocumentPreview = ({ file }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
      setError(null);
    };

    reader.onerror = () => {
      setError('Failed to load file preview');
      setPreview(null);
    };

    // Preview based on file type
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      setError('Preview not available for this file type');
      setPreview(null);
    }
  }, [file]);

  if (!file) return null;

  const fileSize = (file.size / 1024).toFixed(2);
  const fileType = file.type || 'Unknown';

  return (
    <div className="document-preview">
      <div className="preview-header">
        <h3>Document Preview</h3>
        <span className="file-info">
          {file.name} • {(fileSize / 1024).toFixed(2) > 1 
            ? `${(fileSize / 1024).toFixed(2)} MB` 
            : `${fileSize} KB`}
        </span>
      </div>

      {error && (
        <div className="preview-error">
          <p>{error}</p>
          <p className="file-type-info">File Type: {fileType}</p>
        </div>
      )}

      {preview && (
        <div className="preview-content">
          {file.type.startsWith('image/') ? (
            <img src={preview} alt="Preview" className="preview-image" />
          ) : file.type === 'application/pdf' ? (
            <iframe 
              src={preview} 
              title="PDF Preview" 
              className="preview-pdf"
              frameBorder="0"
            />
          ) : (
            <div className="preview-placeholder">
              <div className="placeholder-icon">📄</div>
              <p>Preview not available</p>
              <p className="file-type-info">{fileType}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;

