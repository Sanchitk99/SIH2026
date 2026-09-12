from functools import lru_cache
from typing import Any

from core.config import settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Any:
    """Return the server-side Supabase client used for Storage uploads."""
    secret_key = settings.SUPABASE_SECRET_KEY or settings.SUPABASE_SERVICE_ROLE_KEY
    if not settings.SUPABASE_URL or not secret_key:
        raise RuntimeError(
            "Supabase is not configured. Set SUPABASE_URL and "
            "SUPABASE_SECRET_KEY in backend/.env."
        )

    try:
        from supabase import create_client
    except ImportError as exc:
        raise RuntimeError(
            "The supabase package is not installed. Run pip install -r requirements.txt."
        ) from exc

    return create_client(settings.SUPABASE_URL, secret_key)
