"use client";
import React from "react";
import OrderSummary from "./OrderSummary";
import { useCart } from "@/hooks/useCart";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";

const Cart = () => {
  const { cartItems, clearCart } = useCart();

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giỏ hàng?")) {
      clearCart();
    }
  };

  return (
    <>
      <section><Breadcrumb title={"Giỏ Hàng"} pages={["Giỏ Hàng"]} /></section>

      {cartItems.length > 0 ? (
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Giỏ Hàng Của Bạn</h2>
              <button type="button" onClick={handleClearCart} className="text-blue hover:text-red-500 transition-colors">
                Xóa Giỏ Hàng
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-10">
              {/* PHẦN BÊN TRÁI: BẢNG SẢN PHẨM (KHÔNG CÒN SCROLL) */}
              <div className="w-full lg:w-[68%]">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                  {/* Table Header với tỉ lệ % đồng bộ */}
                  <div className="hidden sm:flex items-center py-4 px-6 bg-gray-50 border-b border-gray-100">
                    <div className="w-[45%] text-dark font-semibold text-sm">Sản Phẩm</div>
                    <div className="w-[15%] text-dark font-semibold text-sm">Giá</div>
                    <div className="w-[20%] text-dark font-semibold text-sm text-center">Số Lượng</div>
                    <div className="w-[15%] text-dark font-semibold text-sm text-right">Thành Tiền</div>
                    <div className="w-[5%]"></div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item, key) => (
                      <SingleItem item={item} key={key} />
                    ))}
                  </div>
                </div>
              </div>

              {/* PHẦN BÊN PHẢI: TỔNG ĐƠN HÀNG */}
              <div className="w-full lg:w-[32%] lg:sticky lg:top-25">
                <OrderSummary />
                <Link href="/checkout" className="mt-6 w-full flex justify-center bg-blue text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md shadow-blue/20">
                  Tiến Hành Thanh Toán
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center py-20 bg-white">
          <p className="pb-6 text-gray-500">Giỏ hàng trống!</p>
          <Link href="/shop-with-sidebar" className="inline-flex bg-dark text-white py-3 px-10 rounded-lg">Quay Lại Cửa Hàng</Link>
        </div>
      )}
    </>
  );
};

export default Cart;