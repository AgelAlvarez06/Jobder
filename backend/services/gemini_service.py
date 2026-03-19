import google.generativeai as genai
from config.settings import GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL

genai.configure(api_key=GEMINI_API_KEY)


def generate_embedding(text: str) -> list[float]:
    try:
        response = genai.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            content=text
        )

        embedding = None

        if "embedding" in response:
            embedding = response["embedding"]

        elif "data" in response and "embedding" in response["data"]:
            embedding = response["data"]["embedding"]

        if embedding is None:
            raise ValueError("Unexpected embedding response format")

        if not isinstance(embedding, list):
            raise TypeError("Embedding is not a list")

        return [float(x) for x in embedding]

    except Exception as e:
        raise RuntimeError(
            f"Failed to generate embedding using model '{GEMINI_EMBEDDING_MODEL}': {e}"
        ) from e