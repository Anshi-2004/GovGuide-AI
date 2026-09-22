/**
 * GovGuide AI — React Frontend
 * Faithfully replicates the Streamlit government portal UI
 */

import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";
import {
  sendChat,
  fetchSchemes,
  analyzeDocument,
  submitFeedback,
  fetchFeedbackStats,
  fetchHealth,
} from "./api";

/* ── Configuration (mirrors src/config.py) ──────────────────────────────── */
const LANGUAGES = ["English", "Hindi (हिंदी)"];

const INDIAN_STATES = [
  "Select State",
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh",
];

const CATEGORIES = [
  "Select Category","General",
  "SC (Scheduled Caste)","ST (Scheduled Tribe)",
  "OBC (Other Backward Class)","EWS (Economically Weaker Section)",
];

const INCOME_RANGES = [
  "Select Income Range","Below ₹1 Lakh","₹1 – 2.5 Lakh",
  "₹2.5 – 5 Lakh","₹5 – 8 Lakh","Above ₹8 Lakh",
];

const QUICK_SERVICES_EN = [
  { icon: "🎓", name: "Scholarship Help", desc: "Why rejected? How to apply?", q: "Why was my scholarship rejected?" },
  { icon: "🆔", name: "Aadhaar Services", desc: "Name correction, update, link", q: "How to correct my name in Aadhaar?" },
  { icon: "📄", name: "Certificates", desc: "Income, caste, domicile docs", q: "What documents needed for income certificate?" },
  { icon: "📜", name: "RTI Filing", desc: "How to file & track RTI", q: "How to file an RTI application?" },
];

const QUICK_SERVICES_HI = [
  { icon: "🎓", name: "छात्रवृत्ति सहायता", desc: "अस्वीकार क्यों? आवेदन कैसे?", q: "मेरी छात्रवृत्ति क्यों अस्वीकार हुई?" },
  { icon: "🆔", name: "आधार सेवाएं", desc: "नाम सुधार, अपडेट, लिंक", q: "आधार में नाम कैसे सुधारें?" },
  { icon: "📄", name: "प्रमाण पत्र", desc: "आय, जाति, अधिवास दस्तावेज", q: "आय प्रमाण पत्र के लिए क्या दस्तावेज चाहिए?" },
  { icon: "📜", name: "RTI दाखिल करें", desc: "RTI कैसे दाखिल करें और ट्रैक करें", q: "RTI आवेदन कैसे करें?" },
];

const SERVICE_COLORS = ["blue", "green", "orange", "purple"];

const ANNOUNCEMENTS_EN = [
  "📢 GovGuide AI now supports document upload for rejection letter analysis",
  "🆕 Hindi language support available — switch from Home panel",
  "📋 New: RTI filing guide and scholarship rejection helper added",
  "⚡ Tip: Set your profile (State, Category, Income) for personalised answers",
];
const ANNOUNCEMENTS_HI = [
  "📢 GovGuide AI अब अस्वीकृति पत्र के विश्लेषण के लिए दस्तावेज़ अपलोड का समर्थन करता है",
  "🆕 हिंदी भाषा का समर्थन उपलब्ध है — होम पैनल से बदलें",
  "📋 नया: RTI फाइलिंग गाइड और छात्रवृत्ति अस्वीकृति सहायक जोड़ा गया",
  "⚡ सुझाव: व्यक्तिगत उत्तरों के लिए अपनी प्रोफ़ाइल सेट करें",
];

const QUICK_LINKS = {
  "🎓 Scholarships": "https://scholarships.gov.in",
  "🆔 Aadhaar": "https://uidai.gov.in",
  "📜 RTI Online": "https://rtionline.gov.in",
  "📋 DigiLocker": "https://digilocker.gov.in",
  "🏛️ india.gov.in": "https://india.gov.in",
};

/* ── Simple markdown renderer ─────────────────────────────────────────── */
function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^[-•✅❌]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p>\s*<h([23])>/g, '<h$1>').replace(/<\/h([23])>\s*<\/p>/g, '</h$1>');
  html = html.replace(/<p>\s*<hr\/>\s*<\/p>/g, '<hr/>');
  html = html.replace(/<p>\s*<li>/g, '<ul><li>').replace(/<\/li>\s*<\/p>/g, '</li></ul>');
  return html;
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN APP COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── Theme & font ─────────────────────────────────────────────── */
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("md");

  /* ── Profile ──────────────────────────────────────────────────── */
  const [language, setLanguage] = useState("English");
  const [statePick, setStatePick] = useState("Select State");
  const [category, setCategory] = useState("Select Category");
  const [income, setIncome] = useState("Select Income Range");

  /* ── Panels ───────────────────────────────────────────────────── */
  const [showHome, setShowHome] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  /* ── Chat ──────────────────────────────────────────────────────── */
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(new Set());

  /* ── Document ──────────────────────────────────────────────────── */
  const [docText, setDocText] = useState(null);
  const [docName, setDocName] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  /* ── Feedback stats ────────────────────────────────────────────── */
  const [fbStats, setFbStats] = useState(null);

  const isHindi = language.includes("Hindi");
  const textareaRef = useRef(null);

  /* ── Apply theme + font to document ───────────────────────────── */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.setAttribute("data-font", fontSize);
  }, [fontSize]);

  /* ── Load feedback stats for Home panel ───────────────────────── */
  useEffect(() => {
    if (showHome) {
      fetchFeedbackStats().then(setFbStats).catch(() => {});
    }
  }, [showHome]);

  /* ── Prefill question from quick service ──────────────────────── */
  const prefillQuestion = useCallback((q) => {
    setQuestion(q);
    setShowHome(false);
    setShowHelp(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  /* ── Submit question ──────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    try {
      const res = await sendChat({
        question: question.trim(),
        language,
        state: statePick,
        category,
        income,
        document_text: docText,
      });
      setChatHistory(prev => [...prev, {
        question: question.trim(),
        answer: res.answer,
        sources: res.sources || [],
        hasDoc: !!docText,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
      setQuestion("");
    } catch (err) {
      setChatHistory(prev => [...prev, {
        question: question.trim(),
        answer: `## ⚠️ Error\n\n\`${err.message}\`\n\nPlease check your API key or try again.`,
        sources: [],
        hasDoc: false,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Analyze document ─────────────────────────────────────────── */
  const handleAnalyzeDoc = async () => {
    if (!docText || loading) return;
    setLoading(true);
    const autoQ = isHindi
      ? "इस दस्तावेज़ का विश्लेषण करें।"
      : "Analyse this uploaded document and tell me what issues exist and what action to take.";
    try {
      const res = await sendChat({
        question: autoQ,
        language,
        state: statePick,
        category,
        income,
        document_text: docText,
      });
      setChatHistory(prev => [...prev, {
        question: `📎 Document Analysis: ${docName}`,
        answer: res.answer,
        sources: res.sources || [],
        hasDoc: true,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        question: `📎 Document Analysis: ${docName}`,
        answer: `## ⚠️ Error\n\n\`${err.message}\``,
        sources: [],
        hasDoc: true,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Handle file upload ───────────────────────────────────────── */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocText(ev.target.result);
      setDocName(file.name);
    };
    reader.readAsText(file);
  };

  /* ── Handle feedback ──────────────────────────────────────────── */
  const handleFeedback = async (idx, type) => {
    const chat = chatHistory[idx];
    try {
      await submitFeedback({
        question: chat.question,
        answer_preview: chat.answer.slice(0, 300),
        feedback_type: type,
        language,
        state: statePick,
        category,
      });
    } catch {}
    setFeedbackGiven(prev => new Set(prev).add(idx));
  };

  /* ── Nav items ────────────────────────────────────────────────── */
  const navItemsEn = ["🏠 Home", "💬 Ask Question", "📋 Schemes", "📎 Documents", "📖 How to Use", "🔗 Quick Links", "❓ Help"];
  const navItemsHi = ["🏠 होम", "💬 प्रश्न पूछें", "📋 योजनाएं", "📎 दस्तावेज़", "📖 उपयोग", "🔗 लिंक", "❓ सहायता"];
  const navItems = isHindi ? navItemsHi : navItemsEn;

  /* ── Announcements ────────────────────────────────────────────── */
  const announcements = isHindi ? ANNOUNCEMENTS_HI : ANNOUNCEMENTS_EN;
  const services = isHindi ? QUICK_SERVICES_HI : QUICK_SERVICES_EN;

  return (
    <>
      {/* ═══ TOP UTILITY BAR ═══ */}
      <div className="gov-top-bar">
        <div className="gov-top-left">
          <div className="gov-emblem">🏛️</div>
          <div className="gov-brand">
            <div className="gov-brand-hi">गवगाइड एआई — सरकारी सेवा सहायक</div>
            <div className="gov-brand-en">GovGuide AI</div>
            <div className="gov-brand-sub">Government Systems &amp; Public Services Assistant</div>
          </div>
        </div>
        <div className="gov-top-right">
          {["sm","md","lg"].map(sz => (
            <div
              key={sz}
              className={`gov-a-btn${fontSize === sz ? " active" : ""}`}
              title={sz === "sm" ? "Decrease font" : sz === "lg" ? "Increase font" : "Default font"}
              onClick={() => setFontSize(sz)}
            >
              {sz === "sm" ? "A⁻" : sz === "lg" ? "A⁺" : "A"}
            </div>
          ))}
          <div
            className="gov-contrast-btn"
            title="Toggle contrast"
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
          />
        </div>
      </div>

      {/* ═══ NAVIGATION BAR ═══ */}
      <div className="gov-nav-bar">
        <div className="gov-nav-links">
          {navItems.map((item, i) => (
            <button
              key={i}
              className={`gov-nav-item${i === 0 ? " active" : ""}`}
              onClick={() => {
                if (i === 0) { setShowHome(h => !h); setShowHelp(false); }
                else if (i === 4 || i === 6) { setShowHelp(h => !h); setShowHome(false); }
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="gov-nav-search">
          <button className="gov-search-icon">🔍</button>
        </div>
      </div>

      {/* ═══ ANNOUNCEMENT TICKER ═══ */}
      <div className="gov-ticker">
        <div className="gov-ticker-inner">
          <div className="gov-ticker-label">📣 {isHindi ? "अपडेट" : "UPDATES"}</div>
          <div className="gov-ticker-content">
            <div className="gov-ticker-scroll">
              {announcements.map((a, i) => <span key={i}>{a}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ HERO BANNER ═══ */}
      <div className="gov-hero">
        <div className="gov-hero-content">
          <div className="gov-hero-text">
            <h1>🏛️ GovGuide <span>AI</span></h1>
            <p>
              {isHindi
                ? "भारतीय सरकारी प्रणालियों और सार्वजनिक सेवाओं के लिए आपका AI-संचालित सहायक। प्रक्रियाओं को समझें, अस्वीकृति के कारण जानें, और दस्तावेज़ आवश्यकताओं की जानकारी प्राप्त करें।"
                : "Your AI-powered assistant for Indian Government Systems & Public Services. Understand processes, know why applications are rejected, and get document guidance."
              }
            </p>
          </div>
          <div className="gov-hero-stats">
            <div className="gov-hero-stat">
              <div className="gov-hero-stat-num">10+</div>
              <div className="gov-hero-stat-label">{isHindi ? "विषय" : "Topics"}</div>
            </div>
            <div className="gov-hero-stat">
              <div className="gov-hero-stat-num">2</div>
              <div className="gov-hero-stat-label">{isHindi ? "भाषाएं" : "Languages"}</div>
            </div>
            <div className="gov-hero-stat">
              <div className="gov-hero-stat-num">50+</div>
              <div className="gov-hero-stat-label">{isHindi ? "स्रोत" : "Sources"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT WRAPPER ═══ */}
      <div className="gov-content-wrapper">

        {/* ── Action buttons ── */}
        <div className="gov-action-row">
          <button
            className="gov-btn-primary"
            onClick={() => { setShowHome(h => !h); setShowHelp(false); }}
          >
            {isHindi ? "🏠 होम पैनल" : "🏠 Home Panel"}
          </button>
          <button
            className="gov-btn-outline"
            onClick={() => { setShowHelp(h => !h); setShowHome(false); }}
          >
            {isHindi ? "📖 उपयोग कैसे करें" : "📖 How to Use"}
          </button>
        </div>

        {/* ═══ HELP PANEL ═══ */}
        {showHelp && (
          <HelpPanel isHindi={isHindi} onClose={() => setShowHelp(false)} />
        )}

        {/* ═══ HOME PANEL ═══ */}
        {showHome && (
          <HomePanel
            isHindi={isHindi}
            language={language} setLanguage={setLanguage}
            statePick={statePick} setStatePick={setStatePick}
            category={category} setCategory={setCategory}
            income={income} setIncome={setIncome}
            fbStats={fbStats}
            onClose={() => setShowHome(false)}
            onPrefill={prefillQuestion}
          />
        )}

        {/* ═══ QUICK SERVICES ═══ */}
        <div className="gov-section-title">
          🚀 {isHindi ? "त्वरित सेवाएं" : "Quick Services"}
        </div>
        <div className="gov-service-grid">
          {services.map((s, i) => (
            <div key={i} className="gov-service-card" onClick={() => prefillQuestion(s.q)}>
              <div className={`gov-service-icon gov-service-icon-${SERVICE_COLORS[i]}`}>{s.icon}</div>
              <div className="gov-service-name">{s.name}</div>
              <div className="gov-service-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* ═══ DOCUMENT UPLOAD ═══ */}
        <div className="gov-upload-section">
          <div className="gov-upload-header" onClick={() => setUploadOpen(o => !o)}>
            <span>{isHindi ? "📎 दस्तावेज़ अपलोड करें (वैकल्पिक)" : "📎 Upload a Document (Optional)"}</span>
            <span className={`chevron${uploadOpen ? " open" : ""}`}>▼</span>
          </div>
          {uploadOpen && (
            <div className="gov-upload-body fade-in">
              <div className="gov-upload-info">
                📄 {isHindi
                  ? "अस्वीकृति पत्र या आवेदन फ़ॉर्म अपलोड करें — AI विश्लेषण करेगा।"
                  : "Upload a rejection letter or application form — the AI will analyse it and tell you what to fix."
                }
              </div>
              <div className="gov-file-input">
                <span>{isHindi ? "फ़ाइल चुनें (PDF, PNG, JPG, TXT)" : "Choose file (PDF, PNG, JPG, TXT)"}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileUpload}
                />
              </div>
              {docText && (
                <div style={{ marginTop: 12 }}>
                  <div className="gov-success">
                    ✅ <strong>{docName}</strong> — {docText.length.toLocaleString()} characters extracted
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="gov-btn-amber" onClick={handleAnalyzeDoc} disabled={loading}>
                      {isHindi ? "🔍 दस्तावेज़ का विश्लेषण करें" : "🔍 Analyse This Document"}
                    </button>
                    <button className="gov-btn-danger gov-btn-sm" onClick={() => { setDocText(null); setDocName(null); }}>
                      {isHindi ? "🗑️ हटाएं" : "🗑️ Clear"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {docText && (
          <div className="gov-doc-badge">
            📎 <strong>{docName}</strong> — {isHindi ? "प्रश्न इस दस्तावेज़ का संदर्भ देंगे" : "questions will reference this document"}
          </div>
        )}

        {/* ═══ QUESTION INPUT ═══ */}
        <div className="gov-question-card">
          <div className="gov-question-header">
            💬 {isHindi ? "❓ अपना प्रश्न पूछें" : "❓ Ask Your Question"}
          </div>
          <textarea
            ref={textareaRef}
            className="gov-textarea"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={isHindi
              ? "उदाहरण: मेरी छात्रवृत्ति क्यों अस्वीकार हुई?"
              : "Example: Why was my scholarship rejected? Which documents do I need?"
            }
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          />
          <div className="gov-question-buttons">
            <button className="gov-btn-primary" onClick={handleSubmit} disabled={loading || !question.trim()}>
              🔍 {isHindi ? "उत्तर प्राप्त करें" : "Get Answer"}
            </button>
            <button
              className="gov-btn-danger gov-btn-sm"
              disabled={!docText}
              onClick={() => { setDocText(null); setDocName(null); }}
            >
              📄 {isHindi ? "Doc हटाएं" : "Clear Doc"}
            </button>
            <button
              className="gov-btn-danger gov-btn-sm"
              onClick={() => { setChatHistory([]); setFeedbackGiven(new Set()); }}
            >
              🗑️ {isHindi ? "साफ करें" : "Clear All"}
            </button>
          </div>
        </div>

        {/* ═══ LOADING ═══ */}
        {loading && (
          <div className="gov-spinner">
            {isHindi ? "🤔 विश्लेषण हो रहा है…" : "🤔 Analysing your question…"}
          </div>
        )}

        {/* ═══ CONVERSATION HISTORY ═══ */}
        {chatHistory.length > 0 && (
          <div className="fade-in">
            <div className="gov-section-title">
              {isHindi ? "💬 बातचीत का इतिहास" : "💬 Conversation History"}
            </div>
            {[...chatHistory].reverse().map((chat, ri) => {
              const idx = chatHistory.length - 1 - ri;
              return (
                <ChatEntry
                  key={idx}
                  chat={chat}
                  idx={idx}
                  isHindi={isHindi}
                  feedbackGiven={feedbackGiven.has(idx)}
                  onFeedback={handleFeedback}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <Footer isHindi={isHindi} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HELP PANEL
   ══════════════════════════════════════════════════════════════════════════ */
function HelpPanel({ isHindi, onClose }) {
  return (
    <div className="gov-panel fade-in">
      <div className="gov-panel-header">
        <span>{isHindi ? "📖 GovGuide AI का उपयोग कैसे करें" : "📖 How to Use GovGuide AI"}</span>
        <button className="gov-panel-close" onClick={onClose}>✕ Close</button>
      </div>
      <div className="gov-panel-body">
        <div className="gov-panel-grid">
          <div>
            <div className="gov-card gov-card-info">
              <div className="gov-card-title">📋 {isHindi ? "उपयोग के चरण" : "Steps to Use"}</div>
              <div className="gov-card-body">
                <strong>{isHindi ? "चरण 1:" : "Step 1:"}</strong> {isHindi ? "प्रश्न टाइप करें" : "Type your question"}<br/>
                <strong>{isHindi ? "चरण 2:" : "Step 2:"}</strong> {isHindi ? "Get Answer क्लिक करें" : "Click Get Answer"}<br/>
                <strong>{isHindi ? "चरण 3:" : "Step 3:"}</strong> {isHindi ? "संरचित उत्तर पढ़ें" : "Read the structured response"}<br/>
                <strong>{isHindi ? "चरण 4:" : "Step 4:"}</strong> {isHindi ? "आधिकारिक स्रोत से सत्यापित करें" : "Verify with official sources"}
              </div>
            </div>
            <div className="gov-card gov-card-success">
              <div className="gov-card-title">🎯 {isHindi ? "बेहतर उत्तर के लिए" : "Tips for Better Answers"}</div>
              <div className="gov-card-body">
                ✅ {isHindi ? "विशेष समस्या बताएं" : "Be specific about your problem"}<br/>
                ✅ {isHindi ? "योजना का नाम बताएं" : "Mention the exact scheme/service"}<br/>
                ✅ {isHindi ? "Home से प्रोफ़ाइल भरें" : "Set your profile via Home button"}<br/>
                ✅ {isHindi ? "एक बार में एक प्रश्न" : "Ask one question at a time"}
              </div>
            </div>
          </div>
          <div>
            <div className="gov-card gov-card-info">
              <div className="gov-card-title">📎 {isHindi ? "दस्तावेज़ अपलोड" : "Document Upload"}</div>
              <div className="gov-card-body">
                {isHindi
                  ? "अस्वीकृति पत्र या आवेदन फ़ॉर्म अपलोड करें — AI बताएगा क्या ठीक करना है।"
                  : "Upload a rejection letter or application form — the AI will analyse it and tell you exactly what to fix."
                }<br/><br/><strong>{isHindi ? "समर्थित:" : "Supported:"}</strong> PDF, PNG, JPG, TXT
              </div>
            </div>
            <div className="gov-card gov-card-info">
              <div className="gov-card-title">📚 {isHindi ? "स्रोत देखें" : "View Sources"}</div>
              <div className="gov-card-body">
                {isHindi
                  ? "हर उत्तर के नीचे 'स्रोत देखें' क्लिक करें — देखें AI ने किस दस्तावेज़ से जानकारी ली।"
                  : "Click View Sources below any answer to see which official document it was drawn from."
                }
              </div>
            </div>
          </div>
          <div>
            <div className="gov-card gov-card-warning">
              <div className="gov-card-title">⚠️ {isHindi ? "महत्वपूर्ण" : "Important"}</div>
              <div className="gov-card-body">
                {isHindi ? "यह टूल केवल जानकारी देता है" : "Information only — not legal advice"}<br/>
                ❌ {isHindi ? "कानूनी सलाह नहीं" : "Cannot file applications"}<br/>
                ❌ {isHindi ? "आवेदन नहीं कर सकता" : "Cannot guarantee outcomes"}<br/>
                ✅ {isHindi ? "आधिकारिक स्रोत से पुष्टि करें" : "Always verify with officials"}
              </div>
            </div>
            <div>
              <div className="gov-card-title">🔗 {isHindi ? "त्वरित लिंक" : "Quick Links"}</div>
              <div className="gov-quick-links">
                {Object.entries(QUICK_LINKS).map(([name, url]) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">{name}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HOME PANEL
   ══════════════════════════════════════════════════════════════════════════ */
function HomePanel({
  isHindi, language, setLanguage,
  statePick, setStatePick, category, setCategory, income, setIncome,
  fbStats, onClose, onPrefill,
}) {
  const examplesEn = ["Why was my scholarship rejected?", "How to correct my Aadhaar name?", "What documents for income certificate?", "How to file an RTI application?"];
  const examplesHi = ["मेरी छात्रवृत्ति क्यों अस्वीकार हुई?", "आधार में नाम कैसे सुधारें?", "आय प्रमाण पत्र के लिए दस्तावेज?", "RTI आवेदन कैसे करें?"];
  const examples = isHindi ? examplesHi : examplesEn;

  return (
    <div className="gov-panel fade-in">
      <div className="gov-panel-header">
        <span>{isHindi ? "🏠 GovGuide AI — होम" : "🏠 GovGuide AI — Home"}</span>
        <button className="gov-panel-close" onClick={onClose}>✕ Close</button>
      </div>
      <div className="gov-panel-body">
        <div className="gov-panel-grid">
          {/* Language + Topics */}
          <div>
            <div className="gov-panel-section-title">🌐 Language / भाषा</div>
            <select className="gov-select" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <br/><br/>
            <div className="gov-panel-section-title">📚 {isHindi ? "विषय" : "Topics"}</div>
            <div>
              {["💰 Scholarship", "🆔 Aadhaar", "📄 Income Cert", "📜 RTI", "🪪 PAN Card", "🛂 Passport"].map(p => (
                <span key={p} className="gov-pill">{p}</span>
              ))}
            </div>
          </div>

          {/* Profile */}
          <div>
            <div className="gov-panel-section-title">👤 {isHindi ? "आपकी प्रोफ़ाइल" : "Your Profile"}</div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
              {isHindi ? "आपकी स्थिति के अनुसार जवाब" : "Tailors answers to your situation"}
            </p>
            <div className="gov-label">{isHindi ? "राज्य" : "State"}</div>
            <select className="gov-select" value={statePick} onChange={e => setStatePick(e.target.value)}>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <br/><br/>
            <div className="gov-label">{isHindi ? "श्रेणी" : "Category"}</div>
            <select className="gov-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <br/><br/>
            <div className="gov-label">{isHindi ? "आय" : "Income"}</div>
            <select className="gov-select" value={income} onChange={e => setIncome(e.target.value)}>
              {INCOME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Example questions */}
          <div>
            <div className="gov-panel-section-title">💡 {isHindi ? "उदाहरण प्रश्न" : "Example Questions"}</div>
            {examples.map((q, i) => (
              <button
                key={i}
                className="gov-btn-outline"
                style={{ width: "100%", marginBottom: 8, textAlign: "left" }}
                onClick={() => onPrefill(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Quick links + Feedback stats */}
          <div>
            <div className="gov-panel-section-title">🔗 {isHindi ? "त्वरित लिंक" : "Quick Links"}</div>
            <div className="gov-quick-links">
              {Object.entries(QUICK_LINKS).map(([name, url]) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">{name}</a>
              ))}
            </div>
            {fbStats && fbStats.total > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="gov-panel-section-title">📊 {isHindi ? "फ़ीडबैक" : "Feedback"}</div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-heading)" }}>👍 {fbStats.helpful}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-heading)" }}>👎 {fbStats.not_helpful}</div>
                  </div>
                </div>
                <div style={{ background: "var(--border-default)", borderRadius: 4, height: 6, marginTop: 8 }}>
                  <div style={{ background: "var(--green)", borderRadius: 4, height: 6, width: `${fbStats.helpful_pct}%` }} />
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                  {fbStats.helpful_pct}% helpful
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CHAT ENTRY
   ══════════════════════════════════════════════════════════════════════════ */
function ChatEntry({ chat, idx, isHindi, feedbackGiven, onFeedback }) {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className="fade-in" style={{ marginBottom: "1rem" }}>
      <div className="gov-q-bubble">
        <span className="gov-q-text">🙋 {chat.question}{chat.hasDoc ? " 📎" : ""}</span>
        <span className="gov-q-time">{chat.ts}</span>
      </div>
      <div className="gov-answer-card">
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(chat.answer) }} />

        {chat.sources.length > 0 && (
          <>
            <button className="gov-sources-toggle" onClick={() => setShowSources(s => !s)}>
              📚 {isHindi ? "स्रोत देखें" : "View Sources"} ({chat.sources.length})
              <span>{showSources ? "▲" : "▼"}</span>
            </button>
            {showSources && (
              <div className="fade-in" style={{ marginTop: 8 }}>
                {chat.sources.map((src, si) => (
                  <div key={si} className="gov-src-card">
                    <div className="gov-src-name">📄 {src.name || src.source || `Source ${si+1}`}</div>
                    <div className="gov-src-snip">"{src.snippet || src.content || ""}"</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="gov-feedback-row">
          {!feedbackGiven ? (
            <>
              <span>{isHindi ? "क्या यह सहायक था?" : "Was this helpful?"}</span>
              <button className="gov-fb-btn" onClick={() => onFeedback(idx, "helpful")}>👍</button>
              <button className="gov-fb-btn" onClick={() => onFeedback(idx, "not_helpful")}>👎</button>
            </>
          ) : (
            <span className="gov-fb-thanks">✅ {isHindi ? "फ़ीडबैक के लिए धन्यवाद!" : "Thanks for your feedback!"}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════════════════ */
function Footer({ isHindi }) {
  const disclaimer = isHindi
    ? "⚠️ यह उपकरण केवल शैक्षिक उद्देश्यों के लिए है। कोई भी कदम उठाने से पहले आधिकारिक सरकारी स्रोतों से पुष्टि करें। यह कानूनी सलाह नहीं है।"
    : "⚠️ This tool is for educational purposes only. Always verify information with official government sources before taking action. This is not legal advice.";

  return (
    <>
      <div className="gov-partners-bar">
        <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="gov-partner">🇮🇳 india.gov.in</a>
        <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="gov-partner">💻 Digital India</a>
        <a href="https://meity.gov.in" target="_blank" rel="noopener noreferrer" className="gov-partner">🏢 MeitY</a>
        <a href="https://mygov.in" target="_blank" rel="noopener noreferrer" className="gov-partner">🗳️ MyGov</a>
        <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="gov-partner">📊 data.gov.in</a>
        <a href="https://nic.in" target="_blank" rel="noopener noreferrer" className="gov-partner">🖥️ NIC</a>
      </div>
      <div className="gov-footer">
        <div className="gov-footer-links">
          {["Terms & Conditions","Privacy Policy","Accessibility","Sitemap","Contact Us","Feedback"].map(l => (
            <a key={l} href="#" className="gov-footer-link">{l}</a>
          ))}
        </div>
        <div className="gov-footer-copy">
          Made with ❤️ for Citizens of India &nbsp;|&nbsp; © 2024–2026 GovGuide AI &nbsp;|&nbsp; For Educational Purpose Only
        </div>
        <div className="gov-footer-disclaimer">{disclaimer}</div>
      </div>
    </>
  );
}
