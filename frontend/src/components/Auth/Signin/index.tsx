"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { removeAllItemsFromCart, setCartItems } from "@/redux/features/cart-slice";

import { login } from "@/redux/features/auth-slice";

const Signin = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  
  // Redux
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for Session Cookie
        body: JSON.stringify({
          phoneNumber: data.phone,
          password: data.password,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Dispatch login to Redux
        dispatch(login({ user: userData, token: "session" })); // Using session based auth
        toast.success("Đăng nhập thành công!");
        
        // Sync Cart Logic
        if (cartItems.length > 0) {
           try {
             // 1. Send local cart to server
             const syncResponse = await fetch("/api/cart/sync", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                 body: JSON.stringify(cartItems.map(item => ({
                    productVariantId: item.id, 
                    quantity: item.quantity
                 })))
             });
             
             if (syncResponse.ok) {
                 dispatch(removeAllItemsFromCart());
                 const updatedCart = await syncResponse.json();
                 
                 const newItems = updatedCart.items.map((item: any) => ({
                    id: item.productVariantId,
                    title: item.title,
                    price: item.price,
                    discountedPrice: item.price,
                    quantity: item.quantity,
                    imgs: {
                        thumbnails: [item.imageUrl || "/images/product/product-01.png"],
                        previews: [item.imageUrl || "/images/product/product-01.png"]
                    }
                 }));
                 
                 dispatch(setCartItems(newItems));
             }
           } catch (syncError) {
             console.error("Cart sync failed", syncError);
           }
        } else {
              try {
                 const cartRes = await fetch("/api/cart", {
                     method: "GET",
                     credentials: "include"
                 });
                 if (cartRes.ok) {
                    const cartData = await cartRes.json();
                    if (cartData.items) {
                         const newItems = cartData.items.map((item: any) => ({
                            id: item.productVariantId,
                            title: item.title,
                            price: item.price,
                            discountedPrice: item.price,
                            quantity: item.quantity,
                            imgs: {
                                thumbnails: [item.imageUrl || "/images/product/product-01.png"],
                                previews: [item.imageUrl || "/images/product/product-01.png"]
                            }
                         }));
                         dispatch(setCartItems(newItems));
                    }
                 }
              } catch (e) {
                  console.error("Failed to fetch cart", e);
              }
        }

        // Redirect based on role
        if (userData.roleCode === "ADMIN" || userData.roleCode === "STAFF") {
            router.push("/admin");
        } else {
            router.push("/");
        }
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Đăng Nhập"} pages={["Đăng Nhập"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Đăng Nhập Vào Tài Khoản
              </h2>
            </div>

            <div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                  <label htmlFor="phone" className="block mb-2.5">
                    Số Điện Thoại <span className="text-red">*</span>
                  </label>

                  <input
                    type="text"
                    id="phone"
                    placeholder="Nhập số điện thoại"
                    {...register("phone", { required: "Vui lòng nhập số điện thoại" })}
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.phone ? 'border-red-500' : 'border-gray-3'}`}
                  />
                  {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone.message as string}</span>}
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Mật khẩu
                  </label>

                  <input
                    type="password"
                    id="password"
                    placeholder="Nhập mật khẩu"
                    autoComplete="on"
                    {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.password ? 'border-red-500' : 'border-gray-3'}`}
                  />
                  {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password.message as string}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:bg-gray-400"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                </button>

                <Link
                  href="/forgot-password"
                  className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Quên mật khẩu?
                </Link>

                <p className="text-center mt-6">
                  Chưa có tài khoản?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Đăng Ký Ngay!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
