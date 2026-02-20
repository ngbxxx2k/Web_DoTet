import logging
import httpx
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger(__name__)


def _get_client() -> Groq:
    """Tạo Groq client mới"""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY chưa được cấu hình!")
    client = Groq(
        api_key=GROQ_API_KEY,
        http_client=httpx.Client(),
    )
    logger.info("[Groq] Client đã khởi tạo")
    return client


# Prompt template bắt buộc — không cho phép hallucinate
PROMPT_TEMPLATE = """Bạn là một trợ lý ảo hữu ích, hãy luôn trả lời bằng tiếng Việt lịch sự.

Nhiệm vụ của bạn là trả lời câu hỏi dựa trên thông tin được cung cấp trong ngữ cảnh (Context) bên dưới.
1. Hãy trả lời bằng tiếng Việt, văn phong lịch sự, thân thiện.
2. Chỉ sử dụng thông tin từ Context. Tuyệt đối KHÔNG tự bịa ra thông tin.
3. Nếu không tìm thấy câu trả lời trong Context, hãy đáp: "Hiện tại em chưa tìm thấy thông tin này trong tài liệu. Anh/chị có thể liên hệ hotline để được hỗ trợ thêm ạ."

Ngữ cảnh (Context):
{context}

Câu hỏi:
{question}

Câu trả lời:"""


def generate_answer(context: str, question: str) -> str:
    """Gửi prompt đến Groq API và nhận câu trả lời"""
    client = _get_client()
    prompt = PROMPT_TEMPLATE.format(context=context, question=question)

    logger.info(f"[Groq] Gửi prompt, model={GROQ_MODEL}")
    logger.debug(f"[Groq] Context length: {len(context)} chars")

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0,  # Chính xác, không creative
            max_tokens=1024,
        )

        answer = response.choices[0].message.content.strip()
        logger.info(f"[Groq] Nhận response thành công, length={len(answer)}")
        return answer

    except Exception as e:
        logger.error(f"[Groq] Lỗi gọi API: {e}")
        raise
