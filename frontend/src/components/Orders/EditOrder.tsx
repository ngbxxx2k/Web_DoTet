import React from "react";

const EditOrder = ({ order, toggleModal, onCancel }: any) => {
  const isCancellable = ["PENDING", "PROCESSING"].includes(String(order?.status).toUpperCase());

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      toggleModal(false);
    }
  };

  return (
    <div className="w-full px-10">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-dark mb-2">Quản lý đơn hàng</h4>
        <p className="text-sm text-gray-500">Mã đơn hàng: #{order?.orderId}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-600 mb-1">Trạng thái hiện tại:</p>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              order?.status === 'DELIVERED' ? 'text-green-700 bg-green-100' :
              order?.status === 'CANCELLED' ? 'text-red-700 bg-red-100' :
              order?.status === 'PROCESSING' ? 'text-yellow-700 bg-yellow-100' :
              'text-blue-700 bg-blue-100'
            }`}>
          {(() => {
             switch (String(order?.status).toUpperCase()) {
                case 'PENDING': return 'Chờ xử lý';
                case 'PROCESSING': return 'Đang xử lý';
                case 'SHIPPING': return 'Đang giao hàng';
                case 'DELIVERED': return 'Đã giao hàng';
                case 'CANCELLED': return 'Đã huỷ';
                case 'RETURNED': return 'Trả hàng';
                default: return order?.status;
             }
          })()}
        </span>
      </div>

      {isCancellable ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Bạn có thể huỷ đơn hàng này nếu chưa được vận chuyển. Hành động này không thể hoàn tác.
          </p>
          <button
            className="w-full rounded-[10px] bg-red-600 text-white py-3 px-5 font-medium hover:bg-red-700 transition-colors"
            onClick={handleCancel}
          >
            Huỷ đơn hàng
          </button>
        </div>
      ) : (
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-yellow-800 text-sm">
            Đơn hàng này không thể huỷ ở trạng thái hiện tại. Vui lòng liên hệ bộ phận chăm sóc khách hàng nếu cần hỗ trợ.
          </p>
        </div>
      )}

      <button
        className="mt-4 w-full text-gray-500 text-sm hover:text-dark py-2"
        onClick={() => toggleModal(false)}
      >
        Đóng
      </button>
    </div>
  );
};

export default EditOrder;
