import { Category, CategoryFormInput } from "@/types/category";

// Change this to your actual backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  async getById(id: number): Promise<Category> {
    const res = await fetch(`${API_URL}/categories/${id}`);
    if (!res.ok) throw new Error("Failed to fetch category");
    return res.json();
  },

  async create(data: CategoryFormInput): Promise<Category> {
    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const error = await res.json();
            throw new Error(error.message || "Failed to create category");
        } else {
            const text = await res.text();
            throw new Error(`API Error (${res.status}): ${text}`);
        }
    }
    return res.json();
  },

  async update(id: number, data: CategoryFormInput): Promise<Category> {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
             const error = await res.json();
             throw new Error(error.message || "Failed to update category");
        } else {
             const text = await res.text();
             throw new Error(`API Error (${res.status}): ${text}`);
        }
    }
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete category");
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
         const text = await res.text();
         throw new Error(`Upload failed: ${text}`);
    }
    
    // Expect: { url: "..." }
    const data = await res.json();
    return data.url;
  }
};
