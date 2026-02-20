"use client";

import { Role } from "@/hooks/useCustomers";

interface CustomerToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleId: number | null;
  onRoleChange: (value: number | null) => void;
  isActive: boolean | null;
  onStatusChange: (value: boolean | null) => void;
  roles: Role[];
}

export default function CustomerToolbar({
  search,
  onSearchChange,
  roleId,
  onRoleChange,
  isActive,
  onStatusChange,
  roles,
}: CustomerToolbarProps) {
  return (
    <div className="p-4 border-b border-slate-200 dark:border-border-dark flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-surface-dark rounded-t-xl">
      {/* Search & Role */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              search
            </span>
          </span>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-border-dark rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
            placeholder="Tìm kiếm khách hàng..."
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-40">
          <select
            className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-slate-200 dark:border-border-dark rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm cursor-pointer"
            value={roleId ?? ""}
            onChange={(e) => onRoleChange(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Tất cả vai trò</option>
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
      {/* More Filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-40">
          <select
            className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-slate-200 dark:border-border-dark rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm cursor-pointer"
            value={isActive === null ? "" : isActive ? "true" : "false"}
            onChange={(e) =>
              onStatusChange(e.target.value === "" ? null : e.target.value === "true")
            }
          >
            <option value="">Mọi Trạng Thái</option>
            <option value="true">Hoạt Động</option>
            <option value="false">Đã Khóa</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              expand_more
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
