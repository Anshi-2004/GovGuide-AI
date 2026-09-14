import os
from typing import List
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

class DataProcessor:
    """Handles loading and processing of government documents"""
    
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def load_documents(self) -> List:
        """Load all text documents from the data directory"""
        print(f"Loading documents from {self.data_path}...")
        
        loader = DirectoryLoader(
            self.data_path,
            glob="**/*.txt",
            loader_cls=TextLoader,
            show_progress=True
        )
        
        documents = loader.load()
        print(f"Loaded {len(documents)} documents")
        
        return documents
    
    def split_documents(self, documents: List) -> List:
        """Split documents into smaller chunks for better retrieval"""
        print("Splitting documents into chunks...")
        
        chunks = self.text_splitter.split_documents(documents)
        print(f"Created {len(chunks)} chunks")
        
        return chunks
    
    def process(self) -> List:
        """Complete pipeline: load and split documents"""
        documents = self.load_documents()
        chunks = self.split_documents(documents)
        return chunks