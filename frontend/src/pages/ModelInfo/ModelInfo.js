import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Database,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { sentimentAPI } from '../../services/api';
import './ModelInfo.css';

const ModelInfo = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    setLoading(true);
    try {
      const data = await sentimentAPI.getModelInfo();
      setModelInfo(data?.model);
    } catch (error) {
      console.error('Error loading model info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    if (!window.confirm('Are you sure you want to retrain the model? This may take several minutes.')) {
      return;
    }

    setRetraining(true);
    try {
      const result = await sentimentAPI.retrainModel(true);
      alert(`Model retrained successfully!\nNew Accuracy: ${(result.results.accuracy * 100).toFixed(2)}%`);
      loadModelInfo();
    } catch (error) {
      alert('Error retraining model: ' + (error.response?.data?.error || error.message));
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="model-loading">
        <div className="spinner-large"></div>
        <p>Loading model information...</p>
      </div>
    );
  }

  const accuracyPercentage = modelInfo?.accuracy ? (modelInfo.accuracy * 100).toFixed(1) : 0;
  const accuracyLevel = accuracyPercentage >= 80 ? 'excellent' : accuracyPercentage >= 60 ? 'good' : 'needs-improvement';

  return (
    <div className="model-page">
      <div className="model-header">
        <div>
          <h1>Model Information</h1>
          <p className="model-subtitle">View and manage your sentiment analysis model</p>
        </div>
        <button 
          className="retrain-btn"
          onClick={handleRetrain}
          disabled={retraining}
        >
          {retraining ? (
            <>
              <div className="btn-spinner"></div>
              Retraining...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Retrain Model
            </>
          )}
        </button>
      </div>

      {modelInfo ? (
        <>
          {/* Model Status Card */}
          <div className="status-card">
            <div className="status-icon">
              <Brain size={48} />
            </div>
            <div className="status-info">
              <h2>Sentiment Analysis Model</h2>
              <p>Naive Bayes Classifier with TF-IDF Vectorization</p>
              <div className="status-badges">
                <span className="badge active">
                  <CheckCircle size={14} />
                  Active
                </span>
                <span className="badge version">v{modelInfo.version}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-item accuracy">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Model Accuracy</span>
                <span className={`stat-value ${accuracyLevel}`}>{accuracyPercentage}%</span>
                <div className="accuracy-bar">
                  <div 
                    className={`accuracy-fill ${accuracyLevel}`}
                    style={{ width: `${accuracyPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <Database size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Training Samples</span>
                <span className="stat-value">{modelInfo.total_samples?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Version</span>
                <span className="stat-value">{modelInfo.version}</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Last Updated</span>
                <span className="stat-value">{modelInfo.last_trained || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Model Details */}
          <div className="details-section">
            <h3>Model Details</h3>
            <div className="details-grid">
              <div className="detail-card">
                <h4>Algorithm</h4>
                <p>Multinomial Naive Bayes</p>
                <span className="detail-desc">Probabilistic classifier based on Bayes' theorem</span>
              </div>
              <div className="detail-card">
                <h4>Feature Extraction</h4>
                <p>TF-IDF Vectorizer</p>
                <span className="detail-desc">Term Frequency-Inverse Document Frequency</span>
              </div>
              <div className="detail-card">
                <h4>Supported Classes</h4>
                <div className="class-tags">
                  <span className="class-tag positive">Positive</span>
                  <span className="class-tag neutral">Neutral</span>
                  <span className="class-tag negative">Negative</span>
                </div>
              </div>
              <div className="detail-card">
                <h4>Max Features</h4>
                <p>5,000</p>
                <span className="detail-desc">Maximum vocabulary size for vectorization</span>
              </div>
            </div>
          </div>

          {/* Retraining Tips */}
          <div className="tips-section">
            <div className="tips-icon">
              <AlertCircle size={24} />
            </div>
            <div className="tips-content">
              <h4>When to Retrain?</h4>
              <ul>
                <li>After uploading new labeled datasets</li>
                <li>When accuracy drops on recent predictions</li>
                <li>When analyzing a new product category or domain</li>
                <li>Periodically (e.g., monthly) to maintain performance</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="no-model">
          <Brain size={64} />
          <h3>No Model Found</h3>
          <p>Train the model first to see information here</p>
          <button className="train-btn" onClick={handleRetrain} disabled={retraining}>
            {retraining ? 'Training...' : 'Train Model Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelInfo;
