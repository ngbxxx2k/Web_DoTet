import React from "react";
import { OrderItem } from "@/services/order.service";
import { formatVND, formatDateTimeVN } from "@/utils/format";

const getStatusText = (status: string) => {
  switch (String(status).toUpperCase()) {
    case 'PENDING': return 'Chờ xử lý';
    case 'PROCESSING': return 'Đang xử lý';
    case 'SHIPPING': return 'Đang giao hàng';
    case 'DELIVERED': return 'Đã giao hàng';
    case 'CANCELLED': return 'Đã hủy';
    case 'RETURNED': return 'Trả hàng';
    default: return status;
  }
};

const OrderDetails = ({ orderItem }: any) => {
  if (!orderItem) return null;

  return (
    <div className="w-full h-full overflow-y-auto px-4 pb-4">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b border-gray-200 pb-4">
        <div>
          <h4 className="font-semibold text-lg text-dark mb-2">Chi tiết đơn hàng #{orderItem.orderId}</h4>
          <p className="text-sm text-gray-500">Ngày đặt: {formatDateTimeVN(orderItem.createdAt)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Trạng thái: <span className={`font-medium ${
              orderItem.status === 'DELIVERED' ? 'text-green-600' :
              orderItem.status === 'CANCELLED' ? 'text-red-600' :
              orderItem.status === 'PROCESSING' || orderItem.status === 'PENDING' ? 'text-yellow-600' :
              'text-blue-600'
            }`}>{getStatusText(orderItem.status)}</span>
          </p>
        </div>
        <div className="md:text-right">
             <p className="text-sm text-gray-500">Phương thức thanh toán: <span className="font-medium text-dark">{orderItem.paymentMethod}</span></p>
             <p className="font-bold text-xl text-primary mt-2">{formatVND(orderItem.total)}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="mb-6">
        <h5 className="font-medium text-dark mb-3">Sản phẩm</h5>
        <div className="space-y-4">
          {orderItem.items?.map((item: OrderItem) => (
            <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
              <div className="w-16 h-16 flex-shrink-0 bg-white rounded border border-gray-200 overflow-hidden">
                <img 
                  src={item.thumbnail || "/images/product/product-01.png"} 
                  alt={item.productName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium text-dark line-clamp-2">{item.productName}</p>
                <p className="text-sm text-gray-500">x{item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-dark">
                  {formatVND(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-dark mb-2">Địa chỉ giao hàng</h5>
        <p className="text-sm text-gray-600">{orderItem.shippingAddress || "Không có địa chỉ"}</p>
      </div>
    </div>
  );
};

export default OrderDetails;
