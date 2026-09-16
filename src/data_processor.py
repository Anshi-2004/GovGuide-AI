import os
import json
from typing import List
from langchain_community.document_loaders import TextLoader, DirectoryLoader, PyPDFLoader
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter


class DataProcessor:
    """Handles loading and processing of government documents (TXT, JSON, PDF)."""

    def __init__(self, data_path: str):
        self.data_path = data_path
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def load_documents(self) -> List[Document]:
        """Load text, JSON, and PDF documents from data directory."""
        print(f"[DataProcessor] Loading documents from {self.data_path}...")
        documents: List[Document] = []

        if not os.path.exists(self.data_path):
            print(f"[DataProcessor] Warning: Path {self.data_path} does not exist.")
            return documents

        # 1. Load Text files
        try:
            txt_loader = DirectoryLoader(
                self.data_path,
                glob="**/*.txt",
                loader_cls=TextLoader,
                show_progress=False,
            )
            txt_docs = txt_loader.load()
            documents.extend(txt_docs)
            print(f"[DataProcessor] Loaded {len(txt_docs)} TXT documents.")
        except Exception as exc:
            print(f"[DataProcessor] Warning loading TXT files: {exc}")

        # 2. Load JSON files (e.g. schemes.json)
        for root, _, files in os.walk(self.data_path):
            for file in files:
                if file.endswith(".json"):
                    full_path = os.path.join(root, file)
                    try:
                        with open(full_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if isinstance(data, list):
                                for item in data:
                                    content = (
                                        f"Government Scheme: {item.get('name', 'N/A')}\n"
                                        f"Category: {item.get('category', 'General')}\n"
                                        f"State: {item.get('state', 'All India')}\n"
                                        f"Income Limit: {item.get('income_limit', 'N/A')}\n"
                                        f"Description: {item.get('description', '')}\n"
                                        f"Eligibility: {item.get('eligibility', '')}\n"
                                        f"Benefits: {item.get('benefits', '')}\n"
                                        f"Required Documents: {item.get('documents', '')}\n"
                                        f"Application Process: {item.get('process', '')}\n"
                                        f"Official URL: {item.get('url', '')}"
                                    )
                                    doc = Document(
                                        page_content=content,
                                        metadata={"source": full_path, "title": item.get("name", file)},
                                    )
                                    documents.append(doc)
                    except Exception as json_err:
                        print(f"[DataProcessor] Warning loading JSON {file}: {json_err}")

        # 3. Load PDF files
        for root, _, files in os.walk(self.data_path):
            for file in files:
                if file.endswith(".pdf"):
                    full_path = os.path.join(root, file)
                    try:
                        pdf_loader = PyPDFLoader(full_path)
                        pdf_docs = pdf_loader.load()
                        documents.extend(pdf_docs)
                        print(f"[DataProcessor] Loaded PDF {file}: {len(pdf_docs)} pages.")
                    except Exception as pdf_err:
                        print(f"[DataProcessor] Warning loading PDF {file}: {pdf_err}")

        print(f"[DataProcessor] Total loaded raw documents/records: {len(documents)}")
        return documents

    def split_documents(self, documents: List[Document]) -> List[Document]:
        """Split documents into smaller chunks for vector index retrieval."""
        print("[DataProcessor] Splitting documents into chunks...")
        chunks = self.text_splitter.split_documents(documents)
        print(f"[DataProcessor] Created {len(chunks)} chunks.")
        return chunks

    def process(self) -> List[Document]:
        """Complete ingestion pipeline: load and split documents."""
        documents = self.load_documents()
        chunks = self.split_documents(documents)
        return chunks