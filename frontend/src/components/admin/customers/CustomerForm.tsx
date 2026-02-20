"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Customer, Role, saveCustomer, useRoles } from "@/hooks/useCustomers";
import toast from "react-hot-toast";

interface CustomerFormProps {
  initialData?: Customer | null;
  mode: "add" | "edit" | "view";
  onClose?: () => void;
}

interface FormData {
  id?: number;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  roleId: number;
  isActive: boolean;
  adminNotes: string;
  avatarUrl: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
}

export default function CustomerForm({ initialData, mode, onClose }: CustomerFormProps) {
  const router = useRouter();
  const { roles, loading: rolesLoading } = useRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isViewMode = mode === "view";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id,
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      password: "",
      confirmPassword: "",
      phoneNumber: initialData?.phoneNumber || "",
      roleId: initialData?.roleId || 0,
      isActive: initialData?.isActive ?? true,
      adminNotes: initialData?.adminNotes || "",
      avatarUrl: initialData?.avatarUrl || "",
      province: initialData?.province || "",
      district: initialData?.district || "",
      ward: initialData?.ward || "",
      addressDetail: initialData?.addressDetail || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        id: initialData.id,
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        password: "",
        confirmPassword: "",
        phoneNumber: initialData.phoneNumber || "",
        roleId: initialData.roleId || 0,
        isActive: initialData.isActive ?? true,
        adminNotes: initialData.adminNotes || "",
        avatarUrl: initialData.avatarUrl || "",
        province: initialData.province || "",
        district: initialData.district || "",
        ward: initialData.ward || "",
        addressDetail: initialData.addressDetail || "",
      });
      setAvatarPreview(initialData.avatarUrl || null);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    if (isViewMode) return;

    if (mode === "add" && !data.password) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    if (data.password && data.password !== data.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!data.roleId) {
      toast.error("Vui lòng chọn vai trò");
      return;
    }

    try {
      setIsSubmitting(true);
      await saveCustomer({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        password: data.password || undefined,
        phoneNumber: data.phoneNumber,
        roleId: data.roleId,
        isActive: data.isActive,
        adminNotes: data.adminNotes,
        avatarUrl: data.avatarUrl,
        province: data.province,
        district: data.district,
        ward: data.ward,
        addressDetail: data.addressDetail,
      });
      toast.success(`Khách hàng đã được ${mode === "add" ? "thêm mới" : "cập nhật"} thành công`);
      if (onClose) {
        onClose();
      } else {
        router.push("/admin/customers");
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu khách hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarClick = () => {
    if (!isViewMode) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary via backend
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
        
        if (res.ok) {
          const data = await res.json();
          setValue("avatarUrl", data.url); // Store Cloudinary URL, not base64
          toast.success("Tải ảnh đại diện thành công");
        } else {
          toast.error("Tải ảnh đại diện thất bại");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Tải ảnh đại diện thất bại");
      }
    }
  };

  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Avatar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Ảnh Đại Diện</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {isViewMode ? "Ảnh đại diện" : "Tải lên ảnh đại diện cho khách hàng."}
          </p>
          <div className="flex flex-col items-center justify-center">
            <div
              className={`relative group ${isViewMode ? "" : "cursor-pointer"}`}
              onClick={handleAvatarClick}
            >
              <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
                {avatarPreview ? (
                  <img
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    src={avatarPreview}
                  />
                ) : (
                  <div className="text-center p-4">
                    <span
                      className="material-symbols-outlined text-slate-400 dark:text-slate-500 mb-2"
                      style={{ fontSize: "36px" }}
                    >
                      add_a_photo
                    </span>
                    <p className="text-xs text-slate-500">Nhấn để tải lên</p>
                  </div>
                )}
              </div>
              {!isViewMode && (
                <div className="absolute bottom-1 right-1 bg-white dark:bg-slate-700 rounded-full p-1.5 shadow-sm border border-slate-200 dark:border-slate-600">
                  <span
                    className="material-symbols-outlined text-slate-600 dark:text-slate-300"
                    style={{ fontSize: "20px" }}
                  >
                    edit
                  </span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isViewMode}
            />
            {!isViewMode && (
              <p className="text-xs text-slate-400 mt-3">
                Hỗ trợ *.jpeg, *.jpg, *.png, *.gif <br /> tối đa 3.1 MB
              </p>
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Thông Tin Cá Nhân
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("fullName", { required: "Full name is required" })}
                className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="Ví dụ: Nguyễn Văn A"
                type="text"
                disabled={isViewMode}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>
                    mail
                  </span>
                </div>
                <input
                  {...register("email", { required: "Vui lòng nhập email" })}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="olivia@untitledui.com"
                  type="email"
                  disabled={isViewMode}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Số Điện Thoại
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>
                    phone
                  </span>
                </div>
                <input
                  {...register("phoneNumber")}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Address fields at the bottom of Personal Info */}
            <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
               <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                 Địa Chỉ Giao Hàng
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỉnh / Thành Phố</label>
                    <input {...register("province")} disabled={isViewMode} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary" placeholder="Ví dụ: TP.HCM" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quận / Huyện</label>
                    <input {...register("district")} disabled={isViewMode} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary" placeholder="Ví dụ: Quận 1" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phường / Xã</label>
                    <input {...register("ward")} disabled={isViewMode} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary" placeholder="Ví dụ: Bến Nghé" />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa Chỉ Chi Tiết</label>
                    <input {...register("addressDetail")} disabled={isViewMode} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary" placeholder="Ví dụ: 123 Nguyễn Huệ" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Security - Only show for add/edit */}
        {!isViewMode && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Bảo Mật</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật Khẩu {mode === "add" && <span className="text-red-500">*</span>}
                </label>
                <input
                  {...register("password")}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder={mode === "edit" ? "Để trống nếu không đổi" : "••••••••"}
                  type="password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Xác Nhận Mật Khẩu
                </label>
                <input
                  {...register("confirmPassword")}
                  className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* Account Status */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Trạng Thái Tài Khoản</h3>
          <div className="flex items-center justify-between mb-6">
            <span className="flex-grow flex flex-col">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Đang Hoạt Động
              </span>
              <span className="text-xs text-slate-500">Khách hàng có thể đăng nhập</span>
            </span>
            <button
              type="button"
              disabled={isViewMode}
              onClick={() => setValue("isActive", !isActive)}
              className={`${
                isActive ? "bg-primary" : "bg-slate-300"
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed`}
              role="switch"
              aria-checked={isActive}
            >
              <span
                aria-hidden="true"
                className={`${
                  isActive ? "translate-x-5" : "translate-x-0"
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vai Trò <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register("roleId", { valueAsNumber: true })}
                className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                disabled={isViewMode || rolesLoading}
              >
                <option value={0}>Chọn Vai Trò</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.roleName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Ghi Chú Admin</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Ghi Chú
            </label>
            <textarea
              {...register("adminNotes")}
              className="block w-full rounded-lg border-slate-300 dark:border-border-dark bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Thêm ghi chú nội bộ về khách hàng này..."
              rows={4}
              disabled={isViewMode}
            ></textarea>
            <p className="text-xs text-slate-500 mt-2">Ghi chú này chỉ hiển thị với admin.</p>
          </div>
        </div>

        {/* Submit Button */}
        {!isViewMode && (
          <div className="sticky bottom-4 z-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors shadow-lg"
            >
              {isSubmitting
                ? "Đang lưu..."
                : mode === "add"
                ? "Tạo Khách Hàng"
                : "Cập Nhật Khách Hàng"}
            </button>
          </div>
        )}

        {isViewMode && onClose && (
          <div className="sticky bottom-4 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
