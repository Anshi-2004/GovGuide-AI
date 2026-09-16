import React from 'react';
import { Bot, Landmark, FileSearch, Scale, BarChart3, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, HelpCircle, FileText } from 'lucide-react';

export default function LandingPage({ setActiveTab }) {
  const features = [
    {
      id: 'chat',
      title: 'AI Citizen Assistant',
      icon: Bot,
      color: 'from-blue-600 to-indigo-600',
      badge: 'General Questions',
      description: 'Ask any question about central & state government schemes, certificate procedures, eligibility rules, and reservation benefits.',
      actionText: 'Start Asking Questions',
    },
    {
      id: 'schemes',
      title: 'Government Schemes Directory',
      icon: Landmark,
      color: 'from-amber-600 to-orange-600',
      badge: '100+ Gazette Schemes',
      description: 'Browse, filter, and search verified government welfare schemes by state jurisdiction, caste/social category, and family income limits.',
      actionText: 'Explore Schemes Directory',
    },
    {
      id: 'document',
      title: 'Document Analyzer & Document Q&A',
      icon: FileSearch,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Upload & Ask About Notice',
      description: 'Paste or upload application rejection memos or defect letters. Get an automated diagnostic breakdown and ask specific questions about your document.',
      actionText: 'Analyze Rejection Document',
    },
    {
      id: 'rti',
      title: 'RTI Application Draft Builder',
      icon: Scale,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Section 6(1) RTI Act',
      description: 'Generate legally formatted Right to Information (RTI) application letters to track delayed applications and hold public officers accountable.',
      actionText: 'Draft RTI Application',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Select Your Demographic Filter',
      desc: 'Set your state, social category (SC/ST/OBC/EWS/General), and family income bracket for tailored rules.',
    },
    {
      number: '02',
      title: 'Ask Questions or Analyze Notices',
      desc: 'Get immediate AI guidance on public schemes or run a contradiction diagnostic on rejection letters.',
    },
    {
      number: '03',
      title: 'Take Action with Legal Drafts',
      desc: 'Generate printable RTI applications and step-by-step checklists to resubmit corrected applications.',
    },
  ];

  return (
    <div className="space-y-12 py-4 animate-fade-in">
      {/* Hero Section */}
      <section className="glass-card p-8 md:p-12 relative overflow-hidden border-l-4 border-l-amber-500">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
            <Sparkles size={14} />
            <span>Official Public Information & Citizen Welfare Portal</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-normal md:leading-normal tracking-tight mb-4">
            Empowering Citizens with AI-Driven <span className="text-amber-400">Public Services Guidance</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mb-6">
            GovGuide AI simplifies complex government procedures. Discover eligible welfare schemes, diagnose application rejection reasons, generate legal RTI drafts, and get instant answers based on verified gazette rules.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('chat')}
              className="btn-saffron py-3 px-6 text-sm flex items-center gap-2 font-semibold"
            >
              <Bot size={18} />
              <span>Ask AI Assistant</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => setActiveTab('schemes')}
              className="btn-secondary py-3 px-6 text-sm flex items-center gap-2 font-semibold"
            >
              <Landmark size={18} />
              <span>Explore Schemes</span>
            </button>

            <button
              onClick={() => setActiveTab('document')}
              className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <FileSearch size={18} className="text-emerald-400" />
              <span>Analyze Rejection Letter</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Accent */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* "What You Can Do On This Portal" Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <span className="badge badge-saffron text-xs py-1 px-3">Portal Services</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-snug">
            What You Can Do on GovGuide AI
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Choose from our specialized tools designed to solve public scheme queries, document rejections, and RTI filings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="glass-card p-8 flex flex-col justify-between hover:border-amber-500/40 transition-all cursor-pointer group"
                onClick={() => setActiveTab(item.id)}
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}>
                      <IconComponent size={24} />
                    </div>
                    <span className="badge badge-blue text-[11px] py-1 px-2.5">{item.badge}</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>{item.actionText}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Pipeline Section */}
      <section className="glass-card p-8 border-l-4 border-l-blue-600 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Simple 3-Step Process</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug">How GovGuide AI Assists Citizens</h2>
          </div>
          <ShieldCheck size={28} className="text-emerald-400 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-slate-950/70 p-6 rounded-xl border border-slate-800/80 space-y-3 relative">
              <span className="text-2xl font-black text-amber-500/80 block">{step.number}</span>
              <h4 className="text-sm font-bold text-white leading-snug">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

