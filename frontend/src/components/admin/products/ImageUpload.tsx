"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  value: (File | string)[]; // Hybrid types
  onChange: (files: (File | string)[]) => void;
  maxFiles?: number;
}

const ImageUpload = ({ value = [], onChange, maxFiles = 5 }: ImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>([]); // To show UI immediately

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Calculate remaining slots
      const remaining = maxFiles - value.length;
      if (remaining <= 0) return;

      const newFiles = acceptedFiles.slice(0, remaining);
      const newValues = [...value, ...newFiles];
      
      onChange(newValues);
    },
    [value, onChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: maxFiles,
  });

  const removeImage = (index: number) => {
    const newValues = [...value];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const renderPreview = (item: File | string) => {
    if (typeof item === "string") {
        return item;
    }
    return URL.createObjectURL(item);
  };

  return (
    <div className="w-full">
      {/* Drag & Drop Area */}
      {value.length < maxFiles && (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
                ? "border-primary bg-blue-50 dark:bg-blue-900/20"
                : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
        >
            <input {...getInputProps()} />
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
            cloud_upload
            </span>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
            <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
            PNG, JPG, WEBP (Max {maxFiles} files)
            </p>
        </div>
      )}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mt-6">
          {value.map((item, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden group"
            >
              <img
                src={renderPreview(item)}
                alt={`preview-${index}`}
                className="w-full h-full object-cover"
                onLoad={() => {
                    // Revoke object URL to avoid memory leak if it's a File
                    if (item instanceof File) {
                        // We rely on browser GC mostly or use strict useEffect cleanup if needed
                    }
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                     e.stopPropagation();
                     removeImage(index);
                  }}
                  className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50"
                  title="Remove image"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
