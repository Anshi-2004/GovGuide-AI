import os
import sys
from dotenv import load_dotenv

load_dotenv()

def safe_print(msg: str):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode(sys.stdout.encoding or "ascii", errors="replace").decode(sys.stdout.encoding or "ascii"))

# Test 1: Check OpenRouter API key
api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
model_name = os.getenv("OPENROUTER_MODEL") or os.getenv("LLM_MODEL") or "openai/gpt-4o-mini"
base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

safe_print("=== OpenRouter Diagnostics ===")
safe_print(f"API Key found: {bool(api_key)}")
safe_print(f"API Key (first 10 chars): {api_key[:10] if api_key else 'None'}...")
safe_print(f"Model: {model_name}")
safe_print(f"Base URL: {base_url}")

if not api_key or api_key == "your_openrouter_api_key_here":
    safe_print("[!] Please add your OPENROUTER_API_KEY to the .env file.")
    sys.exit(1)

# Test 2: Try Chat completion via OpenRouter
try:
    from langchain_openai import ChatOpenAI
    
    llm = ChatOpenAI(
        api_key=api_key,
        base_url=base_url,
        model_name=model_name,
        temperature=0.3,
        max_tokens=100,
        default_headers={
            "HTTP-Referer": "https://github.com/GovGuide-AI",
            "X-Title": "GovGuide AI",
        }
    )
    safe_print("[*] Contacting OpenRouter...")
    response = llm.invoke("Hello! Confirm you are working by replying 'GovGuide AI online'.")
    safe_print(f"[OK] OpenRouter response: {response.content}")
    
except Exception as e:
    safe_print(f"[ERROR] OpenRouter test failed: {e}")
