"use client";
import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Bạn có chắc chắn không?",
  message = "Hành động này không thể hoàn tác.",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div 
        className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl transform transition-all border border-slate-200 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center text-center gap-4">
          
          {/* Icon based on variant */}
          <div className={`p-3 rounded-full ${
            variant === "danger" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
            variant === "warning" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
            "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          }`}>
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
                {variant === "danger" ? "warning" : variant === "warning" ? "error" : "info"}
            </span>
          </div>

          <div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
               {title}
             </h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">
               {message}
             </p>
          </div>

          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 ${
                variant === "danger" ? "bg-red-600 hover:bg-red-700" :
                variant === "warning" ? "bg-amber-600 hover:bg-amber-700" :
                "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Đang xử lý..." : confirmText}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
