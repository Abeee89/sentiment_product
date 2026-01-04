import React from 'react';
import { FileText, Download, PieChart, BarChart2, TrendingUp } from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const reportTypes = [
    {
      title: 'Sentiment Summary',
      description: 'Overview of sentiment distribution across all analyzed data',
      icon: PieChart,
      color: 'purple'
    },
    {
      title: 'Trend Analysis',
      description: 'Sentiment trends over time with insights',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Detailed Statistics',
      description: 'In-depth statistical breakdown of predictions',
      icon: BarChart2,
      color: 'blue'
    },
    {
      title: 'Export Data',
      description: 'Download analyzed results in various formats',
      icon: Download,
      color: 'orange'
    }
  ];

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p className="reports-subtitle">Generate and download analysis reports</p>
        </div>
      </div>

      <div className="reports-grid">
        {reportTypes.map((report, index) => (
          <div key={index} className={`report-card ${report.color}`}>
            <div className="report-icon">
              <report.icon size={32} />
            </div>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            <button className="report-btn">
              <FileText size={16} />
              Generate Report
            </button>
          </div>
        ))}
      </div>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <h2>🚀 More Reports Coming Soon</h2>
          <p>We're working on advanced reporting features including:</p>
          <ul>
            <li>Automated weekly/monthly reports</li>
            <li>Custom date range analysis</li>
            <li>Comparative analysis between datasets</li>
            <li>PDF and Excel export options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
