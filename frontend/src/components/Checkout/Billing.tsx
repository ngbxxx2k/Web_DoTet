import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface BillingProps {
    register: UseFormRegister<any>;
    errors: FieldErrors;
}

const Billing: React.FC<BillingProps> = ({ register, errors }) => {
  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Thông Tin Thanh Toán
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="fullName" className="block mb-2.5">
              Họ và Tên <span className="text-red">*</span>
            </label>

            <input
              type="text"
              id="fullName"
              placeholder="Nguyễn Văn A"
              {...register("customerName", { required: "Vui lòng nhập họ tên" })}
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.customerName ? 'border-red-500' : 'border-gray-3'}`}
            />
             {errors.customerName && <span className="text-red-500 text-sm">{errors.customerName.message as string}</span>}
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            Số Điện Thoại <span className="text-red">*</span>
          </label>

          <input
            type="text"
            id="phone"
            placeholder="Số điện thoại"
            {...register("customerPhone", { required: "Vui lòng nhập số điện thoại" })}
            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.customerPhone ? 'border-red-500' : 'border-gray-3'}`}
          />
           {errors.customerPhone && <span className="text-red-500 text-sm">{errors.customerPhone.message as string}</span>}
        </div>

        <div className="mb-5.5">
          <label htmlFor="email" className="block mb-2.5">
            Địa chỉ Email <span className="text-red">*</span>
          </label>

          <input
            type="email"
            id="email"
            placeholder="Địa chỉ Email"
            {...register("customerEmail", { 
                required: "Vui lòng nhập email",
                pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Email không hợp lệ"
                }
            })}
            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.customerEmail ? 'border-red-500' : 'border-gray-3'}`}
          />
           {errors.customerEmail && <span className="text-red-500 text-sm">{errors.customerEmail.message as string}</span>}
        </div>

        <div className="mb-5">
          <label htmlFor="address" className="block mb-2.5">
            Địa chỉ (Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố) <span className="text-red">*</span>
          </label>

          <input
            type="text"
            id="address"
            placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
            {...register("shippingAddress", { required: "Vui lòng nhập địa chỉ" })}
            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${errors.shippingAddress ? 'border-red-500' : 'border-gray-3'}`}
          />
           {errors.shippingAddress && <span className="text-red-500 text-sm">{errors.shippingAddress.message as string}</span>}
        </div>
      </div>
    </div>
  );
};

export default Billing;
