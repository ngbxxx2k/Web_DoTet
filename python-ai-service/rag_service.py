import os
import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter
from PyPDF2 import PdfReader
from docx import Document

import embedding_service
import qdrant_service
import groq_client
import database
from config import CHUNK_SIZE, CHUNK_OVERLAP, SIMILARITY_THRESHOLD, TOP_K

logger = logging.getLogger(__name__)


def read_file(file_path: str) -> str:
    """Đọc nội dung file (hỗ trợ .txt, .pdf, .docx)"""
    ext = os.path.splitext(file_path)[1].lower()
    logger.info(f"[RAG] Đọc file: {file_path}, extension: {ext}")

    try:
        if ext == ".txt":
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()

        elif ext == ".pdf":
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text

        elif ext in [".docx", ".doc"]:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text

        else:
            # Thử đọc như text file
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()

    except Exception as e:
        logger.error(f"[RAG] Lỗi đọc file {file_path}: {e}")
        raise


def chunk_text(text: str) -> list[str]:
    """Chia text thành các chunks nhỏ"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = splitter.split_text(text)
    logger.info(f"[RAG] Đã chia thành {len(chunks)} chunks (chunk_size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
    return chunks


def ingest_file(file_id: int, file_path: str, file_name: str):
    """
    Pipeline ingest file:
    1. Update status -> EMBEDDING
    2. Đọc file
    3. Chunking
    4. Embedding
    5. Lưu vào Qdrant
    6. Update status -> READY (hoặc ERROR)
    """
    try:
        # 1. Update status
        database.update_file_status(file_id, "EMBEDDING")
        logger.info(f"[RAG] Bắt đầu ingest file_id={file_id}, name={file_name}")

        # 2. Đọc file
        text = read_file(file_path)
        if not text.strip():
            raise ValueError("File rỗng hoặc không đọc được nội dung")
        logger.info(f"[RAG] Đọc file thành công, length={len(text)} chars")

        # 3. Chunking
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("Không tạo được chunk nào từ file")

        # 4. Embedding
        logger.info(f"[RAG] Bắt đầu embedding {len(chunks)} chunks...")
        vectors = embedding_service.embed_texts(chunks)
        logger.info(f"[RAG] Embedding thành công")

        # 5. Lưu vào Qdrant với metadata
        metadatas = []
        for chunk in chunks:
            metadatas.append({
                "file_id": file_id,
                "file_name": file_name,
                "text": chunk,
            })

        qdrant_service.upsert_vectors(vectors, metadatas)

        # 6. Update status -> READY
        database.update_file_status(file_id, "READY")
        logger.info(f"[RAG] Ingest hoàn tất cho file_id={file_id}, {len(chunks)} chunks")

    except Exception as e:
        logger.error(f"[RAG] Ingest thất bại cho file_id={file_id}: {e}")
        try:
            database.update_file_status(file_id, "ERROR")
        except Exception as db_err:
            logger.error(f"[RAG] Không thể update status ERROR: {db_err}")
        raise


def query(question: str) -> str:
    """
    Pipeline RAG query:
    1. Embed câu hỏi
    2. Vector search Top K
    3. Filter similarity >= threshold
    4. Build context
    5. Gọi Groq
    6. Trả answer
    """
    logger.info(f"[RAG] Query: {question}")

    # 1. Embed câu hỏi
    question_vector = embedding_service.embed_text(question)

    # 2. Vector search
    results = qdrant_service.search_vectors(question_vector, top_k=TOP_K)
    logger.info(f"[RAG] Tìm thấy {len(results)} kết quả từ Qdrant")

    # 3. Filter theo similarity threshold
    filtered_results = [r for r in results if r["score"] >= SIMILARITY_THRESHOLD]
    logger.info(
        f"[RAG] Sau filter (threshold={SIMILARITY_THRESHOLD}): {len(filtered_results)} kết quả"
    )

    # 4. Nếu không còn kết quả
    if not filtered_results:
        logger.info("[RAG] Không tìm thấy context phù hợp")
        return "Tôi không tìm thấy thông tin trong tài liệu."

    # 5. Build context
    context_parts = []
    for r in filtered_results:
        text = r["payload"].get("text", "")
        score = r["score"]
        context_parts.append(f"[Score: {score:.2f}] {text}")

    context = "\n\n".join(context_parts)
    logger.info(f"[RAG] Context length: {len(context)} chars từ {len(filtered_results)} chunks")

    # 6. Gọi Groq
    answer = groq_client.generate_answer(context, question)
    logger.info(f"[RAG] Answer generated, length={len(answer)}")

    return answer
