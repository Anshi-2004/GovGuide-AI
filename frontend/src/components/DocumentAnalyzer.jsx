import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, AlertTriangle, CheckCircle, Upload, Search, RefreshCw } from 'lucide-react';

const SAMPLE_REJECTIONS = [
  {
    title: "Post-Matric Scholarship Rejection Notice",
    content: "Application #SCH-2024-8891 rejected. Reason: Income certificate uploaded is older than 12 months. Aadhaar NPCI seeding status returned 'Bank Account Inactive / Unmapped'. High School Marksheet name 'Amit K. Sharma' differs from Aadhaar name 'Amit Kumar Sharma'."
  },
  {
    title: "Aadhaar Demographic Update Defect Memo",
    content: "URN #2024-99120 rejected by UIDAI Validator. Reason: Proof of Address electricity bill submitted is not in applicant's name. Proof of Identity document lacks official digital signature stamp."
  }
];

export default function DocumentAnalyzer({ language }) {
  const [docText, setDocText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!docText.trim() || loading) return;
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_text: docText,
          document_title: docTitle || 'Application Notice',
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult("⚠️ Error analyzing document. Please verify FastAPI backend status.");
      }
    } catch (e) {
      console.error(e);
      setAnalysisResult("⚠️ Network error reaching document analysis service.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setDocTitle(sample.title);
    setDocText(sample.content);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">Document Rejection Diagnostic</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Paste your application rejection letter, SMS alert, or objection memo text to receive an immediate diagnostic breakdown and step-by-step fix guide.
          </p>

          {/* Sample loader */}
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Try Sample Rejections:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_REJECTIONS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSample(sample)}
                  className="text-xs bg-gray-900 border border-gray-800 hover:border-blue-500/50 text-gray-300 px-3 py-1.5 rounded-lg transition-all"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="form-label">Document Title / Application No.</label>
              <input
                type="text"
                placeholder="e.g. Scholarship Objection Notice"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label">Rejection Notice / Document Text</label>
              <textarea
                rows={10}
                placeholder="Paste the exact rejection letter text or SMS notification..."
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                className="form-textarea text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!docText.trim() || loading}
          className="btn-primary w-full justify-center text-xs py-3 mt-4 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Analyzing Document Contradictions...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Run AI Rejection Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Output Analysis Panel */}
      <div className="glass-card p-6 flex flex-col">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-800 mb-4">
          <CheckCircle size={20} className="text-emerald-400" />
          <h3 className="text-base font-bold text-white">Diagnostic & Fix Recommendations</h3>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs py-12">
            <RefreshCw size={28} className="animate-spin text-blue-400 mb-3" />
            <p>Scanning document requirements & cross-referencing state rules...</p>
          </div>
        ) : analysisResult ? (
          <div className="flex-1 overflow-y-auto pr-2 markdown-body text-xs text-gray-200 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysisResult}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <AlertTriangle size={40} className="text-amber-400/60 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">No Document Analyzed Yet</h4>
            <p className="text-xs text-gray-400 max-w-sm">
              Paste your application rejection notice on the left panel and click "Run AI Rejection Analysis".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
