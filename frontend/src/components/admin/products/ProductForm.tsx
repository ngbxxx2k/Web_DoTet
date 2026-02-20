"use client";

import { useProductForm } from "@/hooks/useProductForm";
import { ProductFormValues, ProductVariantValues } from "@/schemas/product";
import ImageUpload from "./ImageUpload";
import { formatVND } from "@/utils/format";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ProductVariantSchema } from "@/schemas/product";
import { z } from "zod";
import { useCategories } from "@/hooks/useCategories";
import { useAttributes } from "@/hooks/useAttributes";
import toast from "react-hot-toast";

const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ProductFormProps {
  initialData?: ProductFormValues;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const { form, fields, remove, handleSaveVariant, handleEditVariant, onSubmit, isSubmitting } = useProductForm(initialData);
  const { options: categoryOptions, loading: catsLoading } = useCategories();
  const { attributes, loading: attrsLoading } = useAttributes();
  
  const { 
    register, 
    control, 
    watch, 
    setValue, 
    formState: { errors } 
  } = form;

  // Local state for the Variant Sub-Form
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [expandedVariantIndex, setExpandedVariantIndex] = useState<number | null>(null);

  // --- Variant Config State (New / Edit) ---
  const [selectedAttrs, setSelectedAttrs] = useState<Record<number, string[]>>({});

  const handleGenerateVariants = () => {
      // 1. Identify which attribute is "Size" and which is "Color"
      const sizeAttr = attributes.find(a => a.name.toLowerCase() === "size");
      const colorAttr = attributes.find(a => a.name.toLowerCase() === "color");

      if (!sizeAttr || !colorAttr) {
          toast.error("Hệ thống yêu cầu thuộc tính 'Size' và 'Color' phải được định nghĩa.");
          return;
      }

      const selectedSizes = selectedAttrs[sizeAttr.id] || [];
      const selectedColors = selectedAttrs[colorAttr.id] || [];
      
      if (selectedSizes.length === 0 || selectedColors.length === 0) {
          toast.error("Vui lòng chọn ít nhất một Size và một Color.");
          return;
      }

      const baseName = watch('name') || "PRD";
      const baseSku = baseName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "X");
      const basePrice = watch('basePrice') || 0;

      let count = 0;
      // Cartesian Product
      selectedSizes.forEach(sizeVal => {
          selectedColors.forEach(colorVal => {
              const sku = `${baseSku}-${sizeVal}-${colorVal}-${Date.now().toString().slice(-4)}${count++}`.toUpperCase();
              
              const variantData: ProductVariantValues = {
                  size: sizeVal,
                  color: colorVal,
                  sku: sku,
                  price: basePrice,
                  stock: 0,
                  images: []
              };
              
              // Add to form
              // We use handleSaveVariant from hook which might check duplicates, 
              // but here we are batch creating. 
              // Directly call append from hook? `fields` is from useFieldArray.
              // useProductForm implementation wraps append.
              // Let's use handleSaveVariant but usually it expects one by one.
              // To avoid too many renders or alerts, let's just append directly via hook if exposed, 
              // BUT useProductForm exposes `append` from useFieldArray.
              
              // Let's check duplicate manually to avoid toast spam
              const currentVariants = form.getValues("variants") || [];
              const isDuplicate = currentVariants.some(v => v.size === sizeVal && v.color === colorVal);
              
              if (!isDuplicate) {
                   handleSaveVariant(variantData);
              }
          });
      });

      toast.success("Đã tạo biến thể!");
      setShowAddVariant(false);
      setSelectedAttrs({});
  }


  // --- Handlers for Edit Variant ---
  const handleUpdateField = (index: number, field: keyof ProductVariantValues, value: any) => {
      const currentValues = form.getValues(`variants.${index}`);
      handleEditVariant(index, { ...currentValues, [field]: value });
  }


  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
      {/* =====================================================================================
          CỘT CHÍNH (LEFT COLUMN)
      ===================================================================================== */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* --- 1. GENERAL INFORMATION --- */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Thông Tin Chung
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                Tên Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className="mt-2 block w-full rounded-md border-0 py-2.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-primary dark:bg-slate-700 sm:text-sm sm:leading-6"
                placeholder="Ví dụ: Áo Thun Cotton Cao Cấp"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                Mô Tả
              </label>
              <textarea
                {...register("description")}
                className="mt-2 block w-full rounded-md border-0 py-2.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-primary dark:bg-slate-700 sm:text-sm sm:leading-6 min-h-[120px]"
                placeholder="Mô tả chi tiết sản phẩm..."
              />
            </div>
          </div>
        </div>

        {/* --- 2. PRODUCT MEDIA --- */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Ảnh Đại Diện & Bộ Sưu Tập
            </h2>
          </div>
          
          <div className="space-y-6">
              {/* Thumbnail */}
              <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-2">
                    Ảnh Đại Diện (Ảnh Chính)
                  </label>
                  <ImageUpload 
                    value={watch("thumbnail") ? [watch("thumbnail") as any] : []}
                    onChange={(files) => {
                        const file = files[0] || null;
                        setValue("thumbnail", file);
                    }}
                    maxFiles={1}
                  />
                  <p className="text-xs text-slate-500 mt-1">Sử dụng cho thẻ sản phẩm và danh sách.</p>
              </div>

              {/* Gallery */}
              <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-2">
                    Bộ Sưu Tập Ảnh
                  </label>
                  <ImageUpload 
                    value={watch("images")} 
                    onChange={(files) => setValue("images", files)} 
                    maxFiles={8}
                  />
              </div>
          </div>
        </div>

        {/* --- 3. VARIANTS --- */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Biến Thể</h2>
              <p className="text-xs text-slate-500 mt-1">Chọn thuộc tính để tạo biến thể.</p>
            </div>
            
            {!showAddVariant && (
              <button
                type="button"
                onClick={() => setShowAddVariant(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-sm"
              >
                <Icon name="add" className="text-[20px]" />
                Thêm Biến Thể
              </button>
            )}
          </div>

          {/* --- ADD VARIANT CONFIGURATION --- */}
          {showAddVariant && (
            <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-left-4 border-slate-200 dark:border-slate-700 border-l-primary animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Tạo Biến Thể
                 </h3>
                 <button type="button" onClick={() => setShowAddVariant(false)} className="text-slate-400 hover:text-slate-600">
                    <Icon name="close" className="text-[20px]" />
                 </button>
              </div>

               {attrsLoading ? (
                  <div className="text-sm text-slate-500 py-4">Đang tải thuộc tính...</div>
              ) : (
                  <div className="space-y-6 mb-6">
                      {attributes.map(attr => (
                          <div key={attr.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                  {attr.name}
                                  <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                    {attr.values.length} tùy chọn
                                  </span>
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                  {attr.values.map(val => {
                                      const isSelected = selectedAttrs[attr.id]?.includes(val.value);
                                      return (
                                          <label 
                                            key={val.id} 
                                            className={`
                                                cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                                                ${isSelected 
                                                    ? "bg-primary/10 border-primary text-primary" 
                                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-slate-300"}
                                            `}
                                          >
                                              <input 
                                                type="checkbox" 
                                                className="hidden"
                                                checked={!!isSelected}
                                                onChange={(e) => {
                                                    setSelectedAttrs(prev => {
                                                        const current = prev[attr.id] || [];
                                                        if (e.target.checked) {
                                                            return { ...prev, [attr.id]: [...current, val.value] };
                                                        } else {
                                                            return { ...prev, [attr.id]: current.filter(v => v !== val.value) };
                                                        }
                                                    });
                                                }}
                                              />
                                              {val.colorCode && (
                                                  <span 
                                                    className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                                                    style={{ backgroundColor: val.colorCode }}
                                                  ></span>
                                              )}
                                              {val.value}
                                          </label>
                                      );
                                  })}
                              </div>
                          </div>
                      ))}
                      
                      {attributes.length === 0 && (
                          <p className="text-sm text-slate-500">Không tìm thấy thuộc tính. Vui lòng tạo thuộc tính (Size, Color) trước trong trang Thuộc Tính.</p>
                      )}
                  </div>
              )}

              <div className="flex gap-3 justify-end items-center border-t border-slate-200 dark:border-slate-700 pt-4">
                  <span className="text-xs text-slate-500">
                     Đã chọn: {
                        Object.values(selectedAttrs).reduce((acc, curr) => acc + curr.length, 0)
                     } tùy chọn
                  </span>
                  <button 
                     type="button"
                     onClick={() => {
                         setShowAddVariant(false);
                         setSelectedAttrs({});
                     }}
                     className="h-10 px-4 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold"
                  >
                     Hủy
                  </button>
                  <button 
                    type="button" 
                    onClick={handleGenerateVariants} 
                    className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 flex items-center gap-2"
                  >
                     <Icon name="auto_awesome" className="text-[18px]" />
                     Tạo Biến Thể
                  </button>
              </div>
            </div>
          )}

          {/* --- VARIANT LIST --- */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Icon name="list" className="text-[18px] text-slate-500" />
              Danh Sách Biến Thể ({fields.length})
            </h3>
            
            <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-500 w-16 text-center">Ảnh</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Thông Tin Var</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 w-32">Mã SKU</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 w-24">Giá</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 w-24 text-center">Kho</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {fields.map((field, index) => {
                     const vData = form.getValues(`variants.${index}`);
                     const firstImg = vData.images?.[0];
                     const previewUrl = typeof firstImg === "string" ? firstImg : firstImg instanceof File ? URL.createObjectURL(firstImg) : "";

                     return (
                    <>
                        <tr 
                            key={field.id} 
                            className={`group transition-colors ${expandedVariantIndex === index ? 'bg-slate-50 dark:bg-slate-800 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'}`}
                        >
                          <td className="px-4 py-3 text-center">
                            <div className="h-10 w-10 mx-auto rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white shadow-sm">
                               {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" />}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                             <div className="font-bold text-slate-900 dark:text-white">{vData.size} / {vData.color}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{vData.sku}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{formatVND(vData.price)}</td>
                          <td className="px-4 py-3 text-center">
                             <span className="font-bold">{vData.stock}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-1 justify-end">
                                <button type="button" onClick={() => setExpandedVariantIndex(expandedVariantIndex === index ? null : index)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                                     <Icon name="edit" className="text-[18px]" />
                                </button>
                                <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                >
                                <Icon name="delete" className="text-[18px]" />
                                </button>
                            </div>
                          </td>
                        </tr>

                        {expandedVariantIndex === index && (
                             <tr>
                             <td colSpan={6} className="p-0 border-t-0">
                                 <div className="bg-slate-50 dark:bg-slate-900/30 p-5 border-t border-b border-slate-200 dark:border-slate-700 shadow-inner">
                                     <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                                         <div className="md:col-span-2">
                                             <label className="block text-xs font-semibold text-slate-500 mb-1">Kích Thước</label>
                                             <input value={vData.size} onChange={(e) => handleUpdateField(index, "size", e.target.value)} className="w-full h-8 rounded border-slate-300 text-sm" />
                                         </div>
                                         <div className="md:col-span-2">
                                             <label className="block text-xs font-semibold text-slate-500 mb-1">Màu Sắc</label>
                                             <input value={vData.color} onChange={(e) => handleUpdateField(index, "color", e.target.value)} className="w-full h-8 rounded border-slate-300 text-sm" />
                                         </div>
                                         <div className="md:col-span-3">
                                             <label className="block text-xs font-semibold text-slate-500 mb-1">Mã SKU</label>
                                             <input value={vData.sku} onChange={(e) => handleUpdateField(index, "sku", e.target.value)} className="w-full h-8 rounded border-slate-300 text-sm" />
                                         </div>
                                         <div className="md:col-span-3">
                                             <label className="block text-xs font-semibold text-slate-500 mb-1">Giá</label>
                                             <input type="number" value={vData.price} onChange={(e) => handleUpdateField(index, "price", Number(e.target.value))} className="w-full h-8 rounded border-slate-300 text-sm" />
                                         </div>
                                         <div className="md:col-span-2">
                                             <label className="block text-xs font-semibold text-slate-500 mb-1">Tồn Kho</label>
                                             <input type="number" value={vData.stock} onChange={(e) => handleUpdateField(index, "stock", Number(e.target.value))} className="w-full h-8 rounded border-slate-300 text-sm" />
                                         </div>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-semibold text-slate-500 mb-2">Ảnh Biến Thể</label>
                                         <ImageUpload 
                                            value={vData.images} 
                                            onChange={(files) => handleUpdateField(index, "images", files)} 
                                            maxFiles={4} 
                                         />
                                     </div>
                                 </div>
                             </td>
                         </tr>
                        )}
                    </>
                  )})}
                  
                  {fields.length === 0 && (
                     <tr>
                         <td colSpan={6} className="p-8 text-center text-slate-500">
                            Chưa có biến thể nào.
                         </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================================
          CỘT SIDEBAR (RIGHT COLUMN)
      ===================================================================================== */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* --- 4. ORGANIZATION --- */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tổ Chức</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-1">Trạng Thái</label>
              <select 
                value={watch("isActive") ? "true" : "false"}
                onChange={(e) => {
                    const val = e.target.value === "true";
                    setValue("isActive", val);
                }}
                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-primary dark:bg-slate-700 sm:text-sm sm:leading-6"
              >
                <option value="true">Đang Bán</option>
                <option value="false">Nháp / Ẩn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-1">Danh Mục</label>
              <select 
                value={watch("categoryId") || ""}
                {...register("categoryId", { valueAsNumber: true })} 
                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-primary dark:bg-slate-700 sm:text-sm sm:leading-6"
              >
                <option value="">Chọn Danh Mục</option>
                {categoryOptions.map(opt => (
                    <option key={opt.id} value={opt.id} dangerouslySetInnerHTML={{__html: opt.label.replace(/ /g, '&nbsp;')}}>
                    </option>
                ))}
              </select>
              {catsLoading && <p className="text-xs text-slate-500 mt-1">Đang tải danh mục...</p>}
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white mb-1">Nhà Cung Cấp</label>
              <input {...register("vendor")} type="text" className="block w-full rounded-md border-0 py-2.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600" placeholder="Ví dụ: Nike" />
            </div>
            
          </div>
        </div>

        {/* --- 5. BASE PRICING --- */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Giá Cơ Bản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">Giá Gốc (VNĐ)</label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <input type="number" step="0.01" {...register("basePrice")} className="block w-full rounded-md border-0 py-2.5 pl-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-700 sm:text-sm sm:leading-6" placeholder="0.00" />
                {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* --- 6. SUBMIT BUTTONS --- */}
        <div className="sticky bottom-4 z-10">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors shadow-lg"
            >
                {isSubmitting ? "Đang Lưu..." : "Lưu Sản Phẩm"}
            </button>
        </div>

      </div>
    </form>
  );
}