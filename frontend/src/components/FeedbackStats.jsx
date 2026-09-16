import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Database, Cpu, Activity, RefreshCw, BarChart3, ShieldCheck } from 'lucide-react';

export default function FeedbackStats() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/feedback/stats'),
        fetch('/api/health'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      }
    } catch (e) {
      console.error('Stats fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-amber-500">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-saffron text-[10px]">System Telemetry & Transparency</span>
            <span className="text-xs text-slate-400">RTI Section 4 Disclosure</span>
          </div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-amber-400" />
            Citizen Feedback & System Architecture Status
          </h2>
          <p className="text-xs text-slate-400">
            Real-time analytics on AI answer accuracy, PostgreSQL database persistence, and FAISS vector retrieval health.
          </p>
        </div>

        <button onClick={fetchData} className="btn-secondary text-xs py-2 px-4 shrink-0">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Helpfulness */}
        <div className="glass-card p-5 border-l-4 border-l-emerald-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase text-[11px] tracking-wider">Helpfulness Score</span>
            <ThumbsUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats ? `${stats.helpful_pct}%` : '0%'}
          </div>
          <p className="text-[11px] text-slate-400">
            {stats ? `${stats.helpful} positive of ${stats.total} total reviews` : 'No reviews recorded yet'}
          </p>
        </div>

        {/* Card 2: Total Feedback Records */}
        <div className="glass-card p-5 border-l-4 border-l-blue-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase text-[11px] tracking-wider">Citizen Reviews</span>
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats ? stats.total : 0}
          </div>
          <p className="text-[11px] text-slate-400">Persisted in SQL Database</p>
        </div>

        {/* Card 3: Database Engine */}
        <div className="glass-card p-5 border-l-4 border-l-purple-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase text-[11px] tracking-wider">SQL Storage</span>
            <Database size={16} className="text-purple-400" />
          </div>
          <div className="text-lg font-extrabold text-white capitalize">
            {health?.database?.status === 'connected' ? 'PostgreSQL / SQLite' : 'Offline'}
          </div>
          <p className="text-[11px] text-slate-400">
            {health ? `${health.database?.schemes_count || 0} schemes seeded` : 'Checking status...'}
          </p>
        </div>

        {/* Card 4: Vector Index */}
        <div className="glass-card p-5 border-l-4 border-l-amber-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase text-[11px] tracking-wider">FAISS Vector Index</span>
            <Cpu size={16} className="text-amber-400" />
          </div>
          <div className="text-lg font-extrabold text-white capitalize">
            {health?.faiss_vector_store?.status === 'loaded' ? 'Active Index' : 'Not Loaded'}
          </div>
          <p className="text-[11px] text-slate-400">SentenceTransformers Embeddings</p>
        </div>
      </div>

      {/* Recent Feedback Feed Table */}
      <div className="glass-card p-6 border-l-4 border-l-blue-600">
        <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <Activity size={18} className="text-amber-400" />
          Recent Citizen Query Feedback Audit Logs
        </h3>

        {!stats || stats.recent_feedback.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 space-y-1">
            <ShieldCheck size={32} className="text-slate-600 mx-auto" />
            <p>No feedback audit logs recorded yet.</p>
            <p className="text-[11px] text-slate-500">Ask questions in the AI Assistant tab and leave a 👍 or 👎 review!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
                  <th className="py-3 px-4">Evaluation</th>
                  <th className="py-3 px-4">Citizen Question</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.recent_feedback.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      {item.feedback === 'helpful' ? (
                        <span className="badge badge-green">Accurate 👍</span>
                      ) : (
                        <span className="badge badge-amber">Review Needed 👎</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium max-w-md truncate">
                      {item.question}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.language}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

