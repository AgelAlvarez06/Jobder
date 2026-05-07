"""Best-effort CV / job-description text extraction."""
from io import BytesIO
from typing import Optional


def extract_text(filename: str, content: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return _extract_pdf(content)
    # Plain-text fallback for .txt / .md / unknown
    try:
        return content.decode("utf-8", errors="ignore").strip()
    except Exception:
        return ""


def _extract_pdf(content: bytes) -> str:
    try:
        from pypdf import PdfReader
    except Exception:
        return ""
    try:
        reader = PdfReader(BytesIO(content))
        parts = []
        for page in reader.pages:
            try:
                parts.append(page.extract_text() or "")
            except Exception:
                continue
        return "\n".join(parts).strip()
    except Exception:
        return ""
