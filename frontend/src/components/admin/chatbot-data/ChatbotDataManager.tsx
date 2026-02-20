"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  File,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Search,
  Filter,
  RefreshCw,
  HardDrive,
  FileStack,
  Files,
} from "lucide-react";
import FileViewModal from "./FileViewModal";
import {
  ChatbotService,
  ChatbotFileData,
  ChatbotStats,
} from "@/services/chatbot.service";
import { formatDateTimeVN } from "@/utils/format";

const ChatbotDataManager = () => {
  const [files, setFiles] = useState<ChatbotFileData[]>([]);
  const [stats, setStats] = useState<ChatbotStats>({
    totalFiles: 0,
    totalChunks: 0,
    qdrantSize: "N/A",
  });
  const [selectedFile, setSelectedFile] = useState<ChatbotFileData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch files từ API
  const fetchFiles = useCallback(async () => {
    try {
      const data = await ChatbotService.getFiles();
      setFiles(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách file:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await ChatbotService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Lỗi lấy stats:", error);
    }
  }, []);

  // Load lần đầu + auto refresh mỗi 5s nếu có file đang processing
  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, [fetchFiles, fetchStats]);

  useEffect(() => {
    const hasProcessing = files.some(
      (f) => f.status === "PROCESSING" || f.status === "EMBEDDING"
    );

    if (hasProcessing) {
      intervalRef.current = setInterval(() => {
        fetchFiles();
        fetchStats();
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [files, fetchFiles, fetchStats]);

  // Upload handler
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        setIsUploading(true);
        setUploadProgress(0);

        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 15, 90));
          }, 200);

          await ChatbotService.uploadFile(file);

          clearInterval(progressInterval);
          setUploadProgress(100);

          // Refresh danh sách
          await fetchFiles();
          await fetchStats();
        } catch (error) {
          console.error("Upload thất bại:", error);
          alert(`Upload thất bại: ${file.name}`);
        } finally {
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        }
      }
    },
    [fetchFiles, fetchStats]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Actions
  const handleViewFile = (file: ChatbotFileData) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleDeleteFile = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa file này không?")) return;

    try {
      await ChatbotService.deleteFile(id);
      await fetchFiles();
      await fetchStats();
    } catch (error) {
      console.error("Xóa file thất bại:", error);
      alert("Xóa file thất bại!");
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchFiles();
    await fetchStats();
    setIsLoading(false);
  };

  // Filter
  const filteredFiles = files.filter((f) =>
    f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    return formatDateTimeVN(dateStr);
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle size={12} className="mr-1" /> Sẵn sàng
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse">
            <Loader2 size={12} className="mr-1 animate-spin" /> Đang xử lý
          </span>
        );
      case "EMBEDDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <Loader2 size={12} className="mr-1 animate-spin" /> Đang nhúng vector
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertCircle size={12} className="mr-1" /> Lỗi
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-6 font-display">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Database size={24} />
          </span>
          Dữ Liệu Training Chatbot
        </h1>
        <p className="text-gray-500 mt-1 ml-12 text-sm">
          Quản lý tài liệu knowledge base cho chatbot (PDF, DOCX, TXT)
        </p>
      </div>

      {/* Stats Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Files size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tổng Tài Liệu</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <FileStack size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tổng Phân Đoạn</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalChunks}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dung Lượng Vector</p>
            <p className="text-2xl font-bold text-gray-900">{stats.qdrantSize}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Area */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UploadCloud size={20} className="text-blue-500" />
              Tải Lên Tài Liệu
            </h3>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 scale-[1.02]"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-3">
                  <UploadCloud size={32} />
                </div>
                {isDragActive ? (
                  <p className="font-medium text-blue-600">Thả file vào đây...</p>
                ) : (
                  <>
                    <p className="font-medium text-gray-700 mb-1">
                      Kéo thả hoặc click để chọn file
                    </p>
                    <p className="text-xs text-gray-400">
                      Hỗ trợ PDF, DOCX, TXT (Max 50MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Đang upload...</span>
                  <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Hướng dẫn
              </h4>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                <li>Tài liệu nên chứa thông tin rõ ràng, mạch lạc.</li>
                <li>Sử dụng định dạng tiêu chuẩn để chatbot dễ đọc.</li>
                <li>File có trạng thái &quot;Processing&quot; sẽ được nhúng vector tự động.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: File List */}
        <div className="lg:col-span-2">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                title="Bộ lọc"
              >
                <Filter size={18} />
              </button>
              <span className="text-sm text-gray-500">
                Tổng số:{" "}
                <span className="font-semibold text-gray-900">
                  {filteredFiles.length}
                </span>{" "}
                tài liệu
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
            {isLoading && files.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <span className="ml-3 text-gray-500">Đang tải...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tên Tài Liệu
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Kích Thước
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Ngày Tải
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFiles.length > 0 ? (
                      filteredFiles.map((file) => (
                        <tr
                          key={file.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                <File size={20} />
                              </div>
                              <div>
                                <div
                                  className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]"
                                  title={file.fileName}
                                >
                                  {file.fileName}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {file.fileName.split(".").pop()?.toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                            {formatFileSize(file.fileSize)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={file.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleViewFile(file)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                title="Xem chi tiết chunks"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                title="Xóa file"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <File size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-900">
                              Chưa có dữ liệu
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Hãy tải lên tài liệu đầu tiên của bạn.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <FileViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        file={selectedFile}
      />
    </div>
  );
};

export default ChatbotDataManager;
