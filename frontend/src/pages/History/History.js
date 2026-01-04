import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  BarChart3,
  Search
} from 'lucide-react';
import { sentimentAPI } from '../../services/api';
import './History.css';

const History = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const data = await sentimentAPI.getDatasets();
      setDatasets(data.datasets || []);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasets = datasets.filter(dataset => 
    dataset.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (dataset) => {
    const total = dataset.total_rows || 0;
    if (total > 1000) return { text: 'Large', class: 'large' };
    if (total > 100) return { text: 'Medium', class: 'medium' };
    return { text: 'Small', class: 'small' };
  };

  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner-large"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1>Upload History</h1>
          <p className="history-subtitle">View and manage your previously uploaded datasets</p>
        </div>
        <button className="refresh-btn" onClick={loadDatasets}>
          <HistoryIcon size={18} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="history-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-stats">
          <span>{filteredDatasets.length} datasets found</span>
        </div>
      </div>

      {/* Dataset List */}
      {filteredDatasets.length > 0 ? (
        <div className="datasets-grid">
          {filteredDatasets.map((dataset, index) => {
            const status = getStatusBadge(dataset);
            return (
              <div key={index} className="dataset-card">
                <div className="dataset-card-header">
                  <div className="dataset-icon">
                    <FileText size={24} />
                  </div>
                  <span className={`status-badge ${status.class}`}>{status.text}</span>
                </div>
                
                <div className="dataset-info">
                  <h3 className="dataset-name">{dataset.filename || 'Unnamed Dataset'}</h3>
                  <div className="dataset-meta">
                    <span className="meta-item">
                      <Calendar size={14} />
                      {formatDate(dataset.upload_date)}
                    </span>
                    <span className="meta-item">
                      <BarChart3 size={14} />
                      {dataset.total_rows?.toLocaleString() || 0} rows
                    </span>
                  </div>
                </div>

                {dataset.description && (
                  <p className="dataset-description">{dataset.description}</p>
                )}

                <div className="dataset-stats">
                  <div className="mini-stat positive">
                    <span className="mini-stat-value">{dataset.positive_count || 0}</span>
                    <span className="mini-stat-label">Positive</span>
                  </div>
                  <div className="mini-stat neutral">
                    <span className="mini-stat-value">{dataset.neutral_count || 0}</span>
                    <span className="mini-stat-label">Neutral</span>
                  </div>
                  <div className="mini-stat negative">
                    <span className="mini-stat-value">{dataset.negative_count || 0}</span>
                    <span className="mini-stat-label">Negative</span>
                  </div>
                </div>

                <div className="dataset-actions">
                  <button className="action-btn view" onClick={() => setSelectedDataset(dataset)}>
                    <Eye size={16} />
                    View
                  </button>
                  <button className="action-btn download">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-history">
          <HistoryIcon size={64} />
          <h3>No datasets found</h3>
          <p>Upload a dataset to see it here</p>
        </div>
      )}

      {/* Dataset Detail Modal */}
      {selectedDataset && (
        <div className="modal-overlay" onClick={() => setSelectedDataset(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDataset.filename}</h2>
              <button className="modal-close" onClick={() => setSelectedDataset(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Upload Date</span>
                  <span className="detail-value">{formatDate(selectedDataset.upload_date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Rows</span>
                  <span className="detail-value">{selectedDataset.total_rows?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Positive</span>
                  <span className="detail-value positive">{selectedDataset.positive_count || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Neutral</span>
                  <span className="detail-value neutral">{selectedDataset.neutral_count || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Negative</span>
                  <span className="detail-value negative">{selectedDataset.negative_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
