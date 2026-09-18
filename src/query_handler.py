"""
GovGuide AI — Query Handler
RAG-based question answering with language, user profile, and
uploaded document support. Includes structured error handling.
"""

import os
from typing import Dict, List, Optional

from langchain_openai import ChatOpenAI
from src.config import Config

# Safe import for LangChain message types (handles both old and new versions)
try:
    from langchain_core.messages import HumanMessage, SystemMessage
except ImportError:
    from langchain.schema import HumanMessage, SystemMessage  # type: ignore


class QueryHandler:
    """Retrieval-Augmented Generation (RAG) query processor."""

    def __init__(self, vector_store):
        self.vector_store = vector_store
        self._llm_available = False
        self._init_error = None

        api_key = Config.API_KEY
        if not api_key:
            self._init_error = "OPENROUTER_API_KEY (or OPENAI_API_KEY) is not set in .env file."
            print(f"[QueryHandler] Warning: {self._init_error}")
        else:
            try:
                # Configure OpenRouter / OpenAI compatible client
                kwargs = {
                    "temperature": Config.TEMPERATURE,
                    "model_name": Config.LLM_MODEL,
                    "api_key": api_key,
                    "max_tokens": Config.MAX_TOKENS,
                }
                
                # If using OpenRouter or base URL configured
                if Config.OPENROUTER_API_KEY or "openrouter" in (Config.OPENROUTER_BASE_URL or "").lower() or api_key.startswith("sk-or-"):
                    kwargs["base_url"] = Config.OPENROUTER_BASE_URL
                    kwargs["default_headers"] = {
                        "HTTP-Referer": "https://github.com/GovGuide-AI",
                        "X-Title": "GovGuide AI",
                    }

                self.llm = ChatOpenAI(**kwargs)
                self._llm_available = True
                print(f"[QueryHandler] LLM initialized successfully with model: {Config.LLM_MODEL}")
            except Exception as exc:
                self._init_error = str(exc)
                print(f"[QueryHandler] LLM init failed: {exc}")

        self.retriever = vector_store.as_retriever(
            search_kwargs={"k": Config.TOP_K_RESULTS}
        )

    # ── Context helpers ───────────────────────────────────────────────────────

    def _user_context_block(self, user_context: Optional[Dict]) -> str:
        if not user_context:
            return ""
        parts: List[str] = []
        sentinels = Config.SENTINEL_VALUES
        if user_context.get("state", "") not in sentinels | {""}:
            parts.append(f"- State: {user_context['state']}")
        if user_context.get("category", "") not in sentinels | {""}:
            parts.append(f"- Category: {user_context['category']}")
        if user_context.get("income", "") not in sentinels | {""}:
            parts.append(f"- Annual Family Income: {user_context['income']}")
        if not parts:
            return ""
        return (
            "**User Profile** (tailor your answer to this profile):\n"
            + "\n".join(parts) + "\n"
        )

    def _document_context_block(self, document_text: Optional[str], is_hindi: bool) -> str:
        if not document_text:
            return ""
        truncated = document_text[:3000]
        if is_hindi:
            return (
                "\n**अपलोड किया गया दस्तावेज़** — इसका विश्लेषण करें:\n"
                f"```\n{truncated}\n```\n"
            )
        return (
            "\n**Uploaded Document** — Analyse this for issues, missing items, or "
            "rejection reasons and provide corrective steps:\n"
            f"```\n{truncated}\n```\n"
        )

    def _build_prompt(self, question, context, document_text, user_context, language):
        is_hindi = "Hindi" in language
        base = Config.SYSTEM_PROMPT_HI if is_hindi else Config.SYSTEM_PROMPT_EN
        system_prompt = base.format(
            user_context=self._user_context_block(user_context),
            document_context=self._document_context_block(document_text, is_hindi),
        )
        return (
            f"{system_prompt}\n\n"
            "---\nKnowledge Base Context:\n"
            f"{context}\n\n"
            f"---\nUser Question: {question}\n\n"
            "Structured Answer:"
        )

    @staticmethod
    def _format_sources(source_docs) -> List[Dict]:
        sources, seen = [], set()
        for doc in source_docs:
            raw = doc.metadata.get("source", "Knowledge Base")
            name = (
                os.path.basename(raw)
                .replace("_", " ").replace(".txt", "").strip().title()
            )
            if name in seen:
                continue
            seen.add(name)
            snippet = doc.page_content[:220].strip()
            if len(doc.page_content) > 220:
                snippet += "…"
            sources.append({"name": name, "snippet": snippet})
        return sources

    # ── Public API ────────────────────────────────────────────────────────────

    def get_answer(
        self,
        question: str,
        document_text: Optional[str] = None,
        user_context: Optional[Dict] = None,
        language: str = "English",
    ) -> Dict:
        """Answer a question using RAG. Always returns a valid dict."""
        if not self._llm_available:
            msg = self._init_error or "LLM unavailable."
            if "api_key" in msg.lower() or "not set" in msg.lower():
                return self._fallback(
                    "🔑 **API Key Missing**: Please add your `OPENROUTER_API_KEY` to the `.env` file "
                    "and restart the app. You can get a free key at [OpenRouter Keys](https://openrouter.ai/keys)."
                )
            return self._fallback(f"⚠️ **LLM Unavailable**: {msg}")

        try:
            # Retrieve relevant knowledge chunks
            try:
                source_docs = self.retriever.invoke(question)
            except AttributeError:
                source_docs = self.retriever.get_relevant_documents(question)  # type: ignore

            context = "\n\n".join(d.page_content for d in source_docs)
            full_prompt = self._build_prompt(
                question, context, document_text, user_context, language
            )

            messages = [
                SystemMessage(
                    content="You are GovGuide AI. Follow the structured format exactly as instructed."
                ),
                HumanMessage(content=full_prompt),
            ]

            response = self.llm.invoke(messages)

            return {
                "success": True,
                "answer": response.content,
                "sources": self._format_sources(source_docs),
                "has_document": document_text is not None,
            }

        except Exception as exc:
            return self._handle_error(exc)

    # Alias for API compatibility
    answer_question = get_answer

    # ── Error handling ────────────────────────────────────────────────────────

    def _handle_error(self, exc: Exception) -> Dict:
        exc_str = str(exc).lower()

        try:
            import openai as _oa
            if isinstance(exc, _oa.AuthenticationError):
                return self._fallback(
                    "🔑 **Authentication Error**: Your OpenRouter API key is invalid or expired. "
                    "Please check `OPENROUTER_API_KEY` in your `.env` file."
                )
            if isinstance(exc, _oa.RateLimitError):
                if any(k in exc_str for k in ("quota", "credit", "billing", "insufficient_quota", "exhausted")):
                    return self._fallback(
                        "💳 **Quota Exceeded / Credit Balance Exhausted**: Your OpenRouter account has no remaining credits. "
                        "Please add credits at [OpenRouter Account](https://openrouter.ai/credits) or switch to a free model (e.g. `meta-llama/llama-3.3-70b-instruct:free`)."
                    )
                return self._fallback(
                    "⏳ **Rate Limit**: Rate limit reached for this model. Please wait a minute or try another model in `.env`."
                )
            if isinstance(exc, _oa.APIConnectionError):
                return self._fallback(
                    "🌐 **Connection Error**: Cannot reach OpenRouter. Check your internet connection."
                )
        except ImportError:
            pass

        if any(k in exc_str for k in ("quota", "credit", "billing", "insufficient_quota", "exhausted")):
            return self._fallback(
                "💳 **Quota Exceeded / Credit Balance Exhausted**: Your OpenRouter account has no remaining credits. "
                "Please add credits at [OpenRouter Account](https://openrouter.ai/credits) or switch to a free model in `.env`."
            )
        if any(k in exc_str for k in ("api_key", "authentication", "unauthorized", "incorrect api key")):
            return self._fallback(
                "🔑 **API Key Error**: Your API key appears invalid. "
                "Check `OPENROUTER_API_KEY` in `.env` and restart the app."
            )
        if any(k in exc_str for k in ("connection", "network", "timeout")):
            return self._fallback("🌐 **Network Error**: Check your internet and try again.")
        if any(k in exc_str for k in ("rate", "quota")):
            return self._fallback("⏳ **Rate Limit**: Please wait a minute and try again.")

        return self._fallback(
            f"⚠️ **Error** ({type(exc).__name__}): {str(exc)[:300]}"
        )

    def _fallback(self, error_message: str) -> Dict:
        answer = f"""## ⚠️ Service Notice

{error_message}

## 💡 Official Resources (Available Now)

| Service | Portal |
|---|---|
| 🎓 Scholarships | [scholarships.gov.in](https://scholarships.gov.in) |
| 🆔 Aadhaar / UIDAI | [uidai.gov.in](https://uidai.gov.in) |
| 📜 RTI Online | [rtionline.gov.in](https://rtionline.gov.in) |
| 📋 DigiLocker | [digilocker.gov.in](https://digilocker.gov.in) |
| 🏛️ India Portal | [india.gov.in](https://india.gov.in) |

**Helplines:** Aadhaar: **1947** · Scholarships: **0120-6619540** · RTI: **1800-11-81-81**
"""
        return {
            "success": False,
            "error": error_message,
            "answer": answer,
            "sources": [],
            "has_document": False,
        }