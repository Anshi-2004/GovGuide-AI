import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Database, Cpu, Activity, RefreshCw } from 'lucide-react';

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
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📊 Community Feedback & System Architecture Status
          </h2>
          <p className="text-xs text-gray-400">
            Real-time telemetry on AI response accuracy, database storage, and vector retrieval stats.
          </p>
        </div>

        <button onClick={fetchData} className="btn-secondary text-xs py-2 px-4">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Helpfulness */}
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Helpfulness Rate</span>
            <ThumbsUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats ? `${stats.helpful_pct}%` : '0%'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {stats ? `${stats.helpful} positive of ${stats.total} total reviews` : 'No reviews recorded'}
          </p>
        </div>

        {/* Card 2: Total Feedback Records */}
        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Total Feedback Items</span>
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats ? stats.total : 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Persisted in SQL Database</p>
        </div>

        {/* Card 3: Database Engine */}
        <div className="glass-card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Database Storage</span>
            <Database size={16} className="text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white capitalize">
            {health?.database?.status === 'connected' ? 'PostgreSQL / SQLite' : 'Offline'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {health ? `${health.database?.schemes_count || 0} schemes seeded` : 'Checking status...'}
          </p>
        </div>

        {/* Card 4: Vector Index */}
        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>FAISS Vector Index</span>
            <Cpu size={16} className="text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white capitalize">
            {health?.faiss_vector_store?.status === 'loaded' ? 'Active Index' : 'Not Loaded'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">SentenceTransformers Embeddings</p>
        </div>
      </div>

      {/* Recent Feedback Feed Table */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          Recent Community Feedback Logs
        </h3>

        {!stats || stats.recent_feedback.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No feedback records stored yet. Ask questions in the AI Assistant tab and leave a 👍 or 👎!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">User Question</th>
                  <th className="pb-3 px-3">Language</th>
                  <th className="pb-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {stats.recent_feedback.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-900/40">
                    <td className="py-3 px-3">
                      {item.feedback === 'helpful' ? (
                        <span className="badge badge-green">Helpful 👍</span>
                      ) : (
                        <span className="badge badge-amber">Needs Improvement 👎</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-200 font-medium max-w-md truncate">
                      {item.question}
                    </td>
                    <td className="py-3 px-3 text-gray-400">{item.language}</td>
                    <td className="py-3 px-3 text-gray-400">
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
