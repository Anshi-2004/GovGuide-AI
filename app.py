"""
GovGuide AI — Main Streamlit Application
A Government Systems & Public Services AI Assistant for Indian Citizens
Redesigned with Indian Government Portal aesthetics
"""

import io
import os
from datetime import datetime
from typing import Optional, Tuple

import streamlit as st
import streamlit.components.v1 as components

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
    page_title="GovGuide AI — Government Services Assistant",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Government Portal Styling ────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

/* ══════════════════════════════════════════════════════════════
   RESET & GLOBAL
   ══════════════════════════════════════════════════════════════ */
html, body, [class*="css"] {
    font-family: 'Inter', 'Noto Sans Devanagari', sans-serif !important;
}
.stApp {
    background: #F0F2F5 !important;
    min-height: 100vh;
}
#MainMenu, footer, header { visibility: hidden; }
[data-testid="stSidebar"]        { display: none !important; }
[data-testid="collapsedControl"] { display: none !important; }

/* ── FULL-WIDTH: Remove Streamlit default padding ────────── */
.block-container {
    max-width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}
[data-testid="stMainBlockContainer"] {
    max-width: 100% !important;
    padding: 0 !important;
}
[data-testid="stMain"] {
    padding: 0 !important;
}
/* Inner content gets horizontal padding for readability */
.gov-content-wrapper {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0.8rem 2rem;
}

/* ══════════════════════════════════════════════════════════════
   TOP UTILITY BAR — White with emblem & branding
   ══════════════════════════════════════════════════════════════ */
.gov-top-bar {
    background: #FFFFFF;
    border-bottom: 3px solid #F4A020;
    padding: 10px 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -1rem -1rem 0 -1rem;
    position: relative;
    z-index: 100;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.gov-top-left {
    display: flex;
    align-items: center;
    gap: 14px;
}
.gov-emblem {
    font-size: 2.4rem;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
}
.gov-brand {
    display: flex;
    flex-direction: column;
    gap: 1px;
}
.gov-brand-hi {
    font-family: 'Noto Sans Devanagari', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    color: #1D3557;
    line-height: 1.2;
}
.gov-brand-en {
    font-size: 0.92rem;
    font-weight: 700;
    color: #1D3557;
    letter-spacing: 0.3px;
    line-height: 1.2;
}
.gov-brand-sub {
    font-size: 0.72rem;
    color: #64748B;
    font-weight: 400;
    line-height: 1.3;
}
.gov-top-right {
    display: flex;
    align-items: center;
    gap: 10px;
}
.gov-a-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px; height: 30px;
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid #CBD5E1;
    transition: all 0.15s;
}
.gov-a-btn:hover { background: #E2E8F0; }
.gov-a-sm { font-size: 0.68rem; background: #F8FAFC; color: #475569; }
.gov-a-md { font-size: 0.82rem; background: #1D3557; color: #FFFFFF; }
.gov-a-lg { font-size: 0.92rem; background: #F8FAFC; color: #475569; }
.gov-contrast-btn {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 2px solid #94A3B8;
    background: linear-gradient(135deg, #1E293B 50%, #F8FAFC 50%);
    cursor: pointer;
    transition: all 0.15s;
}
.gov-contrast-btn:hover { border-color: #1D3557; }
.gov-a-btn.active {
    outline: 2px solid #F4A020;
    outline-offset: 1px;
}

/* ── Font-size scaling ─────────────────────────────────── */
html.gov-font-sm .stApp { font-size: 13px !important; }
html.gov-font-lg .stApp { font-size: 18px !important; }

/* ── High-contrast / Dark mode ─────────────────────────── */
html.gov-high-contrast .stApp {
    background: #121212 !important;
    color: #F0F0F0 !important;
}
html.gov-high-contrast .gov-top-bar {
    background: #1A1A1A !important;
    border-bottom-color: #F4A020 !important;
}
html.gov-high-contrast .gov-brand-hi,
html.gov-high-contrast .gov-brand-en { color: #F0F0F0 !important; }
html.gov-high-contrast .gov-brand-sub { color: #BBBBBB !important; }
html.gov-high-contrast .gov-nav-bar {
    background: #0D0D0D !important;
}
html.gov-high-contrast .gov-hero {
    background: linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 100%) !important;
}
html.gov-high-contrast .gov-card,
html.gov-high-contrast .gov-answer-card,
html.gov-high-contrast .gov-question-card,
html.gov-high-contrast .gov-panel {
    background: #1E1E1E !important;
    border-color: #333 !important;
    color: #E0E0E0 !important;
}
html.gov-high-contrast .gov-card-title,
html.gov-high-contrast .gov-question-header,
html.gov-high-contrast .gov-section-title,
html.gov-high-contrast .gov-panel-header { color: #F4A020 !important; }
html.gov-high-contrast .gov-card-body,
html.gov-high-contrast .gov-service-desc,
html.gov-high-contrast .gov-ticker-scroll { color: #CCCCCC !important; }
html.gov-high-contrast .gov-service-card {
    background: #1E1E1E !important;
    border-color: #444 !important;
}
html.gov-high-contrast .gov-service-name { color: #F0F0F0 !important; }
html.gov-high-contrast .gov-q-bubble {
    background: #1A2740 !important;
    border-color: #2A4060 !important;
}
html.gov-high-contrast .gov-q-text { color: #E0E0E0 !important; }
html.gov-high-contrast .gov-ticker {
    background: #1A1A2E !important;
    border-bottom-color: #333 !important;
}
html.gov-high-contrast .gov-contrast-btn {
    border-color: #F4A020 !important;
    background: linear-gradient(135deg, #F8FAFC 50%, #1E293B 50%) !important;
}
html.gov-high-contrast .stTextArea textarea {
    background: #2A2A2A !important;
    color: #F0F0F0 !important;
    border-color: #555 !important;
}
html.gov-high-contrast .stSelectbox > div > div {
    background: #2A2A2A !important;
    color: #F0F0F0 !important;
    border-color: #555 !important;
}
html.gov-high-contrast .stExpander {
    background: #1E1E1E !important;
    border-color: #444 !important;
}

/* ══════════════════════════════════════════════════════════════
   NAVIGATION BAR — Deep navy with white text
   ══════════════════════════════════════════════════════════════ */
.gov-nav-bar {
    background: linear-gradient(180deg, #1D3557 0%, #16293F 100%);
    padding: 0 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 -1rem;
    position: relative;
    z-index: 99;
    box-shadow: 0 2px 8px rgba(29,53,87,0.25);
}
.gov-nav-links {
    display: flex;
    align-items: stretch;
    gap: 0;
    height: 44px;
}
.gov-nav-item {
    display: flex;
    align-items: center;
    padding: 0 18px;
    color: #E8ECF1;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s;
    border-bottom: 3px solid transparent;
    letter-spacing: 0.2px;
    white-space: nowrap;
}
.gov-nav-item:hover {
    background: rgba(255,255,255,0.08);
    color: #FFFFFF;
    border-bottom-color: #F4A020;
}
.gov-nav-active {
    background: rgba(255,255,255,0.10) !important;
    color: #FFFFFF !important;
    border-bottom-color: #F4A020 !important;
    font-weight: 600;
}
.gov-nav-search {
    display: flex;
    align-items: center;
}
.gov-search-icon {
    background: #F4A020;
    color: #1D3557;
    width: 44px; height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.15s;
}
.gov-search-icon:hover { background: #E8950F; }

/* ══════════════════════════════════════════════════════════════
   ANNOUNCEMENT TICKER
   ══════════════════════════════════════════════════════════════ */
.gov-ticker {
    background: linear-gradient(90deg, #EEF2FF, #F0F7FF);
    border-bottom: 1px solid #C7D2FE;
    padding: 8px 2.5rem;
    margin: 0 -1rem;
    overflow: hidden;
    position: relative;
    z-index: 98;
}
.gov-ticker-inner {
    display: flex;
    align-items: center;
    gap: 12px;
}
.gov-ticker-label {
    background: #1D3557;
    color: #FFFFFF;
    padding: 3px 12px;
    border-radius: 3px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    flex-shrink: 0;
}
.gov-ticker-content {
    overflow: hidden;
    white-space: nowrap;
    flex: 1;
}
.gov-ticker-scroll {
    display: inline-block;
    animation: tickerScroll 35s linear infinite;
    color: #1E40AF;
    font-size: 0.82rem;
    font-weight: 500;
}
.gov-ticker-scroll span {
    margin-right: 60px;
}
@keyframes tickerScroll {
    0%   { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}
.gov-ticker-controls {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}
.gov-ticker-btn {
    width: 24px; height: 24px;
    border: 1px solid #93C5FD;
    border-radius: 3px;
    background: #FFFFFF;
    color: #1D4ED8;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

/* ══════════════════════════════════════════════════════════════
   HERO BANNER — Government style
   ══════════════════════════════════════════════════════════════ */
.gov-hero {
    background: linear-gradient(135deg, #1D3557 0%, #264573 40%, #1A5276 70%, #1D3557 100%);
    border-radius: 0;
    padding: 2.2rem 2.5rem 2rem;
    margin: 0 -1rem;
    position: relative;
    overflow: hidden;
}
.gov-hero::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 300px; height: 100%;
    background: radial-gradient(ellipse at right center, rgba(244,160,32,0.12), transparent 70%);
    pointer-events: none;
}
.gov-hero::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #F4A020, #E8950F, #FF6B35, #F4A020);
}
.gov-hero-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    position: relative;
    z-index: 1;
}
.gov-hero-text { flex: 1; }
.gov-hero-text h1 {
    color: #FFFFFF;
    font-size: 1.9rem;
    font-weight: 800;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
    line-height: 1.2;
}
.gov-hero-text h1 span {
    color: #F4A020;
}
.gov-hero-text p {
    color: rgba(255,255,255,0.78);
    font-size: 0.95rem;
    margin: 0;
    line-height: 1.5;
}
.gov-hero-stats {
    display: flex;
    gap: 16px;
    flex-shrink: 0;
}
.gov-hero-stat {
    background: rgba(255,255,255,0.10);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    padding: 14px 20px;
    text-align: center;
    min-width: 100px;
}
.gov-hero-stat-num {
    color: #F4A020;
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
}
.gov-hero-stat-label {
    color: rgba(255,255,255,0.72);
    font-size: 0.72rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ══════════════════════════════════════════════════════════════
   CONTENT SECTION
   ══════════════════════════════════════════════════════════════ */
.gov-section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1D3557;
    padding-bottom: 10px;
    margin-bottom: 16px;
    border-bottom: 3px solid #F4A020;
    display: inline-block;
}
.gov-card {
    background: #FFFFFF;
    border-radius: 8px;
    padding: 1.4rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03);
    margin-bottom: 1rem;
    transition: box-shadow 0.2s, transform 0.2s;
}
.gov-card:hover {
    box-shadow: 0 4px 16px rgba(29,53,87,0.10);
}
.gov-card-accent {
    border-left: 4px solid #1D3557;
}
.gov-card-info {
    border-left: 4px solid #3B82F6;
    background: #F8FAFF;
}
.gov-card-warning {
    border-left: 4px solid #F59E0B;
    background: #FFFBEB;
}
.gov-card-success {
    border-left: 4px solid #10B981;
    background: #F0FDF4;
}
.gov-card-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1D3557;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.gov-card-body {
    color: #475569;
    font-size: 0.88rem;
    line-height: 1.6;
}

/* ══════════════════════════════════════════════════════════════
   QUICK SERVICE CARDS — grid of example questions
   ══════════════════════════════════════════════════════════════ */
.gov-service-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 12px;
}
.gov-service-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: block;
}
.gov-service-card:hover {
    border-color: #1D3557;
    box-shadow: 0 4px 14px rgba(29,53,87,0.12);
    transform: translateY(-2px);
}
.gov-service-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    margin-bottom: 10px;
}
.gov-service-icon-blue   { background: #EFF6FF; }
.gov-service-icon-green  { background: #F0FDF4; }
.gov-service-icon-orange { background: #FFF7ED; }
.gov-service-icon-purple { background: #F5F3FF; }
.gov-service-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #1E293B;
    margin-bottom: 4px;
}
.gov-service-desc {
    font-size: 0.75rem;
    color: #64748B;
    line-height: 1.4;
}

/* ══════════════════════════════════════════════════════════════
   QUESTION AREA
   ══════════════════════════════════════════════════════════════ */
.gov-question-card {
    background: #FFFFFF;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid #E2E8F0;
    margin: 1rem 0;
}
.gov-question-header {
    font-size: 1rem;
    font-weight: 700;
    color: #1D3557;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* ══════════════════════════════════════════════════════════════
   CHAT HISTORY
   ══════════════════════════════════════════════════════════════ */
.gov-q-bubble {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-left: 4px solid #1D3557;
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}
.gov-q-text {
    color: #1E293B;
    font-weight: 600;
    font-size: 0.92rem;
    flex: 1;
}
.gov-q-time {
    color: #94A3B8;
    font-size: 0.75rem;
    white-space: nowrap;
}
.gov-answer-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 1.3rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

/* ══════════════════════════════════════════════════════════════
   SOURCE CITATION
   ══════════════════════════════════════════════════════════════ */
.gov-src-card {
    background: #F8FAFC;
    border-left: 3px solid #3B82F6;
    border-radius: 0 6px 6px 0;
    padding: 10px 14px;
    margin: 6px 0;
}
.gov-src-name {
    color: #1D4ED8;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}
.gov-src-snip {
    color: #64748B;
    font-style: italic;
    font-size: 0.8rem;
    margin-top: 4px;
}

/* ══════════════════════════════════════════════════════════════
   DOCUMENT UPLOAD AREA
   ══════════════════════════════════════════════════════════════ */
.gov-upload-info {
    background: #F0F7FF;
    border: 1px dashed #93C5FD;
    border-radius: 8px;
    padding: 12px 16px;
    color: #1E40AF;
    font-size: 0.85rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}
.gov-doc-badge {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 0.82rem;
    color: #1D4ED8;
    margin: 8px 0 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
}

/* ══════════════════════════════════════════════════════════════
   PANELS (Help / Home)
   ══════════════════════════════════════════════════════════════ */
@keyframes panelSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
}
.gov-panel {
    animation: panelSlideIn 0.25s ease;
    background: #FFFFFF;
    border-radius: 10px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    margin: 1rem 0;
    overflow: hidden;
}
.gov-panel-header {
    background: linear-gradient(135deg, #1D3557, #264573);
    color: #FFFFFF;
    padding: 14px 20px;
    font-size: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.gov-panel-body {
    padding: 1.2rem;
}
.gov-panel-section-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #64748B;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid #F4A020;
    display: inline-block;
}

/* ══════════════════════════════════════════════════════════════
   TOPIC PILLS
   ══════════════════════════════════════════════════════════════ */
.gov-pill {
    display: inline-block;
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 0.78rem;
    color: #1D4ED8;
    font-weight: 500;
    margin: 3px;
    transition: all 0.15s;
}
.gov-pill:hover {
    background: #1D3557;
    color: #FFFFFF;
    border-color: #1D3557;
}

/* ══════════════════════════════════════════════════════════════
   BUTTONS — Government style
   ══════════════════════════════════════════════════════════════ */
.gov-btn-primary button {
    background: linear-gradient(180deg, #1D3557 0%, #16293F 100%) !important;
    border: none !important;
    color: #FFFFFF !important;
    font-weight: 600 !important;
    border-radius: 6px !important;
    padding: 0.55rem 1.2rem !important;
    font-size: 0.88rem !important;
    box-shadow: 0 2px 6px rgba(29,53,87,0.30) !important;
    transition: all 0.2s !important;
    width: 100% !important;
}
.gov-btn-primary button:hover {
    box-shadow: 0 4px 14px rgba(29,53,87,0.40) !important;
    transform: translateY(-1px) !important;
}
.gov-btn-outline button {
    background: #FFFFFF !important;
    border: 2px solid #1D3557 !important;
    color: #1D3557 !important;
    font-weight: 600 !important;
    border-radius: 6px !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.85rem !important;
    transition: all 0.2s !important;
    width: 100% !important;
}
.gov-btn-outline button:hover {
    background: #1D3557 !important;
    color: #FFFFFF !important;
    transform: translateY(-1px) !important;
}
.gov-btn-amber button {
    background: linear-gradient(180deg, #F4A020, #E8950F) !important;
    border: none !important;
    color: #1D3557 !important;
    font-weight: 700 !important;
    border-radius: 6px !important;
    padding: 0.55rem 1.2rem !important;
    font-size: 0.88rem !important;
    box-shadow: 0 2px 6px rgba(244,160,32,0.35) !important;
    transition: all 0.2s !important;
    width: 100% !important;
}
.gov-btn-amber button:hover {
    box-shadow: 0 4px 14px rgba(244,160,32,0.50) !important;
    transform: translateY(-1px) !important;
}

/* ══════════════════════════════════════════════════════════════
   GENERAL OVERRIDES
   ══════════════════════════════════════════════════════════════ */
.stButton > button {
    border-radius: 6px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
    font-family: 'Inter', sans-serif !important;
}
.stButton > button:hover { transform: translateY(-1px) !important; }

[data-testid="metric-container"] {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 10px 14px !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
hr { border-color: #E2E8F0 !important; }
details {
    background: #F8FAFC !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 8px !important;
}
.stTextArea textarea {
    border: 2px solid #CBD5E1 !important;
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.9rem !important;
    background: #FFFFFF !important;
    color: #1E293B !important;
    transition: border-color 0.2s !important;
}
.stTextArea textarea:focus {
    border-color: #1D3557 !important;
    box-shadow: 0 0 0 3px rgba(29,53,87,0.10) !important;
}
.stSelectbox > div > div {
    border: 2px solid #CBD5E1 !important;
    border-radius: 6px !important;
    background: #FFFFFF !important;
}
.stExpander {
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 8px !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
}

/* ══════════════════════════════════════════════════════════════
   FEEDBACK
   ══════════════════════════════════════════════════════════════ */
.gov-fb-thanks {
    color: #059669;
    font-size: 0.82rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

/* ══════════════════════════════════════════════════════════════
   FOOTER — Government style
   ══════════════════════════════════════════════════════════════ */
.gov-partners-bar {
    background: linear-gradient(135deg, #1D3557, #264573);
    margin: 2rem -1rem 0;
    padding: 18px 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
    border-top: 4px solid #F4A020;
}
.gov-partner {
    color: rgba(255,255,255,0.85);
    font-size: 0.78rem;
    font-weight: 600;
    text-decoration: none;
    padding: 6px 16px;
    border: 1px solid rgba(255,255,255,0.20);
    border-radius: 6px;
    transition: all 0.15s;
    white-space: nowrap;
}
.gov-partner:hover {
    background: rgba(255,255,255,0.10);
    color: #FFFFFF;
    border-color: rgba(255,255,255,0.40);
}
.gov-footer {
    background: #0F1D2F;
    margin: 0 -1rem -1rem;
    padding: 1.5rem 2.5rem;
    text-align: center;
}
.gov-footer-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
.gov-footer-link {
    color: rgba(255,255,255,0.65);
    font-size: 0.78rem;
    text-decoration: none;
    transition: color 0.15s;
}
.gov-footer-link:hover { color: #F4A020; }
.gov-footer-copy {
    color: rgba(255,255,255,0.40);
    font-size: 0.72rem;
    line-height: 1.5;
}
.gov-footer-disclaimer {
    color: rgba(255,255,255,0.50);
    font-size: 0.7rem;
    margin-top: 8px;
    font-style: italic;
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


# ─── Top Utility Bar ──────────────────────────────────────────────────────────

def render_top_bar(is_hindi: bool):
    """White top bar with National Emblem, bilingual branding, and accessibility."""
    st.markdown(f"""
    <div class="gov-top-bar">
        <div class="gov-top-left">
            <div class="gov-emblem">🏛️</div>
            <div class="gov-brand">
                <div class="gov-brand-hi">गवगाइड एआई — सरकारी सेवा सहायक</div>
                <div class="gov-brand-en">GovGuide AI</div>
                <div class="gov-brand-sub">Government Systems & Public Services Assistant</div>
            </div>
        </div>
        <div class="gov-top-right">
            <div class="gov-a-btn gov-a-sm" id="gov-font-sm-btn" title="Decrease font size">A<sup>-</sup></div>
            <div class="gov-a-btn gov-a-md active" id="gov-font-md-btn" title="Default font size">A</div>
            <div class="gov-a-btn gov-a-lg" id="gov-font-lg-btn" title="Increase font size">A<sup>+</sup></div>
            <div class="gov-contrast-btn" id="gov-contrast-btn" title="Toggle contrast"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Inject JavaScript via components.html — runs in an iframe but accesses
    # the parent Streamlit document through window.parent.document.
    components.html("""
    <script>
    (function() {
        const doc = window.parent.document;

        function wireButtons() {
            const smBtn = doc.getElementById('gov-font-sm-btn');
            const mdBtn = doc.getElementById('gov-font-md-btn');
            const lgBtn = doc.getElementById('gov-font-lg-btn');
            const contrastBtn = doc.getElementById('gov-contrast-btn');

            if (!smBtn || !mdBtn || !lgBtn || !contrastBtn) {
                // Elements not rendered yet, retry
                setTimeout(wireButtons, 200);
                return;
            }

            // Prevent duplicate listeners
            if (smBtn.dataset.wired) return;
            smBtn.dataset.wired = 'true';

            const html = doc.documentElement;

            function clearActive() {
                doc.querySelectorAll('.gov-a-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
            }

            smBtn.addEventListener('click', function() {
                html.classList.remove('gov-font-lg');
                html.classList.add('gov-font-sm');
                clearActive();
                smBtn.classList.add('active');
            });

            mdBtn.addEventListener('click', function() {
                html.classList.remove('gov-font-sm', 'gov-font-lg');
                clearActive();
                mdBtn.classList.add('active');
            });

            lgBtn.addEventListener('click', function() {
                html.classList.remove('gov-font-sm');
                html.classList.add('gov-font-lg');
                clearActive();
                lgBtn.classList.add('active');
            });

            contrastBtn.addEventListener('click', function() {
                html.classList.toggle('gov-high-contrast');
            });
        }

        // Wait for DOM to be ready then wire up
        if (doc.readyState === 'complete') {
            wireButtons();
        } else {
            doc.addEventListener('DOMContentLoaded', wireButtons);
        }
    })();
    </script>
    """, height=0, scrolling=False)


# ─── Navigation Bar ───────────────────────────────────────────────────────────

def render_nav_bar(is_hindi: bool):
    """Deep navy navigation bar with menu items."""
    nav_items_en = ["🏠 Home", "💬 Ask Question", "📋 Schemes", "📎 Documents", "📖 How to Use", "🔗 Quick Links", "❓ Help"]
    nav_items_hi = ["🏠 होम", "💬 प्रश्न पूछें", "📋 योजनाएं", "📎 दस्तावेज़", "📖 उपयोग", "🔗 लिंक", "❓ सहायता"]
    items = nav_items_hi if is_hindi else nav_items_en

    items_html = ""
    for i, item in enumerate(items):
        active = " gov-nav-active" if i == 0 else ""
        items_html += f'<div class="gov-nav-item{active}">{item}</div>'

    st.markdown(f"""
    <div class="gov-nav-bar">
        <div class="gov-nav-links">{items_html}</div>
        <div class="gov-nav-search">
            <div class="gov-search-icon">🔍</div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ─── Announcement Ticker ──────────────────────────────────────────────────────

def render_ticker(is_hindi: bool):
    """Scrolling announcements bar like income tax portal."""
    announcements_en = [
        "📢 GovGuide AI now supports document upload for rejection letter analysis",
        "🆕 Hindi language support available — switch from Home panel",
        "📋 New: RTI filing guide and scholarship rejection helper added",
        "⚡ Tip: Set your profile (State, Category, Income) for personalised answers",
    ]
    announcements_hi = [
        "📢 GovGuide AI अब अस्वीकृति पत्र के विश्लेषण के लिए दस्तावेज़ अपलोड का समर्थन करता है",
        "🆕 हिंदी भाषा का समर्थन उपलब्ध है — होम पैनल से बदलें",
        "📋 नया: RTI फाइलिंग गाइड और छात्रवृत्ति अस्वीकृति सहायक जोड़ा गया",
        "⚡ सुझाव: व्यक्तिगत उत्तरों के लिए अपनी प्रोफ़ाइल सेट करें",
    ]
    items = announcements_hi if is_hindi else announcements_en
    spans = "".join(f"<span>{a}</span>" for a in items)
    label = "अपडेट" if is_hindi else "UPDATES"

    st.markdown(f"""
    <div class="gov-ticker">
        <div class="gov-ticker-inner">
            <div class="gov-ticker-label">📣 {label}</div>
            <div class="gov-ticker-content">
                <div class="gov-ticker-scroll">{spans}</div>
            </div>
            <div class="gov-ticker-controls">
                <div class="gov-ticker-btn">◀</div>
                <div class="gov-ticker-btn">▶</div>
                <div class="gov-ticker-btn">⏸</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ─── Hero Banner ───────────────────────────────────────────────────────────────

def render_hero(is_hindi: bool):
    """Government-style hero banner with title and stats."""
    if is_hindi:
        title = '🏛️ GovGuide <span>AI</span>'
        subtitle = "भारतीय सरकारी प्रणालियों और सार्वजनिक सेवाओं के लिए आपका AI-संचालित सहायक। प्रक्रियाओं को समझें, अस्वीकृति के कारण जानें, और दस्तावेज़ आवश्यकताओं की जानकारी प्राप्त करें।"
        s1, s2, s3 = "विषय", "भाषाएं", "स्रोत"
    else:
        title = '🏛️ GovGuide <span>AI</span>'
        subtitle = "Your AI-powered assistant for Indian Government Systems & Public Services. Understand processes, know why applications are rejected, and get document guidance."
        s1, s2, s3 = "Topics", "Languages", "Sources"

    st.markdown(f"""
    <div class="gov-hero">
        <div class="gov-hero-content">
            <div class="gov-hero-text">
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
            <div class="gov-hero-stats">
                <div class="gov-hero-stat">
                    <div class="gov-hero-stat-num">10+</div>
                    <div class="gov-hero-stat-label">{s1}</div>
                </div>
                <div class="gov-hero-stat">
                    <div class="gov-hero-stat-num">2</div>
                    <div class="gov-hero-stat-label">{s2}</div>
                </div>
                <div class="gov-hero-stat">
                    <div class="gov-hero-stat-num">50+</div>
                    <div class="gov-hero-stat-label">{s3}</div>
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ─── "How to Use" panel ────────────────────────────────────────────────────────

def render_help_panel(is_hindi: bool):
    panel_title = "📖 GovGuide AI का उपयोग कैसे करें" if is_hindi else "📖 How to Use GovGuide AI"

    st.markdown(f"""
    <div class="gov-panel">
        <div class="gov-panel-header">
            <span>{panel_title}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    with st.container():
        cl, _ = st.columns([1, 9])
        with cl:
            if st.button("✕ Close", key="close_help"):
                st.session_state.show_help = False
                st.rerun()

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


# ─── "Home" panel ──────────────────────────────────────────────────────────────

def render_home_panel(fb_handler, is_hindi: bool):
    """Government-style Home panel with profile, topics, examples, links."""
    panel_title = "🏠 GovGuide AI — होम" if is_hindi else "🏠 GovGuide AI — Home"

    st.markdown(f"""
    <div class="gov-panel">
        <div class="gov-panel-header">
            <span>{panel_title}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    with st.container():
        cl, _ = st.columns([1, 9])
        with cl:
            if st.button("✕ Close", key="close_home"):
                st.session_state.show_home = False
                st.rerun()

        # Four-column content layout
        lc, pc, tc, ec = st.columns([1, 1.4, 1.6, 1], gap="medium")

        # ── Col 1: Language ────────────────────────────────────────
        with lc:
            st.markdown('<p class="gov-panel-section-title">🌐 Language / भाषा</p>', unsafe_allow_html=True)
            lang_pick = st.selectbox(
                "lang_home",
                Config.LANGUAGES,
                index=Config.LANGUAGES.index(st.session_state.language),
                label_visibility="collapsed",
                key="lang_home_widget",
            )
            st.session_state.language = lang_pick

            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown('<p class="gov-panel-section-title">📚 ' + ("विषय" if is_hindi else "Topics") + '</p>', unsafe_allow_html=True)
            pills = ["💰 Scholarship", "🆔 Aadhaar", "📄 Income Cert", "📜 RTI", "🪪 PAN Card", "🛂 Passport"]
            st.markdown(" ".join(f'<span class="gov-pill">{p}</span>' for p in pills), unsafe_allow_html=True)

        # ── Col 2: Profile ─────────────────────────────────────────
        with pc:
            st.markdown('<p class="gov-panel-section-title">👤 ' + ("आपकी प्रोफ़ाइल" if is_hindi else "Your Profile") + '</p>', unsafe_allow_html=True)
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
            st.markdown('<p class="gov-panel-section-title">💡 ' + ("उदाहरण प्रश्न" if is_hindi else "Example Questions") + '</p>', unsafe_allow_html=True)
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
            st.markdown('<p class="gov-panel-section-title">🔗 ' + ("त्वरित लिंक" if is_hindi else "Quick Links") + '</p>', unsafe_allow_html=True)
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
                st.markdown('<p class="gov-panel-section-title">📊 ' + ("फ़ीडबैक" if is_hindi else "Feedback") + '</p>', unsafe_allow_html=True)
                fc1, fc2 = st.columns(2)
                fc1.metric("👍", stats["helpful"])
                fc2.metric("👎", stats["not_helpful"])
                st.progress(stats["helpful_pct"] / 100)
                st.caption(f"{stats['helpful_pct']}% helpful")


# ─── Quick Services Grid ──────────────────────────────────────────────────────

def render_quick_services(is_hindi: bool):
    """Grid of clickable service cards using Streamlit buttons."""
    services = [
        {"icon": "🎓",
         "name": "Scholarship Help" if not is_hindi else "छात्रवृत्ति सहायता",
         "desc": "Why rejected? How to apply?" if not is_hindi else "अस्वीकार क्यों? आवेदन कैसे?",
         "q": "मेरी छात्रवृत्ति क्यों अस्वीकार हुई?" if is_hindi else "Why was my scholarship rejected?"},
        {"icon": "🆔",
         "name": "Aadhaar Services" if not is_hindi else "आधार सेवाएं",
         "desc": "Name correction, update, link" if not is_hindi else "नाम सुधार, अपडेट, लिंक",
         "q": "आधार में नाम कैसे सुधारें?" if is_hindi else "How to correct my name in Aadhaar?"},
        {"icon": "📄",
         "name": "Certificates" if not is_hindi else "प्रमाण पत्र",
         "desc": "Income, caste, domicile docs" if not is_hindi else "आय, जाति, अधिवास दस्तावेज",
         "q": "आय प्रमाण पत्र के लिए क्या दस्तावेज चाहिए?" if is_hindi else "What documents needed for income certificate?"},
        {"icon": "📜",
         "name": "RTI Filing" if not is_hindi else "RTI दाखिल करें",
         "desc": "How to file & track RTI" if not is_hindi else "RTI कैसे दाखिल करें और ट्रैक करें",
         "q": "RTI आवेदन कैसे करें?" if is_hindi else "How to file an RTI application?"},
    ]

    section_title = "त्वरित सेवाएं" if is_hindi else "Quick Services"
    st.markdown(f'<p class="gov-section-title">🚀 {section_title}</p>', unsafe_allow_html=True)

    cols = st.columns(len(services), gap="medium")
    for i, (col, s) in enumerate(zip(cols, services)):
        with col:
            st.markdown(
                f'<p style="font-size:1.8rem;margin:0 0 4px;">{s["icon"]}</p>'
                f'<p style="font-weight:600;color:#1E293B;font-size:0.88rem;margin:0 0 2px;">{s["name"]}</p>'
                f'<p style="color:#64748B;font-size:0.78rem;margin:0 0 10px;">{s["desc"]}</p>',
                unsafe_allow_html=True,
            )
            if st.button(f"Ask about {s['name']}" if not is_hindi else f"{s['name']} पूछें", key=f"svc_{i}", use_container_width=True):
                st.session_state.prefill_question = s['q']
                st.rerun()


# ─── Government Footer ────────────────────────────────────────────────────────

def render_footer(is_hindi: bool):
    """Government-style footer with partner logos bar and links."""
    st.markdown("""
    <div class="gov-partners-bar">
        <a href="https://india.gov.in" target="_blank" class="gov-partner">🇮🇳 india.gov.in</a>
        <a href="https://digitalindia.gov.in" target="_blank" class="gov-partner">💻 Digital India</a>
        <a href="https://meity.gov.in" target="_blank" class="gov-partner">🏢 MeitY</a>
        <a href="https://mygov.in" target="_blank" class="gov-partner">🗳️ MyGov</a>
        <a href="https://data.gov.in" target="_blank" class="gov-partner">📊 data.gov.in</a>
        <a href="https://nic.in" target="_blank" class="gov-partner">🖥️ NIC</a>
    </div>
    """, unsafe_allow_html=True)

    disclaimer = (
        "⚠️ यह उपकरण केवल शैक्षिक उद्देश्यों के लिए है। कोई भी कदम उठाने से पहले आधिकारिक सरकारी स्रोतों से पुष्टि करें। यह कानूनी सलाह नहीं है।"
        if is_hindi else
        "⚠️ This tool is for educational purposes only. Always verify information with official government sources before taking action. This is not legal advice."
    )

    st.markdown(f"""
    <div class="gov-footer">
        <div class="gov-footer-links">
            <a href="#" class="gov-footer-link">Terms & Conditions</a>
            <a href="#" class="gov-footer-link">Privacy Policy</a>
            <a href="#" class="gov-footer-link">Accessibility</a>
            <a href="#" class="gov-footer-link">Sitemap</a>
            <a href="#" class="gov-footer-link">Contact Us</a>
            <a href="#" class="gov-footer-link">Feedback</a>
        </div>
        <div class="gov-footer-copy">
            Made with ❤️ for Citizens of India &nbsp;|&nbsp; © 2024–2026 GovGuide AI &nbsp;|&nbsp; For Educational Purpose Only
        </div>
        <div class="gov-footer-disclaimer">{disclaimer}</div>
    </div>
    """, unsafe_allow_html=True)


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    _init_state()

    qa_handler, load_err = _load_qa_system()
    fb_handler = _load_feedback_handler()

    # Derive language from session state (no sidebar)
    is_hindi = "Hindi" in st.session_state.language
    lang     = st.session_state.language

    # ════════════════════════════════════════════════════════════════
    # GOVERNMENT HEADER
    # ════════════════════════════════════════════════════════════════
    render_top_bar(is_hindi)
    render_nav_bar(is_hindi)
    render_ticker(is_hindi)
    render_hero(is_hindi)

    # ════════════════════════════════════════════════════════════════
    # CONTENT WRAPPER START — centered content with padding
    # ════════════════════════════════════════════════════════════════
    st.markdown('<div class="gov-content-wrapper">', unsafe_allow_html=True)

    # ════════════════════════════════════════════════════════════════
    # ACTION BUTTONS ROW: [Home] [How to Use]
    # ════════════════════════════════════════════════════════════════
    btn_c1, btn_c2, btn_spacer = st.columns([1.5, 1.5, 5])

    with btn_c1:
        st.markdown('<div class="gov-btn-primary">', unsafe_allow_html=True)
        home_lbl = "🏠 होम पैनल" if is_hindi else "🏠 Home Panel"
        if st.button(home_lbl, key="home_btn", use_container_width=True):
            st.session_state.show_home = not st.session_state.show_home
            st.session_state.show_help = False
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

    with btn_c2:
        st.markdown('<div class="gov-btn-outline">', unsafe_allow_html=True)
        how_lbl = "📖 उपयोग कैसे करें" if is_hindi else "📖 How to Use"
        if st.button(how_lbl, key="how_btn", use_container_width=True):
            st.session_state.show_help = not st.session_state.show_help
            st.session_state.show_home = False
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
            st.markdown("""
            <div class="gov-card gov-card-warning">
                <div class="gov-card-title">⚠️ Knowledge Base Not Found</div>
                <div class="gov-card-body">The AI knowledge base has not been initialized. Please run setup first.</div>
            </div>
            """, unsafe_allow_html=True)
            st.code("python setup.py", language="bash")
        else:
            st.markdown(f"""
            <div class="gov-card gov-card-warning">
                <div class="gov-card-title">⚠️ System Error</div>
                <div class="gov-card-body">{load_err.replace('error:', '')}</div>
            </div>
            """, unsafe_allow_html=True)
        render_footer(is_hindi)
        return

    # ════════════════════════════════════════════════════════════════
    # QUICK SERVICES
    # ════════════════════════════════════════════════════════════════
    render_quick_services(is_hindi)

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
        st.markdown(f'<div class="gov-upload-info">📄 {hint}</div>', unsafe_allow_html=True)

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
                st.markdown('<div class="gov-btn-amber">', unsafe_allow_html=True)
                if st.button(a_lbl, key="analyse_doc", use_container_width=True):
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
                st.markdown('</div>', unsafe_allow_html=True)

        if st.session_state.doc_text:
            c_lbl = "🗑️ दस्तावेज़ हटाएं" if is_hindi else "🗑️ Clear Document"
            if st.button(c_lbl, key="clr_doc_exp"):
                st.session_state.doc_text = None
                st.session_state.doc_name = None
                st.rerun()

    if st.session_state.doc_text:
        st.markdown(
            f'<div class="gov-doc-badge">📎 <strong>{st.session_state.doc_name}</strong>'
            " — questions will reference this document</div>",
            unsafe_allow_html=True,
        )

    # ════════════════════════════════════════════════════════════════
    # QUESTION INPUT
    # ════════════════════════════════════════════════════════════════
    q_title = "❓ अपना प्रश्न पूछें" if is_hindi else "❓ Ask Your Question"
    st.markdown(f"""
    <div class="gov-question-card">
        <div class="gov-question-header">💬 {q_title}</div>
    </div>
    """, unsafe_allow_html=True)

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
        st.markdown('<div class="gov-btn-primary">', unsafe_allow_html=True)
        submit = st.button("🔍 " + ("उत्तर प्राप्त करें" if is_hindi else "Get Answer"),
                           type="primary", use_container_width=True, key="submit_btn")
        st.markdown('</div>', unsafe_allow_html=True)
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
        st.markdown(f'<div class="gov-section-title">{h_lbl}</div>', unsafe_allow_html=True)

        for ri, chat in enumerate(reversed(st.session_state.chat_history)):
            chat_idx = len(st.session_state.chat_history) - 1 - ri
            fk = f"fb_{chat_idx}"

            doc_flag = " 📎" if chat.get("has_doc") else ""
            st.markdown(
                f'<div class="gov-q-bubble">'
                f'<span class="gov-q-text">🙋 {chat["question"]}{doc_flag}</span>'
                f'<span class="gov-q-time">{chat.get("ts","")}</span></div>',
                unsafe_allow_html=True,
            )

            st.markdown('<div class="gov-answer-card">', unsafe_allow_html=True)
            with st.container():
                st.markdown(chat["answer"])

                sources = chat.get("sources", [])
                if sources:
                    s_lbl = f"📚 {'स्रोत देखें' if is_hindi else 'View Sources'} ({len(sources)})"
                    with st.expander(s_lbl):
                        for src in sources:
                            st.markdown(
                                f'<div class="gov-src-card">'
                                f'<div class="gov-src-name">📄 {src["name"]}</div>'
                                f'<div class="gov-src-snip">"{src["snippet"]}"</div>'
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
                    st.markdown(f'<span class="gov-fb-thanks">✅ {thanks}</span>', unsafe_allow_html=True)

            st.markdown('</div>', unsafe_allow_html=True)

            if ri < len(st.session_state.chat_history) - 1:
                st.divider()

    # ════════════════════════════════════════════════════════════════
    # CONTENT WRAPPER END
    # ════════════════════════════════════════════════════════════════
    st.markdown('</div>', unsafe_allow_html=True)

    # ════════════════════════════════════════════════════════════════
    # FOOTER
    # ════════════════════════════════════════════════════════════════
    render_footer(is_hindi)


if __name__ == "__main__":
    main()