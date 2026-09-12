"""
GovGuide AI - Setup Script
Run this once to create the FAISS vector-store embeddings from the
documents in data/raw/.  Embeddings use a FREE HuggingFace model -
no OpenAI API key is required for setup.
"""

import os
from src.config import Config
from src.data_processor import DataProcessor
from src.embeddings_generator import EmbeddingsGenerator


def setup_application():
    print("=" * 55)
    print("  GovGuide AI - Setup Script")
    print("=" * 55)

    # Warn if OpenAI key is missing (needed to run the app, not setup)
    if not Config.OPENAI_API_KEY:
        print(
            "\n[NOTE] OPENAI_API_KEY is not set in your .env file.\n"
            "   Embeddings will still be created (they use a free HuggingFace model),\n"
            "   but you will need the API key to run the app (app.py).\n"
        )

    # Step 1 - process raw documents
    print("\n[Step 1] Processing documents...")
    processor = DataProcessor(Config.RAW_DATA_PATH)
    chunks = processor.process()

    if not chunks:
        print("[ERROR] No documents found in data/raw/. Add .txt files and re-run.")
        return

    # Step 2 - create embeddings
    print(f"\n[Step 2] Creating embeddings for {len(chunks)} chunks...")
    gen = EmbeddingsGenerator()
    gen.create_embeddings(chunks)

    # Step 3 - save to disk
    print("\n[Step 3] Saving embeddings...")
    gen.save_embeddings(Config.EMBEDDINGS_PATH)

    print("\n[OK] Setup complete!")
    print("\nRun the app with:")
    print("   streamlit run app.py\n")


if __name__ == "__main__":
    setup_application()