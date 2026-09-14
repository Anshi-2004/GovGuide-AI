import os
import sys
from typing import List
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings


def _print(msg: str):
    """Print safely even on Windows cp1252 consoles (strips unencodable chars)."""
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode(sys.stdout.encoding or "ascii", errors="replace").decode(sys.stdout.encoding or "ascii"))


class EmbeddingsGenerator:
    """Generates and manages embeddings for document chunks using HuggingFace (FREE)."""

    def __init__(self):
        try:
            _print("[*] Initializing HuggingFace embeddings (first run may take 1-2 min)...")
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True},
            )
            self.vector_store = None
            _print("[OK] Embeddings generator initialized.")
        except Exception as exc:
            _print(f"[ERROR] Initializing embeddings: {exc}")
            raise

    def create_embeddings(self, chunks: List):
        """Create embeddings and store in FAISS vector database."""
        _print(f"[*] Creating embeddings for {len(chunks)} chunks...")
        try:
            self.vector_store = FAISS.from_documents(
                documents=chunks,
                embedding=self.embeddings,
            )
            _print("[OK] Embeddings created.")
            return self.vector_store
        except Exception as exc:
            _print(f"[ERROR] Creating embeddings: {exc}")
            raise

    def save_embeddings(self, path: str):
        """Save the vector store to disk."""
        if self.vector_store is None:
            raise ValueError("No embeddings to save — call create_embeddings() first.")
        try:
            os.makedirs(path, exist_ok=True)
            self.vector_store.save_local(path)
            _print(f"[OK] Embeddings saved to {path}")
        except Exception as exc:
            _print(f"[ERROR] Saving embeddings: {exc}")
            raise

    def load_embeddings(self, path: str):
        """Load existing embeddings from disk."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"No embeddings found at: {path}")
        try:
            self.vector_store = FAISS.load_local(
                path,
                self.embeddings,
                allow_dangerous_deserialization=True,
            )
            _print(f"[OK] Embeddings loaded from {path}")
            return self.vector_store
        except Exception as exc:
            _print(f"[ERROR] Loading embeddings: {exc}")
            raise