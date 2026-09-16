import React from 'react';
import { Landmark, Languages, Moon, Sun, Activity } from 'lucide-react';

export default function Navbar({ language, setLanguage, theme, setTheme, activeTab, setActiveTab, apiStatus }) {
  return (
    <header className="glass-card mb-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Landmark size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              GovGuide <span className="text-blue-500">AI</span>
            </h1>
            <p className="text-xs text-gray-400">Indian Government Systems & Public Services Assistant</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-gray-900/50 p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🤖 AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'schemes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🏛️ Schemes Explorer
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'document'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📄 Rejection Analyzer
          </button>
          <button
            onClick={() => setActiveTab('rti')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'rti'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📜 RTI Builder
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'feedback'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Analytics & Stats
          </button>
        </nav>

        {/* Controls (Language, Theme, API Status) */}
        <div className="flex items-center gap-3">
          {/* Health Status Indicator */}
          <div className={`badge ${apiStatus === 'healthy' ? 'badge-green' : 'badge-amber'}`}>
            <Activity size={14} />
            <span>{apiStatus === 'healthy' ? 'Backend Ready' : 'Connecting...'}</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300">
            <Languages size={15} className="text-blue-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-200 font-medium cursor-pointer"
            >
              <option value="English" className="bg-gray-900 text-white">English</option>
              <option value="Hindi (हिंदी)" className="bg-gray-900 text-white">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-900/60 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-blue-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
