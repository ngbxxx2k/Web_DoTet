"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

// --- Types & Schema ---

const AttributeValueSchema = z.object({
  id: z.number().optional(),
  valueName: z.string().nonempty({ message: "Tên giá trị là bắt buộc" }),
  colorCode: z.string().optional(),
});

const AttributeSchema = z.object({
  attributeName: z.string().nonempty({ message: "Tên thuộc tính là bắt buộc" }),
  values: z.array(AttributeValueSchema).default([])
});

type AttributeFormValues = z.infer<typeof AttributeSchema>;

interface Attribute {
    id: number;
    name: string;
    values: { id: number; value: string; colorCode?: string }[];
}

// --- Component ---

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  // Form Setup
  const { register, control, handleSubmit, reset, setValue } = useForm<AttributeFormValues>({
    resolver: zodResolver(AttributeSchema),
    defaultValues: { attributeName: "", values: [] }
  });

  const { fields, append, remove } = useFieldArray({
      control,
      name: "values"
  });

  // Fetch Attributes
  const fetchAttributes = async () => {
    setLoading(true);
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const res = await fetch(`${API_URL}/attributes`);
        if (res.ok) {
            const data = await res.json();
            setAttributes(data);
        }
    } catch (error) {
        console.error("Failed to fetch attributes", error);
        toast.error("Không thể tải danh sách thuộc tính");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
     fetchAttributes();
  }, []);

  // Handle Edit Click
  const onEdit = (id: number) => {
      const attr = attributes.find(a => a.id === id);
      if (!attr) return;

      setEditingId(id);
      reset({
          attributeName: attr.name,
          values: attr.values.map(v => ({
              id: v.id,
              valueName: v.value,
              colorCode: v.colorCode || ""
          }))
      });
      setShowModal(true);
  };

  // Handle Add Click
  const onAdd = () => {
      setEditingId(null);
      reset({ attributeName: "", values: [] });
      setShowModal(true);
  };

  // Submit Logic
  const onSubmit = async (data: AttributeFormValues) => {
      try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
          const url = editingId ? `${API_URL}/attributes/${editingId}` : `${API_URL}/attributes`;
          const method = editingId ? "PUT" : "POST";

          const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
          });

          if (res.ok) {
              await fetchAttributes();
              setShowModal(false);
              toast.success(editingId ? "Cập nhật thuộc tính thành công" : "Tạo thuộc tính thành công");
          } else {
              toast.error("Lưu thuộc tính thất bại");
          }
      } catch (error) {
          console.error(error);
          toast.error("Lỗi khi lưu thuộc tính");
      }
  };

  // Delete Logic
  const handleDeleteClick = (id: number) => {
      setIdToDelete(id);
      setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
       if (idToDelete === null) return;
       try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
          const res = await fetch(`${API_URL}/attributes/${idToDelete}`, { method: "DELETE" });
          if(res.ok) {
              fetchAttributes();
              toast.success("Xóa thuộc tính thành công");
          } else {
              toast.error("Xóa thuộc tính thất bại");
          }
       } catch (error) {
           console.error(error);
           toast.error("Lỗi khi xóa thuộc tính");
       } finally {
            setDeleteModalOpen(false);
            setIdToDelete(null);
       }
  }

  return (
    <div className="space-y-6">
       {/* Breadcrumb */}
       <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">Tổng quan</Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <Link className="hover:text-primary transition-colors" href="/admin/products">Sản Phẩm</Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Thuộc Tính</span>
      </nav>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Thuộc Tính</h1>
        <button 
           onClick={onAdd}
           className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 shadow-sm"
        >
            + Thêm Thuộc Tính
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="px-5 py-3 font-semibold text-slate-500 w-10"></th>
                    <th className="px-5 py-3 font-semibold text-slate-500">Nhóm Thuộc Tính</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 text-center">Số Giá Trị</th>
                    <th className="px-5 py-3 font-semibold text-slate-500 text-right">Hành Động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Đang tải...</td></tr>
                ) : attributes.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Không tìm thấy thuộc tính.</td></tr>
                ) : (
                    attributes.map(attr => (
                        <ExpandableAttributeRow 
                           key={attr.id} 
                           attr={attr} 
                           onEdit={() => onEdit(attr.id)} 
                           onDelete={() => handleDeleteClick(attr.id)} 
                        />
                    ))
                )}
            </tbody>
          </table>
      </div>

        {/* MODAL FORM */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingId ? "Sửa Thuộc Tính" : "Thêm Thuộc Tính Mới"}
                            </h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-white">Tên Thuộc Tính</label>
                                <input 
                                    {...register("attributeName")} 
                                    className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 py-2 px-3 text-sm" 
                                    placeholder="Ví dụ: Size, Color"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-white flex justify-between">
                                    <span>Giá Trị</span>
                                    <button 
                                        type="button" 
                                        onClick={() => append({ valueName: "", colorCode: "" })}
                                        className="text-xs text-primary font-bold hover:underline"
                                    >
                                        + Thêm Giá Trị
                                    </button>
                                </label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 items-start">
                                            <div className="flex-1">
                                                <input 
                                                    {...register(`values.${index}.valueName` as const)} 
                                                    placeholder="Giá trị (Ví dụ: XL)" 
                                                    className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 py-1.5 px-3 text-sm"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input 
                                                    {...register(`values.${index}.colorCode` as const)} 
                                                    placeholder="#RRGGBB" 
                                                    className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 py-1.5 px-3 text-sm"
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => remove(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                    {fields.length === 0 && (
                                        <p className="text-xs text-slate-400 text-center py-2">Chưa có giá trị nào.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:opacity-90"
                            >
                                Lưu Thay Đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* CONFIRM DELETE MODAL */}
        <ConfirmModal 
            isOpen={deleteModalOpen}
            title="Xóa Thuộc Tính"
            message="Bạn có chắc chắn muốn xóa thuộc tính này? Tất cả các giá trị của nó sẽ bị xóa."
            onConfirm={confirmDelete}
            onCancel={() => setDeleteModalOpen(false)}
        />
    </div>
  );
}

function ExpandableAttributeRow({ attr, onEdit, onDelete }: { attr: Attribute; onEdit: () => void; onDelete: () => void }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className={`hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors ${expanded ? "bg-slate-50 dark:bg-slate-800" : ""}`}>
                <td className="px-5 py-4 text-center">
                    <button 
                        onClick={() => setExpanded(!expanded)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px] align-middle">
                            {expanded ? "keyboard_arrow_down" : "keyboard_arrow_right"}
                        </span>
                    </button>
                </td>
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white text-base">
                    {attr.name}
                </td>
                <td className="px-5 py-4 text-center text-slate-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {attr.values.length} Giá Trị
                    </span>
                </td>
                <td className="px-5 py-4 text-right">
                    <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 text-sm font-semibold mr-4 inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
                    </button>
                    <button onClick={onDelete} className="text-red-600 hover:text-red-800 text-sm font-semibold inline-flex items-center gap-1">
                         <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                    </button>
                </td>
            </tr>
            
            {expanded && (
                <tr>
                    <td colSpan={4} className="p-0 border-none">
                        <div className="pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-b border-slate-100 dark:border-slate-800 shadow-inner">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                Giá Trị Thuộc Tính
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {attr.values.length > 0 ? (
                                    attr.values.map(v => (
                                        <div key={v.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                            {v.colorCode ? (
                                                <div 
                                                    className="w-8 h-8 rounded-full border-2 border-slate-200 shadow-sm flex-shrink-0" 
                                                    style={{ backgroundColor: v.colorCode }}
                                                ></div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 uppercase flex-shrink-0">
                                                    {v.value.substring(0, 2)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={v.value}>
                                                    {v.value}
                                                </p>
                                                {v.colorCode && (
                                                    <p className="text-xs text-slate-500 font-mono truncate">{v.colorCode}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-4 text-center text-slate-400 text-sm italic">
                                        Chưa có giá trị. Nhấn "Sửa" để thêm giá trị.
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
