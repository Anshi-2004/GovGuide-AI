"""
GovGuide AI — FastAPI REST API Backend
Connects React.js Frontend to PostgreSQL, FAISS Vector Search, and LLM APIs.
"""

import os
import sys
import uuid
from typing import Dict, List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Add parent directory to sys.path so src imports work cleanly
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.config import Config
from src.embeddings_generator import EmbeddingsGenerator
from src.data_processor import DataProcessor
from src.query_handler import QueryHandler
from backend.app.database import (
    init_db,
    get_db,
    SchemeModel,
    ChatHistoryModel,
    FeedbackModel,
    KnowledgeDocModel,
)

# Initialize FastAPI App
app = FastAPI(
    title="GovGuide AI — REST API",
    description="Backend API for Indian Government Systems & Public Services Assistant",
    version="2.0.0",
)

# Enable CORS for React frontend (Vite default port 5173 and localhost variations)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances for vector store and query handler
import threading

vector_store = None
query_handler = None
rag_loading = False


def _load_rag_in_background():
    global vector_store, query_handler, rag_loading
    rag_loading = True
    print("[*] Background loading of FAISS vector store & QueryHandler started...")
    try:
        embeddings_gen = EmbeddingsGenerator()
        if os.path.exists(Config.EMBEDDINGS_PATH):
            vector_store = embeddings_gen.load_embeddings(Config.EMBEDDINGS_PATH)
            print("[OK] FAISS vector store loaded from disk.")
        else:
            print("[*] Vector store not found. Building from data/raw...")
            processor = DataProcessor(Config.RAW_DATA_PATH)
            chunks = processor.process()
            if chunks:
                vector_store = embeddings_gen.create_embeddings(chunks)
                embeddings_gen.save_embeddings(Config.EMBEDDINGS_PATH)
                print("[OK] FAISS vector store generated and saved.")
            else:
                print("[WARN] No raw data files found to build FAISS index.")

        if vector_store:
            query_handler = QueryHandler(vector_store)
            print("[OK] RAG QueryHandler initialized successfully.")
    except Exception as e:
        print(f"[ERROR] Background FAISS/LLM initialization error: {e}")
    finally:
        rag_loading = False


@app.on_event("startup")
def startup_event():
    """Initialize Database tables instantly and trigger background FAISS loading."""
    print("\n" + "=" * 60)
    print("  GovGuide AI -- Backend Startup Initialisation")
    print("=" * 60)

    # 1. Initialize DB & Seed Data instantly
    try:
        init_db()
        print("[OK] Database initialized successfully.")
    except Exception as e:
        print(f"[WARN] Database initialization error: {e}")

    # 2. Trigger FAISS & QueryHandler loading in background thread
    threading.Thread(target=_load_rag_in_background, daemon=True).start()


# ── Pydantic Request / Response Schemas ───────────────────────────────────────

class ChatRequest(BaseModel):
    question: str = Field(..., example="Why was my scholarship application rejected?")
    language: Optional[str] = Field("English", example="English")
    state: Optional[str] = Field(None, example="Uttar Pradesh")
    category: Optional[str] = Field(None, example="SC (Scheduled Caste)")
    income: Optional[str] = Field(None, example="Below ₹2.5 Lakh")
    document_text: Optional[str] = Field(None, description="Optional uploaded document content")
    session_id: Optional[str] = Field(None, example="session-12345")


class ChatResponse(BaseModel):
    session_id: str
    question: str
    answer: str
    language: str
    sources: List[Dict]
    status: str = "success"


class FeedbackRequest(BaseModel):
    question: str
    answer_preview: str
    feedback_type: str = Field(..., example="helpful")  # "helpful" or "not_helpful"
    language: Optional[str] = "English"
    state: Optional[str] = None
    category: Optional[str] = None
    user_comments: Optional[str] = None


class DocumentAnalyzeRequest(BaseModel):
    document_text: str
    language: Optional[str] = "English"
    document_title: Optional[str] = "Rejection Document"


# ── API Endpoints ─────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    """Root status endpoint."""
    return {
        "app": "GovGuide AI Backend API",
        "version": "2.0.0",
        "status": "online",
        "llm_model": Config.LLM_MODEL,
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Comprehensive health check for DB, FAISS vector store, and LLM."""
    global vector_store, query_handler

    db_status = "connected"
    scheme_count = 0
    try:
        scheme_count = db.query(SchemeModel).count()
    except Exception as e:
        db_status = f"error: {str(e)}"

    faiss_status = "loaded" if vector_store is not None else "not_loaded"
    llm_status = "available" if (query_handler and getattr(query_handler, "_llm_available", False)) else "not_available"

    return {
        "status": "healthy" if (faiss_status == "loaded" and db_status == "connected") else "degraded",
        "database": {
            "status": db_status,
            "schemes_count": scheme_count,
        },
        "faiss_vector_store": {
            "status": faiss_status,
            "path": Config.EMBEDDINGS_PATH,
        },
        "llm": {
            "status": llm_status,
            "model": Config.LLM_MODEL,
            "init_error": getattr(query_handler, "_init_error", None) if query_handler else "Handler not initialized",
        },
    }


@app.post("/api/chat", response_model=ChatResponse)
def handle_chat_query(req: ChatRequest, db: Session = Depends(get_db)):
    """
    RAG-based chat handler.
    Retrieves vector context from FAISS and queries LLM API. Logged into DB.
    """
    global query_handler, vector_store

    if not query_handler:
        if vector_store:
            query_handler = QueryHandler(vector_store)
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Vector store / Query handler is not initialized.",
            )

    user_ctx = {
        "state": req.state or "",
        "category": req.category or "",
        "income": req.income or "",
    }

    session_id = req.session_id or f"sess-{uuid.uuid4().hex[:8]}"

    # Execute RAG query pipeline
    result = query_handler.get_answer(
        question=req.question,
        document_text=req.document_text,
        user_context=user_ctx,
        language=req.language or "English",
    )

    answer_text = result.get("answer", "No answer produced.")
    sources = result.get("sources", [])

    # Log to PostgreSQL / SQLite database
    try:
        chat_log = ChatHistoryModel(
            session_id=session_id,
            question=req.question,
            answer=answer_text,
            language=req.language,
            state=req.state,
            category=req.category,
            income=req.income,
        )
        db.add(chat_log)
        db.commit()
    except Exception as db_err:
        db.rollback()
        print(f"[DB Warning] Failed to log chat entry: {db_err}")

    return ChatResponse(
        session_id=session_id,
        question=req.question,
        answer=answer_text,
        language=req.language or "English",
        sources=sources,
        status="success",
    )


@app.get("/api/schemes")
def list_schemes(
    state: Optional[str] = Query(None, description="Filter by Indian State"),
    category: Optional[str] = Query(None, description="Filter by Category (SC, ST, OBC, EWS, General)"),
    income: Optional[str] = Query(None, description="Filter by Income Level"),
    search: Optional[str] = Query(None, description="Search keyword in name or description"),
    db: Session = Depends(get_db),
):
    """Retrieve government schemes filtered by State, Category, and Income."""
    query = db.query(SchemeModel)

    if state and state not in Config.SENTINEL_VALUES and state != "All":
        query = query.filter((SchemeModel.state == state) | (SchemeModel.state == "All India"))

    if category and category not in Config.SENTINEL_VALUES and category != "All":
        query = query.filter((SchemeModel.category == category) | (SchemeModel.category == "General"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (SchemeModel.name.ilike(search_pattern))
            | (SchemeModel.eligibility.ilike(search_pattern))
            | (SchemeModel.benefits.ilike(search_pattern))
        )

    schemes = query.all()
    return {
        "total": len(schemes),
        "schemes": [
            {
                "id": s.id,
                "name": s.name,
                "code": s.code,
                "category": s.category,
                "state": s.state,
                "income_limit": s.income_limit,
                "eligibility": s.eligibility,
                "benefits": s.benefits,
                "required_documents": s.required_documents,
                "application_process": s.application_process,
                "official_url": s.official_url,
            }
            for s in schemes
        ],
    }


@app.get("/api/schemes/{scheme_id}")
def get_scheme_detail(scheme_id: int, db: Session = Depends(get_db)):
    """Fetch details of a single government scheme by ID."""
    scheme = db.query(SchemeModel).filter(SchemeModel.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme with ID {scheme_id} not found.")
    return {
        "id": scheme.id,
        "name": scheme.name,
        "code": scheme.code,
        "category": scheme.category,
        "state": scheme.state,
        "income_limit": scheme.income_limit,
        "eligibility": scheme.eligibility,
        "benefits": scheme.benefits,
        "required_documents": scheme.required_documents,
        "application_process": scheme.application_process,
        "official_url": scheme.official_url,
    }


@app.post("/api/documents/analyze")
def analyze_document(req: DocumentAnalyzeRequest):
    """Analyze uploaded rejection letters or documents for missing items and corrections."""
    global query_handler, vector_store

    if not query_handler:
        if vector_store:
            query_handler = QueryHandler(vector_store)
        else:
            raise HTTPException(
                status_code=503,
                detail="Query handler / LLM service unavailable.",
            )

    prompt_q = (
        f"Please analyze this government application / document titled '{req.document_title}'. "
        "Identify why it might be rejected or flagged, what documents or corrections are missing, "
        "and provide step-by-step guidance on how to fix it."
    )

    res = query_handler.answer_question(
        question=prompt_q,
        document_text=req.document_text,
        user_context=None,
        language=req.language or "English",
    )

    return {
        "title": req.document_title,
        "analysis": res.get("answer", "Could not analyze document."),
        "language": req.language,
    }


@app.post("/api/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    """Store user feedback (👍 helpful / 👎 not_helpful) in PostgreSQL/SQLite database."""
    try:
        record = FeedbackModel(
            question=req.question[:500],
            answer_preview=req.answer_preview[:300],
            feedback_type=req.feedback_type,
            language=req.language or "English",
            state=req.state or "Not specified",
            category=req.category or "Not specified",
            user_comments=req.user_comments,
        )
        db.add(record)
        db.commit()
        return {"status": "success", "message": "Feedback recorded successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record feedback: {e}")


@app.get("/api/feedback/stats")
def feedback_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate community feedback statistics."""
    total = db.query(FeedbackModel).count()
    helpful = db.query(FeedbackModel).filter(FeedbackModel.feedback_type == "helpful").count()
    not_helpful = total - helpful
    helpful_pct = round((helpful / total * 100) if total > 0 else 0.0, 1)

    recent = (
        db.query(FeedbackModel)
        .order_by(FeedbackModel.timestamp.desc())
        .limit(10)
        .all()
    )

    return {
        "total": total,
        "helpful": helpful,
        "not_helpful": not_helpful,
        "helpful_pct": helpful_pct,
        "recent_feedback": [
            {
                "id": r.id,
                "question": r.question,
                "feedback": r.feedback_type,
                "language": r.language,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            }
            for r in recent
        ],
    }


@app.post("/api/knowledge/reindex")
def reindex_knowledge_base():
    """Trigger manual re-indexing of raw documents into FAISS vector DB."""
    global vector_store, query_handler

    try:
        processor = DataProcessor(Config.RAW_DATA_PATH)
        chunks = processor.process()
        if not chunks:
            return {"status": "error", "message": "No raw data files found to index."}

        embeddings_gen = EmbeddingsGenerator()
        vector_store = embeddings_gen.create_embeddings(chunks)
        embeddings_gen.save_embeddings(Config.EMBEDDINGS_PATH)
        query_handler = QueryHandler(vector_store)

        return {
            "status": "success",
            "message": f"Successfully re-indexed {len(chunks)} knowledge chunks into FAISS vector store.",
            "chunks": len(chunks),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reindexing failed: {e}")
