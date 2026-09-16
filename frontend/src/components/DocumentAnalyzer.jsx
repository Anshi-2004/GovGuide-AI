import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, AlertTriangle, CheckCircle2, Search, RefreshCw, FileSearch, Printer, Sparkles, ShieldCheck, Send, MessageSquareText, HelpCircle } from 'lucide-react';

const SAMPLE_REJECTIONS = [
  {
    title: "Post-Matric Scholarship Rejection Notice",
    content: "Application #SCH-2024-8891 rejected by District Welfare Officer. Reason: Income certificate uploaded is older than 12 months (Expired). Aadhaar NPCI seeding status returned 'Bank Account Inactive / Unmapped'. High School Marksheet name 'Amit K. Sharma' differs from Aadhaar name 'Amit Kumar Sharma'."
  },
  {
    title: "Aadhaar Demographic Update Defect Memo",
    content: "URN #2024-99120 rejected by UIDAI Validator. Reason: Proof of Address electricity bill submitted is not in applicant's name. Proof of Identity document lacks official digital signature stamp."
  },
  {
    title: "PM Kisan Samman Nidhi Land Seeding Issue",
    content: "Beneficiary ID #PMK-771290 status flagged 'Ineligible'. Reason: Land seeding status marked 'No' in revenue records. Bank account PFMS validation failed due to name mismatch."
  }
];

export default function DocumentAnalyzer({ language }) {
  const [docText, setDocText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dedicated Document Q&A state
  const [docQuestion, setDocQuestion] = useState('');
  const [docQAHistory, setDocQAHistory] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!docText.trim() || loading) return;
    setLoading(true);
    setAnalysisResult(null);
    setDocQAHistory([]);

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

  const handleAskDocQuestion = async (e) => {
    e.preventDefault();
    if (!docQuestion.trim() || qaLoading || !docText.trim()) return;

    const q = docQuestion.trim();
    setDocQuestion('');
    setQaLoading(true);

    const newQAItem = { question: q, answer: null, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setDocQAHistory((prev) => [...prev, newQAItem]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Regarding this document notice ("${docTitle || 'Notice'}"): ${q}`,
          language,
          document_text: docText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocQAHistory((prev) =>
          prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, answer: data.answer } : item))
        );
      } else {
        setDocQAHistory((prev) =>
          prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, answer: "⚠️ Unable to get response for this document question." } : item))
        );
      }
    } catch (err) {
      console.error(err);
      setDocQAHistory((prev) =>
        prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, answer: "⚠️ Network error connecting to backend service." } : item))
      );
    } finally {
      setQaLoading(false);
    }
  };

  const loadSample = (sample) => {
    setDocTitle(sample.title);
    setDocText(sample.content);
    setAnalysisResult(null);
    setDocQAHistory([]);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>GovGuide AI — Rejection Diagnostic Report</title>
          <style>
            body { font-family: sans-serif; padding: 30px; font-size: 13px; line-height: 1.6; color: #111; }
            h2 { color: #1e3a8a; border-bottom: 2px solid #d97706; padding-bottom: 8px; }
            .meta { background: #f8fafc; padding: 12px; border: 1px solid #cbd5e1; margin-bottom: 20px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <h2>🏛️ GovGuide AI — Official Rejection Diagnostic Report</h2>
          <div class="meta">
            <strong>Document Title / Ref:</strong> ${docTitle || 'Application Notice'}<br/>
            <strong>Generated Date:</strong> ${new Date().toLocaleString()}
          </div>
          <div style="white-space: pre-wrap;">${analysisResult}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="glass-card p-6 border-l-4 border-l-emerald-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-green text-[10px]">Document Intelligence Workspace</span>
              <span className="text-xs text-slate-400">OCR & Contradiction Analysis</span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileSearch size={22} className="text-emerald-400" />
              Document Rejection Diagnostic & Dedicated Document Q&A
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Upload or paste your objection memo, rejection SMS, or notice here. Run an automated AI diagnostic and ask specific questions directly about your uploaded document.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload / Paste Notice Form */}
        <div className="glass-card p-6 flex flex-col justify-between border-l-4 border-l-blue-600 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">1. Upload / Paste Notice</h3>
              </div>
              <span className="badge badge-saffron text-[10px]">Input Area</span>
            </div>

            {/* Sample loader */}
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Try Sample Rejection Notices:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_REJECTIONS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSample(sample)}
                    className="text-xs bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 px-3 py-1.5 rounded-lg transition-all text-left truncate max-w-[240px]"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="form-label">Document / Application Reference Title</label>
                <input
                  type="text"
                  placeholder="e.g. Post-Matric Scholarship Defect Memo #2024"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="form-input text-xs bg-slate-950 border-slate-800"
                />
              </div>

              <div>
                <label className="form-label">Paste Rejection Letter / Notice Text</label>
                <textarea
                  rows={9}
                  placeholder="Paste exact text from your rejection letter, defect notice, or SMS..."
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  className="form-textarea text-xs bg-slate-950 border-slate-800 leading-relaxed"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!docText.trim() || loading}
            className="btn-saffron w-full justify-center text-xs py-3 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Running AI Contradiction Analysis...</span>
              </>
            ) : (
              <>
                <Search size={15} />
                <span>Run AI Diagnostic on Document</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Diagnostic & Dedicated Document Q&A */}
        <div className="glass-card p-6 flex flex-col justify-between border-l-4 border-l-emerald-600 space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">2. Diagnostic & Document Q&A Workspace</h3>
              </div>

              {analysisResult && (
                <button
                  onClick={handlePrintReport}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Printer size={13} />
                  <span>Print Report</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center text-slate-400 text-xs py-16 space-y-3">
                <RefreshCw size={30} className="animate-spin text-amber-400" />
                <p>Cross-referencing Gazette rules & checking mandatory document requirements...</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-4">
                <div className="overflow-y-auto pr-2 markdown-body text-xs text-slate-200 leading-relaxed max-h-[300px] bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisResult}
                  </ReactMarkdown>
                </div>

                {/* Document Follow-up Q&A History */}
                {docQAHistory.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <MessageSquareText size={14} />
                      Questions Asked About This Document:
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {docQAHistory.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                          <p className="font-semibold text-blue-300">Q: {item.question}</p>
                          {item.answer ? (
                            <div className="text-slate-200 text-[11px] leading-relaxed pt-1 border-t border-slate-800/60">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-[11px] italic animate-pulse">Analyzing document context...</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-2">
                <AlertTriangle size={40} className="text-amber-400/60 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Notice Loaded Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Paste your rejection memo on the left panel and click "Run AI Diagnostic" to start analyzing and asking questions.
                </p>
              </div>
            )}
          </div>

          {/* Ask Specific Question About Uploaded Document */}
          {analysisResult && (
            <form onSubmit={handleAskDocQuestion} className="pt-3 border-t border-slate-800 space-y-2">
              <label className="form-label text-[11px] text-amber-400 flex items-center gap-1">
                <HelpCircle size={13} />
                Ask a Question Specifically About This Document:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={docQuestion}
                  onChange={(e) => setDocQuestion(e.target.value)}
                  placeholder="e.g. Which authority should I contact to fix the name error?"
                  className="form-input text-xs bg-slate-950 border-slate-800 flex-1"
                />
                <button
                  type="submit"
                  disabled={!docQuestion.trim() || qaLoading}
                  className="btn-saffron py-2.5 px-4 text-xs shrink-0 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>Ask Doc AI</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


