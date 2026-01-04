import React, { useState } from 'react';
import { Upload, FileText, Send, Sparkles, AlertCircle } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import ResultsDisplay from '../../components/ResultsDisplay';
import { sentimentAPI } from '../../services/api';
import './Analysis.css';

const Analysis = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [singleText, setSingleText] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'text'

  const handleUploadSuccess = (result) => {
    setUploadResult(result);
    setError(null);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setUploadResult(null);
  };

  const handleSingleAnalysis = async () => {
    if (!singleText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const result = await sentimentAPI.predictText(singleText);
      setSingleResult(result);
    } catch (error) {
      setError(error.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'positive';
      case 'negative': return 'negative';
      case 'neutral': return 'neutral';
      default: return '';
    }
  };

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <div>
          <h1>Sentiment Analysis</h1>
          <p className="analysis-subtitle">Analyze customer sentiment from text or upload a dataset</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="analysis-tabs">
        <button 
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload size={18} />
          Upload Dataset
        </button>
        <button 
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <FileText size={18} />
          Single Text
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="analysis-content">
          <div className="upload-card">
            <div className="upload-card-header">
              <Upload size={24} />
              <h2>Upload Dataset</h2>
            </div>
            <p className="upload-description">
              Upload a CSV, XLSX, or TSV file containing customer reviews or feedback.
              The system will automatically detect the text column and analyze sentiment.
            </p>
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          {uploadResult && (
            <ResultsDisplay uploadResult={uploadResult} />
          )}
        </div>
      )}

      {/* Single Text Tab */}
      {activeTab === 'text' && (
        <div className="analysis-content">
          <div className="text-analysis-card">
            <div className="text-analysis-header">
              <Sparkles size={24} />
              <h2>Analyze Single Text</h2>
            </div>
            <p className="text-description">
              Enter a customer review or feedback text below to analyze its sentiment.
            </p>
            
            <div className="text-input-container">
              <textarea
                value={singleText}
                onChange={(e) => setSingleText(e.target.value)}
                placeholder="Enter text to analyze... (e.g., 'This product is amazing! I love it.')"
                rows={5}
              />
              <button 
                className="analyze-btn"
                onClick={handleSingleAnalysis}
                disabled={analyzing || !singleText.trim()}
              >
                {analyzing ? (
                  <>
                    <div className="btn-spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Analyze Sentiment
                  </>
                )}
              </button>
            </div>

            {singleResult && (
              <div className={`single-result ${getSentimentClass(singleResult.sentiment)}`}>
                <div className="result-emoji">{getSentimentEmoji(singleResult.sentiment)}</div>
                <div className="result-content">
                  <span className="result-label">Sentiment</span>
                  <span className="result-sentiment">{singleResult.sentiment}</span>
                  <span className="result-confidence">
                    Confidence: {(singleResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="result-bar">
                  <div 
                    className="result-bar-fill" 
                    style={{ width: `${singleResult.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Example texts */}
          <div className="examples-card">
            <h3>Try these examples:</h3>
            <div className="examples-list">
              {[
                "This product exceeded my expectations! Absolutely love it.",
                "The quality is okay, nothing special about it.",
                "Terrible experience. The product broke after one day.",
                "Fast shipping and great customer service!",
                "Not worth the price. Very disappointed."
              ].map((example, index) => (
                <button 
                  key={index}
                  className="example-btn"
                  onClick={() => setSingleText(example)}
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
