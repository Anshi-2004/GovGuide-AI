"""
GovGuide AI — Main Streamlit Application
A Government Systems & Public Services AI Assistant for Indian Citizens
"""

import io
import os
from datetime import datetime
from typing import Optional, Tuple

import streamlit as st

from src.config import Config
from src.embeddings_generator import EmbeddingsGenerator
from src.feedback_handler import FeedbackHandler
from src.query_handler import QueryHandler

# ── Optional document-processing imports ─────────────────────────────────────
try:
    import pdfplumber  # noqa: F401
    _PDF_OK = True
except ImportError:
    _PDF_OK = False

try:
    from PIL import Image  # noqa: F401
    import pytesseract  # noqa: F401
    _OCR_OK = True
except ImportError:
    _OCR_OK = False

# ─── Page configuration ────────────────────────────────────────────────────────
st.set_page_config(
    page_title="GovGuide AI",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Styling ───────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
html, body, [class*="css"] { font-family: 'Inter', sans-serif !important; }

/* ── Global background ───────────────────────────────────────── */
.stApp {
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #1a1040 100%);
    min-height: 100vh;
}
#MainMenu, footer, header { visibility: hidden; }

/* ── Hide Streamlit sidebar completely ───────────────────────── */
[data-testid="stSidebar"]        { display: none !important; }
[data-testid="collapsedControl"] { display: none !important; }

/* ── Hero card ───────────────────────────────────────────────── */
.govguide-hero {
    text-align: center;
    padding: 1.5rem 1.5rem 1.1rem;
    background: linear-gradient(145deg, rgba(102,126,234,0.10), rgba(240,147,251,0.06));
    border: 1px solid rgba(102,126,234,0.25);
    border-radius: 20px;
    backdrop-filter: blur(12px);
}
.govguide-hero h1 {
    font-size: 2.4rem;
    font-weight: 700;
    background: linear-gradient(135deg, #a78bfa, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 0.3rem;
}
.govguide-hero p { color: rgba(220,220,255,0.70); font-size: 0.98rem; margin: 0; }

/* ── Header button wrappers ──────────────────────────────────── */
/* "How to Use" — top left, soft purple outline */
.how-btn button {
    background: rgba(129,140,248,0.10) !important;
    border: 1px solid rgba(129,140,248,0.40) !important;
    color: #a5b4fc !important;
    font-weight: 600 !important;
    border-radius: 12px !important;
    padding: 0.5rem 0.9rem !important;
    width: 100% !important;
    transition: all 0.2s !important;
}
.how-btn button:hover {
    background: rgba(129,140,248,0.22) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 16px rgba(129,140,248,0.25) !important;
}

/* "Home" — top right, gradient fill */
.home-btn button {
    background: linear-gradient(135deg, #667eea, #764ba2) !important;
    border: none !important;
    color: white !important;
    font-weight: 600 !important;
    border-radius: 12px !important;
    padding: 0.5rem 0.9rem !important;
    width: 100% !important;
    box-shadow: 0 4px 18px rgba(102,126,234,0.40) !important;
    transition: all 0.2s !important;
}
.home-btn button:hover {
    box-shadow: 0 6px 24px rgba(102,126,234,0.55) !important;
    transform: translateY(-1px) !important;
}

/* ── Panel slide-in animation ────────────────────────────────── */
@keyframes panelIn {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
}
.panel-anim { animation: panelIn 0.22s ease; }

/* ── Home panel inner grid ───────────────────────────────────── */
.home-section-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: rgba(165,180,252,0.65);
    margin-bottom: 0.5rem;
}

/* ── Topic pill ──────────────────────────────────────────────── */
.pill {
    display: inline-block;
    background: rgba(129,140,248,0.12);
    border: 1px solid rgba(129,140,248,0.25);
    border-radius: 20px;
    padding: 0.18rem 0.65rem;
    font-size: 0.78rem;
    color: #a5b4fc;
    margin: 0.15rem;
}

/* ── Question bubble ─────────────────────────────────────────── */
.q-bubble {
    background: linear-gradient(135deg, rgba(102,126,234,0.16), rgba(129,140,248,0.08));
    border: 1px solid rgba(102,126,234,0.28);
    border-radius: 14px;
    padding: 0.9rem 1.1rem;
    margin-bottom: 0.5rem;
    color: #c7d2fe;
    font-weight: 500;
    font-size: 0.95rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}
.q-time { color: rgba(200,210,255,0.35); font-size: 0.78rem; white-space: nowrap; }

/* ── Source citation ─────────────────────────────────────────── */
.src-card {
    background: rgba(255,255,255,0.03);
    border-left: 3px solid #818cf8;
    border-radius: 0 8px 8px 0;
    padding: 0.6rem 0.9rem;
    margin: 0.35rem 0;
    font-size: 0.83rem;
}
.src-name { color: #a5b4fc; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.src-snip { color: rgba(200,210,255,0.52); font-style: italic; margin-top: 0.25rem; }

/* ── Feedback ────────────────────────────────────────────────── */
.fb-thanks { color: #86efac; font-size: 0.8rem; }

/* ── Doc badge ───────────────────────────────────────────────── */
.doc-badge {
    background: linear-gradient(135deg, rgba(192,132,252,0.15), rgba(129,140,248,0.10));
    border: 1px solid rgba(192,132,252,0.28);
    border-radius: 9px;
    padding: 0.4rem 0.8rem;
    font-size: 0.82rem;
    color: #e9d5ff;
    margin: 0.5rem 0 0.8rem;
    display: inline-block;
}

/* ── Upload hint ─────────────────────────────────────────────── */
.upload-info {
    background: rgba(129,140,248,0.07);
    border: 1px dashed rgba(129,140,248,0.30);
    border-radius: 12px;
    padding: 0.85rem 1rem;
    color: rgba(200,210,255,0.7);
    font-size: 0.88rem;
    margin-bottom: 0.6rem;
}

/* ── Metric ──────────────────────────────────────────────────── */
[data-testid="metric-container"] {
    background: rgba(129,140,248,0.08);
    border: 1px solid rgba(129,140,248,0.18);
    border-radius: 10px;
    padding: 0.5rem 0.8rem !important;
}

/* ── General buttons ─────────────────────────────────────────── */
.stButton > button {
    border-radius: 10px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
}
.stButton > button:hover { transform: translateY(-1px) !important; }
hr { border-color: rgba(255,255,255,0.07) !important; }
details {
    background: rgba(255,255,255,0.02) !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 10px !important;
}
</style>
""", unsafe_allow_html=True)


# ─── Cached resource loaders ───────────────────────────────────────────────────

@st.cache_resource
def _load_qa_system():
    try:
        gen = EmbeddingsGenerator()
        vs = gen.load_embeddings(Config.EMBEDDINGS_PATH)
        return QueryHandler(vs), None
    except FileNotFoundError:
        return None, "embeddings_missing"
    except Exception as exc:
        return None, f"error:{exc}"


@st.cache_resource
def _load_feedback_handler():
    return FeedbackHandler(Config.FEEDBACK_PATH)


# ─── Document text extraction ──────────────────────────────────────────────────

def extract_text(uploaded_file) -> Tuple[str, str]:
    ftype = uploaded_file.type
    fname = uploaded_file.name
    raw: bytes = uploaded_file.read()

    if ftype == "application/pdf":
        if not _PDF_OK:
            return "", "Install pdfplumber: `pip install pdfplumber`"
        import pdfplumber
        try:
            with pdfplumber.open(io.BytesIO(raw)) as pdf:
                pages = [p.extract_text() or "" for p in pdf.pages]
            text = "\n\n".join(p for p in pages if p.strip())
            return (text, "") if text.strip() else ("", "PDF is image-based — try PNG/JPG.")
        except Exception as exc:
            return "", f"PDF error: {exc}"

    if ftype in {"image/png", "image/jpeg", "image/jpg"}:
        if not _OCR_OK:
            return "", "Install Python packages: `pip install pytesseract Pillow`"
        from PIL import Image
        import pytesseract

        # Auto-detect Tesseract binary on Windows
        possible_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
        ]
        for p in possible_paths:
            if os.path.exists(p):
                pytesseract.pytesseract.tesseract_cmd = p
                break

        try:
            img = Image.open(io.BytesIO(raw))
            # Try Hindi+English, fallback to English if hindi language pack is missing
            try:
                text = pytesseract.image_to_string(img, lang="eng+hin")
            except Exception:
                text = pytesseract.image_to_string(img, lang="eng")

            return (text.strip(), "") if text.strip() else ("", "Could not extract readable text from image.")
        except pytesseract.TesseractNotFoundError:
            return "", (
                "Tesseract OCR software is missing on Windows. "
                "To process image files (PNG/JPG), install it by running `winget install UB-Mannheim.TesseractOCR` in PowerShell, "
                "or upload document as a PDF / TXT file."
            )
        except Exception as exc:
            return "", f"OCR error: {exc}"

    if ftype == "text/plain" or fname.lower().endswith(".txt"):
        try:
            return raw.decode("utf-8", errors="replace"), ""
        except Exception as exc:
            return "", f"Read error: {exc}"

    return "", f"Unsupported file type ({ftype}). Upload PDF, PNG, JPG, or TXT."


# ─── Session state ─────────────────────────────────────────────────────────────

def _init_state():
    defaults = {
        "chat_history":     [],
        "prefill_question": None,
        "feedback_given":   set(),
        "doc_text":         None,
        "doc_name":         None,
        "language":         "English",
        "state_pick":       "Select State",
        "category":         "Select Category",
        "income":           "Select Income Range",
        "show_help":        False,
        "show_home":        False,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


# ─── "How to Use" panel ────────────────────────────────────────────────────────

def render_help_panel(is_hindi: bool):
    st.markdown('<div class="panel-anim">', unsafe_allow_html=True)
    with st.container(border=True):
        # Header row
        cl, ct = st.columns([1, 9])
        with cl:
            if st.button("✕  Close", key="close_help"):
                st.session_state.show_help = False
                st.rerun()
        with ct:
            st.markdown("### 📖 " + ("GovGuide AI का उपयोग कैसे करें" if is_hindi else "How to Use GovGuide AI"))

        st.divider()
        c1, c2, c3 = st.columns(3, gap="medium")

        with c1:
            if is_hindi:
                st.info("#### 📋 उपयोग के चरण\n\n**चरण 1:** प्रश्न टाइप करें\n\n**चरण 2:** *Get Answer* क्लिक करें\n\n**चरण 3:** संरचित उत्तर पढ़ें\n\n**चरण 4:** आधिकारिक स्रोत से सत्यापित करें")
                st.success("#### 🎯 बेहतर उत्तर के लिए\n\n✅ विशेष समस्या बताएं\n\n✅ योजना का नाम बताएं\n\n✅ Home से प्रोफ़ाइल भरें\n\n✅ एक बार में एक प्रश्न")
            else:
                st.info("#### 📋 Steps to Use\n\n**Step 1:** Type your question\n\n**Step 2:** Click **Get Answer**\n\n**Step 3:** Read the structured response\n\n**Step 4:** Verify with official sources")
                st.success("#### 🎯 Tips for Better Answers\n\n✅ Be specific about your problem\n\n✅ Mention the exact scheme/service\n\n✅ Set your profile via Home button\n\n✅ Ask one question at a time")

        with c2:
            if is_hindi:
                st.info("#### 📎 दस्तावेज़ अपलोड\n\nअस्वीकृति पत्र या आवेदन फ़ॉर्म अपलोड करें — AI बताएगा क्या ठीक करना है।\n\n**समर्थित:** PDF, PNG, JPG, TXT")
                st.info("#### 📚 स्रोत देखें\n\nहर उत्तर के नीचे **'स्रोत देखें'** क्लिक करें — देखें AI ने किस दस्तावेज़ से जानकारी ली।")
                st.info("#### 🔔 फ़ीडबैक\n\nहर उत्तर के नीचे 👍 या 👎 से रेट करें।")
            else:
                st.info("#### 📎 Document Upload\n\nUpload a **rejection letter** or **application form** — the AI will analyse it and tell you exactly what to fix.\n\n**Supported:** PDF, PNG, JPG, TXT")
                st.info("#### 📚 View Sources\n\nClick **View Sources** below any answer to see which official document it was drawn from.")
                st.info("#### 🔔 Feedback\n\nRate each answer with 👍 or 👎 below the response.")

        with c3:
            if is_hindi:
                st.warning("#### ⚠️ महत्वपूर्ण\n\nयह टूल **केवल जानकारी** देता है\n\n❌ कानूनी सलाह नहीं\n\n❌ आवेदन नहीं कर सकता\n\n✅ आधिकारिक स्रोत से पुष्टि करें")
                st.markdown("#### 🔗 त्वरित लिंक")
            else:
                st.warning("#### ⚠️ Important\n\nInformation only — **not legal advice**\n\n❌ Cannot file applications\n\n❌ Cannot guarantee outcomes\n\n✅ Always verify with officials")
                st.markdown("#### 🔗 Quick Links")

            for name, url in {
                "🎓 Scholarships": "https://scholarships.gov.in",
                "🆔 Aadhaar": "https://uidai.gov.in",
                "📜 RTI Online": "https://rtionline.gov.in",
                "📋 DigiLocker": "https://digilocker.gov.in",
                "🏛️ India Portal": "https://india.gov.in",
            }.items():
                st.markdown(f"[{name}]({url})")
    st.markdown('</div>', unsafe_allow_html=True)


# ─── "Home" panel ──────────────────────────────────────────────────────────────

def render_home_panel(fb_handler, is_hindi: bool):
    """Slide-in Home drawer with language, profile, topics, examples, links."""
    st.markdown('<div class="panel-anim">', unsafe_allow_html=True)
    with st.container(border=True):

        # Header
        cl, ct = st.columns([1, 9])
        with cl:
            if st.button("✕  Close", key="close_home"):
                st.session_state.show_home = False
                st.rerun()
        with ct:
            st.markdown("### 🏠 " + ("GovGuide AI — होम" if is_hindi else "GovGuide AI — Home"))

        st.divider()

        # Four-column content layout
        lc, pc, tc, ec = st.columns([1, 1.4, 1.6, 1], gap="medium")

        # ── Col 1: Language ────────────────────────────────────────
        with lc:
            st.markdown('<p class="home-section-title">🌐 Language / भाषा</p>', unsafe_allow_html=True)
            lang_pick = st.selectbox(
                "lang_home",
                Config.LANGUAGES,
                index=Config.LANGUAGES.index(st.session_state.language),
                label_visibility="collapsed",
                key="lang_home_widget",
            )
            st.session_state.language = lang_pick

            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown('<p class="home-section-title">📚 ' + ("विषय" if is_hindi else "Topics") + '</p>', unsafe_allow_html=True)
            pills = ["💰 Scholarship", "🆔 Aadhaar", "📄 Income Cert", "📜 RTI"]
            st.markdown(" ".join(f'<span class="pill">{p}</span>' for p in pills), unsafe_allow_html=True)

        # ── Col 2: Profile ─────────────────────────────────────────
        with pc:
            st.markdown('<p class="home-section-title">👤 ' + ("आपकी प्रोफ़ाइल" if is_hindi else "Your Profile") + '</p>', unsafe_allow_html=True)
            st.caption("Tailors answers to your situation" if not is_hindi else "आपकी स्थिति के अनुसार जवाब")

            state_pick = st.selectbox(
                "State / राज्य", Config.INDIAN_STATES,
                index=Config.INDIAN_STATES.index(st.session_state.state_pick)
                if st.session_state.state_pick in Config.INDIAN_STATES else 0,
                key="state_home",
            )
            st.session_state.state_pick = state_pick

            cat_pick = st.selectbox(
                "Category / श्रेणी", Config.CATEGORIES,
                index=Config.CATEGORIES.index(st.session_state.category)
                if st.session_state.category in Config.CATEGORIES else 0,
                key="cat_home",
            )
            st.session_state.category = cat_pick

            inc_pick = st.selectbox(
                "Income / आय", Config.INCOME_RANGES,
                index=Config.INCOME_RANGES.index(st.session_state.income)
                if st.session_state.income in Config.INCOME_RANGES else 0,
                key="inc_home",
            )
            st.session_state.income = inc_pick

        # ── Col 3: Example questions ───────────────────────────────
        with tc:
            st.markdown('<p class="home-section-title">💡 ' + ("उदाहरण प्रश्न" if is_hindi else "Example Questions") + '</p>', unsafe_allow_html=True)
            examples = (
                ["मेरी छात्रवृत्ति क्यों अस्वीकार हुई?",
                 "आधार में नाम कैसे सुधारें?",
                 "आय प्रमाण पत्र के लिए दस्तावेज?",
                 "RTI आवेदन कैसे करें?"]
                if is_hindi else
                ["Why was my scholarship rejected?",
                 "How to correct my Aadhaar name?",
                 "What documents for income certificate?",
                 "How to file an RTI application?"]
            )
            for i, q in enumerate(examples):
                if st.button(q, key=f"home_ex_{i}", use_container_width=True):
                    st.session_state.prefill_question = q
                    st.session_state.show_home = False
                    st.rerun()

        # ── Col 4: Links + Feedback stats ─────────────────────────
        with ec:
            st.markdown('<p class="home-section-title">🔗 ' + ("त्वरित लिंक" if is_hindi else "Quick Links") + '</p>', unsafe_allow_html=True)
            for name, url in {
                "🎓 Scholarships": "https://scholarships.gov.in",
                "🆔 Aadhaar": "https://uidai.gov.in",
                "📜 RTI Online": "https://rtionline.gov.in",
                "📋 DigiLocker": "https://digilocker.gov.in",
                "🏛️ india.gov.in": "https://india.gov.in",
            }.items():
                st.markdown(f"[{name}]({url})")

            st.markdown("<br>", unsafe_allow_html=True)
            stats = fb_handler.get_stats()
            if stats["total"] > 0:
                st.markdown('<p class="home-section-title">📊 ' + ("फ़ीडबैक" if is_hindi else "Feedback") + '</p>', unsafe_allow_html=True)
                fc1, fc2 = st.columns(2)
                fc1.metric("👍", stats["helpful"])
                fc2.metric("👎", stats["not_helpful"])
                st.progress(stats["helpful_pct"] / 100)
                st.caption(f"{stats['helpful_pct']}% helpful")

    st.markdown('</div>', unsafe_allow_html=True)


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    _init_state()

    qa_handler, load_err = _load_qa_system()
    fb_handler = _load_feedback_handler()

    # Derive language from session state (no sidebar)
    is_hindi = "Hindi" in st.session_state.language
    lang     = st.session_state.language

    # ════════════════════════════════════════════════════════════════
    # HEADER ROW:  [❓ How to Use]  [Hero]  [🏠 Home]
    # ════════════════════════════════════════════════════════════════
    how_col, hero_col, home_col = st.columns([1.2, 5.6, 1.2])

    with how_col:
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="how-btn">', unsafe_allow_html=True)
        how_lbl = "❓ उपयोग" if is_hindi else "❓ How to Use"
        if st.button(how_lbl, key="how_btn", use_container_width=True):
            st.session_state.show_help = not st.session_state.show_help
            st.session_state.show_home = False
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

    with hero_col:
        title_sub = ("भारतीय सरकारी सेवाओं के लिए आपका AI सहायक"
                     if is_hindi else
                     "Your AI Assistant for Government Systems &amp; Public Services")
        st.markdown(
            f'<div class="govguide-hero"><h1>🏛️ GovGuide AI</h1><p>{title_sub}</p></div>',
            unsafe_allow_html=True,
        )

    with home_col:
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="home-btn">', unsafe_allow_html=True)
        home_lbl = "🏠 होम" if is_hindi else "🏠 Home"
        if st.button(home_lbl, key="home_btn", use_container_width=True):
            st.session_state.show_home = not st.session_state.show_home
            st.session_state.show_help = False
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

    # ════════════════════════════════════════════════════════════════
    # PANELS  (mutually exclusive — only one open at a time)
    # ════════════════════════════════════════════════════════════════
    if st.session_state.show_help:
        render_help_panel(is_hindi)
    elif st.session_state.show_home:
        render_home_panel(fb_handler, is_hindi)

    # ════════════════════════════════════════════════════════════════
    # SYSTEM ERROR GUARD
    # ════════════════════════════════════════════════════════════════
    if load_err:
        if load_err == "embeddings_missing":
            st.error("⚠️ Knowledge base not found. Run setup first:")
            st.code("python setup.py", language="bash")
        else:
            st.error(f"⚠️ System error: {load_err.replace('error:', '')}")
        return

    # ════════════════════════════════════════════════════════════════
    # DOCUMENT UPLOAD
    # ════════════════════════════════════════════════════════════════
    up_lbl = ("📎 दस्तावेज़ अपलोड करें (वैकल्पिक)"
              if is_hindi else "📎 Upload a Document (Optional)")

    with st.expander(up_lbl, expanded=False):
        hint = (
            "अस्वीकृति पत्र या आवेदन फ़ॉर्म अपलोड करें — AI विश्लेषण करेगा।"
            if is_hindi else
            "Upload a rejection letter or application form — the AI will analyse it and tell you what to fix."
        )
        st.markdown(f'<div class="upload-info">{hint}</div>', unsafe_allow_html=True)

        uploaded = st.file_uploader("file_up", type=["pdf", "png", "jpg", "jpeg", "txt"],
                                    label_visibility="collapsed")
        if uploaded:
            with st.spinner("🔍 Extracting text…"):
                text, err = extract_text(uploaded)
            if err:
                st.error(f"❌ {err}")
            elif text:
                st.session_state.doc_text = text
                st.session_state.doc_name = uploaded.name
                st.success(f"✅ **{uploaded.name}** — {len(text):,} characters extracted")
                with st.expander("👁️ Preview"):
                    st.text(text[:600] + ("…" if len(text) > 600 else ""))

                a_lbl = "🔍 दस्तावेज़ का विश्लेषण करें" if is_hindi else "🔍 Analyse This Document"
                if st.button(a_lbl, type="primary", key="analyse_doc"):
                    auto_q = ("इस दस्तावेज़ का विश्लेषण करें।" if is_hindi
                              else "Analyse this uploaded document and tell me what issues exist and what action to take.")
                    user_ctx = {"state": st.session_state.state_pick,
                                "category": st.session_state.category,
                                "income": st.session_state.income}
                    with st.spinner("🤔 Analysing…"):
                        try:
                            res = qa_handler.get_answer(auto_q,
                                                        document_text=st.session_state.doc_text,
                                                        user_context=user_ctx, language=lang)
                        except Exception as exc:
                            res = {"success": False,
                                   "answer": f"## ⚠️ Error\n\n`{exc}`",
                                   "sources": [], "has_document": True}
                    st.session_state.chat_history.append({
                        "question": f"📎 Document Analysis: {uploaded.name}",
                        "answer": res["answer"], "sources": res.get("sources", []),
                        "success": res["success"], "has_doc": True,
                        "ts": datetime.now().strftime("%H:%M"),
                    })
                    st.rerun()

        if st.session_state.doc_text:
            c_lbl = "🗑️ दस्तावेज़ हटाएं" if is_hindi else "🗑️ Clear Document"
            if st.button(c_lbl, key="clr_doc_exp"):
                st.session_state.doc_text = None
                st.session_state.doc_name = None
                st.rerun()

    if st.session_state.doc_text:
        st.markdown(
            f'<div class="doc-badge">📎 <strong>{st.session_state.doc_name}</strong>'
            " — questions will reference this document</div>",
            unsafe_allow_html=True,
        )

    # ════════════════════════════════════════════════════════════════
    # QUESTION INPUT
    # ════════════════════════════════════════════════════════════════
    q_lbl = "❓ अपना प्रश्न पूछें" if is_hindi else "❓ Ask Your Question"
    st.markdown(f"### {q_lbl}")

    prefill  = st.session_state.prefill_question or ""
    question = st.text_area(
        "q_area", value=prefill, height=110,
        placeholder=("उदाहरण: मेरी छात्रवृत्ति क्यों अस्वीकार हुई?"
                     if is_hindi else
                     "Example: Why was my scholarship rejected? Which documents do I need?"),
        label_visibility="collapsed",
    )
    if st.session_state.prefill_question:
        st.session_state.prefill_question = None

    b1, b2, b3 = st.columns([2, 1, 1], gap="small")
    with b1:
        submit = st.button("🔍 " + ("उत्तर प्राप्त करें" if is_hindi else "Get Answer"),
                           type="primary", use_container_width=True, key="submit_btn")
    with b2:
        clr_doc = st.button("📄 " + ("Doc हटाएं" if is_hindi else "Clear Doc"),
                            use_container_width=True,
                            disabled=not st.session_state.doc_text, key="clr_doc_main")
    with b3:
        clr_all = st.button("🗑️ " + ("साफ करें" if is_hindi else "Clear All"),
                            use_container_width=True, key="clr_all")

    if clr_doc:
        st.session_state.doc_text = None
        st.session_state.doc_name = None
        st.rerun()
    if clr_all:
        st.session_state.chat_history = []
        st.session_state.feedback_given = set()
        st.rerun()

    # ════════════════════════════════════════════════════════════════
    # PROCESS QUESTION
    # ════════════════════════════════════════════════════════════════
    if submit and question.strip():
        user_ctx = {"state": st.session_state.state_pick,
                    "category": st.session_state.category,
                    "income": st.session_state.income}
        spin = "🤔 " + ("विश्लेषण हो रहा है…" if is_hindi else "Analysing your question…")

        with st.spinner(spin):
            try:
                res = qa_handler.get_answer(question,
                                            document_text=st.session_state.doc_text,
                                            user_context=user_ctx, language=lang)
            except Exception as exc:
                res = {"success": False,
                       "answer": (f"## ⚠️ Unexpected Error\n\n"
                                  f"`{type(exc).__name__}: {exc}`\n\n"
                                  "Please check your API key or try again."),
                       "sources": [], "has_document": False}

        st.session_state.chat_history.append({
            "question": question, "answer": res["answer"],
            "sources": res.get("sources", []), "success": res["success"],
            "has_doc": res.get("has_document", False),
            "ts": datetime.now().strftime("%H:%M"),
        })
        st.rerun()

    # ════════════════════════════════════════════════════════════════
    # CONVERSATION HISTORY
    # ════════════════════════════════════════════════════════════════
    if st.session_state.chat_history:
        h_lbl = "💬 बातचीत का इतिहास" if is_hindi else "💬 Conversation History"
        st.markdown(f"---\n### {h_lbl}")

        for ri, chat in enumerate(reversed(st.session_state.chat_history)):
            chat_idx = len(st.session_state.chat_history) - 1 - ri
            fk = f"fb_{chat_idx}"

            doc_flag = " 📎" if chat.get("has_doc") else ""
            st.markdown(
                f'<div class="q-bubble">'
                f'<span>🙋 {chat["question"]}{doc_flag}</span>'
                f'<span class="q-time">{chat.get("ts","")}</span></div>',
                unsafe_allow_html=True,
            )

            with st.container():
                st.markdown(chat["answer"])

                sources = chat.get("sources", [])
                if sources:
                    s_lbl = f"📚 {'स्रोत देखें' if is_hindi else 'View Sources'} ({len(sources)})"
                    with st.expander(s_lbl):
                        for src in sources:
                            st.markdown(
                                f'<div class="src-card">'
                                f'<div class="src-name">📄 {src["name"]}</div>'
                                f'<div class="src-snip">"{src["snippet"]}"</div>'
                                f'</div>', unsafe_allow_html=True)

                if fk not in st.session_state.feedback_given:
                    fc0, fc1, fc2 = st.columns([3, 0.6, 0.6])
                    with fc0:
                        st.caption("Was this helpful?" if not is_hindi else "क्या यह सहायक था?")
                    with fc1:
                        if st.button("👍", key=f"up_{chat_idx}"):
                            fb_handler.save_feedback(chat["question"], chat["answer"],
                                                     "helpful", lang,
                                                     st.session_state.state_pick,
                                                     st.session_state.category)
                            st.session_state.feedback_given.add(fk)
                            st.rerun()
                    with fc2:
                        if st.button("👎", key=f"dn_{chat_idx}"):
                            fb_handler.save_feedback(chat["question"], chat["answer"],
                                                     "not_helpful", lang,
                                                     st.session_state.state_pick,
                                                     st.session_state.category)
                            st.session_state.feedback_given.add(fk)
                            st.rerun()
                else:
                    thanks = "फ़ीडबैक के लिए धन्यवाद!" if is_hindi else "Thanks for your feedback!"
                    st.markdown(f'<span class="fb-thanks">✅ {thanks}</span>', unsafe_allow_html=True)

            if ri < len(st.session_state.chat_history) - 1:
                st.divider()

    # ════════════════════════════════════════════════════════════════
    # FOOTER
    # ════════════════════════════════════════════════════════════════
    st.divider()
    footer = ("भारत के नागरिकों के लिए ❤️ से बनाया गया | केवल शैक्षिक उद्देश्य"
              if is_hindi else
              "Made with ❤️ for Citizens of India | For Educational Purpose Only")
    st.markdown(
        f"<div style='text-align:center;color:rgba(200,210,255,0.35);"
        f"padding:0.8rem;font-size:0.82rem;'>{footer}</div>",
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()