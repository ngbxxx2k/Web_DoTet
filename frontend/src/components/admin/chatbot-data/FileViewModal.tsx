"use client";

import { useState, useEffect } from "react";
import { X, FileText, Loader2, Hash, Layers, Settings } from "lucide-react";
import { ChatbotService, FileChunksData } from "@/services/chatbot.service";

interface FileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: number;
    fileName: string;
    status: string;
  } | null;
}

const FileViewModal = ({ isOpen, onClose, file }: FileViewModalProps) => {
  const [chunksData, setChunksData] = useState<FileChunksData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      setIsLoading(true);
      setError(null);
      setChunksData(null);

      ChatbotService.getFileChunks(file.id)
        .then((data) => {
          setChunksData(data);
        })
        .catch((err) => {
          setError(err.message || "Không thể tải chunks");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const fileExt = file.fileName.split(".").pop()?.toUpperCase() || "UNKNOWN";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{file.fileName}</h3>
              <p className="text-xs text-gray-500 uppercase">{fileExt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Bar */}
        {chunksData && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Hash size={14} className="text-gray-400" />
              <span className="text-gray-500">Tổng phân đoạn:</span>
              <span className="font-semibold text-gray-900">{chunksData.totalChunks}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Settings size={14} className="text-gray-400" />
              <span className="text-gray-500">Kích thước phân đoạn:</span>
              <span className="font-semibold text-gray-900">500</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Layers size={14} className="text-gray-400" />
              <span className="text-gray-500">Độ chồng lặp:</span>
              <span className="font-semibold text-gray-900">50</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
              <p className="text-gray-500">Đang tải chunks...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <p className="font-medium">{error}</p>
              <p className="text-sm text-gray-400 mt-1">
                File có thể chưa hoàn tất quá trình nhúng vector.
              </p>
            </div>
          ) : chunksData && chunksData.chunks.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Danh sách phân đoạn văn bản đã lập chỉ mục ({chunksData.totalChunks} phân đoạn)
              </h4>
              {chunksData.chunks.map((chunk, index) => (
                <div
                  key={chunk.id || index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Phân đoạn #{index + 1}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                    {chunk.text}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-gray-600">Chưa có phân đoạn nào</p>
              <p className="text-sm mt-1">
                File đang được xử lý hoặc chưa được nhúng vector.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileViewModal;
