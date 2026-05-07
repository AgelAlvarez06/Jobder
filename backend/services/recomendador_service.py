"""Thin compatibility shim around chroma_service."""
from typing import List, Optional
from services.chroma_service import query_embedding


def search_similar(
    embedding: List[float],
    top_k: int = 20,
    id_prefix: Optional[str] = None,
    exclude_ids: Optional[List[str]] = None,
):
    return query_embedding(
        query_embedding=embedding,
        top_k=top_k,
        id_prefix=id_prefix,
        exclude_ids=exclude_ids,
    )
