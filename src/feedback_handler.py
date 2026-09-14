"""
GovGuide AI — Feedback Handler
Stores and retrieves user feedback on answers in a local JSON file.
"""

import json
import os
from datetime import datetime
from typing import Dict, List


class FeedbackHandler:
    """Persists user feedback (👍 / 👎) to a local JSON file."""

    def __init__(self, feedback_path: str = "data/feedback.json"):
        self.feedback_path = feedback_path
        # Ensure the parent directory exists
        parent_dir = os.path.dirname(feedback_path)
        if parent_dir:
            os.makedirs(parent_dir, exist_ok=True)

    # ── Write ──────────────────────────────────────────────────────────────────

    def save_feedback(
        self,
        question: str,
        answer: str,
        feedback_type: str,
        language: str = "English",
        state: str = None,
        category: str = None,
    ) -> bool:
        """
        Append a feedback record to the JSON file.

        Args:
            feedback_type: "helpful" or "not_helpful"
        Returns:
            True on success, False on failure.
        """
        entry = {
            "timestamp": datetime.now().isoformat(),
            "question": question[:500],
            "answer_preview": answer[:300],
            "feedback": feedback_type,
            "language": language,
            "state": state or "Not specified",
            "category": category or "Not specified",
        }

        try:
            records = self._load_raw()
            records.append(entry)
            with open(self.feedback_path, "w", encoding="utf-8") as f:
                json.dump(records, f, ensure_ascii=False, indent=2)
            return True
        except Exception as exc:
            print(f"[FeedbackHandler] Error saving feedback: {exc}")
            return False

    # ── Read ───────────────────────────────────────────────────────────────────

    def _load_raw(self) -> List[Dict]:
        """Return the raw list from the JSON file (empty list if file missing)."""
        if not os.path.exists(self.feedback_path):
            return []
        try:
            with open(self.feedback_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except (json.JSONDecodeError, IOError):
            return []

    def load_all_feedback(self) -> List[Dict]:
        """Public accessor for all feedback records."""
        return self._load_raw()

    # ── Stats ──────────────────────────────────────────────────────────────────

    def get_stats(self) -> Dict:
        """Return aggregate statistics about stored feedback."""
        records = self._load_raw()
        total = len(records)
        helpful = sum(1 for r in records if r.get("feedback") == "helpful")
        not_helpful = total - helpful
        helpful_pct = round((helpful / total * 100) if total > 0 else 0.0, 1)

        return {
            "total": total,
            "helpful": helpful,
            "not_helpful": not_helpful,
            "helpful_pct": helpful_pct,
        }
