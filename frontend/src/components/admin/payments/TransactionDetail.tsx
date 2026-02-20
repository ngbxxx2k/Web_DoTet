"use client";

import React, { useState, useEffect } from "react";
import { useOrderById, useOrders, PAYMENT_STATUSES } from "@/hooks/useOrders";
import { formatVND, formatDateTimeVN } from "@/utils/format";

interface TransactionDetailProps {
  orderId: number | null;
  onStatusUpdated?: () => void;
}

export default function TransactionDetail({ orderId, onStatusUpdated }: TransactionDetailProps) {
  const { order, loading, refresh } = useOrderById(orderId);
  const { updatePaymentStatus } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.paymentStatus);
    }
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!orderId) return;
    setIsUpdating(true);
    await updatePaymentStatus(orderId, selectedStatus);
    refresh();
    if (onStatusUpdated) onStatusUpdated();
    setIsUpdating(false);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-invoice");
    if (!printContent) return;

    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Build the print document
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Hóa Đơn #{order?.orderCode}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .text-center { text-center: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .mt-6 { margin-top: 1.5rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
            .p-4 { padding: 1rem; }
            .bg-slate-50 { background-color: #f8fafc; }
            .border { border: 1px solid #e2e8f0; }
            .rounded-xl { border-radius: 0.75rem; }
            .text-3xl { font-size: 1.875rem; }
            .font-black { font-weight: 900; }
            .text-primary { color: #2563eb; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .font-bold { font-weight: 700; }
            .text-slate-500 { color: #64748b; }
            .divide-y > * + * { border-top: 1px solid #e2e8f0; }
            .w-full { width: 100%; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; background: #f8fafc; font-size: 10px; color: #64748b; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .text-right { text-align: right; }
            .no-print { display: none !important; }
            @page { margin: 0; }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
              <div>
                <h1 style="font-size: 24px; font-weight: 900; margin: 0;">HÓA ĐƠN</h1>
                <p style="color: #64748b;">#{order?.orderCode}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: 700; margin: 0;">Shop MDuy</p>
                <p style="font-size: 12px; color: #64748b; margin: 0;">contact@shopmduy.com</p>
              </div>
            </div>

            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
              <p style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Tổng Tiền Đã Thanh Toán</p>
              <h2 style="font-size: 32px; font-weight: 900; color: #2563eb; margin: 0;">${formatVND(order?.finalAmount)}</h2>
            </div>

            <div style="margin-bottom: 40px; space-y: 20px;">
              <div style="margin-bottom: 24px;">
                <h4 style="font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">Thông Tin Khách Hàng</h4>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; color: #64748b;">Họ Tên</span>
                  <span style="font-size: 13px; font-weight: 700;">${order?.customerName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <span style="font-size: 13px; color: #64748b;">Liên Hệ</span>
                  <span style="font-size: 13px;">${order?.customerEmail || order?.customerPhone || ""}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
                  <span style="font-size: 13px; color: #64748b;">Địa Chỉ</span>
                  <span style="font-size: 13px; text-align: right; max-width: 250px;">${order?.shippingAddress}</span>
                </div>
              </div>
              
              <div>
                <h4 style="font-size: 10px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">Chi Tiết Đơn Hàng</h4>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; color: #64748b;">Ngày Đặt</span>
                  <span style="font-size: 13px; font-weight: 700;">${formatDateTimeVN(order?.createdAt)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <span style="font-size: 13px; color: #64748b;">Phương Thức TT</span>
                  <span style="font-size: 13px; font-weight: 700;">${order?.paymentMethodText}</span>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sản Phẩm</th>
                  <th style="text-align: center;">SL</th>
                  <th style="text-align: right;">Đơn Giá</th>
                  <th style="text-align: right;">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                ${order?.items?.map(item => `
                  <tr>
                    <td>
                      <div style="font-weight: 700;">${item.productName}</div>
                      <div style="font-size: 11px; color: #64748b;">${item.variantName || ""}</div>
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatVND(item.unitPrice)}</td>
                    <td style="text-align: right; font-weight: 700;">${formatVND(item.unitPrice * item.quantity)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div style="margin-top: 30px; border-top: 2px solid #f1f5f9; padding-top: 20px;">
              <div style="width: 100%;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                  <span style="font-weight: 700;">Tạm Tính</span>
                  <span style="font-weight: 700;">${formatVND(order?.totalAmount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                  <span style="font-weight: 700;">Phí Vận Chuyển</span>
                  <span style="font-weight: 700;">${formatVND(order?.shippingFee)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #1e293b; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                  <span>Tổng Cộng</span>
                  <span style="color: #2563eb;">${formatVND(order?.finalAmount)}</span>
                </div>
              </div>
            </div>

            ${order?.note ? `
              <div style="margin-top: 40px; padding: 20px; background: #fffcf0; border: 1px solid #fef3c7; border-radius: 8px;">
                <h5 style="font-size: 10px; color: #b45309; text-transform: uppercase; margin: 0 0 8px 0;">Notes</h5>
                <p style="font-size: 12px; color: #92400e; margin: 0; font-style: italic;">${order.note}</p>
              </div>
            ` : ""}

            <div style="margin-top: 60px; text-align: center; border-t: 1px solid #f1f5f9; padding-top: 20px;">
              <p style="font-size: 12px; color: #94a3b8;">Cảm ơn quý khách đã mua hàng!</p>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Small delay to ensure styles are loaded, then print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  if (!orderId) {
    return (
      <div className="hidden lg:flex w-[40%] flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-800 z-10 h-full p-12 text-center">
        <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
        </div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Chọn một giao dịch để xem chi tiết</h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hidden lg:flex w-[40%] flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-800 z-10 h-full">
        <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="hidden lg:flex w-[40%] flex-col bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-800 z-10 h-full relative">
      
      {/* Styles for Printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Reset for print */
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          
          /* Hide everything by default */
          body * { 
            visibility: hidden !important; 
          }
          
          /* Show only the invoice and its children */
          #printable-invoice, #printable-invoice * { 
            visibility: visible !important; 
          }
          
          /* Position the invoice for printing */
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 1.5cm !important;
            background: white !important;
            color: black !important;
            display: block !important;
          }

          /* Hide UI elements that shouldn't be printed */
          .no-print, [display="none"] { 
            display: none !important; 
            visibility: hidden !important;
          }

          /* Force dark mode colors to light mode for better printing */
          .dark #printable-invoice {
            background: white !important;
            color: black !important;
          }
          .dark #printable-invoice * {
            color: black !important;
            border-color: #eee !important;
          }
          
          /* Ensure backgrounds are printed if possible */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      {/* --- HEADER --- */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 no-print">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Giao Dịch #{order.orderCode}
          </h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
            title="In Hóa Đơn"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
          </button>
        </div>
      </div>

      {/* --- CONTENT (Printable Section) --- */}
      <div id="printable-invoice" className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-md mx-auto space-y-6">

          {/* 1. TỔNG TIỀN */}
          <div className="text-center py-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm print:border-none print:shadow-none">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Tổng Cộng
            </p>
            <h2 className="text-3xl font-black text-primary">
              {formatVND(order.finalAmount)}
            </h2>
          </div>

          {/* 2. THÔNG TIN CHUNG */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-100 dark:divide-slate-700 print:divide-slate-200">
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Khách Hàng</span>
              <div className="flex items-center gap-3 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{order.customerName}</span>
                  <span className="text-xs text-slate-500">{order.customerEmail || order.customerPhone}</span>
                </div>
                {order.customerAvatar && (
                  <img src={order.customerAvatar} alt="" className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-600 no-print"/>
                )}
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Phương Thức TT</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="text-sm font-semibold">{order.paymentMethodText}</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ngày Đặt</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="text-sm font-semibold">{formatDateTimeVN(order.createdAt)}</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Giao Tới</span>
              <div className="text-right max-w-[200px]">
                <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">{order.shippingAddress}</span>
              </div>
            </div>
          </div>

          {/* 3. DANH SÁCH SẢN PHẨM */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sản Phẩm ({order.items?.length || 0})</h4>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="h-10 w-10 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 overflow-hidden no-print">
                     {item.productImage ? (
                       <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                     ) : (
                       <span className="material-symbols-outlined text-slate-300">image</span>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.productName}
                    </p>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatVND(item.unitPrice)} x {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {formatVND(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Tạm Tính</span>
                    <span>{formatVND(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Phí Vận Chuyển</span>
                    <span>{formatVND(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Tổng Cộng</span>
                    <span className="text-primary">{formatVND(order.finalAmount)}</span>
                </div>
            </div>
          </div>

          {order.note && (
             <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl">
                <h5 className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 mb-1 tracking-widest">Ghi Chú Nội Bộ</h5>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed italic">"{order.note}"</p>
             </div>
          )}

        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 no-print">
        <div className="flex flex-col gap-4">
          
          {/* Payment Status Selector */}
          <div className="w-full">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 block uppercase tracking-widest">
              Cập Nhật Trạng Thái Quyết Toán
            </label>
            <div className="relative">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(Number(e.target.value))}
                className="appearance-none w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer text-slate-900 dark:text-white transition-all"
              >
                {PAYMENT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button 
            onClick={handleUpdateStatus}
            disabled={isUpdating || selectedStatus === order.paymentStatus}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-white hover:bg-blue-600 shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isUpdating ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm font-bold">verified</span>
                Đồng Bộ Sao Kê
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
