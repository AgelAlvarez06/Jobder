from services.gemini_service import generate_embedding
from services.chroma_service import search_embedding

def search_similar_jobs(text: str):
    embedding = generate_embedding(text)

    results = search_embedding(
        query_embedding=embedding,
        top_k=5
    )

    vacante_ids = [
        int(id.replace("vacante_", ""))
        for id in results["ids"]
        if id.startswith("vacante_")
    ]

    return {
        "ids": vacante_ids,
        "distances": results["distances"]
    }