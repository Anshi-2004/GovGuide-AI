import React, { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, FileText, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

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
      {/* Top Banner & Filter Controls */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🏛️ Government Schemes Directory
            </h2>
            <p className="text-xs text-gray-400">
              Discover eligible central and state government schemes, income limits, and mandatory application documents.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search scheme name, eligibility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs pl-9 pr-3 py-2.5 w-64 bg-gray-900"
              />
            </div>
            <button type="submit" className="btn-primary text-xs py-2.5 px-4">
              Search
            </button>
          </form>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-800 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-gray-400">
            <Filter size={14} className="text-blue-400" />
            <span>Filter by:</span>
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="form-select text-xs py-1.5 px-3 bg-gray-900"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select text-xs py-1.5 px-3 bg-gray-900"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm glass-card">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Fetching verified government schemes database...
        </div>
      ) : schemes.length === 0 ? (
        <div className="p-12 text-center glass-card">
          <AlertCircle size={36} className="text-amber-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-semibold text-white">No Schemes Found</h3>
          <p className="text-xs text-gray-400 mt-1">Try resetting state or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="glass-card p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all cursor-pointer group"
              onClick={() => setActiveModalScheme(scheme)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge badge-blue">{scheme.category}</span>
                  <span className="text-[11px] font-medium text-gray-400">{scheme.state}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                  {scheme.name}
                </h3>

                <div className="mb-4">
                  <span className="inline-block text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-md font-semibold">
                    Income: {scheme.income_limit}
                  </span>
                </div>

                <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                  {scheme.eligibility}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>View Full Details & Process</span>
                <ExternalLink size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheme Detail Popup Modal */}
      {activeModalScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setActiveModalScheme(null)}
              className="absolute right-5 top-5 p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="badge badge-blue">{activeModalScheme.category}</span>
              <span className="badge badge-green">{activeModalScheme.state}</span>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">{activeModalScheme.name}</h2>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[11px] text-blue-400">Eligibility Criteria</h4>
                <p>{activeModalScheme.eligibility}</p>
              </div>

              <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[11px] text-emerald-400">Benefits & Coverage</h4>
                <p>{activeModalScheme.benefits}</p>
              </div>

              <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[11px] text-amber-400">Mandatory Documents</h4>
                <p>{activeModalScheme.required_documents}</p>
              </div>

              <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[11px] text-purple-400">How to Apply</h4>
                <p>{activeModalScheme.application_process}</p>
              </div>

              {activeModalScheme.official_url && (
                <a
                  href={activeModalScheme.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full justify-center text-xs py-3"
                >
                  <ExternalLink size={16} />
                  <span>Visit Official Government Portal</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
