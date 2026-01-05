import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sentimentAPI } from '../services/api';
import './ResultsDisplay.css';

const COLORS = {
  positive: '#4CAF50',
  neutral: '#FF9800',
  negative: '#F44336'
};

const ResultsDisplay = ({ uploadResult, datasetId }) => {
  const [statistics, setStatistics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (uploadResult || datasetId) {
      loadStatistics();
      loadModelInfo();
    }
  }, [uploadResult, datasetId]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const id = datasetId || uploadResult?.dataset_id;
      const data = await sentimentAPI.getStatistics(id);
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModelInfo = async () => {
    try {
      const data = await sentimentAPI.getModelInfo();
      if (data.success) {
        setModelInfo(data.model);
      }
    } catch (error) {
      console.error('Error loading model info:', error);
    }
  };

  const handleRetrain = async () => {
    if (!window.confirm('Retrain the model with all available data? This may take a few minutes.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await sentimentAPI.retrainModel(true);
      alert(`Model retrained successfully!\nAccuracy: ${(result.results.accuracy * 100).toFixed(2)}%`);
      loadModelInfo();
      loadStatistics();
    } catch (error) {
      alert('Error retraining model: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!uploadResult && !datasetId) {
    return (
      <div className="results-container">
        <p className="no-results">Upload a file to see results</p>
      </div>
    );
  }

  const stats = statistics?.sentiment_distribution || uploadResult?.statistics;
  const chartData = stats ? [
    { name: 'Positive', value: stats.positive || stats.find(s => s.sentiment === 'positive')?.count || 0, sentiment: 'positive' },
    { name: 'Neutral', value: stats.neutral || stats.find(s => s.sentiment === 'neutral')?.count || 0, sentiment: 'neutral' },
    { name: 'Negative', value: stats.negative || stats.find(s => s.sentiment === 'negative')?.count || 0, sentiment: 'negative' }
  ].filter(item => item.value > 0) : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Analysis Results</h2>
        {uploadResult && (
          <div className="upload-info">
            <p><strong>File:</strong> {uploadResult.filename}</p>
            <p><strong>Total Rows:</strong> {uploadResult.total_rows}</p>
            {modelInfo && (
              <p><strong>Model Version:</strong> {modelInfo.version} (Accuracy: {(modelInfo.accuracy * 100).toFixed(2)}%)</p>
            )}
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading...</div>}

      {chartData.length > 0 && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Sentiment Counts</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="statistics-summary">
        <h3>Summary</h3>
        <div className="stats-grid">
          <div className="stat-card positive">
            <div className="stat-value">{chartData.find(d => d.sentiment === 'positive')?.value || 0}</div>
            <div className="stat-label">Positive</div>
            <div className="stat-percentage">
              {total > 0 ? ((chartData.find(d => d.sentiment === 'positive')?.value || 0) / total * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="stat-card neutral">
            <div className="stat-value">{chartData.find(d => d.sentiment === 'neutral')?.value || 0}</div>
            <div className="stat-label">Neutral</div>
            <div className="stat-percentage">
              {total > 0 ? ((chartData.find(d => d.sentiment === 'neutral')?.value || 0) / total * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="stat-card negative">
            <div className="stat-value">{chartData.find(d => d.sentiment === 'negative')?.value || 0}</div>
            <div className="stat-label">Negative</div>
            <div className="stat-percentage">
              {total > 0 ? ((chartData.find(d => d.sentiment === 'negative')?.value || 0) / total * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="model-actions">
        <button 
          className="retrain-button" 
          onClick={handleRetrain}
          disabled={loading}
        >
          {loading ? 'Processing...' : '🔄 Retrain Model with New Data'}
        </button>
        <p className="retrain-hint">
          Retrain the model to improve accuracy with newly uploaded data
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;

