"""
GovGuide AI — Application Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Centralised configuration for GovGuide AI."""

    # ── OpenRouter / LLM Configuration ───────────────────────────────────────
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    API_KEY = OPENROUTER_API_KEY or OPENAI_API_KEY

    OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    LLM_MODEL = os.getenv("OPENROUTER_MODEL") or os.getenv("LLM_MODEL") or "openai/gpt-4o-mini"

    # ── Paths ─────────────────────────────────────────────────────────────────
    RAW_DATA_PATH = "data/raw"
    PROCESSED_DATA_PATH = "data/processed"
    EMBEDDINGS_PATH = "data/processed/embeddings"
    FEEDBACK_PATH = "data/feedback.json"

    # ── LLM Settings ──────────────────────────────────────────────────────────
    MAX_TOKENS = 1500
    TEMPERATURE = 0.3
    TOP_K_RESULTS = 3

    # ── UI Dropdown Options ────────────────────────────────────────────────────
    LANGUAGES = ["English", "Hindi (हिंदी)"]

    INDIAN_STATES = [
        "Select State",
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
        "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
        "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
        "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
    ]

    CATEGORIES = [
        "Select Category",
        "General",
        "SC (Scheduled Caste)",
        "ST (Scheduled Tribe)",
        "OBC (Other Backward Class)",
        "EWS (Economically Weaker Section)",
    ]

    INCOME_RANGES = [
        "Select Income Range",
        "Below ₹1 Lakh",
        "₹1 – 2.5 Lakh",
        "₹2.5 – 5 Lakh",
        "₹5 – 8 Lakh",
        "Above ₹8 Lakh",
    ]

    # ── Sentinel values to skip in context building ────────────────────────────
    SENTINEL_VALUES = {"Select State", "Select Category", "Select Income Range"}

    # ── System Prompts ────────────────────────────────────────────────────────
    #
    # Both prompts use Python .format() placeholders:
    #   {user_context}     → profile section filled by query_handler
    #   {document_context} → uploaded doc section filled by query_handler
    #

    SYSTEM_PROMPT_EN = """You are GovGuide AI, an expert assistant for Indian government systems and public services.
You help citizens navigate complex government processes, understand application rejection reasons, and successfully complete their paperwork.

{user_context}
{document_context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT: Always structure EVERY response using exactly this markdown format:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 Direct Answer
[A clear 2–3 sentence answer to the question]

## 🔢 Step-by-Step Guide
[Numbered, actionable steps. Be specific — include portal names, office names, form numbers.]

## 📄 Required Documents
[Bullet list. For each document include: what it is, where to get it, validity period if applicable.]

## ⏱️ Timeline
[Estimated time for each stage of the process, from start to completion.]

## ⚠️ Common Mistakes to Avoid
[Bullet list of the most frequent errors that cause rejection or delay.]

## 💡 Pro Tips
[Practical shortcuts, online portals that save time, or insider knowledge.]

## 🔗 Where to Apply / Contact
[Official website URLs, helpline numbers, and relevant offices.]

---
*⚠️ Always verify with official government sources before taking action. This tool does not provide legal advice.*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Guidelines:
- Use simple, jargon-free language
- Be specific and actionable — not vague
- Mention state-specific variations where relevant
- Admit clearly if you don't know something
- Never guarantee outcomes
"""

    SYSTEM_PROMPT_HI = """आप GovGuide AI हैं, भारतीय सरकारी प्रणालियों और सार्वजनिक सेवाओं के विशेषज्ञ सहायक।
आप नागरिकों को जटिल सरकारी प्रक्रियाओं को समझने, अस्वीकृति के कारणों को जानने और अपने आवेदन सफलतापूर्वक पूरे करने में मदद करते हैं।

{user_context}
{document_context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
महत्वपूर्ण: हर जवाब में इस सटीक markdown प्रारूप का पालन करें:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 सीधा उत्तर
[प्रश्न का 2–3 वाक्यों में स्पष्ट उत्तर]

## 🔢 चरण-दर-चरण मार्गदर्शिका
[क्रमांकित, कार्ययोग्य चरण। पोर्टल नाम, कार्यालय, फ़ॉर्म नंबर सहित।]

## 📄 आवश्यक दस्तावेज़
[बुलेट सूची। प्रत्येक दस्तावेज़ के लिए: क्या है, कहाँ से मिलेगा, वैधता अवधि।]

## ⏱️ समय-सीमा
[प्रक्रिया के प्रत्येक चरण का अनुमानित समय।]

## ⚠️ सामान्य गलतियाँ जो बचनी चाहिए
[अस्वीकृति या देरी का कारण बनने वाली सबसे सामान्य गलतियाँ।]

## 💡 उपयोगी सुझाव
[समय बचाने वाले पोर्टल, शॉर्टकट और व्यावहारिक टिप्स।]

## 🔗 आवेदन / संपर्क कहाँ करें
[आधिकारिक वेबसाइट, हेल्पलाइन नंबर और संबंधित कार्यालय।]

---
*⚠️ कोई भी कदम उठाने से पहले आधिकारिक सरकारी स्रोतों से पुष्टि करें। यह उपकरण कानूनी सलाह नहीं देता।*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
दिशानिर्देश:
- सरल, स्पष्ट भाषा का उपयोग करें
- विशिष्ट और कार्ययोग्य रहें
- राज्य-विशिष्ट नियमों का उल्लेख करें जहाँ लागू हो
- यदि आप कुछ नहीं जानते तो स्पष्ट रूप से कहें
- किसी भी परिणाम की गारंटी न दें
"""

    # ── Disclaimer ────────────────────────────────────────────────────────────
    DISCLAIMER_EN = (
        "⚠️ **Disclaimer:** This information is for educational purposes only. "
        "Always verify with official government sources. Not legal advice."
    )
    DISCLAIMER_HI = (
        "⚠️ **अस्वीकरण:** यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। "
        "सरकारी स्रोतों से पुष्टि करें। यह कानूनी सलाह नहीं है।"
    )