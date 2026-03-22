from google import genai
from config.settings import GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL

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