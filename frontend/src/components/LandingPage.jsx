import React, { useState } from 'react';
import { 
  Search, Bot, Landmark, FileSearch, Scale, ArrowRight, ShieldCheck, 
  Sparkles, ChevronLeft, ChevronRight, Lightbulb, CheckCircle2,
  GraduationCap, Sprout, Stethoscope, Home, Briefcase, Users
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
    <div className="space-y-16 py-6 animate-fade-in">
      
      {/* myAadhaar Centered Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 pt-4 pb-4">
        
        {/* Badge & Serif Headline */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
            <Sparkles size={14} />
            <span>National Public Information & Government Schemes Portal</span>
          </div>

          <h1 className="font-serif-hero text-4xl sm:text-5xl md:text-6xl font-normal text-white leading-tight">
            Welcome to <span className="italic text-amber-400 font-serif-hero font-semibold">GovGuide AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
            What do you want to do today ?
          </p>
        </div>

        {/* Central Pill Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="search-pill-bar group">
            <input
              type="text"
              placeholder="Search government schemes, document rejection fixes, RTI templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base outline-none pr-3"
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

        {/* Circular Quick Action Icons Row */}
        <div className="pt-4">
          <div className="flex flex-wrap items-start justify-center gap-8 md:gap-12 max-w-3xl mx-auto">
            {quickActionCircles.map((circle) => {
              const IconComp = circle.icon;
              return (
                <div
                  key={circle.id}
                  onClick={() => setActiveTab(circle.id)}
                  className="action-circle-card group"
                >
                  <div className={`action-circle-icon ${circle.color} mb-3.5 group-hover:border-amber-400`}>
                    <IconComp size={34} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                    {circle.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 mt-1">
                    {circle.subtitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Spacious 2-Column Portal Services Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Card (7 cols): Services Overview Card */}
        <div className="lg:col-span-7 glass-card p-8 sm:p-10 flex flex-col justify-between border-l-4 border-l-purple-500 space-y-6 h-auto">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <ShieldCheck className="text-purple-400" size={18} />
              <span>GOVGUIDE AI OFFICIAL PORTAL</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              Check all your GovGuide AI services in one place
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Explore 100+ verified Central & State welfare schemes, diagnose application rejection reasons with automated contradiction checks, and generate printable Section 6(1) RTI applications.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('chat')}
              className="btn-primary py-3 px-6 text-sm font-bold flex items-center gap-2 shadow-lg"
            >
              <span>Launch AI Citizen Assistant</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className="btn-secondary py-3 px-5 text-sm font-semibold"
            >
              <span>Explore All 100+ Schemes</span>
            </button>
          </div>
        </div>

        {/* Right Cards (5 cols): Sidebar Widgets */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          {/* Widget 1: "Did you know ?" Trivia Card */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-8 space-y-4 relative overflow-hidden h-auto flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Lightbulb size={18} />
                <span>Did you know ?</span>
              </div>
              <Sparkles size={20} className="text-amber-400 opacity-70" />
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Under <strong className="text-amber-300">Section 6(1) of the RTI Act 2005</strong>, public information officers are legally obligated to respond to citizen applications within <strong className="text-emerald-400">30 calendar days</strong>.
            </p>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Verified Gazette Rules</span>
              <span className="text-amber-400 font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('rti')}>
                Draft RTI Application →
              </span>
            </div>
          </div>

          {/* Widget 2: 100% Verified Gazette Rules Badge Card */}
          <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex items-start gap-4 h-auto">
            <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={24} />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">100% Verified Gazette Rules</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                All scheme criteria, reservation brackets, and document rules are synchronized with active ministry gazette releases.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* "Find Services relevant to you" Horizontal Category Grid */}
      <section className="space-y-8 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-hero text-2xl sm:text-3xl font-normal text-white">
              Find Services relevant to you
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore welfare schemes by sector and category
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
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

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCategories
            .slice(categoryIndex, categoryIndex + 3)
            .map((cat, idx) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab('schemes')}
                  className="glass-card p-8 flex flex-col justify-between space-y-6 hover:border-amber-500/40 transition-all cursor-pointer group h-auto min-h-[220px]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md`}>
                        <CatIcon size={24} />
                      </div>
                      <span className="badge badge-amber text-xs py-1 px-2.5">
                        {cat.count}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>View Category Schemes</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 3-Step Citizen Workflow Section */}
      <section className="glass-card p-8 sm:p-10 border-l-4 border-l-amber-500 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Simplified Public Process</span>
            <h2 className="text-2xl font-extrabold text-white leading-snug">How Citizens Use GovGuide AI</h2>
          </div>
          <ShieldCheck size={32} className="text-emerald-400 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-950/80 p-8 rounded-2xl border border-slate-800 space-y-3 h-auto min-h-[190px]">
            <span className="text-3xl font-black text-amber-400 block">01</span>
            <h4 className="text-base font-bold text-white leading-snug">Search or Select Category</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use the central pill search bar or filter schemes by state, social category, and income bracket.
            </p>
          </div>

          <div className="bg-slate-950/80 p-8 rounded-2xl border border-slate-800 space-y-3 h-auto min-h-[190px]">
            <span className="text-3xl font-black text-amber-400 block">02</span>
            <h4 className="text-base font-bold text-white leading-snug">Ask AI or Analyze Notices</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Get immediate gazette rule breakdowns or upload rejection memos to identify defect reasons.
            </p>
          </div>

          <div className="bg-slate-950/80 p-8 rounded-2xl border border-slate-800 space-y-3 h-auto min-h-[190px]">
            <span className="text-3xl font-black text-amber-400 block">03</span>
            <h4 className="text-base font-bold text-white leading-snug">Draft RTI & Resubmit</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Generate legally formatted Section 6(1) RTI applications to track delays and resubmit applications.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
