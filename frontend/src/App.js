import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import History from './pages/History';
import ModelInfo from './pages/ModelInfo';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>

        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          setIsCollapsed={setSidebarCollapsed} 
        />
        <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/history" element={<History />} />
            <Route path="/model" element={<ModelInfo />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={
              <Settings 
                darkMode={darkMode} 
                setDarkMode={setDarkMode}
                language={language}
                setLanguage={setLanguage}
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

