import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết sản phẩm | E-Commerce",
  description: "Xem chi tiết sản phẩm",
};

interface ShopDetailsPageProps {
  searchParams: Promise<{ id?: string }>;
}

const ShopDetailsPage = async ({ searchParams }: ShopDetailsPageProps) => {
  const params = await searchParams;
  const productId = params.id ? parseInt(params.id) : null;
  
  return (
    <main>
      <ShopDetails productId={productId} />
    </main>
  );
};

export default ShopDetailsPage;
