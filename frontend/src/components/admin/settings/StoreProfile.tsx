import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

interface Props {
  settings: Record<string, string>;
  onSettingChange: (key: string, value: string) => void;
}

export default function StoreProfile({ settings, onSettingChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8080/api/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            // Assuming response is { url: "..." }
            onSettingChange("logo_url", data.url);
            toast.success("Upload logo thành công");
        } else {
            toast.error("Upload thất bại");
        }
      } catch (error) {
          console.error(error);
          toast.error("Lỗi khi upload ảnh");
      } finally {
          setUploading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Thông tin Cửa hàng
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cập nhật thông tin nhận diện thương hiệu và liên hệ của cửa hàng.
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Logo Upload */}
        <div>
          <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
            Logo / Icon Cửa hàng
          </span>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800 overflow-hidden relative shrink-0">
               {uploading ? (
                   <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
               ) : settings['logo_url'] ? (
                 <img src={settings['logo_url']} alt="Store Logo" className="h-full w-full object-cover" />
               ) : (
                 <span className="material-symbols-outlined text-4xl text-slate-400">storefront</span>
               )}
            </div>
            <div {...getRootProps()} className="flex-1 cursor-pointer">
               <input {...getInputProps()} />
               <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-primary">Click để tải ảnh</span> hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
               </div>
            </div>
          </div>
        </div>

        {/* Store Name - Full Width */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Tên Cửa Hàng <span className="text-red-500">*</span>
            </span>
            <input
              className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none"
              placeholder="Nhập tên cửa hàng của bạn..."
              type="text"
              value={settings['store_name'] || ""}
              onChange={(e) => onSettingChange("store_name", e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Phone */}
          <label className="block">
            <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Số Điện Thoại Hỗ Trợ
            </span>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    call
                </span>
                <input
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none"
                placeholder="VD: 1900 1234"
                type="tel"
                value={settings['support_phone'] || ""}
                onChange={(e) => onSettingChange("support_phone", e.target.value)}
                />
            </div>
          </label>

          {/* Customer Care Email */}
          <label className="block">
            <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Email Chăm Sóc Khách Hàng
            </span>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    mail
                </span>
                <input
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none"
                placeholder="VD: support@store.com"
                type="email"
                value={settings['support_email'] || ""}
                onChange={(e) => onSettingChange("support_email", e.target.value)}
                />
            </div>
          </label>
        </div>

        {/* Office Address */}
        <label className="block">
            <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Địa Chỉ Văn Phòng
            </span>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">
                    location_on
                </span>
                <textarea
                className="w-full h-24 pl-10 pr-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none resize-none"
                placeholder="Nhập địa chỉ văn phòng..."
                value={settings['office_address'] || ""}
                onChange={(e) => onSettingChange("office_address", e.target.value)}
                ></textarea>
            </div>
        </label>
      </div>
    </div>
  );
}
