"use client";
import React, { useEffect, useState, useCallback } from "react";
import SingleOrder from "./SingleOrder";
import { OrderService, Order } from "@/services/order.service";
import { useAppSelector } from "@/redux/store";
import toast from "react-hot-toast";

import ConfirmModal from "../ui/ConfirmModal";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAppSelector((state) => state.authReducer.token);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await OrderService.getMyOrders(token);
      setOrders(data);
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes("403") || error.message.includes("401"))) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelClick = (orderId: number) => {
    setCancelOrderId(orderId);
  };

  const handleConfirmCancel = async () => {
    if (!token || !cancelOrderId) return;
    try {
      await OrderService.cancelOrder(cancelOrderId, token);
      toast.success("Hủy đơn hàng thành công");
      fetchOrders(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || "Hủy đơn hàng thất bại");
    } finally {
      setCancelOrderId(null);
    }
  };

  if (isLoading) {
    return <p className="py-8 text-center">Đang tải đơn hàng...</p>;
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* <!-- order item --> */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex border-b border-gray-3 mb-5">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark font-medium">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark font-medium">Date</p>
              </div>

              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark font-medium">Status</p>
              </div>

              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark font-medium">Title</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark font-medium">Total</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark font-medium">Action</p>
              </div>
            </div>
          )}
          {orders.length > 0 ? (
            orders.map((orderItem, key) => (
              <SingleOrder 
                key={key} 
                orderItem={orderItem} 
                smallView={false} 
                onCancel={() => handleCancelClick(orderItem.id)}
              />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-center">
              You don&apos;t have any orders yet!
            </p>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((orderItem, key) => (
            <SingleOrder 
              key={key} 
              orderItem={orderItem} 
              smallView={true} 
              onCancel={() => handleCancelClick(orderItem.id)}
            />
          ))}
      </div>

      <ConfirmModal
        isOpen={!!cancelOrderId}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelOrderId(null)}
        confirmText="Yes, Cancel Order"
        type="danger"
      />
    </>
  );
};

export default Orders;
