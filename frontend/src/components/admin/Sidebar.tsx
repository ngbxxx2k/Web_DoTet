"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth-slice";

// 1. Định nghĩa danh sách menu ở đây để dễ quản lý
const MENU_ITEMS = [
  { name: "Tổng quan", href: "/admin/dashboard", icon: "dashboard" },
  { name: "Sản phẩm", href: "/admin/products", icon: "shopping_bag" },
  { name: "Danh mục", href: "/admin/categories", icon: "category" },
  { name: "Đơn hàng", href: "/admin/orders", icon: "shopping_cart" },
  { name: "Thanh toán", href: "/admin/payments", icon: "payments" },
  { name: "Khách hàng", href: "/admin/customers", icon: "group" },
  { name: "Banners", href: "/admin/banners", icon: "view_carousel" },
  { name: "Thống kê", href: "/admin/analytics", icon: "analytics" },
  { name: "Đánh giá", href: "/admin/feedbacks", icon: "reviews" },
  { name: "Chatbot", href: "/admin/chatbot-data", icon: "database" },
  { name: "Cài đặt", href: "/admin/settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // 2. Logic kiểm tra Active
  const checkActive = (href: string) => {
    // Nếu là trang dashboard/overview, yêu cầu đường dẫn phải trùng khớp tuyệt đối hoặc là root /admin
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    // Các trang con khác: check trùng hoặc bắt đầu bằng (để support nested routes như /products/edit/1)
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const handleLogout = () => {
    // Xóa cookie nếu cần (nếu dùng cookie httpOnly thì phải gọi API)
    // Ở đây giả sử chỉ xóa state Redux và localStorage (nếu có persist)
    dispatch(logout());
    router.push("/signin");
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-[#1a202c] border-r border-[#dbdfe6] dark:border-border-dark h-full flex-shrink-0">
      <div className="flex flex-col h-full justify-between p-4">
        <div className="flex flex-col gap-6">
          {/* Header Sidebar */}
          <div className="flex flex-col px-2">
            <h1 className="text-[#111318] dark:text-white text-xl font-bold leading-normal">
              Trang Quản Trị
            </h1>
            
          </div>

          {/* Menu Links - Render bằng map giúp code gọn hơn và fix lỗi logic */}
          <nav className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-180px)]">
            {MENU_ITEMS.map((item) => {
              const isActive = checkActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary" // Active Style
                      : "text-[#616f89] hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" // Inactive Style
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-medium leading-normal">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar (Back to Home & Logout) */}
        <div className="px-2 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <Link 
            href="/"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="text-sm font-medium leading-normal">Về Trang Chủ</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium leading-normal">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}