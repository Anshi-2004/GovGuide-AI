import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, ThumbsUp, ThumbsDown, User, Bot, Sparkles, Paperclip, Check, AlertCircle, Copy } from 'lucide-react';

const QUICK_PROMPTS = [
  "Why was my scholarship application rejected?",
  "How to correct my name & address in Aadhaar?",
  "What documents are needed for income certificate?",
  "How do I file an online RTI query step-by-step?",
  "How to apply for PM Kisan Samman Nidhi scheme?",
  "What is the eligibility for Ayushman Bharat PM-JAY?",
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
        ? 'नमस्ते! मैं GovGuide AI हूँ। भारतीय सरकारी योजनाओं, प्रमाणपत्रों, छात्रवृत्तियों और RTI प्रक्रियाओं के बारे में अपने प्रश्न पूछें।'
        : 'Hello! I am GovGuide AI. Ask me any question about Indian government schemes, certificate applications, scholarship rejection reasons, or RTI filing procedures.',
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
        text: `⚠️ **Unable to connect to GovGuide AI Backend.**\n\nPlease ensure the FastAPI server is running on port 8000.\n\n*Error details: ${err.message}*`,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar: User Profile Context Filters */}
      <div className="lg:col-span-1 glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
          <Sparkles size={18} className="text-blue-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">User Profile Filter</h3>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Tailor answers specifically to your state rules, social category reservations, and family income bracket.
        </p>

        <div>
          <label className="form-label">State / Union Territory</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="form-select text-xs"
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select text-xs"
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
            className="form-select text-xs"
          >
            {INCOMES.map((inc) => (
              <option key={inc} value={inc}>{inc}</option>
            ))}
          </select>
        </div>

        {/* Uploaded Document Context Toggle */}
        <div className="pt-2 border-t border-gray-800">
          <button
            onClick={() => setShowDocDrawer(!showDocDrawer)}
            className={`w-full text-xs font-semibold py-2 px-3 rounded-lg border flex items-center justify-between transition-all ${
              documentText
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Paperclip size={14} />
              {documentText ? 'Document Context Active' : 'Attach Document Context'}
            </span>
            {documentText && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
        </div>

        {showDocDrawer && (
          <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 animate-fade-in">
            <label className="form-label text-xs">Paste Rejection Letter / Notice Text</label>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste document text here to analyze..."
              className="form-textarea text-xs h-24 mb-2"
            />
            {documentText && (
              <button
                onClick={() => setDocumentText('')}
                className="text-xs text-rose-400 hover:underline"
              >
                Clear Document Text
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 glass-card flex flex-col h-[700px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fade-in ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot size={20} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-tl-none'
                    : 'bg-gray-900/90 border border-gray-800 text-gray-100 rounded-tl-none'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-white/10 text-xs opacity-70">
                  <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'GovGuide AI'}</span>
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
                  <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span>Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(msg.id, 'helpful', messages.find((m) => m.sender === 'user')?.text || '', msg.text)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          msg.feedbackSubmitted === 'helpful'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                            : 'border-gray-800 hover:border-gray-700 text-gray-400 hover:text-emerald-400'
                        }`}
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'not_helpful', messages.find((m) => m.sender === 'user')?.text || '', msg.text)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          msg.feedbackSubmitted === 'not_helpful'
                            ? 'bg-rose-950 border-rose-500 text-rose-400'
                            : 'border-gray-800 hover:border-gray-700 text-gray-400 hover:text-rose-400'
                        }`}
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot size={20} />
              </div>
              <div className="bg-gray-900/90 border border-gray-800 rounded-2xl rounded-tl-none p-4 text-xs text-gray-400 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Analyzing knowledge base & government rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-5 py-2.5 bg-gray-900/40 border-t border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">Suggestions:</span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-gray-800/60 hover:bg-blue-600/20 hover:border-blue-500/50 border border-gray-700/60 text-gray-300 hover:text-blue-300 px-3 py-1 rounded-full whitespace-nowrap transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-gray-800 flex items-center gap-3 bg-gray-900/80 rounded-b-2xl"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              language === 'Hindi (हिंदी)'
                ? 'सरकारी सेवा या योजना के बारे में प्रश्न पूछें...'
                : 'Ask a question about schemes, certificates, RTI, or rejection reasons...'
            }
            className="form-input flex-1 text-sm bg-gray-950 border-gray-800"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="btn-primary shrink-0 py-3 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
