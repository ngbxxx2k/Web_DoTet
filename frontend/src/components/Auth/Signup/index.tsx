"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login } from "@/redux/features/auth-slice";
import { removeAllItemsFromCart, setCartItems } from "@/redux/features/cart-slice";

const Signup = () => {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cartReducer.items);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // 1. Register
      const registerResponse = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          phoneNumber: data.phone,
          password: data.password,
        }),
      });

      if (registerResponse.ok) {
        toast.success("Tạo tài khoản thành công! Đang đăng nhập...");
        
        // 2. Auto Login
        const loginResponse = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              phoneNumber: data.phone,
              password: data.password,
            }),
        });

        if (loginResponse.ok) {
             const userData = await loginResponse.json();
             dispatch(login({ user: userData, token: "session" }));
             
             // 3. Sync Cart
             if (cartItems.length > 0) {
                try {
                     const syncResponse = await fetch("http://localhost:8080/api/cart/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
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
                } catch (err) {
                    console.error("Cart sync failed", err);
                }
             } else {
                 // Fetch existing cart if any
                 try {
                     const cartRes = await fetch("http://localhost:8080/api/cart", { method: "GET", credentials: "include" });
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
                 } catch (e) { console.error(e); }
             }

             router.push("/");
        } else {
             router.push("/signin");
        }
      } else {
        const errorData = await registerResponse.json().catch(() => ({}));
        toast.error(errorData.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const password = watch("password");

  return (
    <>
      <Breadcrumb title={"Đăng Ký"} pages={["Đăng Ký"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Tạo Tài Khoản
              </h2>
            </div>

            <div className="mt-5.5">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    Họ Tên <span className="text-red">*</span>
                  </label>

                  <input
                    type="text"
                    id="name"
                    placeholder="Nhập họ tên"
                    {...register("name", { required: "Vui lòng nhập họ tên" })}
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.name ? 'border-red-500' : 'border-gray-3'}`}
                  />
                  {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message as string}</span>}
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email <span className="text-red">*</span>
                  </label>

                  <input
                    type="email"
                    id="email"
                    placeholder="Nhập email"
                    {...register("email", { 
                        required: "Vui lòng nhập email",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                            message: "Email không hợp lệ"
                        }
                    })}
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.email ? 'border-red-500' : 'border-gray-3'}`}
                  />
                  {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message as string}</span>}
                </div>
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
                    Mật khẩu <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    id="password"
                    placeholder="Nhập mật khẩu"
                    autoComplete="on"
                    {...register("password", { 
                        required: "Vui lòng nhập mật khẩu",
                        minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                    })}
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.password ? 'border-red-500' : 'border-gray-3'}`}
                  />
                  {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password.message as string}</span>}
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re-type-password" className="block mb-2.5">
                    Nhập Lại Mật Khẩu <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    id="re-type-password"
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="on"
                    {...register("re-type-password", { 
                        required: "Vui lòng nhập lại mật khẩu",
                        validate: (val: string) => {
                            if (watch('password') != val) {
                                return "Mật khẩu không khớp";
                            }
                        }
                    })}
                    className={`rounded-lg border bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors['re-type-password'] ? 'border-red-500' : 'border-gray-3'}`}
                  />
                  {errors['re-type-password'] && <span className="text-red-500 text-sm mt-1">{errors['re-type-password'].message as string}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:bg-gray-400"
                >
                  {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
                </button>

                <p className="text-center mt-6">
                  Đã có tài khoản?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Đăng Nhập Ngay
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

export default Signup;
