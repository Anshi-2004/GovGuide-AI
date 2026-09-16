import React, { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, FileText, CheckCircle2, AlertCircle, X, ShieldCheck, Landmark, ArrowRight, Award } from 'lucide-react';

const STATES = [
  "All India", "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
];

const CATEGORIES = [
  "All", "General", "SC (Scheduled Caste)", "ST (Scheduled Tribe)",
  "OBC (Other Backward Class)", "EWS (Economically Weaker Section)"
];

export default function SchemeExplorer() {
  const [schemes, setSchemes] = useState([]);
  const [selectedState, setSelectedState] = useState('All India');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalScheme, setActiveModalScheme] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('eligibility'); // eligibility, benefits, docs, process
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, [selectedState, selectedCategory]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== 'All India') params.append('state', selectedState);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/schemes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes || []);
      }
    } catch (e) {
      console.error('Failed to fetch schemes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Header */}
      <div className="glass-card p-6 border-l-4 border-l-amber-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-saffron text-[10px] py-0.5 px-2">Verified Gazette Database</span>
              <span className="text-xs text-slate-400">Section 4(1)(b) Disclosure</span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Landmark size={22} className="text-amber-400" />
              National Government Schemes Directory
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Explore eligible central and state government schemes, family income thresholds, reservation criteria, and mandatory application document checklists.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by scheme name, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs pl-9 pr-3 py-2.5 bg-slate-950 border-slate-800"
              />
            </div>
            <button type="submit" className="btn-saffron text-xs py-2.5 px-4 shrink-0">
              Search Schemes
            </button>
          </form>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Filter size={14} className="text-amber-400" />
              <span>Demographic Filters:</span>
            </div>

            {/* State Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Jurisdiction:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="form-select text-xs py-1.5 px-3 bg-slate-950 border-slate-800"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs glass-card space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Connecting to Government Portal Database & Filtering Eligibility Matrix...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="p-16 text-center glass-card space-y-2">
          <AlertCircle size={40} className="text-amber-400 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-white">No Schemes Found for Selected Criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try switching state to "All India" or setting category filter to "All" to view all available government initiatives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="glass-card p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all cursor-pointer group"
              onClick={() => {
                setActiveModalScheme(scheme);
                setActiveModalTab('eligibility');
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge badge-saffron">{scheme.category}</span>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {scheme.state}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-2 leading-snug">
                  {scheme.name}
                </h3>

                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-950/60 text-blue-300 border border-blue-800/50 px-2.5 py-1 rounded-md font-semibold">
                    <Award size={12} className="text-blue-400" />
                    Max Income: {scheme.income_limit}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {scheme.eligibility}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>View Full Criteria & Documents</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabbed Scheme Detail Modal Popup */}
      {activeModalScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative border-t-4 border-t-amber-500">
            <button
              onClick={() => setActiveModalScheme(null)}
              className="absolute right-5 top-5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close Popup"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-saffron">{activeModalScheme.category}</span>
              <span className="badge badge-blue">{activeModalScheme.state}</span>
            </div>

            <h2 className="text-xl font-extrabold text-white mb-4 pr-8">{activeModalScheme.name}</h2>

            {/* Modal Internal Tabs Header */}
            <div className="flex border-b border-slate-800 mb-4 text-xs font-semibold">
              <button
                onClick={() => setActiveModalTab('eligibility')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeModalTab === 'eligibility'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Eligibility Criteria
              </button>
              <button
                onClick={() => setActiveModalTab('benefits')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeModalTab === 'benefits'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Benefits & Coverage
              </button>
              <button
                onClick={() => setActiveModalTab('docs')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeModalTab === 'docs'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Required Documents
              </button>
              <button
                onClick={() => setActiveModalTab('process')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeModalTab === 'process'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                How to Apply
              </button>
            </div>

            {/* Modal Tab Content */}
            <div className="space-y-4 text-xs text-slate-300 min-h-[160px] leading-relaxed">
              {activeModalTab === 'eligibility' && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Eligibility Breakdown</h4>
                  <p>{activeModalScheme.eligibility}</p>
                  <div className="pt-2 text-[11px] text-slate-400">
                    <strong>Income Limit:</strong> {activeModalScheme.income_limit}
                  </div>
                </div>
              )}

              {activeModalTab === 'benefits' && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Direct Financial / Public Benefits</h4>
                  <p>{activeModalScheme.benefits}</p>
                </div>
              )}

              {activeModalTab === 'docs' && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Mandatory Document Checklist</h4>
                  <p>{activeModalScheme.required_documents}</p>
                </div>
              )}

              {activeModalTab === 'process' && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">Application Step-by-Step Guide</h4>
                  <p>{activeModalScheme.application_process}</p>
                </div>
              )}

              {activeModalScheme.official_url && (
                <a
                  href={activeModalScheme.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-saffron w-full justify-center text-xs py-3 mt-2"
                >
                  <ExternalLink size={15} />
                  <span>Open Official Application Portal</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

