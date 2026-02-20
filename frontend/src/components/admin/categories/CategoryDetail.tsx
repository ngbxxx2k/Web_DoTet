"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Category, CategoryFormInput } from "@/types/category";
import { CategoryService } from "@/services/category.service"; // Use backend service
import ConfirmModal from "@/components/Common/ConfirmModal"; // Import custom modal
import toast from "react-hot-toast";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

interface CategoryDetailProps {
  selectedCategory?: Category;
  categories: Category[];
  onSave: (data: CategoryFormInput) => void;
  onDelete: (id: number) => void;
}

export default function CategoryDetail({
  selectedCategory,
  categories,
  onSave,
  onDelete,
}: CategoryDetailProps) {
  const isEditMode = !!selectedCategory;
  const [uploading, setUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal state

  // Flatten categories for Parent Selector
  const flattenCategories = (nodes: Category[], depth = 0): {id: number, title: string, level: number}[] => {
      let result: {id: number, title: string, level: number}[] = [];
      nodes.forEach(node => {
          result.push({ id: node.id, title: node.title, level: depth });
          if(node.children) {
              result = result.concat(flattenCategories(node.children, depth + 1));
          }
      });
      return result;
  };
  
  const flattenedOptions = flattenCategories(categories);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    defaultValues: {
      title: "",
      slug: "",
      parentId: null,
      description: "",
      active: "true", // Start as string
      imageUrl: "",
      updateSubProducts: false,
    },
  });

  const titleValue = watch("title");
  const imageUrlValue = watch("imageUrl");

  // Auto-slug only in create mode
  useEffect(() => {
    if (!isEditMode && titleValue) {
        setValue("slug", slugify(titleValue));
    }
  }, [titleValue, isEditMode, setValue]);

  // Sync form with selection
  useEffect(() => {
    if (selectedCategory) {
      reset({
        id: selectedCategory.id,
        title: selectedCategory.title,
        slug: selectedCategory.slug,
        parentId: selectedCategory.parentId,
        description: selectedCategory.description || "",
        active: selectedCategory.isActive ? "true" : "false", // Map from entity.isActive -> form.active
        imageUrl: selectedCategory.imageUrl || "",
        updateSubProducts: false,
      });
    } else {
      // Clear form when "Add New" is clicked (selectedCategory becomes undefined)
      reset({
        title: "",
        slug: "",
        parentId: null,
        description: "",
        active: "true", // Default to "true" string
        imageUrl: "",
        updateSubProducts: false,
      });
    }
  }, [selectedCategory, reset]);

  const onSubmit = (data: CategoryFormInput) => {
    // Basic validation / transformation
    const payload = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId ? Number(data.parentId) : null,
        // Convert string "true"/"false" from radio to boolean 
        // Sending 'active' to match renamed backend field
        active: String(data.active) === "true",
        updateSubProducts: data.updateSubProducts
    };
    onSave(payload as any); // Type cast might be needed if onSave expects strict type, but payload matches new DTO structure
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          setUploading(true);
          // Upload to Backend (which uploads to Cloudinary)
          const url = await CategoryService.uploadImage(file);
          setValue("imageUrl", url, { shouldDirty: true });
      } catch (err: any) {
          toast.error(`Lỗi khi tải ảnh: ${err.message}`);
      } finally {
          setUploading(false);
      }
  };

  // Open the modal instead of window.confirm
  const handleDeleteClick = () => {
    if (selectedCategory) {
        setIsDeleteModalOpen(true);
    }
  }

  // Handle actual delete logic
  const handleConfirmDelete = () => {
      if (selectedCategory) {
          onDelete(selectedCategory.id);
          setIsDeleteModalOpen(false);
      }
  };

  return (
    <>
        <div className="flex flex-1 flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden">
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col w-full max-w-4xl mx-auto h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
            {/* --- HEADER --- */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditMode ? `Sửa Danh Mục: ${selectedCategory.title}` : "Tạo Danh Mục Mới"}
                </h3>
                {isEditMode && (
                <p className="text-xs text-slate-500 dark:text-slate-400">ID: {selectedCategory.id}</p>
                )}
            </div>
            <div className="flex gap-2">
                <button
                type="button"
                onClick={() => reset()}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                Reset
                </button>
                <button
                type="submit"
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                {uploading ? "Đang Tải..." : "Lưu Thay Đổi"}
                </button>
            </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Tên Danh Mục <span className="text-red-500">*</span>
                    </label>
                    <input
                    {...register("title", { required: "Tên danh mục là bắt buộc" })}
                    className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Đường Dẫn Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-700">
                    <span className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600">
                        /c/
                    </span>
                    <input
                        {...register("slug", { required: true })}
                        className="flex-1 h-9 border-none bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:ring-0"
                    />
                    </div>
                </div>

                {/* Parent */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Danh Mục Cha
                    </label>
                    <div className="relative">
                    <select
                        {...register("parentId")}
                        className="w-full h-9 appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="">Không (Danh Mục Gốc)</option>
                        {flattenedOptions.map(opt => (
                            <option 
                                key={opt.id} 
                                value={opt.id}
                                disabled={isEditMode && opt.id === selectedCategory?.id} // Prevent self-parenting loop in UI (basic check)
                            >
                                {'\u00A0'.repeat(opt.level * 4)}{opt.title}
                            </option>
                        ))}
                    </select>
                    <span
                        className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                        style={{ fontSize: "20px" }}
                    >
                        expand_more
                    </span>
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Mô Tả
                    </label>
                    <textarea
                    {...register("description")}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
                    ></textarea>
                </div>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                {/* Visibility */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">
                    Trạng Thái
                    </label>
                    <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                        {...register("active")}
                        className="mt-1 text-primary focus:ring-primary border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        type="radio"
                        value="true"
                        />
                        <div>
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">Hoạt Động</span>
                        </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                        {...register("active")}
                        className="mt-1 text-primary focus:ring-primary border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        type="radio"
                        value="false"
                        />
                        <div>
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">Ẩn</span>
                        </div>
                    </label>
                    </div>
                </div>

                {/* Image Upload Cloudinary */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Ảnh Danh Mục
                    </label>

                    {imageUrlValue ? (
                        <div className="relative w-full aspect-video rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden group">
                            <img 
                                src={imageUrlValue} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center gap-2 transition-all">
                                <button
                                    type="button"
                                    onClick={() => setValue("imageUrl", "")}
                                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative">
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            {uploading ? (
                                <span className="text-xs text-primary font-medium">Đang Tải...</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-slate-400 mb-2" style={{ fontSize: "24px" }}>cloud_upload</span>
                                    <span className="text-xs text-slate-500 block">Nhấn để tải ảnh</span>
                                </>
                            )}
                        </label>
                    )}
                </div>
                </div>
            </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="shrink-0 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            {isEditMode ? (
                <button 
                    type="button"
                    onClick={handleDeleteClick}
                    className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                Xóa Danh Mục
                </button>
            ) : <div></div>}

            {isEditMode && (
                <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        {...register("updateSubProducts")}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        type="checkbox"
                    />
                    <span className="text-xs text-slate-900 dark:text-white">
                        Cập nhật URL cho tất cả sản phẩm con
                    </span>
                    </label>
                </div>
            )}
            </div>
        </form>
        </div>

        {/* --- Custom Confirm Modal --- */}
        <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Xóa Danh Mục?"
            message={`Bạn có chắc chắn muốn xóa "${selectedCategory?.title}"? Hành động này không thể hoàn tác.`}
            confirmText="Xóa"
            cancelText="Hủy"
            variant="danger"
        />
    </>
  );
}
