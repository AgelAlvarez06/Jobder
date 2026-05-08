"""Shared Redis cache layer.

All operations are wrapped in try/except: Redis is treated as a soft dependency.
If Redis is unavailable or `REDIS_URL` is empty, every call becomes a no-op so
the request can fall through to the source of truth (Postgres + Chroma + Gemini).
"""
from __future__ import annotations

import hashlib
import json
import logging
from typing import Any, Optional

from config.settings import (
    CACHE_KEY_PREFIX,
    EMBEDDING_CACHE_TTL,
    FEED_CACHE_TTL,
    REDIS_URL,
    SWIPED_CACHE_TTL,
)

logger = logging.getLogger(__name__)

_client = None
_warned = False


def _get_client():
    """Lazily build a single Redis client. Returns None if disabled/unavailable."""
    global _client, _warned
    if _client is not None:
        return _client
    if not REDIS_URL:
        if not _warned:
            logger.info("[cache] REDIS_URL empty — cache disabled, bypassing Redis")
            _warned = True
        return None
    try:
        import redis  # type: ignore

        _client = redis.Redis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        # Force a connection check; on failure we degrade.
        _client.ping()
        logger.info("[cache] connected to Redis at %s", REDIS_URL)
        return _client
    except Exception as e:
        if not _warned:
            logger.warning("[cache] Redis unavailable (%s) — degrading to no-op", e)
            _warned = True
        _client = None
        return None


# ---------------------------------------------------------------------------
# Key builders. Always namespaced with `jobder:v1:` so we can flush on schema
# changes by bumping CACHE_KEY_PREFIX.
# ---------------------------------------------------------------------------

def _k(*parts: str) -> str:
    return ":".join((CACHE_KEY_PREFIX, *parts))


def embedding_key(model: str, text: str) -> str:
    digest = hashlib.sha256((text or "").encode("utf-8")).hexdigest()
    return _k("emb", model, digest)


def feed_candidato_key(candidato_id: int, top_k: int) -> str:
    return _k("feed", "cand", str(candidato_id), f"k{top_k}")


def feed_vacante_candidatos_key(vacante_id: int, top_k: int) -> str:
    return _k("feed", "vac", str(vacante_id), f"k{top_k}")


def swiped_set_key(actor_role: str, actor_id: int, vacante_id: Optional[int] = None) -> str:
    """`actor_role` ∈ {candidato, reclutador}. For recruiters we key per vacante."""
    if actor_role == "candidato":
        return _k("swiped", "cand", str(actor_id))
    return _k("swiped", "rec", str(actor_id), "vac", str(vacante_id))


def feed_candidato_prefix(candidato_id: int) -> str:
    return _k("feed", "cand", str(candidato_id)) + ":"


def feed_vacante_prefix(vacante_id: int) -> str:
    return _k("feed", "vac", str(vacante_id)) + ":"


# ---------------------------------------------------------------------------
# Primitive operations — all defensive.
# ---------------------------------------------------------------------------

def get_json(key: str) -> Optional[Any]:
    client = _get_client()
    if client is None:
        return None
    try:
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as e:
        logger.warning("[cache] GET %s failed: %s", key, e)
        return None


def set_json(key: str, value: Any, ttl: Optional[int] = None) -> None:
    client = _get_client()
    if client is None:
        return
    try:
        payload = json.dumps(value, separators=(",", ":"), default=str)
        if ttl and ttl > 0:
            client.set(key, payload, ex=ttl)
        else:
            client.set(key, payload)
    except Exception as e:
        logger.warning("[cache] SET %s failed: %s", key, e)


def delete(*keys: str) -> None:
    if not keys:
        return
    client = _get_client()
    if client is None:
        return
    try:
        client.delete(*keys)
    except Exception as e:
        logger.warning("[cache] DEL %s failed: %s", keys, e)


def delete_prefix(prefix: str) -> None:
    """SCAN + DEL by prefix. No-op if cache is disabled."""
    client = _get_client()
    if client is None:
        return
    try:
        match = f"{prefix}*"
        cursor = 0
        batch: list[str] = []
        while True:
            cursor, found = client.scan(cursor=cursor, match=match, count=200)
            batch.extend(found)
            if len(batch) >= 200:
                client.delete(*batch)
                batch = []
            if cursor == 0:
                break
        if batch:
            client.delete(*batch)
    except Exception as e:
        logger.warning("[cache] DEL_PREFIX %s failed: %s", prefix, e)


# ---------------------------------------------------------------------------
# Re-exported TTL constants (so callers don't need to import settings).
# ---------------------------------------------------------------------------
__all__ = [
    "embedding_key",
    "feed_candidato_key",
    "feed_vacante_candidatos_key",
    "swiped_set_key",
    "feed_candidato_prefix",
    "feed_vacante_prefix",
    "get_json",
    "set_json",
    "delete",
    "delete_prefix",
    "EMBEDDING_CACHE_TTL",
    "FEED_CACHE_TTL",
    "SWIPED_CACHE_TTL",
]
