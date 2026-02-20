export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  rating?: number;
  description?: string;
  status?: string;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: number;
  sku?: string;
  price?: number;
  stock?: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  attributes?: {name: string, value: string}[];
};
