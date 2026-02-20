import { z } from "zod";

/**
 * Zod Schema for Product Management.
 * Handles mixed types for images (string url | File object).
 */

// Schema for a single Variant
export const ProductVariantSchema = z.object({
  id: z.number().optional(), // Optional for new variants
  size: z.string().nonempty({ message: "Size is required" }),
  color: z.string().nonempty({ message: "Color is required" }),
  sku: z.string().nonempty({ message: "SKU is required" }),
  stock: z.coerce.number().min(0, { message: "Stock must be >= 0" }),
  price: z.coerce.number().min(0, { message: "Price must be >= 0" }),
  // Images can be an array of strings (URLs) or File objects
  images: z.array(z.custom<string | File>((val) => {
    return typeof val === "string" || val instanceof File;
  }, "Invalid image type")).default([]),
});

// Schema for the Main Product
export const ProductFormSchema = z.object({
  id: z.number().optional(), // For update mode
  name: z.string().nonempty({ message: "Product Name is required" }),
  description: z.string().default(""), // No null rule
  isActive: z.boolean().default(true), // Status
  categoryId: z.coerce.number().min(1, { message: "Category is required" }),
  vendor: z.string().optional(),
  basePrice: z.coerce.number().min(0, { message: "Base Price must be >= 0" }),
  
  // Thumbnail
  thumbnail: z.custom<string | File | null>((val) => {
    if (val === null || val === undefined) return true;
    return typeof val === "string" || val instanceof File;
  }, "Invalid thumbnail type").nullable().optional(),
  
  // Product Images
  images: z.array(z.custom<string | File>((val) => {
    return typeof val === "string" || val instanceof File;
  }, "Invalid image type")).default([]),

  // Variants Array
  variants: z.array(ProductVariantSchema).default([]),
});

// Export Type inferred from Schema
export type ProductFormValues = z.infer<typeof ProductFormSchema>;
export type ProductVariantValues = z.infer<typeof ProductVariantSchema>;
