import os
import sys
from dotenv import load_dotenv

load_dotenv()

def safe_print(msg: str):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode(sys.stdout.encoding or "ascii", errors="replace").decode(sys.stdout.encoding or "ascii"))

# Test 1: Check API key
api_key = os.getenv("OPENAI_API_KEY")
safe_print(f"API Key found: {bool(api_key)}")
safe_print(f"API Key (first 10 chars): {api_key[:10] if api_key else 'None'}...")

# Test 2: Try creating embeddings
try:
    from langchain_openai import OpenAIEmbeddings
    os.environ["OPENAI_API_KEY"] = api_key or ""
    embeddings = OpenAIEmbeddings()
    safe_print("[OK] OpenAIEmbeddings initialized successfully!")
    
    # Test embedding a simple text
    result = embeddings.embed_query("test")
    safe_print(f"[OK] Embedding successful! Vector length: {len(result)}")
    
except Exception as e:
    safe_print(f"[ERROR] {e}")