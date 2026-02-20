import { useState, ChangeEvent, useEffect } from "react";
import { formatVND } from "@/utils/format";

interface Props {
  settings: Record<string, string>;
  onSettingChange: (key: string, value: string) => void;
}

export default function ShippingConfig({ settings, onSettingChange }: Props) {
  const [displayValue, setDisplayValue] = useState<string>("");

  useEffect(() => {
    if (settings['shipping_fee']) {
        setDisplayValue(formatVND(parseInt(settings['shipping_fee'])));
    } else {
        setDisplayValue(formatVND(0));
    }
  }, [settings]);

  const handleShippingFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    // 1. Get raw input value
    const rawValue = e.target.value;

    // 2. Remove all non-numeric characters (except potentially for some locales, but for VND usually just digits)
    const numericString = rawValue.replace(/\D/g, "");

    // 3. Convert to number
    const numberValue = parseInt(numericString, 10) || 0;

    // 4. Update parent state
    onSettingChange("shipping_fee", numberValue.toString());

    // 5. Update display value instantly using formatVND
    setDisplayValue(formatVND(numberValue));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            Cấu hình Vận chuyển
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập phí vận chuyển mặc định cho đơn hàng.
            </p>
        </div>

        <div className="p-6">
             <label className="block max-w-md">
                <span className="text-sm font-medium text-slate-900 dark:text-white mb-2 block">
                Phí Vận Chuyển Mặc Định
                </span>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                        payments
                    </span>
                    <input
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white font-bold placeholder-slate-400 transition-colors focus:outline-none"
                    placeholder="0 ₫"
                    type="text"
                    value={displayValue}
                    onChange={handleShippingFeeChange}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-1">
                   Số tiền này sẽ được áp dụng cho tất cả đơn hàng nếu chưa cấu hình chi tiết theo khu vực.
                </p>
            </label>
        </div>
    </div>
  );
}
