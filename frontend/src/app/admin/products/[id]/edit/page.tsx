"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductForm from "@/components/admin/products/ProductForm";
import { ProductFormValues } from "@/schemas/product";
import { useProductForm } from "@/hooks/useProductForm";
import toast from "react-hot-toast";

// Helper to pass init data...

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [initialData, setInitialData] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
        if (!id) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                
                // Map API Response to Form Values
                const formValues: ProductFormValues = {
                    id: data.id,
                    name: data.title,
                    description: data.description || "",
                    categoryId: data.category?.id,
                    basePrice: data.basePrice,
                    isActive: data.isActive,
                    vendor: data.vendor || "", 
                    thumbnail: data.thumbnail || null,
                    images: data.images || [],
                    variants: (data.variants || []).map((v: any) => ({
                        id: v.id,
                        sku: v.sku,
                        size: v.size || "",
                        color: v.color || "",
                        price: v.price,
                        stock: v.stock,
                        images: v.images || (v.imageUrl ? [v.imageUrl] : [])
                    }))
                };
                setInitialData(formValues);
            } else {
                toast.error("Product not found");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load product");
        } finally {
            setLoading(false);
        }
    };
    
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading product data...</div>;
  if (!initialData) return <div className="p-10 text-center">Product not found</div>;

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" href="/admin/dashboard">
          Dashboard
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <Link className="hover:text-primary transition-colors" href="/admin/products">
          Products
        </Link>
        <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white">Edit Product</span>
      </nav>

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Edit Product
        </h1>
      </div>

      <ProductForm initialData={initialData} />
    </div>
  );
}
