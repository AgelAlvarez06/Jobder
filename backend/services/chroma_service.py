import chromadb
from chromadb.config import Settings

client = None
collection = None


def get_client():
    global client

    if client is None:
        client = chromadb.Client(
            Settings(
                persist_directory="./chroma_db"
            )
        )
    return client


def get_collection():
    global collection

    if collection is None:
        client = get_client()
        collection = client.get_or_create_collection(
            name="jobder_collection",
            metadata={"hnsw:space": "cosine"}
        )

    return collection


def add_embedding(id: str, embedding: list, document: str):
    collection = get_collection()

    collection.add(
        ids=[id],
        embeddings=[embedding],
        documents=[document],
        metadatas=[{"source": id}]
    )

def search_embedding(query_embedding: list, top_k: int = 5):
    collection = get_collection()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return {
        "ids": results["ids"][0],
        "documents": results["documents"][0],
        "distances": results["distances"][0]
    }