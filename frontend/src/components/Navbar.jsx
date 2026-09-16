import React from 'react';
import { Landmark, Languages, Moon, Sun, Activity, Bot, FileSearch, Scale, BarChart3, Home } from 'lucide-react';

export default function Navbar({ language, setLanguage, theme, setTheme, activeTab, setActiveTab, apiStatus }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI Assistant', icon: Bot },
    { id: 'schemes', label: 'Schemes', icon: Landmark },
    { id: 'document', label: 'Document Q&A', icon: FileSearch },
    { id: 'rti', label: 'RTI Builder', icon: Scale },
    { id: 'feedback', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="glass-card mb-8 p-3.5 px-5 border-l-4 border-l-amber-500 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-blue-700 to-slate-900 flex items-center justify-center text-white shadow-md border border-amber-400/30 group-hover:scale-105 transition-transform">
            <Landmark size={22} className="text-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white leading-none">
                GovGuide <span className="text-amber-400">AI</span>
              </span>
              <span className="badge badge-saffron text-[9px] py-0 px-1.5">India</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Citizen Services Portal</span>
          </div>
        </div>

        {/* Navigation Tabs - Sleek Single Row */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-sm border border-blue-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Health Status Indicator */}
          <div className={`badge ${apiStatus === 'healthy' ? 'badge-green' : 'badge-amber'} py-1 px-2.5 text-[10px]`}>
            <Activity size={12} className={apiStatus === 'healthy' ? 'animate-pulse' : ''} />
            <span className="font-semibold">{apiStatus === 'healthy' ? 'Active' : 'Connecting'}</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300">
            <Languages size={13} className="text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-200 text-xs font-medium cursor-pointer py-0.5"
            >
              <option value="English" className="bg-slate-900 text-white">English</option>
              <option value="Hindi (हिंदी)" className="bg-slate-900 text-white">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Dark/Light Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}



