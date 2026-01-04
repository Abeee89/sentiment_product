import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

function App() {
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (result) => {
    setUploadResult(result);
    setError(null);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setUploadResult(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Product Sentiment Analysis System</h1>
        <p className="subtitle">Upload sales data to analyze customer sentiment</p>
      </header>

      <main className="App-main">
        <div className="upload-section">
          <h2>Upload Dataset</h2>
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {uploadResult && (
          <ResultsDisplay uploadResult={uploadResult} />
        )}
      </main>

      <footer className="App-footer">
        <p>Sentiment Analysis System - Machine Learning Powered</p>
      </footer>
    </div>
  );
}

export default App;

