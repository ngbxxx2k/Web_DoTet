"use client";

import React from "react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({
  isOpen,
  onClose,
}: AddProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Container chính: max-h-[90vh] để giới hạn chiều cao modal, flex-col để chia bố cục dọc */}
      <div className="relative w-full max-w-[960px] max-h-[90vh] flex flex-col bg-white dark:bg-[#1a2133] border border-[#dbdfe6] dark:border-[#2a3142] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header: shrink-0 để không bị co lại khi danh sách dài */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2 shrink-0">
          <h2 className="text-[#111318] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
            Select Product
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[#111318] dark:text-[#a0aec0] hover:bg-[#f0f2f4] dark:hover:bg-[#2a3142] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filter Section: shrink-0 */}
        <div className="flex flex-wrap items-end gap-4 px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3142] shrink-0">
          <label className="flex flex-col min-w-[280px] flex-1">
            <p className="text-[#111318] dark:text-white text-sm font-medium leading-normal pb-2">
              Search Products
            </p>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#616f89]">
                search
              </span>
              <input
                className="flex w-full min-w-0 flex-1 rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#101622] h-12 placeholder:text-[#616f89] pl-11 pr-4 text-sm"
                placeholder="Search name or SKU..."
                defaultValue=""
              />
            </div>
          </label>
          <label className="flex flex-col min-w-[200px] w-full md:w-auto">
            <p className="text-[#111318] dark:text-white text-sm font-medium leading-normal pb-2">
              Category
            </p>
            <select className="flex w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#101622] h-12 px-4 text-sm">
              <option>All Categories</option>
              <option>Clothing</option>
              <option>Footwear</option>
              <option>Accessories</option>
              <option>Electronics</option>
            </select>
          </label>
        </div>

        {/* Product List: flex-1 overflow-y-auto để cuộn độc lập phần này */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Product 1 */}
            <div className="flex flex-col h-full rounded-xl border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#1a2133] overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square w-full bg-[#f0f2f4] dark:bg-[#2a3142] relative p-4">
                 {/* Dùng thẻ img với object-contain để ảnh không bị cắt */}
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd-I-p3-UzF6VWDRv1Ezms-wqp6frTF2hRnqTjXsGIPGo4auiX1k8oW3XiNXtpK6ZgKb9YicpFtj4e9ofTYLapyhDIj34Xof7F07-ALKreVWBpnR9GusFNh5IYlT0yPoHd4ucAphkl3LDQc1ihGnQx1TVVYoqaTs0xtBoJwSKmTuwmufl_vR0hY1tuQkYHQjRBQ0M_YdLncsZIA1jpGrOSrppiuPmqNmuTAK-G1jaZ4mNdPij4OHQQ0_cHJ9tljTQt8h_pw8Wlm8ux" 
                  alt="Urban Runner X1"
                  className="w-full h-full object-contain object-center mix-blend-multiply dark:mix-blend-normal"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    In Stock: 24
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex flex-col">
                  <h3 className="text-[#111318] dark:text-white font-bold text-base leading-tight">
                    Urban Runner X1
                  </h3>
                  <p className="text-[#616f89] text-xs font-medium mt-1">SKU: FTW-9021-W</p>
                </div>
                {/* mt-auto đẩy phần giá và nút xuống đáy thẻ */}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-primary font-bold text-lg">$129.00</p>
                  <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div className="flex flex-col h-full rounded-xl border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#1a2133] overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square w-full bg-[#f0f2f4] dark:bg-[#2a3142] relative p-4">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsgDICVCgFrwZseBZITChu0PPp_FIT9Iimn_hjhQwF2beo7HVARiZQW-InNki4yIqtmuCmQ5PNZXEwA-DRxoWAKZlW8R7tQ4ccjiBN9Y9DDwv2AL8_BPKS93KIdvzGxMHBc6QT7bA4B0iyXnVNMZELg7tq7mRld_Wlcmn0T47APDUMizhkco6GIxwj1faM7MI6HFcvMcw0HFUYtJ8o029jlCyvXvcGsyWcImT1wYsKgofcQDzK7d8B9ET3eOeRyzK5VqWtFJ3dUW4m" 
                  alt="Essential Tee"
                  className="w-full h-full object-contain object-center opacity-60 grayscale mix-blend-multiply dark:mix-blend-normal"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Out of Stock
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex flex-col">
                  <h3 className="text-[#111318] dark:text-white font-bold text-base leading-tight">
                    Essential Tee - Black
                  </h3>
                  <p className="text-[#616f89] text-xs font-medium mt-1">SKU: CLO-4421-B</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-primary font-bold text-lg">$35.00</p>
                  <button
                    className="bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed rounded-lg px-4 py-2 text-sm font-bold"
                    disabled
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product 3 */}
            <div className="flex flex-col h-full rounded-xl border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#1a2133] overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square w-full bg-[#f0f2f4] dark:bg-[#2a3142] relative p-4">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMnBWNcw1EOldneNRa_d5F2I67vsTAoe1FTqwKO7EelQrsuAPxhsJFI__jpMZrSflf-duxLEABZL4loBKNvdxvQmJeeoY0mJc3T9CACrn5gm38E8Qx1q_g7dAcHHisuFvkaIxv2gicqCvufMQbVXqo-rESGQXQipGWnrQ5trMhJMzRBdlXAu_1kh6u5Il7Hb-qTFJjKCOrLJ_y_56fj4PbFCF4emYqKtbModuQD5PFxrDqJW7BFl_7P91S18BtenEhX3w47O6QYV8D" 
                  alt="Vintage Leather Bag"
                  className="w-full h-full object-contain object-center mix-blend-multiply dark:mix-blend-normal"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    In Stock: 8
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex flex-col">
                  <h3 className="text-[#111318] dark:text-white font-bold text-base leading-tight">
                    Vintage Leather Bag
                  </h3>
                  <p className="text-[#616f89] text-xs font-medium mt-1">SKU: ACC-1092-T</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-primary font-bold text-lg">$89.50</p>
                  <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product 4 */}
            <div className="flex flex-col h-full rounded-xl border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#1a2133] overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square w-full bg-[#f0f2f4] dark:bg-[#2a3142] relative p-4">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8uvk5E4cxmvD0sLDQ8iq1LSRYGgXNDgT6s9ZZ0Mtzwg2q2GD35MPx_N2K3t22bo5yt--pi9hGTIj8lcgFCSSpBh3U6moMJGCv-5Et-Db1ArfuhKLYBR4DQymJYmFtWdkvwwjRlrW4gOYXxyETak7M75gG0QuU1pSraJW2sKyu_Uy3d8HMRLkaz9YbrYT7kbgwB6VxzPQrwjNs5Ij_MspKM4OeNU7jZl705MDnYLrJGv6vI27wnkfcqa053bUm6kSRVh8G-ObUjpZr" 
                  alt="Comfort Hoodie"
                  className="w-full h-full object-contain object-center mix-blend-multiply dark:mix-blend-normal"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Low Stock: 3
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex flex-col">
                  <h3 className="text-[#111318] dark:text-white font-bold text-base leading-tight">
                    Comfort Hoodie
                  </h3>
                  <p className="text-[#616f89] text-xs font-medium mt-1">SKU: CLO-2200-N</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-primary font-bold text-lg">$55.00</p>
                  <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product 5 */}
            <div className="flex flex-col h-full rounded-xl border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#1a2133] overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square w-full bg-[#f0f2f4] dark:bg-[#2a3142] relative p-4">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAapRMqGs_325hMKDehxP-zHakn4ffyAroKrHJarzQsMOrfz5Om4w0tOV7UAmYfAXJTVHX-iqzZiicra33gG73cPgFF61Gn8k_9Y-NaZtcbnt8LdTPF3Zh8Xd3deB5l8ha2VUtwqAo2L_9IIfan6eFOd034oH6Ord3STEas8HVIzH_vNfJU6oPwdOs_zRCgOzUlLXJODpZLV3hihrJfJt3Jn4UHUNu-0nmzGmzrMJBoO4MB6QJjjUjZ-KmTHPZBuD2aplLeI_EpU_DJ" 
                  alt="Quartz Pro Watch"
                  className="w-full h-full object-contain object-center mix-blend-multiply dark:mix-blend-normal"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    In Stock: 15
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex flex-col">
                  <h3 className="text-[#111318] dark:text-white font-bold text-base leading-tight">
                    Quartz Pro Watch
                  </h3>
                  <p className="text-[#616f89] text-xs font-medium mt-1">SKU: ACC-4040-S</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-primary font-bold text-lg">$199.00</p>
                  <button className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product 6 */}
            <div className="flex flex-col h-full rounded-xl border border-[#dbdfe6] dark:border-[#2a3142] bg-white dark:bg-[#1a2133] overflow-hidden hover:shadow-md transition-shadow group">
              <div className="aspect-square w-full bg-[#f0f2f4] dark:bg-[#2a3142] relative p-4">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU7JmWuK0dJ1Ib83intsFSPEWpk_RriPem8z2F01q3G0TL99psZYenVl7QVpu_4WxWg3w0cGtEIjVAwkh9uy3thWtbWfbffpkyOPQ8oMi4N8rcVjOzAcvvTnxwmK_gmwhhDyK27dcRrZ2wlSg5QCCdvWxI4x_I-ZXEl9KwgrRfOyNtJuLedvV21MyrA3Pu0V9b7oIu7z_NENWd43NzSjMB1Cl77Rb4yQxmHGUCGlKXZasQ5GPlTRHKiSWh4286HDE_T4bqTRs4_c8V" 
                  alt="Canvas Slip-On"
                  className="w-full h-full object-contain object-center opacity-60 grayscale mix-blend-multiply dark:mix-blend-normal"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Out of Stock
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex flex-col">
                  <h3 className="text-[#111318] dark:text-white font-bold text-base leading-tight">
                    Canvas Slip-On
                  </h3>
                  <p className="text-[#616f89] text-xs font-medium mt-1">SKU: FTW-1100-B</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <p className="text-primary font-bold text-lg">$42.00</p>
                  <button
                    className="bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed rounded-lg px-4 py-2 text-sm font-bold"
                    disabled
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Buttons: shrink-0 */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-[#f8f9fa] dark:bg-[#101622] border-t border-[#dbdfe6] dark:border-[#2a3142] shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-bold text-[#111318] dark:text-white bg-white dark:bg-[#2a3142] border border-[#dbdfe6] dark:border-[#3a4152] hover:bg-gray-50 dark:hover:bg-[#323a4d] transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-colors">
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}