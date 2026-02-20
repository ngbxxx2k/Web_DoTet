import { useState, useEffect } from "react";

// Minimal interface based on what we saw in Backend DTO
export interface Category {
  id: number;
  title: string;
  parentId?: number;
  children?: Category[];
  level?: number;
}

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Helper to flatten tree for select options with indentation
    // If API returns flat list, we might need to build tree first, or just use level if provided.
    // The backend uses a simple "getAllCategories". The response includes 'children' if the service implements it, 
    // but the DTO definitely has 'children'. Assuming standard implementation:
    // If backend returns a flat list (which is common for "getAll"), we need to treeify it or use 'level'.
    // If it returns a tree (roots only), we flatten it for the Select.
    
    // Let's implement a flattener assuming we receive ROOTS (with children populated)
    // OR a flat list. 
    // Safest bet: Build a helper that handles both.
    
    const flattenCategories = (cats: Category[], prefix = ""): { id: number, label: string }[] => {
        let result: { id: number, label: string }[] = [];
        cats.forEach(cat => {
            result.push({ id: cat.id, label: `${prefix}${cat.title}` });
            if (cat.children && cat.children.length > 0) {
                result = [...result, ...flattenCategories(cat.children, `${prefix}-- `)];
            }
        });
        return result;
    }

    // However, if the API returns a FLAT list (e.g. all categories), we need to reconstruct hierarchy 
    // or just rely on IDs.
    // Let's assume the API returns a FLAT list for simplicity based on `CategoryController` looking like simple CRUD.
    // If it's a flat list, we need to manually build the tree or use parentId to indent.
    
    const buildTreeOptions = (cats: Category[]) => {
        // Map to store reference
        const map: {[key: number]: any} = {};
        const roots: any[] = [];
        
        // Deep copy
        const list = cats.map(c => ({...c, children: []}));
        
        list.forEach((cat, i) => {
            map[cat.id] = i; // Store index
        });
        
        list.forEach(cat => {
            if (cat.parentId && map[cat.parentId] !== undefined) {
                list[map[cat.parentId]].children.push(cat);
            } else {
                roots.push(cat);
            }
        });
        
        return flattenCategories(roots);
    };

    return { categories, options: buildTreeOptions(categories), loading };
}
