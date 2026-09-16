import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AIChat from './components/AIChat';
import SchemeExplorer from './components/SchemeExplorer';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import RTIBuilder from './components/RTIBuilder';
import FeedbackStats from './components/FeedbackStats';
import { ShieldAlert, ExternalLink, Type } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('md'); // sm, md, lg
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

  const getFontClass = () => {
    if (fontSize === 'sm') return 'font-scale-sm';
    if (fontSize === 'lg') return 'font-scale-lg';
    return 'font-scale-md';
  };

  return (
    <div className={`min-h-screen ${getFontClass()}`}>
      {/* Indian National Tricolor Accent Bar */}
      <div className="gov-tricolor-bar" />

      {/* Official Government Utility Header Strip */}
      <div className="bg-slate-950/80 border-b border-white/10 text-xs py-1.5 px-4 text-slate-400">
        <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-500/90 tracking-wide flex items-center gap-1.5">
              <span>🇮🇳</span> भारत सरकार | Government of India
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              National Public Information & Public Schemes AI Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {/* Font Size Accessibility Scaler */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
              <Type size={12} className="text-slate-400 mr-0.5" />
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                  fontSize === 'sm' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'
                }`}
                title="Small Font Size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                  fontSize === 'md' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'
                }`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                  fontSize === 'lg' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'
                }`}
                title="Large Font Size"
              >
                A+
              </button>
            </div>

            <a
              href="https://rtionline.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors hidden sm:flex items-center gap-1"
            >
              <span>RTI Online Portal</span>
              <ExternalLink size={10} />
            </a>

            <a
              href="https://myscheme.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors hidden sm:flex items-center gap-1"
            >
              <span>myScheme Portal</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      <div className="app-container">
        <div className="bg-mesh" />

        {/* Main Navigation Header */}
        <Navbar
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          apiStatus={apiStatus}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'home' && <LandingPage setActiveTab={setActiveTab} />}
          {activeTab === 'chat' && <AIChat language={language} />}
          {activeTab === 'schemes' && <SchemeExplorer />}
          {activeTab === 'document' && <DocumentAnalyzer language={language} />}
          {activeTab === 'rti' && <RTIBuilder />}
          {activeTab === 'feedback' && <FeedbackStats />}
        </main>

        {/* Official Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              🏛️ GovGuide AI Portal
            </span>
            <span>RAG Architecture (React.js + FastAPI + PostgreSQL + FAISS)</span>
            <span className="text-slate-600">•</span>
            <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
              Digital India Initiative
            </a>
            <span className="text-slate-600">•</span>
            <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">
              CPGRAMS Public Grievance
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 max-w-3xl mx-auto p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <ShieldAlert size={15} className="text-amber-400 shrink-0" />
            <span>
              <strong>Official Disclaimer:</strong> GovGuide AI provides automated guidance for public awareness and educational purposes based on government gazettes. Please verify requirements with official portals (e.g. india.gov.in, rtionline.gov.in) before submitting legal applications.
            </span>
          </div>

          <p className="text-[11px] text-slate-500 opacity-80">
            Designed for Citizens of India • Accessibility Compliant • RTI Act Section 4 (1)(b) Proactive Disclosure Framework
          </p>
        </footer>
      </div>
    </div>
  );
}


