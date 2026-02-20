import { useState, useEffect } from "react";
import toast from "react-hot-toast";
// import { ProductResponse } from "@/types/types"; 

export interface ProductResponse {
    id: number;
    title: string;
    slug: string;
    description: string;
    basePrice: number;
    thumbnail?: string;
    category?: { id: number; title: string };
    isActive: boolean;
    images?: string[];
    variants?: any[]; // Simplified for list view
}
// But let's assume loose typing or defined types.

export interface PaginationState {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

export interface ProductFilters {
    search: string;
    categoryId: string;
    isActive: string; // "true", "false", or ""
    minPrice: string;
    maxPrice: string;
}

export const useProducts = () => {
    const [products, setProducts] = useState<any[]>([]); // Adjust type as needed
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>({
        search: "",
        categoryId: "",
        isActive: "",
        minPrice: "",
        maxPrice: ""
    });
    const [pagination, setPagination] = useState<PaginationState>({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    const fetchProducts = async (page = 0) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("size", pagination.size.toString());
            
            if (filters.search) params.append("search", filters.search);
            if (filters.categoryId) params.append("categoryId", filters.categoryId);
            if (filters.isActive) params.append("isActive", filters.isActive);
            if (filters.minPrice) params.append("minPrice", filters.minPrice);
            if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
            const res = await fetch(`${API_URL}/products?${params.toString()}`);
            
            if (!res.ok) throw new Error("Failed to fetch products");
            
            const data = await res.json();
            setProducts(Array.isArray(data.content) ? data.content : []);
            setPagination(prev => ({
                ...prev,
                page: typeof data.number === 'number' ? data.number : 0,
                totalPages: typeof data.totalPages === 'number' ? data.totalPages : 0,
                totalElements: typeof data.totalElements === 'number' ? data.totalElements : 0
            }));

        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(0);
    }, [filters]); 
    // Usually reset page to 0 on filter change.


    const deleteProduct = async (id: number) => {
        // Confirmation should be handled by UI before calling this
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: "DELETE"
            });
            
            if (!res.ok) throw new Error("Failed to delete");
            
            toast.success("Product deleted successfully");
            await fetchProducts(pagination.page); 
        } catch (error) {
             console.error("Delete error:", error);
             toast.error("Failed to delete product");
        }
    };

    return {
        products,
        loading,
        pagination,
        setPagination, // To allow manual page change
        filters,
        setFilters,
        refresh: fetchProducts,
        deleteProduct
    };
};
