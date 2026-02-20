const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ChatbotFileData {
  id: number;
  fileName: string;
  fileSize: number;
  status: "PROCESSING" | "EMBEDDING" | "READY" | "ERROR";
  createdAt: string;
}

export interface ChatbotStats {
  totalFiles: number;
  totalChunks: number;
  qdrantSize: string;
}

export interface FileChunksData {
  fileId: number;
  totalChunks: number;
  chunks: {
    id: string;
    text: string;
    file_name: string;
  }[];
}

export interface ChatAnswer {
  answer: string;
}

export const ChatbotService = {
  /**
   * Upload file cho chatbot RAG
   */
  async uploadFile(file: File): Promise<ChatbotFileData> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/data/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Upload thất bại" }));
      throw new Error(error.message || "Upload thất bại");
    }
    return res.json();
  },

  /**
   * Lấy danh sách file
   */
  async getFiles(): Promise<ChatbotFileData[]> {
    const res = await fetch(`${API_URL}/data/files`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể lấy danh sách file");
    return res.json();
  },

  /**
   * Xóa file
   */
  async deleteFile(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/data/files/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Xóa file thất bại");
  },

  /**
   * Lấy stats (tổng file, chunks, dung lượng Qdrant)
   */
  async getStats(): Promise<ChatbotStats> {
    const res = await fetch(`${API_URL}/data/stats`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể lấy stats");
    return res.json();
  },

  /**
   * Lấy chi tiết chunks của 1 file
   */
  async getFileChunks(fileId: number): Promise<FileChunksData> {
    const res = await fetch(`${API_URL}/data/files/${fileId}/chunks`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Không thể lấy chunks");
    return res.json();
  },

  /**
   * Gửi câu hỏi cho chatbot
   */
  async askQuestion(question: string): Promise<ChatAnswer> {
    const res = await fetch(`${API_URL}/chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Không thể gửi câu hỏi");
    return res.json();
  },
};
