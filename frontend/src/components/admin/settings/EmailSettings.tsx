import { useState } from "react";

interface Props {
  settings: Record<string, string>;
  onSettingChange: (key: string, value: string) => void;
}

export default function EmailSettings({ settings, onSettingChange }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">mail</span>
          Cấu hình Email Hệ thống
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Thiết lập thông báo và SMTP server gửi email tự động.
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Notification Email */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
              Email Nhận Thông Báo
            </span>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    notifications_active
                </span>
                <input
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none"
                placeholder="Nhập email để nhận thông báo đơn hàng mới..."
                type="email"
                value={settings['notification_email'] || ""}
                onChange={(e) => onSettingChange("notification_email", e.target.value)}
                />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 ml-1">
                Các thông báo về đơn hàng mới, tin nhắn liên hệ sẽ được gửi đến email này.
            </p>
          </label>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 my-6"></div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Cấu Hình SMTP (Gửi Email)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Email */}
            <label className="block">
                <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
                Email Gửi (SMTP User)
                </span>
                <input
                className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none"
                placeholder="noreply@domain.com"
                type="email"
                value={settings['mail_username'] || settings['smtp_user'] || ""}
                onChange={(e) => onSettingChange("mail_username", e.target.value)}
                />
            </label>

            {/* App Password */}
            <label className="block">
                <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
                Mật Khẩu Ứng Dụng (App Password)
                </span>
                <div className="relative">
                    <input
                    className="w-full h-11 pl-4 pr-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-400 transition-colors focus:outline-none"
                    placeholder="Nhập mật khẩu ứng dụng..."
                    type={showPassword ? "text" : "password"}
                    value={settings['mail_password'] || settings['smtp_password'] || ""}
                    onChange={(e) => onSettingChange("mail_password", e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                </div>
            </label>
        </div>
      </div>
    </div>
  );
}
