"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import SingleItem from "./SingleItem";
import Link from "next/link";

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const handleClearWishlist = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh sách yêu thích?")) {
      dispatch(removeAllItemsFromWishlist());
    }
  };

  return (
    <>
      <Breadcrumb title={"Danh Sách Yêu Thích"} pages={["Danh Sách Yêu Thích"]} />
      {wishlistItems.length > 0 ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Danh Sách Yêu Thích Của Bạn</h2>
              <button type="button" onClick={handleClearWishlist} className="text-blue hover:text-red-500">
                Xóa Danh Sách
              </button>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark">Sản Phẩm</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark">Đơn Giá</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark">Tình Trạng Kho</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark text-right">Hành Động</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
                  {wishlistItems.map((item, key) => (
                    <SingleItem item={item} key={key} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center py-20">
          <div className="mx-auto pb-7.5">
            <svg
              className="mx-auto"
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
              <path
                d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C63.8 75 75 63.8 75 50C75 36.2 63.8 25 50 25ZM60.5 55.5C61.3 56.3 61.3 57.7 60.5 58.5C60.1 58.9 59.6 59.1 59 59.1C58.4 59.1 57.9 58.9 57.5 58.5L50 51L42.5 58.5C42.1 58.9 41.6 59.1 41 59.1C40.4 59.1 39.9 58.9 39.5 58.5C38.7 57.7 38.7 56.3 39.5 55.5L47 48L39.5 40.5C38.7 39.7 38.7 38.3 39.5 37.5C40.3 36.7 41.7 36.7 42.5 37.5L50 45L57.5 37.5C58.3 36.7 59.7 36.7 60.5 37.5C61.3 38.3 61.3 39.7 60.5 40.5L53 48L60.5 55.5Z"
                fill="#8D93A5"
              />
            </svg>
          </div>

          <p className="pb-6 text-lg">Danh sách yêu thích trống!</p>

          <Link
            href="/shop-with-sidebar"
            className="w-96 mx-auto flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
          >
            Khám Phá Sản Phẩm
          </Link>
        </div>
      )}
    </>
  );
};
