import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ProductFormSchema, ProductFormValues, ProductVariantValues } from "@/schemas/product";
import { processImages } from "@/utils/imageHelpers";
import { useState, useEffect } from "react";

/**
 * Custom Hook for handling Product Form Logic.
 */
export const useProductForm = (initialData?: ProductFormValues) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Setup React Hook Form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      isActive: true,
      categoryId: undefined,
      vendor: "",
      basePrice: 0,
      thumbnail: null,
      images: [],
      variants: [],
    },
  });

  // Re-initialize values if initialData changes late
  const { reset } = form;
  useEffect(() => {
    if (initialData) {
        reset(initialData);
    }
  }, [initialData, reset]);

  const { control, handleSubmit, setError, clearErrors, getValues } = form;

  // 2. Setup Field Array for Variants
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "variants",
    keyName: "_fieldKey", // Stable ID for react key
  });

  // --- Variant Handlers ---

  /**
   * Validates and adds a new variant to the list.
   * Checks for unique SKU within the current list.
   */
  const handleSaveVariant = (variantData: ProductVariantValues) => {
    const currentVariants = getValues("variants");
    
    // Check Unique SKU
    const isDuplicateSku = currentVariants.some(
      (v) => v.sku.trim().toLowerCase() === variantData.sku.trim().toLowerCase()
    );

    if (isDuplicateSku) {
      toast.error("SKU must be unique among variants!");
      return false; // Indicate failure
    }

    append(variantData);
    return true; // Indicate success
  };

  /**
   * Updates an existing variant at a specific index.
   * Also checks SKU uniqueness (excluding self).
   */
  const handleEditVariant = (index: number, updatedData: ProductVariantValues) => {
    const currentVariants = getValues("variants");
    
    const isDuplicateSku = currentVariants.some(
        (v, idx) => idx !== index && v.sku.trim().toLowerCase() === updatedData.sku.trim().toLowerCase()
    );

    if (isDuplicateSku) {
        toast.error("SKU must be unique among variants!");
        return false;
    }

    update(index, updatedData);
    return true;
  };


  // --- Submit Handler ---

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();

      // --- 1. Process Main Product Images ---
      const productImgs = processImages(data.images);
      
      // Append new files
      productImgs.new_files.forEach((file) => {
        formData.append("product_new_images[]", file);
      });

      // --- 2. Process Variant Images ---
      // We need to map new images to specific variants.
      // We'll use the SKU as a key reference or index-based map.
      // Strategy: 
      // - Store processed variants (with kept_urls) in the JSON payload.
      // - Append new files with key `variant_new_images_${index}[]` or `variant_new_images_${sku}[]`.
      // - Backend should look for these keys based on the variant data.
      
      const processedVariants = data.variants.map((variant, index) => {
        const vImgs = processImages(variant.images);

        // Append new files for this variant
        // Using index is safer if SKUs are mutable, but SKU is business key. 
        // Let's use index to be safe against SKU changes during edit if backend mapping relies on order.
        // Or strictly use SKU if SKU is immutable in this request scope (validated unique).
        // Let's use `variant_new_images_[sku]` logic as requested, assuming SKU is unique.
        
        vImgs.new_files.forEach((file) => {
            formData.append(`variant_new_images_${variant.sku}[]`, file);
        });

        return {
            ...variant,
            images: vImgs.kept_urls, // Only send URLs string in JSON
            // We strip 'File' objects from JSON because they verify poorly in JSON stringification
        };
      });

      // --- 1.1 Process Thumbnail ---
      if (data.thumbnail instanceof File) {
          formData.append("thumbnail", data.thumbnail);
      }
    
      // --- 3. Construct JSON Payload ---
      // "No Null Rule": values are already defaulted in Schema/Form, but we ensure structure.
      // For thumbnail, if it's a File, we don't send it in JSON. If it's a string, we send it.
      const payload = {
        ...data,
        images: productImgs.kept_urls, // Only kept URLs
        thumbnail: data.thumbnail instanceof File ? null : data.thumbnail, // Send string or null
        variants: processedVariants,
        // Ensure no fields are undefined
        vendor: data.vendor || "",
        description: data.description || "",
      };

      // Append JSON data
      formData.append("data", JSON.stringify(payload));

      // --- 4. Send Request ---
      // This part would ideally invoke a service method passed as prop or imported
      // For now, we fetch directly or simulate.
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const endpoint = data.id 
          ? `${API_URL}/products/${data.id}` // Update
          : `${API_URL}/products`;           // Create
      
      const method = data.id ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method: method,
        body: formData, 
        // Note: Do NOT set Content-Type header when sending FormData, browser sets multipart boundary automatically
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save product");
      }

      // Success
      toast.success("Product saved successfully!");
      router.push("/admin/products"); // Redirect

    } catch (error: any) {
      console.error("Submit Error:", error);
      toast.error(`Error saving product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    fields, // Variant fields
    append,
    remove,
    handleSaveVariant,
    handleEditVariant,
    onSubmit: handleSubmit(onSubmit),
    isSubmitting,
  };
};
