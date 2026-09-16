# 🏛️ GovGuide AI — Modern Multi-Tier Stack (React + FastAPI + PostgreSQL + FAISS)

GovGuide AI features a decoupled multi-tier architecture:
- **Frontend**: React.js SPA (Vite + Tailwind CSS + Lucide icons) on `http://localhost:5173`
- **Backend API**: FastAPI REST server on `http://localhost:8000`
- **Database**: PostgreSQL (or auto SQLite fallback) for Schemes, Chat Audit Logs, and Feedback
- **Vector DB**: FAISS vector retrieval engine powered by SentenceTransformers
- **LLM Engine**: OpenAI / Gemini / OpenRouter RAG pipeline

```
Frontend (React.js) ──[REST API]──> Backend (FastAPI) ──┬──> PostgreSQL / SQLite
                                                         ├──> FAISS (Vector DB)
                                                         └──> LLM API (GPT / Gemini)
```

---

## ⚡ Quick Start (Launch Everything with 1 Command)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Build FAISS embeddings (one-time setup)
python setup.py

# 3. Launch both FastAPI Backend & React Frontend
python run_app.py
```

Then open your browser to:
- 🌐 **React Frontend**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **System Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 📦 Running Services Separately

### 1. Run FastAPI Backend Server
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

### 2. Run React Frontend Server
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ PostgreSQL Database Configuration

By default, GovGuide AI automatically uses a local SQLite database (`data/govguide.db`) for zero-config setup.

To connect to a **PostgreSQL** database instance:
Add `DATABASE_URL` to your `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/govguidedb
OPENROUTER_API_KEY=sk-or-v1-your-key-here
LLM_MODEL=openai/gpt-4o-mini
```

---

## 🚀 Features Available in React UI

1. **🤖 AI Assistant**: Ask questions about Indian government schemes, certificate applications, or rejection reasons with state/category/income profile filters.
2. **🏛️ Government Schemes Explorer**: Filter and search verified schemes by state, social category (SC, ST, OBC, EWS, General), and income limits.
3. **📄 Document Rejection Analyzer**: Paste rejection letters or notices for automated AI diagnosis and correction steps.
4. **📜 RTI Application Builder**: Step-by-step RTI form builder generating legal drafts ready to copy or print.
5. **📊 Community Feedback & System Stats**: Real-time telemetry on response accuracy, database persistence, and FAISS index chunks.
