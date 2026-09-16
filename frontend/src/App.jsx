import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import SchemeExplorer from './components/SchemeExplorer';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import RTIBuilder from './components/RTIBuilder';
import FeedbackStats from './components/FeedbackStats';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('dark');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data.status);
      } else {
        setApiStatus('degraded');
      }
    } catch {
      setApiStatus('error');
    }
  };

  return (
    <div className="app-container">
      <div className="bg-mesh" />

      {/* Navigation Header */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'chat' && <AIChat language={language} />}
        {activeTab === 'schemes' && <SchemeExplorer />}
        {activeTab === 'document' && <DocumentAnalyzer language={language} />}
        {activeTab === 'rti' && <RTIBuilder />}
        {activeTab === 'feedback' && <FeedbackStats />}
      </main>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-800/80 text-center text-xs text-gray-500">
        <p>
          🏛️ <strong>GovGuide AI</strong> — Decentralised RAG Architecture (React.js + FastAPI + PostgreSQL + FAISS)
        </p>
        <p className="mt-1 opacity-75">
          ⚠️ Disclaimer: Information provided is for awareness only. Verify with official government portals before taking legal action.
        </p>
      </footer>
    </div>
  );
}
