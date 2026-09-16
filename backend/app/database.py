"""
GovGuide AI — Database & ORM Layer
Supports PostgreSQL (via DATABASE_URL) and fallback SQLite.
"""

import os
from datetime import datetime
from typing import Generator
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Float,
    create_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

# ── Database URL Configuration ───────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Local fallback to SQLite
    DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    os.makedirs(DB_DIR, exist_ok=True)
    DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'govguide.db')}"

# PostgreSQL needs postgresql:// instead of postgres:// if copied from Heroku/Supabase
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")

engine_args = {}
if is_sqlite:
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── ORM Models ────────────────────────────────────────────────────────────────

class SchemeModel(Base):
    """Government Scheme Entity"""
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(100), unique=True, index=True, nullable=True)
    category = Column(String(100), default="General", index=True)
    state = Column(String(100), default="All India", index=True)
    income_limit = Column(String(100), default="No Income Limit")
    eligibility = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    required_documents = Column(Text, nullable=False)
    application_process = Column(Text, nullable=False)
    official_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatHistoryModel(Base):
    """User Chat Session & Q&A Audit Log"""
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    language = Column(String(50), default="English")
    state = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    income = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FeedbackModel(Base):
    """User Feedback Records (👍 / 👎)"""
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer_preview = Column(Text, nullable=False)
    feedback_type = Column(String(50), nullable=False)  # "helpful" or "not_helpful"
    language = Column(String(50), default="English")
    state = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    user_comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class KnowledgeDocModel(Base):
    """Document Ingestion Register"""
    __tablename__ = "knowledge_docs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="General")
    file_path = Column(String(500), nullable=False)
    chunk_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)


# ── Database Initialization & Session Dependency ──────────────────────────────

def init_db():
    """Create tables if they don't exist and seed default schemes."""
    Base.metadata.create_all(bind=engine)
    seed_default_schemes()


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting DB session in FastAPI handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_default_schemes():
    """Seed initial government schemes if table is empty."""
    db = SessionLocal()
    try:
        if db.query(SchemeModel).count() > 0:
            return

        default_schemes = [
            SchemeModel(
                name="Post-Matric Scholarship Scheme",
                code="PMSS-001",
                category="SC (Scheduled Caste)",
                state="All India",
                income_limit="Below ₹2.5 Lakh",
                eligibility="SC students pursuing post-matriculation or post-secondary courses with annual family income up to ₹2.5 Lakh.",
                benefits="100% compulsory non-refundable fees reimbursement + academic allowance up to ₹13,500/year.",
                required_documents="Caste Certificate, Income Certificate, Previous Class Marksheet, Aadhaar Card, Bank Passbook, Passport Photo.",
                application_process="Apply online via National Scholarship Portal (NSP) or State Scholarship Portal. Complete biometric e-KYC.",
                official_url="https://scholarships.gov.in",
            ),
            SchemeModel(
                name="Income Certificate Verification & Issuance",
                code="INC-CERT-002",
                category="General",
                state="All India",
                income_limit="All Income Levels",
                eligibility="Any resident citizen needing proof of annual family income for scholarships, fee concessions, or government reservations.",
                benefits="Official government proof of income valid for 1 financial year across educational institutes and recruitment portals.",
                required_documents="Salary Slip / Form 16 / Income Affidavit, Salary/Bank Statement (6 months), Aadhaar Card, Address Proof, Passport Photo.",
                application_process="Apply through your State e-District portal or nearest Meeseva / CSC center. Revenue Inspector conducts field verification.",
                official_url="https://edistrict.gov.in",
            ),
            SchemeModel(
                name="Aadhaar Card Correction & Updates",
                code="UIDAI-003",
                category="General",
                state="All India",
                income_limit="No Income Limit",
                eligibility="Any Aadhaar holder needing update to Name, Date of Birth, Gender, Address, or Biometrics.",
                benefits="Updated Aadhaar database matching educational marksheets and official identity documents, reducing rejection risk.",
                required_documents="Proof of Identity (PAN, Voter ID, Passport), Proof of Address (Electricity bill, Bank Statement), Proof of Date of Birth (Birth Certificate, SSLC Marksheet).",
                application_process="Book appointment online at myAadhaar portal. Visit Aadhaar Seva Kendra for biometric/document verification.",
                official_url="https://myaadhaar.uidai.gov.in",
            ),
            SchemeModel(
                name="Right to Information (RTI) Application",
                code="RTI-004",
                category="General",
                state="All India",
                income_limit="No Income Limit (BPL Exempted from Fee)",
                eligibility="Any citizen of India seeking official public record info or status of pending applications/schemes.",
                benefits="Legal right to receive written response from Public Information Officer (PIO) within 30 days.",
                required_documents="RTI Application Draft, Application Fee ₹10 (Postal Order/Online Payment), BPL Card (if claiming fee exemption).",
                application_process="Submit query online at RTI Online portal or send physical application with court fee stamp/IPO to PIO of concerned ministry.",
                official_url="https://rtionline.gov.in",
            ),
            SchemeModel(
                name="PM Kisan Samman Nidhi",
                code="PM-KISAN-005",
                category="General",
                state="All India",
                income_limit="Small & Marginal Farmers",
                eligibility="Landholding farmer families possessing cultivable landholding up to 2 hectares in their name.",
                benefits="Direct financial benefit of ₹6,000 per year in 3 equal installments of ₹2,000 directly into Aadhaar-seeded bank account.",
                required_documents="Aadhaar Card, Landholding Ownership Papers (Khata/Khatian), Bank Account Details, Mobile Number.",
                application_process="Register online at PM Kisan Portal or through Common Service Centers (CSC). Complete mandatory e-KYC.",
                official_url="https://pmkisan.gov.in",
            ),
            SchemeModel(
                name="Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
                code="PM-JAY-006",
                category="EWS (Economically Weaker Section)",
                state="All India",
                income_limit="SECC 2011 Eligible / Below ₹1.2 Lakh",
                eligibility="Deprived rural families and identified occupational categories of urban workers' families based on SECC 2011 database.",
                benefits="Cashless health coverage up to ₹5,000,000 per family per year for secondary and tertiary care hospitalization.",
                required_documents="Aadhaar Card, Ration Card, PM-JAY Family ID / Ayushman Card.",
                application_process="Check eligibility on beneficiary.nha.gov.in or visit nearest empaneled public/private hospital Ayushman Mitra desk.",
                official_url="https://beneficiary.nha.gov.in",
            ),
        ]
        db.add_all(default_schemes)
        db.commit()
        print(f"[DB] Successfully seeded {len(default_schemes)} government schemes into database.")
    except Exception as e:
        db.rollback()
        print(f"[DB Error] Scheme seeding failed: {e}")
    finally:
        db.close()
