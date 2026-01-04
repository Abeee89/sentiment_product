import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Brain,
  Upload,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sentimentAPI } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [recentDatasets, setRecentDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, modelData, datasetsData] = await Promise.all([
        sentimentAPI.getStatistics().catch(() => null),
        sentimentAPI.getModelInfo().catch(() => null),
        sentimentAPI.getDatasets().catch(() => ({ datasets: [] }))
      ]);

      setStats(statsData);
      setModelInfo(modelData?.model);
      setRecentDatasets(datasetsData?.datasets?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    positive: '#10b981',
    neutral: '#f59e0b',
    negative: '#ef4444'
  };

  const sentimentData = stats?.sentiment_distribution ? [
    { name: 'Positive', value: stats.sentiment_distribution.positive || 0, color: COLORS.positive },
    { name: 'Neutral', value: stats.sentiment_distribution.neutral || 0, color: COLORS.neutral },
    { name: 'Negative', value: stats.sentiment_distribution.negative || 0, color: COLORS.negative }
  ] : [];

  const total = sentimentData.reduce((sum, item) => sum + item.value, 0);

  // Mock trend data - in real app, this would come from backend
  const trendData = [
    { name: 'Mon', positive: 65, neutral: 20, negative: 15 },
    { name: 'Tue', positive: 70, neutral: 18, negative: 12 },
    { name: 'Wed', positive: 68, neutral: 22, negative: 10 },
    { name: 'Thu', positive: 72, neutral: 15, negative: 13 },
    { name: 'Fri', positive: 75, neutral: 17, negative: 8 },
    { name: 'Sat', positive: 80, neutral: 12, negative: 8 },
    { name: 'Sun', positive: 78, neutral: 14, negative: 8 },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's your sentiment analysis overview.</p>
        </div>
        <button className="refresh-btn" onClick={loadDashboardData}>
          <Activity size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card green">
          <div className="stat-card-icon">
            <ThumbsUp size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats?.sentiment_distribution?.positive || 0}</span>
            <span className="stat-card-label">Positive Reviews</span>
          </div>
          <div className="stat-card-trend up">
            <TrendingUp size={16} />
            <span>+12%</span>
          </div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-card-icon">
            <Minus size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats?.sentiment_distribution?.neutral || 0}</span>
            <span className="stat-card-label">Neutral Reviews</span>
          </div>
          <div className="stat-card-trend">
            <Minus size={16} />
            <span>0%</span>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-card-icon">
            <ThumbsDown size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats?.sentiment_distribution?.negative || 0}</span>
            <span className="stat-card-label">Negative Reviews</span>
          </div>
          <div className="stat-card-trend down">
            <TrendingDown size={16} />
            <span>-5%</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-card-content">
            <span className="stat-card-value">{total}</span>
            <span className="stat-card-label">Total Analyzed</span>
          </div>
          <div className="stat-card-trend up">
            <TrendingUp size={16} />
            <span>+8%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Sentiment Distribution</h3>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <Upload size={48} />
              <p>No data available yet. Upload a dataset to get started!</p>
            </div>
          )}
        </div>

        <div className="chart-card wide">
          <h3>Sentiment Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              <Area type="monotone" dataKey="positive" stroke="#10b981" fillOpacity={1} fill="url(#colorPositive)" />
              <Area type="monotone" dataKey="neutral" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNeutral)" />
              <Area type="monotone" dataKey="negative" stroke="#ef4444" fillOpacity={1} fill="url(#colorNegative)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        {/* Model Info Card */}
        <div className="info-card">
          <div className="info-card-header">
            <Brain size={24} />
            <h3>Model Information</h3>
          </div>
          {modelInfo ? (
            <div className="model-stats">
              <div className="model-stat-item">
                <span className="model-stat-label">Version</span>
                <span className="model-stat-value">{modelInfo.version}</span>
              </div>
              <div className="model-stat-item">
                <span className="model-stat-label">Accuracy</span>
                <span className="model-stat-value accuracy">{(modelInfo.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="model-stat-item">
                <span className="model-stat-label">Training Samples</span>
                <span className="model-stat-value">{modelInfo.total_samples?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="model-stat-item">
                <span className="model-stat-label">Last Updated</span>
                <span className="model-stat-value">{modelInfo.last_trained || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="no-model">Model not loaded. Please train the model first.</p>
          )}
        </div>

        {/* Recent Datasets */}
        <div className="info-card wide">
          <div className="info-card-header">
            <Upload size={24} />
            <h3>Recent Uploads</h3>
          </div>
          {recentDatasets.length > 0 ? (
            <div className="recent-list">
              {recentDatasets.map((dataset, index) => (
                <div key={index} className="recent-item">
                  <div className="recent-item-info">
                    <span className="recent-item-name">{dataset.filename}</span>
                    <span className="recent-item-date">{new Date(dataset.upload_date).toLocaleDateString()}</span>
                  </div>
                  <span className="recent-item-rows">{dataset.total_rows} rows</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-datasets">No datasets uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
