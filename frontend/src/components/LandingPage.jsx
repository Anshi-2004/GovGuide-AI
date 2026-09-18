import React, { useState } from 'react';
import { 
  Search, Bot, Landmark, FileSearch, Scale, ArrowRight, ShieldCheck, 
  Sparkles, ChevronLeft, ChevronRight, Lightbulb, CheckCircle2,
  GraduationCap, Sprout, Stethoscope, Home, Briefcase, Users, Landmark as OfficialEmblem
} from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('schemes');
    }
  };

  const quickActionCircles = [
    {
      id: 'chat',
      title: 'Ask AI Assistant',
      subtitle: 'General Q&A',
      icon: Bot,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      id: 'schemes',
      title: 'Find Schemes',
      subtitle: '100+ Verified',
      icon: Landmark,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'document',
      title: 'Diagnose Notice',
      subtitle: 'Document Q&A',
      icon: FileSearch,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'rti',
      title: 'Draft RTI Application',
      subtitle: 'Section 6(1) Draft',
      icon: Scale,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
  ];

  const features = [
    {
      id: 'chat',
      title: 'AI Citizen Assistant',
      icon: Bot,
      color: 'from-blue-600 to-indigo-600',
      badge: 'General Q&A',
      description: 'Ask any question about Central & State welfare schemes, caste certificates, income rules, and gazette guidelines.',
      actionText: 'Start Asking Questions',
    },
    {
      id: 'schemes',
      title: 'Government Schemes Directory',
      icon: Landmark,
      color: 'from-amber-600 to-orange-600',
      badge: '100+ Verified Schemes',
      description: 'Browse, filter, and search verified government welfare schemes by state jurisdiction, caste category, and family income limits.',
      actionText: 'Explore Schemes Directory',
    },
    {
      id: 'document',
      title: 'Document Analyzer & Document Q&A',
      icon: FileSearch,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Upload & Ask Document',
      description: 'Paste or upload application rejection memos. Get automated diagnostics and ask targeted questions about your document.',
      actionText: 'Analyze Rejection Document',
    },
    {
      id: 'rti',
      title: 'RTI Application Draft Builder',
      icon: Scale,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Section 6(1) RTI Act',
      description: 'Generate legally formatted Right to Information (RTI) application letters to track delayed applications and hold officers accountable.',
      actionText: 'Draft RTI Application',
    },
  ];

  const serviceCategories = [
    {
      title: 'Education & Scholarships',
      icon: GraduationCap,
      desc: 'Post-Matric, PM YASASVI, NSP Merit Scholarships',
      count: '24 Schemes',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Agriculture & Farming',
      icon: Sprout,
      desc: 'PM-KISAN, Kisan Credit Card, Fasal Bima Yojana',
      count: '18 Schemes',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'Healthcare & Medical',
      icon: Stethoscope,
      desc: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
      count: '15 Schemes',
      color: 'from-rose-600 to-pink-600',
    },
    {
      title: 'Housing & Infrastructure',
      icon: Home,
      desc: 'Pradhan Mantri Awas Yojana (PMAY Urban & Rural)',
      count: '12 Schemes',
      color: 'from-amber-600 to-orange-600',
    },
    {
      title: 'Employment & Business Loans',
      icon: Briefcase,
      desc: 'PMEGP, Mudra Loans, PM Vishwakarma Scheme',
      count: '20 Schemes',
      color: 'from-purple-600 to-violet-600',
    },
    {
      title: 'Women & Child Welfare',
      icon: Users,
      desc: 'Sukanya Samriddhi, PM Matru Vandana Yojana',
      count: '16 Schemes',
      color: 'from-fuchsia-600 to-pink-600',
    },
  ];

  const nextCategory = () => {
    setCategoryIndex((prev) => (prev + 1) % (serviceCategories.length - 2));
  };

  const prevCategory = () => {
    setCategoryIndex((prev) => (prev === 0 ? serviceCategories.length - 3 : prev - 1));
  };

  return (
    <div className="space-y-24 py-6 animate-fade-in text-center">
      
      {/* 1. HERO SECTION: BIG OUTER BOX WITH SMALL CENTERED INNER ELEMENTS */}
      <section className="max-w-5xl mx-auto pt-6 sm:pt-10">
        <div className="glass-card p-10 sm:p-14 md:p-16 border-t-4 border-t-amber-500 space-y-10 text-center relative overflow-hidden shadow-2xl">
          
          {/* Official Emblem Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mx-auto">
            <Sparkles size={14} />
            <span>National Public Information & Government Schemes Portal</span>
          </div>

          {/* CENTERED MAIN WEBSITE NAME */}
          <div className="space-y-4">
            <h1 className="font-serif-hero text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              GovGuide <span className="italic text-amber-400 font-serif-hero font-semibold">AI</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Simplifying Citizen Services, Gazette Welfare Schemes & RTI Legal Guidance
            </p>
          </div>

          {/* CENTERED SEARCH BOX DIRECTLY BELOW MAIN WEBSITE NAME */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="search-pill-bar group">
              <input
                type="text"
                placeholder="Search 100+ welfare schemes, document rejection fixes, RTI templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base outline-none pr-3 text-center"
              />
              <button
                type="submit"
                className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105"
                title="Search Portal"
              >
                <Search size={22} />
              </button>
            </div>
          </form>

          {/* CENTERED QUICK ACTION CIRCLES ROW */}
          <div className="pt-6 border-t border-slate-800/80">
            <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12 max-w-3xl mx-auto">
              {quickActionCircles.map((circle) => {
                const IconComp = circle.icon;
                return (
                  <div
                    key={circle.id}
                    onClick={() => setActiveTab(circle.id)}
                    className="action-circle-card group text-center"
                  >
                    <div className={`action-circle-icon ${circle.color} mb-3 group-hover:border-amber-400`}>
                      <IconComp size={30} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                      {circle.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {circle.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-purple-600/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* 2. CORE FEATURES GRID: BIG OUTER CONTAINER, 4 CENTERED CARDS */}
      <section className="max-w-5xl mx-auto space-y-10">
        
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="badge badge-saffron text-xs py-1 px-3.5 mx-auto">OFFICIAL PORTAL SERVICES</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
            What You Can Do on GovGuide AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Specialized AI tools designed for public scheme queries, document defect analysis, and RTI filings.
          </p>
        </div>

        {/* 2x2 Centered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="glass-card p-8 sm:p-10 text-center flex flex-col items-center justify-between space-y-6 hover:border-amber-500/40 transition-all cursor-pointer group h-full"
                onClick={() => setActiveTab(item.id)}
              >
                <div className="space-y-4 w-full flex flex-col items-center">
                  
                  {/* Small Compact Inner Icon Box */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md mx-auto`}>
                    <IconComponent size={26} />
                  </div>

                  <span className="badge badge-blue text-[11px] py-1 px-3 mx-auto">{item.badge}</span>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>{item.actionText}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* 3. SECTOR CATEGORIES: BIG CONTAINER, CENTERED CATEGORY CARDS */}
      <section className="max-w-5xl mx-auto space-y-10 pt-4">
        
        {/* Centered Header with Nav Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="mx-auto sm:mx-0">
            <h2 className="font-serif-hero text-2xl sm:text-3xl font-normal text-white">
              Find Services relevant to you
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore 100+ verified welfare schemes by category
            </p>
          </div>

          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <button
              onClick={prevCategory}
              className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              title="Previous Services"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextCategory}
              className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              title="Next Services"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* 3 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCategories
            .slice(categoryIndex, categoryIndex + 3)
            .map((cat, idx) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab('schemes')}
                  className="glass-card p-8 text-center flex flex-col items-center justify-between space-y-6 hover:border-amber-500/40 transition-all cursor-pointer group h-full min-h-[240px]"
                >
                  <div className="space-y-4 w-full flex flex-col items-center">
                    
                    {/* Small Inner Icon Badge */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md mx-auto`}>
                      <CatIcon size={26} />
                    </div>

                    <span className="badge badge-amber text-xs py-1 px-3 mx-auto">
                      {cat.count}
                    </span>

                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>View Category Schemes</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
        </div>

      </section>

      {/* 4. 3-STEP WORKFLOW: BIG OUTER BOX, CENTERED STEP CARDS */}
      <section className="max-w-5xl mx-auto glass-card p-10 sm:p-14 border-l-4 border-l-amber-500 space-y-10 text-center">
        
        {/* Centered Workflow Title */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">SIMPLIFIED CITIZEN PROCESS</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">How Citizens Use GovGuide AI</h2>
        </div>

        {/* 3 Centered Step Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-950/80 p-8 rounded-2xl border border-slate-800 text-center space-y-3 flex flex-col items-center">
            <span className="text-3xl font-black text-amber-400 block">01</span>
            <h4 className="text-base font-bold text-white leading-snug">Search or Select Category</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
              Use the central pill search bar or filter schemes by state, category, and income bracket.
            </p>
          </div>

          <div className="bg-slate-950/80 p-8 rounded-2xl border border-slate-800 text-center space-y-3 flex flex-col items-center">
            <span className="text-3xl font-black text-amber-400 block">02</span>
            <h4 className="text-base font-bold text-white leading-snug">Ask AI or Analyze Notices</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
              Get immediate gazette rule breakdowns or upload rejection memos to identify defect reasons.
            </p>
          </div>

          <div className="bg-slate-950/80 p-8 rounded-2xl border border-slate-800 text-center space-y-3 flex flex-col items-center">
            <span className="text-3xl font-black text-amber-400 block">03</span>
            <h4 className="text-base font-bold text-white leading-snug">Draft RTI & Resubmit</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
              Generate legally formatted Section 6(1) RTI applications to track delays and resubmit documents.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}
