"use client";
import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { formatVND } from "@/utils/format";

const SingleItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleRemoveFromCart = () => removeFromCart(item.id);

  const handleIncreaseQuantity = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    updateQuantity(item.id, newQty);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      updateQuantity(item.id, newQty);
    }
  };

  return (
    <div className="flex items-center py-5 px-6 bg-white hover:bg-gray-50 transition-colors">
      {/* CỘT SẢN PHẨM (45%) */}
      <div className="w-[45%] flex items-center gap-4">
        <div className="relative flex-shrink-0 w-16 h-16 bg-gray-2 rounded-lg overflow-hidden border border-gray-200">
          <Image src={item.imgs?.thumbnails[0]} alt="product" fill sizes="64px" className="object-contain p-1" />
        </div>
        <div className="flex-1 pr-2">
          <h3 className="text-dark font-medium text-sm line-clamp-2 hover:text-blue transition-colors">
            <a href="#">{item.title}</a>
          </h3>
        </div>
      </div>

      {/* GIÁ (15%) */}
      <div className="w-[15%]">
        <p className="text-dark font-medium text-sm">{formatVND(item.discountedPrice)}</p>
      </div>

      {/* SỐ LƯỢNG (20%) */}
      <div className="w-[20%] flex justify-center">
        <div className="flex items-center rounded-md border border-gray-300 bg-white overflow-hidden">
          <button onClick={handleDecreaseQuantity} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100">-</button>
          <span className="w-10 text-center text-sm font-bold border-x border-gray-200">{quantity}</span>
          <button onClick={handleIncreaseQuantity} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100">+</button>
        </div>
      </div>

      {/* TỔNG TIỀN (15%) */}
      <div className="w-[15%] text-right text-blue font-bold text-sm">
        {formatVND(item.discountedPrice * quantity)}
      </div>

      {/* NÚT XÓA (5%) */}
      <div className="w-[5%] flex justify-end pl-2">
        <button onClick={handleRemoveFromCart} className="text-gray-400 hover:text-red-500 transition-colors">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SingleItem;