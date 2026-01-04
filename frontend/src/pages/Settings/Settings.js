import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Shield, Database } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p className="settings-subtitle">Customize your application preferences</p>
        </div>
      </div>

      <div className="settings-sections">
        {/* Appearance */}
        <div className="settings-section">
          <div className="section-header">
            <Sun size={20} />
            <h2>Appearance</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Dark Mode</span>
                <span className="setting-desc">Use dark theme for the interface</span>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={() => setDarkMode(!darkMode)} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="settings-section">
          <div className="section-header">
            <Globe size={20} />
            <h2>Language & Region</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Language</span>
                <span className="setting-desc">Select your preferred language</span>
              </div>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={20} />
            <h2>Notifications</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Enable Notifications</span>
                <span className="setting-desc">Receive alerts about analysis completion</span>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={notifications} 
                  onChange={() => setNotifications(!notifications)} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <div className="section-header">
            <Database size={20} />
            <h2>Data Management</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Clear Analysis History</span>
                <span className="setting-desc">Remove all saved analysis results</span>
              </div>
              <button className="danger-btn">Clear Data</button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Export All Data</span>
                <span className="setting-desc">Download all your data in JSON format</span>
              </div>
              <button className="secondary-btn">Export</button>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="settings-section">
          <div className="section-header">
            <Shield size={20} />
            <h2>API Configuration</h2>
          </div>
          <div className="settings-group">
            <div className="setting-item column">
              <div className="setting-info">
                <span className="setting-label">Backend API URL</span>
                <span className="setting-desc">Configure the backend server endpoint</span>
              </div>
              <input 
                type="text" 
                className="setting-input"
                defaultValue="http://localhost:5000/api"
                placeholder="Enter API URL"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <p>Sentiment Analysis System v1.0.0</p>
        <p>© 2026 - Built with Machine Learning</p>
      </div>
    </div>
  );
};

export default Settings;
