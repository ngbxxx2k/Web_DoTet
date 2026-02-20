import logging
from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL

logger = logging.getLogger(__name__)

# Singleton: load model 1 lần duy nhất
_model = None


def _get_model() -> SentenceTransformer:
    """Lazy load model sentence-transformers"""
    global _model
    if _model is None:
        logger.info(f"[Embedding] Đang tải model: {EMBEDDING_MODEL}")
        _model = SentenceTransformer(EMBEDDING_MODEL)
        logger.info(f"[Embedding] Model đã tải thành công: {EMBEDDING_MODEL}")
    return _model


def embed_text(text: str) -> list[float]:
    """Embedding 1 đoạn text, trả về vector"""
    model = _get_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embedding nhiều đoạn text cùng lúc (batch)"""
    model = _get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    return embeddings.tolist()
