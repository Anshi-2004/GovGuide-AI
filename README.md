# 🏛️ GovGuide AI — Indian Government Systems & Public Services Assistant

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_2.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_SPA-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![LangChain](https://img.shields.io/badge/RAG-LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://python.langchain.com)
[![FAISS](https://img.shields.io/badge/Vector_DB-FAISS-00599C?style=flat-square&logo=cplusplus&logoColor=white)](https://github.com/facebookresearch/faiss)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2F_SQLite-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.10_%7C_3.11_%7C_3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

An intelligent, context-aware AI platform designed to demystify Indian public services, welfare schemes, official application processes, document verification workflows, rejection diagnoses, and RTI (Right to Information) filings.

---

## 📌 Table of Contents

- [Problem Statement & Solution](#-problem-statement--solution)
- [System Architecture](#-system-architecture)
- [Core Features & Capabilities](#-core-features--capabilities)
- [Project Directory Structure](#-project-directory-structure)
- [Tech Stack Overview](#-tech-stack-overview)
- [Environment Variables (.env)](#-environment-variables-env)
- [Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone and Set Up Virtual Environment](#1-clone-and-set-up-virtual-environment)
  - [2. Install Python Dependencies](#2-install-python-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Build FAISS Vector Embeddings](#4-build-faiss-vector-embeddings)
  - [5. Install Frontend Dependencies](#5-install-frontend-dependencies)
  - [6. Launch the Application](#6-launch-the-application)
- [Dual Interface Support](#-dual-interface-support)
  - [Option A: React 19 Modern Portal (Recommended)](#option-a-react-19-modern-portal-recommended)
  - [Option B: Classic Streamlit Portal](#option-b-classic-streamlit-portal)
- [FastAPI REST API Reference](#-fastapi-rest-api-reference)
- [Database Schema & Models](#-database-schema--models)
- [Testing & Diagnostics](#-testing--diagnostics)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Ethical Principles & Disclaimer](#-ethical-principles--disclaimer)

---

## 🎯 Problem Statement & Solution

### The Challenge
Navigating government systems in India is often overwhelming for ordinary citizens:
- **Procedural Ambiguity**: Bureaucratic workflows and requirements are rarely taught in standard education.
- **Unclear Rejection Reasons**: Applications for scholarships, subsidies, and certificates are often rejected with cryptic error codes or vague rejection slips.
- **Scattered Information**: Eligibility criteria and required documents vary significantly across states, social categories, and income slabs.
- **Intimidation Factor**: Fear of document discrepancies, fear of visiting administrative offices, or confusion surrounding grievance escalation (RTI, PG-Portals).

### The Solution: GovGuide AI
GovGuide AI acts as an always-available public services guide that:
1. **Answers citizen queries in plain, transparent language** using verified government knowledge bases.
2. **Diagnoses rejection letters and application slips** using OCR and text parsing to explain exact causes and remedies.
3. **Personalizes answers** based on user state, caste/category, and household income.
4. **Simplifies RTI drafting & grievance procedures** into structured, actionable steps.
5. **Supports bilingual interaction** in both English and Hindi (हिंदी).

---

## 🏛️ System Architecture

GovGuide AI features a decoupled, multi-tier architecture built for production scalability:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                            │
│                                                                        │
│   ┌────────────────────────────────┐  ┌────────────────────────────┐   │
│   │    React 19 SPA (Vite)         │  │   Streamlit Web Portal     │   │
│   │    http://localhost:5173       │  │   http://localhost:8501    │   │
│   └───────────────┬────────────────┘  └─────────────┬──────────────┘   │
└───────────────────┼─────────────────────────────────┼──────────────────┘
                    │ REST API Calls                  │ Direct Python
                    ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API & BACKEND SERVICES                          │
│                                                                        │
│                    FastAPI REST API (Port 8000)                        │
│            • Background thread startup for RAG / FAISS                 │
│            • CORS Middleware, Pydantic v2 schemas                      │
│            • File Ingestion: pdfplumber, pypdf, pytesseract OCR        │
└──────────────┬──────────────────┬──────────────────┬───────────────────┘
               │                  │                  │
               ▼                  ▼                  ▼
┌───────────────────────┐ ┌───────────────┐ ┌────────────────────────────┐
│   DATABASE LAYER      │ │ VECTOR STORE  │ │      LLM ENGINE            │
│                       │ │               │ │                            │
│  PostgreSQL / SQLite  │ │ FAISS (Flat)  │ │ OpenRouter / OpenAI API    │
│  • Schemes Directory  │ │ • Sentence-   │ │ • GPT-4o-mini / Gemini     │
│  • Chat History Audit │ │   Transformers│ │ • Grounded Citizen System  │
│  • Community Feedback │ │ • MiniLM-L6-v2│ │   Prompts & RAG Chains     │
└───────────────────────┘ └───────────────┘ └────────────────────────────┘
```

---

## ✨ Core Features & Capabilities

### 1. 🤖 RAG-Powered AI Citizen Assistant
- **Context-Aware Retrieval**: Employs LangChain and FAISS vector indexing to ground answers in verified government procedure documents.
- **Citizen Profile Personalization**: Filter responses according to:
  - **State**: All 28 Indian States & 8 Union Territories
  - **Category**: General, SC (Scheduled Caste), ST (Scheduled Tribe), OBC, EWS
  - **Income Range**: Below ₹1L, ₹1–2.5L, ₹2.5–5L, ₹5–8L, Above ₹8L
- **Bilingual Interface**: Seamless switching between **English** and **Hindi (हिंदी)**.

### 2. 📄 Document Rejection Letter Ingestion & OCR Diagnostics
- **Multi-Format Uploads**: Ingest `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, or `.txt` files.
- **Deep Text Extraction**:
  - Digital PDFs parsed with `pdfplumber` (fallback to `pypdf`).
  - Scanned images parsed with `pytesseract` OCR supporting both English and Hindi (`eng+hin`).
- **Automated Diagnostic Evaluation**: Paste or upload rejection notices to immediately discover missing papers, verification mistakes, and exact remedial steps.

### 3. 🏛️ Government Schemes Explorer
- Comprehensive directory of welfare schemes (e.g., Post-Matric Scholarships, Stand-Up India, EWS Housing, National Fellowships).
- Search and filter by State, Social Category, and Income threshold.
- Direct access to eligibility criteria, benefit amounts, required paperwork, and official portal links.

### 4. 📜 RTI Application Guide & Drafter
- Guides citizens through the Right to Information Act (2005) process.
- Generates structured, compliant RTI application drafts ready to submit on [rtionline.gov.in](https://rtionline.gov.in).
- Explains fee structures, timelines (30-day mandate), and first appeal escalation mechanisms.

### 5. 🆔 Identity & Certificate Correction Guide
- Step-by-step instructions for:
  - **Aadhaar Updates**: Name, date of birth, address, and mobile linking via UIDAI portals.
  - **Income Certificates**: Competent issuing authorities (Tehsildar/SDM), validity, and affidavits.
  - **Caste & Domicile Certificates**: State-specific issuance timelines and verification checklists.

### 6. 📊 Community Feedback & Audit Telemetry
- Users can upvote (👍 Helpful) or downvote (👎 Not Helpful) answers with contextual comments.
- Telemetry persisted in PostgreSQL/SQLite for response evaluation and continual improvement.

### 7. ♿ Accessibility & Government Portal Design Aesthetics
- Designed following the visual conventions of official Indian Government portals ([india.gov.in](https://india.gov.in)).
- Features Indian tricolor header ribbons, triple font-size scaling controls (`A-`, `A`, `A+`), theme switcher, and high-contrast readable typography.

---

## 📁 Project Directory Structure

```
govguide-ai/
│
├── .env                              # Environment secrets and API credentials
├── .gitignore                        # Git ignore patterns
├── README.md                         # Comprehensive documentation (this file)
├── RUNNING.md                        # Quick developer reference for launching services
├── requirements.txt                  # Python dependencies
├── setup.py                          # One-time script to compile raw data into FAISS embeddings
├── run_app.py                        # Unified launcher script (FastAPI + Vite React)
├── app.py                            # Full-featured standalone Streamlit interface
├── test_embeddings.py                # FAISS vector store verification utility
├── test_openrouter.py                # LLM API connection diagnostics script
│
├── backend/                          # FastAPI REST API Backend
│   └── app/
│       ├── __init__.py
│       ├── database.py               # SQLAlchemy ORM models, DB engine, and seed data
│       └── main.py                   # REST endpoints, CORS, OCR handlers, and RAG routes
│
├── frontend/                         # Modern React 19 Frontend
│   ├── index.html                    # Single page HTML entry
│   ├── package.json                  # Frontend dependencies and Vite scripts
│   ├── vite.config.ts                # Vite configuration
│   └── src/
│       ├── main.jsx                  # React application root
│       ├── App.jsx                   # Main React SPA component (Chat, OCR, Help, Modals)
│       ├── App.css                   # National Portal design system & CSS variables
│       └── api.js                    # Fetch client for all backend REST endpoints
│
├── src/                              # Core AI & RAG Engine
│   ├── __init__.py
│   ├── config.py                     # Central configuration constants & path loaders
│   ├── data_processor.py             # Document loader, chunker, and text splitters
│   ├── embeddings_generator.py       # HuggingFace SentenceTransformers embeddings & FAISS
│   ├── feedback_handler.py           # Local feedback file storage handler
│   └── query_handler.py              # Prompt construction, LangChain retriever, LLM invoker
│
└── data/                             # Knowledge Base & Databases
    ├── govguide.db                   # SQLite database (auto-created if PostgreSQL not configured)
    ├── feedback.json                 # JSON fallback for user feedback records
    ├── processed/
    │   └── embeddings/               # Compiled FAISS index files (index.faiss, index.pkl)
    └── raw/                          # Verified source knowledge files
        ├── aadhaar_correction.txt    # UIDAI update and correction workflows
        ├── faqs.txt                  # Common citizen questions and answers
        ├── income_certificate.txt    # Income certificate issuance and validity guidelines
        ├── rti_process.txt           # RTI Act rules, fees, timelines, and format templates
        ├── schemes.json              # Structured welfare schemes database
        └── scholarship_info.txt      # NSP & state scholarship eligibility and rejection causes
```

---

## 🛠️ Tech Stack Overview

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Vanilla CSS | Fast, accessible, mobile-responsive portal UI |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous REST API server |
| **Database** | PostgreSQL / SQLite (SQLAlchemy) | Persistent schemes directory, chat audit history, feedback |
| **Vector DB** | FAISS (Facebook AI Similarity Search) | High-speed semantic similarity retrieval |
| **Embedding Model** | `sentence-transformers/all-MiniLM-L6-v2` | Free, local, CPU-friendly embeddings (no OpenAI cost) |
| **LLM Engine** | OpenRouter (`gpt-4o-mini`) / OpenAI | Grounded reasoning, extraction, and generation |
| **Document Processing** | `pdfplumber`, `pypdf`, `pytesseract`, `PIL` | Digital PDF extraction & Image OCR (English + Hindi) |
| **Alternate UI** | Streamlit | Standalone single-file citizen interface |

---

## 🔐 Environment Variables (.env)

Create a `.env` file in the root directory:

```env
# ── LLM Configuration (OpenRouter) ───────────────────────────
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ── Alternative: Direct OpenAI (Optional) ────────────────────
# OPENAI_API_KEY=sk-proj-your-openai-key-here
# OPENAI_MODEL=gpt-4o-mini

# ── Database Configuration ───────────────────────────────────
# If omitted or left empty, GovGuide AI automatically creates and uses SQLite: data/govguide.db
DATABASE_URL=postgresql://user:password@localhost:5432/govguidedb

# ── OCR Binary Path (Optional on Windows) ────────────────────
# TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

> **Note on Embeddings**: The vector embeddings use the free HuggingFace model `sentence-transformers/all-MiniLM-L6-v2`. Running `setup.py` costs **$0.00** and does not require an active LLM API key.

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Python**: Version 3.10, 3.11, or 3.12 installed.
- **Node.js**: Version 18.0 or higher with `npm`.
- **Git**: Installed and available in terminal.
- *(Optional)* **Tesseract OCR**: If you wish to use optical character recognition on scanned images.
  - Windows: [UB-Mannheim Tesseract Installer](https://github.com/UB-Mannheim/tesseract/wiki)
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr tesseract-ocr-hin`
  - macOS: `brew install tesseract tesseract-lang`

---

### 1. Clone and Set Up Virtual Environment

```bash
# Clone the repository
git clone https://github.com/Anshi-2004/GovGuide-AI.git
cd GovGuide-AI

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate
```

---

### 2. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

Create your `.env` file from the instructions above:

```bash
# Example for Windows PowerShell:
Copy-Item .env.example .env -ErrorAction SilentlyContinue
# Edit .env and paste your OPENROUTER_API_KEY
```

---

### 4. Build FAISS Vector Embeddings

Before launching the app for the first time, process the raw documents into local vector embeddings:

```bash
python setup.py
```

*Output:*
```
=======================================================
  GovGuide AI - Setup Script
=======================================================
[Step 1] Processing documents...
[Step 2] Creating embeddings for 52 chunks...
[Step 3] Saving embeddings...
[OK] Setup complete!
```

---

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

### 6. Launch the Application

#### 🚀 Single-Command Launch (FastAPI + React)
Run the master runner to launch both the backend API and frontend dev server simultaneously:

```bash
python run_app.py
```

Once running, navigate to:
- 🌐 **Citizen Portal (React UI)**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **System Diagnostics**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🖥️ Dual Interface Support

GovGuide AI provides two distinct ways to interact with the platform:

### Option A: React 19 Modern Portal (Recommended)
Built with React 19 and Vite. Offers modern state management, responsive card layouts, seamless modal dialogs, and instant REST API connectivity.

```bash
# In Terminal 1 (Backend):
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# In Terminal 2 (Frontend):
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

### Option B: Classic Streamlit Portal
A comprehensive, single-process web portal implemented in `app.py` for rapid demonstration and environments where Node.js is unavailable:

```bash
streamlit run app.py
```
Open [http://localhost:8501](http://localhost:8501).

---

## 📡 FastAPI REST API Reference

GovGuide AI provides a clean REST API documented interactively at `/docs` (Swagger UI) and `/redoc`.

| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root service status and version | None |
| `GET` | `/api/health` | Comprehensive health check (DB, FAISS index, LLM status) | None |
| `POST` | `/api/chat` | Send a query to the RAG pipeline with user profile context | `ChatRequest` (JSON) |
| `GET` | `/api/schemes` | List government schemes with state, category & income filters | Query params: `state`, `category`, `income`, `search` |
| `GET` | `/api/schemes/{id}` | Get full details for a specific scheme | Path param: `id` (int) |
| `POST` | `/api/documents/upload` | Extract clean text from PDF, Image (OCR), or Text file | `multipart/form-data` with `file` |
| `POST` | `/api/documents/analyze` | Run full diagnostic analysis on uploaded rejection letter | `DocumentAnalyzeRequest` (JSON) |
| `POST` | `/api/feedback` | Record user satisfaction rating (helpful / not helpful) | `FeedbackRequest` (JSON) |
| `GET` | `/api/feedback/stats` | Aggregate community satisfaction metrics and recent audits | None |
| `POST` | `/api/knowledge/reindex` | Trigger dynamic re-indexing of `data/raw/` into FAISS | None |

### Sample `POST /api/chat` Request

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Why was my scholarship rejected due to caste certificate date?",
    "language": "English",
    "state": "Uttar Pradesh",
    "category": "SC (Scheduled Caste)",
    "income": "Below ₹2.5 Lakh"
  }'
```

### Sample `POST /api/chat` Response

```json
{
  "session_id": "sess-a9b8c7d6",
  "question": "Why was my scholarship rejected due to caste certificate date?",
  "answer": "Scholarship applications often get rejected if the caste certificate was issued after the scheme cutoff date...",
  "language": "English",
  "sources": [
    {
      "source": "scholarship_info.txt",
      "relevance": 0.84
    }
  ],
  "status": "success"
}
```

---

## 🗄️ Database Schema & Models

GovGuide AI utilizes SQLAlchemy ORM with support for PostgreSQL and automatic SQLite fallback.

```mermaid
erDiagram
    SCHEMES {
        int id PK
        string name
        string code UK
        string category
        string state
        string income_limit
        text eligibility
        text benefits
        text required_documents
        text application_process
        string official_url
    }

    CHAT_HISTORY {
        int id PK
        string session_id
        text question
        text answer
        string language
        string state
        string category
        string income
        datetime timestamp
    }

    FEEDBACK {
        int id PK
        string question
        string answer_preview
        string feedback_type
        string language
        string state
        string category
        text user_comments
        datetime timestamp
    }

    KNOWLEDGE_DOCS {
        int id PK
        string title
        string doc_type
        text content
        string state
        string category
        string tags
        datetime created_at
    }
```

---

## 🧪 Testing & Diagnostics

GovGuide AI includes targeted diagnostic scripts to isolate and verify subsystems:

```bash
# 1. Test LLM API connectivity & model response
python test_openrouter.py

# 2. Test FAISS vector store loading and search quality
python test_embeddings.py

# 3. Test backend imports & endpoints
python -c "import backend.app.main; print('Backend modules OK')"
```

---

## ❓ Troubleshooting & FAQs

### 1. `Vector store not found` or `degraded` health status
**Cause**: The FAISS embeddings index has not been generated yet.  
**Fix**: Run `python setup.py` in the workspace root. Verify that `data/processed/embeddings/index.faiss` is created.

### 2. Port already in use (`8000` or `5173`)
**Cause**: A previous server instance is still running in the background.  
**Fix**:
- On Windows:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
  ```
- On Linux/macOS:
  ```bash
  kill -9 $(lsof -t -i:8000)
  kill -9 $(lsof -t -i:5173)
  ```

### 3. OCR error on image upload: `TesseractNotFoundError`
**Cause**: Tesseract OCR binary is not installed or not registered in your system `PATH`.  
**Fix**: Install Tesseract OCR from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki). If installed in a non-standard location, define the path in `main.py` or your system environment variables. Note: Citizens can also copy-paste text directly into the text area without OCR.

### 4. Updating the Knowledge Base
To add or update official procedures:
1. Add or modify `.txt` or `.json` files inside `data/raw/`.
2. Run `python setup.py` or send a `POST` request to `http://localhost:8000/api/knowledge/reindex`.
3. The RAG vector store will refresh immediately.

---

## ⚖️ Ethical Principles & Disclaimer

```
⚠️ IMPORTANT LEGAL & GOVERNMENT DISCLAIMER
GovGuide AI is an educational and public awareness technology platform designed
to assist Indian citizens in navigating administrative workflows.

1. NO LEGAL ADVICE: GovGuide AI does not provide formal legal counsel or
   guarantee government approvals, certificate issuance, or scholarship sanctions.
2. CITIZEN AUTONOMY: The platform never files applications on behalf of citizens
   nor asks for sensitive authentication secrets (such as Aadhaar OTP, net banking, or UPI PINs).
3. VERIFICATION REQUIRED: Always verify guidance with official government portals
   (such as india.gov.in, uidai.gov.in, scholarships.gov.in, or rtionline.gov.in)
   or the respective competent authority (Sub-Divisional Magistrate, Tehsildar, etc.).
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcomed! Feel free to:
- Add verified procedure documents to `data/raw/` for state-specific welfare schemes.
- Improve OCR accuracy and language support for regional Indian languages.
- Report issues and suggest enhancements via GitHub Issues.