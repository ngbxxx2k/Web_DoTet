"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import PaymentMethod from "./PaymentMethod";
import Billing from "./Billing";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/redux/store";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { formatVND } from "@/utils/format";

interface CheckoutFormInputs {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  note?: string;
}

const Checkout = () => {
  const router = useRouter();
  const { cartItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Constants
  const shippingFee = 15; // Hardcoded shipping fee for now
  const finalTotal = totalAmount + shippingFee;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormInputs>();

  // Autofill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue("customerName", user.fullName || "");
      setValue("customerEmail", user.email || "");
      setValue("customerPhone", user.phoneNumber || "");
      // Address autofill if available in user object
      // setValue("shippingAddress", user.address || ""); 
    }
  }, [isAuthenticated, user, setValue]);

  const handlePlaceOrder: SubmitHandler<CheckoutFormInputs> = async (data) => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Đang xử lý đơn hàng...");

    try {
      // 1. Prepare Order Payload
      const orderPayload = {
        customerId: user?.id || null, // Optional if guest
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        shippingAddress: data.shippingAddress,
        note: data.note,
        paymentMethod: selectedPaymentMethod === 'cod' ? 0 : 1, // 0: COD, 1: Banking
        shippingFee: shippingFee,
        items: cartItems.map(item => ({
          productVariantId: item.id, // Assuming item.id is variantId based on previous context
          quantity: item.quantity
        }))
      };

      // 2. Create Order
      const response = await fetch(`/api/orders`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          // Important: send session cookie if needed, though most APIs use Authorization header
          // If using session cookie for auth:
           credentials: "include", 
          body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
          let errorMessage = "Đặt hàng thất bại";
          try {
              const errorText = await response.text();
              console.error("Backend Error Text:", errorText);
              try {
                  const errorJson = JSON.parse(errorText);
                  errorMessage = errorJson.message || (typeof errorJson === 'string' ? errorJson : JSON.stringify(errorJson));
              } catch {
                  errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
              }
          } catch (e) {
              errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
      }

      const orderData = await response.json(); // Response should contain created Order object (with orderId)

      // 3. Handle Payment Flow
      if (selectedPaymentMethod === 'cod') {
        // COD: Simply clear cart and redirect to success
        await clearCart();
        toast.success("Đặt hàng thành công!", { id: toastId });
        router.push("/order-success");
      } else {
        // VNPAY: Get Payment URL and Redirect
        toast.loading("Đang chuyển hướng đến cổng thanh toán...", { id: toastId });
        
        const paymentRes = await fetch(`/api/payment/vnpay-create-url?orderId=${orderData.id}`, {
             method: 'GET',
             credentials: "include"
        });
        
        if (!paymentRes.ok) {
             const errorText = await paymentRes.text();
             console.error("VNPAY API Error:", errorText);
             throw new Error(`Không thể tạo URL thanh toán: ${errorText}`);
        }

        const paymentUrl = await paymentRes.text(); // Provide URL as text
        if (paymentUrl) {
           if (isAuthenticated) {
               await clearCart(); 
           } else {
               await clearCart();
           }
           
           window.location.href = paymentUrl; // Redirect to VNPAY
        } else {
           throw new Error("Không thể tạo URL thanh toán");
        }
      }

    } catch (error: any) {
      console.error("Order Error:", error);
      toast.error(error.message || "Đặt hàng thất bại. Vui lòng thử lại.", { id: toastId });
      setIsProcessing(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    // Convert error object values to array and show first error message
    const firstError = Object.values(errors)[0] as any;
    toast.error(firstError?.message || "Vui lòng điền đầy đủ thông tin hợp lệ.");
  };

  return (
    <>
      <Breadcrumb title={"Thanh Toán"} pages={["Thanh Toán"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit(handlePlaceOrder, onInvalid)}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                {!isAuthenticated && <Login /> }

                {/* <!-- billing details --> */}
                <Billing register={register} errors={errors} />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Ghi chú khác (tùy chọn)
                    </label>

                    <textarea
                      id="notes"
                      rows={5}
                      placeholder="Ghi chú về đơn hàng của bạn, ví dụ: lưu ý khi giao hàng."
                      {...register("note")}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Đơn Hàng Của Bạn
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Sản phẩm</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Tạm tính
                        </h4>
                      </div>
                    </div>

                    {/* <!-- product items --> */}
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div className="flex items-center gap-3">
                           <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                                <Image 
                                    src={(item.imgs?.thumbnails && item.imgs.thumbnails.length > 0) ? item.imgs.thumbnails[0] : "/images/product/product-01.png"} 
                                    alt={item.title || "Product"} 
                                    layout="fill" 
                                    objectFit="cover"
                                />
                           </div>
                           <div className="flex flex-col gap-1">
                                <p className="text-dark text-sm font-medium line-clamp-2">{item.title}</p>
                                
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center border border-gray-3 rounded px-2 py-1 gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="text-gray-500 hover:text-dark text-xs"
                                        >
                                            -
                                        </button>
                                        <span className="text-xs font-medium text-dark min-w-[10px] text-center">{item.quantity}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="text-gray-500 hover:text-dark text-xs"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 text-xs hover:underline"
                                    >
                                        Xóa
                                    </button>
                                </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-dark text-right text-sm font-medium">
                            {formatVND(item.quantity * (item.discountedPrice || item.price))}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatVND(item.discountedPrice || item.price)} / ea
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {cartItems.length === 0 && (
                        <div className="py-5 text-center text-gray-500">
                            Giỏ hàng của bạn đang trống.
                        </div>
                    )}

                    {/* <!-- shipping fee --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Phí Vận Chuyển</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">{formatVND(shippingFee)}</p>
                      </div>
                    </div>

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Tổng Cộng</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {formatVND(finalTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- payment box --> */}
                <PaymentMethod selectedMethod={selectedPaymentMethod} onMethodChange={setSelectedPaymentMethod} />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Đang xử lý..." : "Tiến Hành Thanh Toán"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
