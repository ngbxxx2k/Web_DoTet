"use client";

import { useState, useEffect } from "react";
import CategoryList from "@/components/admin/categories/CategoryList";
import CategoryDetail from "@/components/admin/categories/CategoryDetail";
import { Category, CategoryFormInput } from "@/types/category";
import { CategoryService } from "@/services/category.service";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await CategoryService.getAll();
        
        // Build Tree Structure for UI
        const tree = buildCategoryTree(data);
        setCategories(tree);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [refreshTrigger]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  // Find selected category (flatten search just in case, but usually fast enough on tree)
  const selectedCategory = selectedCategoryId 
    ? findCategoryInTree(categories, selectedCategoryId) 
    : null;

  const handleCreateNew = () => {
    setSelectedCategoryId(null); // Null means creating new -> Form clears
  };

  const handleSave = async (data: CategoryFormInput) => {
      try {
          if (data.id) {
              await CategoryService.update(data.id, data);
              toast.success("Cập nhật danh mục thành công!");
          } else {
              await CategoryService.create(data);
              toast.success("Tạo danh mục thành công!");
              handleCreateNew(); // Reset after create
          }
          refreshData();
      } catch (error: any) {
          toast.error(`Lỗi khi lưu danh mục: ${error.message}`);
      }
  };

  const handleDelete = async (id: number) => {
      try {
          await CategoryService.delete(id);
          toast.success("Xóa danh mục thành công!");
          setSelectedCategoryId(null);
          refreshData();
      } catch (error: any) {
          toast.error(`Lỗi khi xóa danh mục: ${error.message}`);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh)] -m-4 md:-m-8">
      {/* Top Navbar */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
            Quản Lý Danh Mục
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-md hidden sm:block">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: "20px" }}
            >
              search
            </span>
            <input
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50"
              placeholder="Tìm kiếm danh mục..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Split View Content */}
      <main className="flex flex-1 overflow-hidden relative">
         {loading && (
             <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
                 Đang tải...
             </div>
         )}
         
         <CategoryList 
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            onCreateNew={handleCreateNew}
            filterText={searchQuery}
         />
         <CategoryDetail 
            key={selectedCategoryId || 'new'} 
            selectedCategory={selectedCategory ?? undefined}
            categories={categories} // Should ideally be flattened for parent selector, but we can fix selector in component
            onSave={handleSave}
            onDelete={handleDelete}
         />
      </main>
    </div>
  );
}

// --- Helpers ---

function buildCategoryTree(flatList: Category[]): Category[] {
    const map = new Map<number, Category>();
    const roots: Category[] = [];

    // Initialize map
    flatList.forEach(item => {
        map.set(item.id, { ...item, children: [] });
    });

    flatList.forEach(item => {
        const node = map.get(item.id)!;
        if (item.parentId && map.has(item.parentId)) {
            map.get(item.parentId)!.children!.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

function findCategoryInTree(list: Category[], id: number): Category | null {
    for (const cat of list) {
        if (cat.id === id) return cat;
        if (cat.children && cat.children.length > 0) {
            const found = findCategoryInTree(cat.children, id);
            if (found) return found;
        }
    }
    return null;
}
