"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

import StoreProfile from "@/components/admin/settings/StoreProfile";
import EmailSettings from "@/components/admin/settings/EmailSettings";
import ShippingConfig from "@/components/admin/settings/ShippingConfig";
import { useAppDispatch } from "@/redux/store";
import { setSettings as setGlobalSettings } from "@/redux/features/settings-slice";
import api from "@/services/api";

// Define validation schema
const settingsSchema = z.object({
  support_email: z.string().email("Email chăm sóc khách hàng không hợp lệ").optional().or(z.literal("")),
  smtp_email: z.string().email("Email SMTP không hợp lệ").optional().or(z.literal("")),
  support_phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 chữ số").optional().or(z.literal("")),
});

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Fetch initial data
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const response = await api.get("/admin/settings");
        const data = response.data;
        
        // Normalize legacy keys from backend to frontend expectations
        if (!data['mail_username'] && data['smtp_user']) {
            data['mail_username'] = data['smtp_user'];
        }
        if (!data['mail_password'] && data['smtp_password']) {
            data['mail_password'] = data['smtp_password'];
        }
        
        setSettings(data);
      } catch (error) {
        console.error("Error loading settings", error);
        toast.error("Không thể tải cấu hình.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminSettings();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Validation
    try {
        settingsSchema.parse({
            support_email: settings['support_email'],
            smtp_email: settings['mail_username'], // Validating mail_username as email
            support_phone: settings['support_phone']
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
                toast.error(err.message);
            });
            setIsSaving(false);
            return;
        }
    }

    try {
      const response = await api.post("/admin/settings", settings);

      if (response.status === 200) {
        toast.success((t) => (
            <div className="flex items-center gap-2">
                <span className="font-semibold">Đã lưu thay đổi thành công!</span>
            </div>
        ), {
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
            },
            iconTheme: {
                primary: '#4ade80',
                secondary: '#333',
            },
        });
        
        // Update global redux state so header/footer update immediately
        dispatch(setGlobalSettings(settings));

      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
       toast.error("Không thể lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
      return <div className="p-8 text-center text-slate-500">Đang tải cấu hình...</div>;
  }

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Tổng quan
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Cài Đặt</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
             Cấu Hình Hệ Thống
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
             Quản lý thông tin cửa hàng, email và vận chuyển.
          </p>
        </div>
        <div className="flex gap-3">
            <button 
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm"
            >
                Hủy
            </button>
            <button 
                disabled={isSaving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold shadow-sm shadow-primary/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSaving ? (
                    <>
                        <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang Lưu...</span>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Lưu Thay Đổi
                    </>
                )}
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* 1. Store Profile */}
        <section id="store-profile">
            <StoreProfile settings={settings} onSettingChange={handleSettingChange} />
        </section>
        
        {/* 2. Email Settings */}
        <section id="email-settings">
            <EmailSettings settings={settings} onSettingChange={handleSettingChange} />
        </section>

        {/* 3. Shipping Config */}
        <section id="shipping-config">
            <ShippingConfig settings={settings} onSettingChange={handleSettingChange} />
        </section>
      </div>
    </div>
  );
}
