import logging
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import qdrant_service
import rag_service

# ==================== Logging ====================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ==================== Lifespan ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Khởi tạo khi start, cleanup khi shutdown"""
    logger.info("=== Python AI Service đang khởi động ===")
    # Init Qdrant collection
    qdrant_service.init_collection()
    logger.info("=== Python AI Service đã sẵn sàng ===")
    yield
    logger.info("=== Python AI Service đang tắt ===")


# ==================== FastAPI App ====================
app = FastAPI(
    title="RAG Chatbot - Python AI Service",
    description="Service xử lý RAG: Chunking, Embedding, Vector Search, Groq LLM",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Request/Response Models ====================
class IngestRequest(BaseModel):
    fileId: int
    filePath: str
    fileName: str


class QueryRequest(BaseModel):
    question: str


class DeleteVectorsRequest(BaseModel):
    fileId: int


class QueryResponse(BaseModel):
    answer: str


# ==================== Routes ====================

@app.post("/ingest")
async def ingest(request: IngestRequest, background_tasks: BackgroundTasks):
    """
    Nhận file info từ Spring Boot, chạy ingest ở background.
    Không block request.
    """
    logger.info(f"[API] POST /ingest - fileId={request.fileId}, fileName={request.fileName}")

    # Chạy background task
    background_tasks.add_task(
        rag_service.ingest_file,
        request.fileId,
        request.filePath,
        request.fileName,
    )

    return {"message": f"Đang xử lý file: {request.fileName}", "fileId": request.fileId}


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Nhận câu hỏi, thực hiện RAG pipeline, trả câu trả lời.
    """
    logger.info(f"[API] POST /query - question: {request.question}")

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập câu hỏi.")

    try:
        answer = rag_service.query(request.question)
        return QueryResponse(answer=answer)
    except Exception as e:
        return QueryResponse(answer="Hệ thống đang bận xử lý, anh/chị vui lòng thử lại sau ít phút nhé.")


@app.post("/delete-vectors")
async def delete_vectors(request: DeleteVectorsRequest):
    """
    Xóa tất cả vectors của 1 file theo file_id.
    """
    logger.info(f"[API] POST /delete-vectors - fileId={request.fileId}")

    try:
        qdrant_service.delete_by_file_id(request.fileId)
        return {"message": f"Đã xóa vectors cho fileId={request.fileId}"}
    except Exception as e:
        logger.error(f"[API] Lỗi delete vectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def get_stats():
    """
    Lấy thông tin stats: tổng chunks, dung lượng Qdrant.
    """
    logger.info("[API] GET /stats")

    try:
        info = qdrant_service.get_collection_info()
        return info
    except Exception as e:
        logger.error(f"[API] Lỗi lấy stats: {e}")
        return {"totalChunks": 0, "qdrantSize": "N/A"}


@app.get("/chunks/{file_id}")
async def get_chunks(file_id: int):
    """
    Lấy danh sách chunks của 1 file.
    """
    logger.info(f"[API] GET /chunks/{file_id}")

    try:
        chunks = qdrant_service.get_chunks_by_file_id(file_id)
        return {
            "fileId": file_id,
            "totalChunks": len(chunks),
            "chunks": chunks,
        }
    except Exception as e:
        logger.error(f"[API] Lỗi lấy chunks: {e}")
        return {"fileId": file_id, "totalChunks": 0, "chunks": []}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "python-ai-service"}


# ==================== Run ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
