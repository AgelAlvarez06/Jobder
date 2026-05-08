import chromadb
from typing import Optional, List

from config.settings import CHROMA_PERSIST_DIR

_client = None
_collection = None
COLLECTION_NAME = "jobder_collection"


def get_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    return _client


def get_collection():
    global _collection
    if _collection is None:
        _collection = get_client().get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection

def get_embedding_by_id(id: str) -> Optional[list]:
    """Return the stored embedding for `id`, or None if absent/error."""
    try:
        col = get_collection()
        res = col.get(ids=[id], include=["embeddings"])
        embs = res.get("embeddings") if res else None
        if not embs:
            return None
        first = embs[0]
        if first is None:
            return None
        return [float(x) for x in first]
    except Exception:
        return None
    
def upsert_embedding(id: str, embedding: list, document: str, metadata: Optional[dict] = None):
    col = get_collection()
    col.upsert(
        ids=[id],
        embeddings=[embedding],
        documents=[document],
        metadatas=[metadata or {"source": id}],
    )


def delete_embedding(id: str):
    col = get_collection()
    try:
        col.delete(ids=[id])
    except Exception:
        pass


def query_embedding(
    query_embedding: list,
    top_k: int = 20,
    id_prefix: Optional[str] = None,
    exclude_ids: Optional[List[str]] = None,
):
    col = get_collection()
    where = None
    # Use Chroma where filter on ids if needed; simpler: post-filter.
    n_request = top_k
    if exclude_ids:
        n_request = top_k + len(exclude_ids)
    n_request = min(max(n_request, top_k), 200)

    results = col.query(
        query_embeddings=[query_embedding],
        n_results=n_request,
    )

    ids = results["ids"][0] if results.get("ids") else []
    distances = results["distances"][0] if results.get("distances") else []
    documents = results["documents"][0] if results.get("documents") else []

    out_ids, out_distances, out_documents = [], [], []
    exclude_set = set(exclude_ids or [])
    for i, cid in enumerate(ids):
        if id_prefix and not cid.startswith(id_prefix):
            continue
        if cid in exclude_set:
            continue
        out_ids.append(cid)
        out_distances.append(distances[i])
        out_documents.append(documents[i])
        if len(out_ids) >= top_k:
            break

    return {"ids": out_ids, "distances": out_distances, "documents": out_documents}
