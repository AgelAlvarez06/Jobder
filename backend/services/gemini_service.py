import logging

from google import genai
from config.settings import GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL
from services import cache_service

logger = logging.getLogger(__name__)

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_embedding(text: str) -> list[float]:
    try:
        response = client.models.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            contents=text
        )

        embedding = response.embeddings[0].values

        # Validación
        if not isinstance(embedding, list):
            raise TypeError("Embedding is not a list")

        return [float(x) for x in embedding]

    except Exception as e:
        raise RuntimeError(
            f"Failed to generate embedding using model '{GEMINI_EMBEDDING_MODEL}': {e}"
        ) from e


def get_or_generate_embedding(text: str) -> list[float]:
    """Embedding cache.

    Busca el embeding en redis, en caso de no hacerlo se le pide a google que lo genere 
    y guarde
    """
    key = cache_service.embedding_key(GEMINI_EMBEDDING_MODEL, text or "")
    cached = cache_service.get_json(key)
    if isinstance(cached, list) and cached:
        logger.debug("[cache] embedding HIT %s", key)
        return [float(x) for x in cached]
    logger.debug("[cache] embedding MISS %s", key)
    embedding = generate_embedding(text)
    cache_service.set_json(key, embedding, ttl=cache_service.EMBEDDING_CACHE_TTL)
    return embedding