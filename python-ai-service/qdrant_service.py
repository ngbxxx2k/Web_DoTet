import logging
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from config import QDRANT_URL, COLLECTION_NAME, EMBEDDING_DIMENSION

logger = logging.getLogger(__name__)

# Singleton Qdrant client
_client = None


def _get_client() -> QdrantClient:
    """Lazy load Qdrant client"""
    global _client
    if _client is None:
        logger.info(f"[Qdrant] Kết nối đến: {QDRANT_URL}")
        _client = QdrantClient(url=QDRANT_URL)
        logger.info("[Qdrant] Kết nối thành công")
    return _client


def init_collection():
    """Tạo collection nếu chưa có"""
    client = _get_client()
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME not in collection_names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=EMBEDDING_DIMENSION,
                distance=Distance.COSINE
            ),
        )
        logger.info(f"[Qdrant] Đã tạo collection: {COLLECTION_NAME}")
    else:
        logger.info(f"[Qdrant] Collection đã tồn tại: {COLLECTION_NAME}")


def upsert_vectors(vectors: list[list[float]], metadatas: list[dict]):
    """Lưu vectors vào Qdrant với metadata"""
    client = _get_client()

    points = []
    for i, (vector, metadata) in enumerate(zip(vectors, metadatas)):
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload=metadata,
        )
        points.append(point)

    # Upsert theo batch 100
    batch_size = 100
    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=batch,
        )
        logger.info(f"[Qdrant] Đã upsert batch {i // batch_size + 1}, size={len(batch)}")

    logger.info(f"[Qdrant] Tổng cộng đã upsert {len(points)} vectors")


def search_vectors(query_vector: list[float], top_k: int = 5) -> list[dict]:
    """Tìm kiếm vectors gần nhất"""
    client = _get_client()

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,
    )

    search_results = []
    for result in results:
        search_results.append({
            "score": result.score,
            "payload": result.payload,
        })

    logger.info(f"[Qdrant] Tìm thấy {len(search_results)} kết quả")
    return search_results


def delete_by_file_id(file_id: int):
    """Xóa tất cả vectors có metadata file_id = file_id"""
    client = _get_client()

    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="file_id",
                    match=MatchValue(value=file_id),
                )
            ]
        ),
    )
    logger.info(f"[Qdrant] Đã xóa vectors cho file_id={file_id}")


def get_collection_info() -> dict:
    """Lấy thông tin collection (tổng vectors, dung lượng)"""
    client = _get_client()

    try:
        info = client.get_collection(COLLECTION_NAME)
        return {
            "totalChunks": info.points_count,
            "qdrantSize": f"{info.points_count} vectors",
            "status": info.status.value if info.status else "unknown",
        }
    except Exception as e:
        logger.error(f"[Qdrant] Lỗi lấy collection info: {e}")
        return {"totalChunks": 0, "qdrantSize": "N/A", "status": "error"}


def get_chunks_by_file_id(file_id: int) -> list[dict]:
    """Lấy tất cả chunks của 1 file từ Qdrant"""
    client = _get_client()

    results = client.scroll(
        collection_name=COLLECTION_NAME,
        scroll_filter=Filter(
            must=[
                FieldCondition(
                    key="file_id",
                    match=MatchValue(value=file_id),
                )
            ]
        ),
        limit=1000,
        with_payload=True,
    )

    chunks = []
    for point in results[0]:
        chunks.append({
            "id": str(point.id),
            "text": point.payload.get("text", ""),
            "file_name": point.payload.get("file_name", ""),
        })

    logger.info(f"[Qdrant] Lấy {len(chunks)} chunks cho file_id={file_id}")
    return chunks
