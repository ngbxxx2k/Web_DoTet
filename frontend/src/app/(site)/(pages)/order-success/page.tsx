"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
        router.push("/");
    }, 5000);

    return () => {
        clearInterval(timer);
        clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4">
      <div className="mb-6">
         {/* Success Icon */}
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
         </div>
      </div>
      
      <h1 className="text-3xl font-bold text-dark mb-4 text-center">Cảm ơn bạn đã đặt hàng!</h1>
      <p className="text-gray-600 text-lg mb-8 text-center max-w-lg">
        Đơn hàng của bạn đã được đặt thành công. Chúng tôi đang xử lý và sẽ thông báo cho bạn sớm nhất.
      </p>

      <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-500">Đang chuyển hướng về trang chủ trong <span className="font-bold text-dark">{countdown}</span> giây...</p>
      </div>

      <Link href="/" className="inline-flex items-center justify-center bg-blue text-white px-8 py-3 rounded-md hover:bg-blue-dark transition-colors">
        Quay về Trang Chủ Ngay
      </Link>
    </div>
  );
};

const OrderSuccess = () => {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <SuccessContent />
        </Suspense>
    );
};

export default OrderSuccess;
