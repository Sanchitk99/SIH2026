"""Small, defensive helpers for interpreting Roboflow workflow output."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any


_LABEL_HINTS = ("class", "label", "category", "type", "name", "predicted")
_CONFIDENCE_HINTS = ("confidence", "score", "probability", "prob")
_IGNORED_LABELS = {"image", "base64", "url", "unknown", "none"}


def extract_workflow_prediction(output: Mapping[str, Any]) -> tuple[str, float]:
    """Extract the best label/confidence pair without assuming output names."""

    candidates: list[tuple[str, float]] = []

    def visit(value: Any) -> None:
        if isinstance(value, Mapping):
            label: str | None = None
            confidence = 0.0
            for key, child in value.items():
                lowered = str(key).lower()
                if isinstance(child, str) and any(hint in lowered for hint in _LABEL_HINTS):
                    normalized = child.strip()
                    if normalized and normalized.lower() not in _IGNORED_LABELS:
                        label = normalized
                elif isinstance(child, (int, float)) and any(hint in lowered for hint in _CONFIDENCE_HINTS):
                    confidence = float(child)
                visit(child)
            if label:
                candidates.append((label, confidence if confidence <= 1 else confidence / 100))
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(output)
    if not candidates:
        return "Unknown", 0.0
    return max(candidates, key=lambda candidate: candidate[1])
