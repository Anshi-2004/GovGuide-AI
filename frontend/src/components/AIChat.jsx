import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, ThumbsUp, ThumbsDown, User, Bot, Sparkles, Paperclip, Check, Copy, Filter, Landmark, GraduationCap, CreditCard, Scale, HelpCircle } from 'lucide-react';

const QUICK_CATEGORIES = [
  {
    name: "Scholarships & Education",
    icon: GraduationCap,
    prompts: [
      "Why was my post-matric scholarship application rejected?",
      "What documents are required for NSP portal NSP scholarship?",
    ]
  },
  {
    name: "Aadhaar & Certificates",
    icon: CreditCard,
    prompts: [
      "How to correct my name & address in Aadhaar card?",
      "What documents are needed for income & domicile certificate?",
    ]
  },
  {
    name: "Farmer & Public Welfare",
    icon: Landmark,
    prompts: [
      "How to apply for PM Kisan Samman Nidhi installment?",
      "What is the eligibility limit for Ayushman Bharat PM-JAY?",
    ]
  },
  {
    name: "RTI & Public Grievance",
    icon: Scale,
    prompts: [
      "How do I file an online RTI query step-by-step?",
      "Where to file CPGRAMS public grievance against department delay?",
    ]
  }
];

const STATES = [
  "Select State", "All India", "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
];

const CATEGORIES = [
  "Select Category", "General", "SC (Scheduled Caste)", "ST (Scheduled Tribe)",
  "OBC (Other Backward Class)", "EWS (Economically Weaker Section)"
];

const INCOMES = [
  "Select Income Range", "Below ₹1 Lakh", "₹1 – 2.5 Lakh", "₹2.5 – 5 Lakh", "₹5 – 8 Lakh", "Above ₹8 Lakh"
];

export default function AIChat({ language }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: language === 'Hindi (हिंदी)'
        ? 'नमस्ते! मैं **GovGuide AI Portal** हूँ। भारतीय सरकारी योजनाओं, जाति/आय प्रमाणपत्रों, छात्रवृत्ति अस्वीकृति कारणों और RTI आवेदन प्रक्रियाओं के बारे में अपने प्रश्न पूछें।'
        : 'Welcome to the **GovGuide AI Citizen Portal**. Ask any question about Indian government schemes, certificate applications, scholarship rejection fixes, or Right to Information (RTI) processes.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [state, setState] = useState('Select State');
  const [category, setCategory] = useState('Select Category');
  const [income, setIncome] = useState('Select Income Range');
  const [documentText, setDocumentText] = useState('');
  const [showDocDrawer, setShowDocDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText = inputQuestion) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      context: { state, category, income },
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language: language,
          state: state !== 'Select State' ? state : null,
          category: category !== 'Select Category' ? category : null,
          income: income !== 'Select Income Range' ? income : null,
          document_text: documentText || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.answer,
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedbackSubmitted: null,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat API Error:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `⚠️ **Unable to connect to GovGuide AI Backend.**\n\nPlease verify that the FastAPI backend service is running on port 8000.\n\n*Technical Details: ${err.message}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (msgId, feedbackType, question, answerPreview) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer_preview: answerPreview,
          feedback_type: feedbackType,
          language,
          state,
          category,
        }),
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, feedbackSubmitted: feedbackType } : m))
      );
    } catch (e) {
      console.error('Feedback error:', e);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasActiveFilters = state !== 'Select State' || category !== 'Select Category' || income !== 'Select Income Range';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar: User Profile & Rules Context Filters */}
      <div className="lg:col-span-1 glass-card p-5 flex flex-col gap-4 border-l-4 border-l-blue-600">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter size={17} className="text-amber-400" />
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">Citizen Demographics Filter</h3>
          </div>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Custom Filter Active" />
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Specify your state, social category, and income level to get state-specific rules, reservation limits, and tailored scheme eligibility.
        </p>

        <div className="space-y-3">
          <div>
            <label className="form-label">State / Union Territory</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="form-select text-xs bg-slate-950"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Reservation Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select text-xs bg-slate-950"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Annual Family Income</label>
            <select
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="form-select text-xs bg-slate-950"
            >
              {INCOMES.map((inc) => (
                <option key={inc} value={inc}>{inc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Uploaded Document Context Toggle */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => setShowDocDrawer(!showDocDrawer)}
            className={`w-full text-xs font-semibold py-2.5 px-3 rounded-lg border flex items-center justify-between transition-all ${
              documentText
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Paperclip size={14} className={documentText ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{documentText ? 'Document Context Loaded' : 'Attach Rejection Notice'}</span>
            </span>
            {documentText && <span className="badge badge-green text-[10px] py-0 px-1.5">Active</span>}
          </button>
        </div>

        {showDocDrawer && (
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 animate-fade-in space-y-2">
            <label className="form-label text-[11px]">Paste Rejection Letter / Memo Text</label>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste document text or SMS notification here..."
              className="form-textarea text-xs h-24 bg-slate-900"
            />
            {documentText && (
              <button
                onClick={() => setDocumentText('')}
                className="text-[11px] text-rose-400 hover:underline font-semibold"
              >
                Clear Document Context
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 glass-card flex flex-col h-[720px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fade-in ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-blue-700 flex items-center justify-center text-white shrink-0 shadow-md border border-amber-500/30">
                  <Bot size={19} className="text-amber-200" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-tr-none border border-blue-500/30'
                    : msg.isError
                    ? 'bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-tl-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-white/10 text-xs opacity-75">
                  <span className="font-semibold flex items-center gap-1.5">
                    {msg.sender === 'user' ? 'Citizen' : 'GovGuide AI Official Assistant'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Content */}
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Footer Controls for Bot Message */}
                {msg.sender === 'bot' && !msg.isError && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedId === msg.id ? 'Copied to Clipboard' : 'Copy Answer'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px]">Was this answer accurate?</span>
                      <button
                        onClick={() => handleFeedback(msg.id, 'helpful', messages.find((m) => m.sender === 'user')?.text || '', msg.text)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          msg.feedbackSubmitted === 'helpful'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                            : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-emerald-400'
                        }`}
                        title="Mark as helpful"
                      >
                        <ThumbsUp size={13} />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'not_helpful', messages.find((m) => m.sender === 'user')?.text || '', msg.text)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          msg.feedbackSubmitted === 'not_helpful'
                            ? 'bg-rose-950 border-rose-500 text-rose-400'
                            : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400'
                        }`}
                        title="Mark as inaccurate"
                      >
                        <ThumbsDown size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-blue-700 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot size={19} className="text-amber-200" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Searching government gazette & vector embeddings...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Categorized Quick Question Chips */}
        <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              Quick Query Launchpad:
            </span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {QUICK_CATEGORIES.map((cat, idx) => {
                const CategoryIcon = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveCategoryIndex(idx)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      activeCategoryIndex === idx
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CategoryIcon size={12} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_CATEGORIES[activeCategoryIndex].prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-xs bg-slate-900/90 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-800 text-slate-300 hover:text-blue-300 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950 rounded-b-2xl"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              language === 'Hindi (हिंदी)'
                ? 'सरकारी सेवा, योजना, RTI या अस्वीकृति कारण के बारे में प्रश्न दर्ज करें...'
                : 'Ask a question about public schemes, certificates, RTI, or rejection fix...'
            }
            className="form-input flex-1 text-sm bg-slate-900 border-slate-800"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="btn-saffron shrink-0 py-3 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={15} />
            <span>Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
}

