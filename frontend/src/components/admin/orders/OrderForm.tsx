"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Order, OrderInput, OrderItemInput, saveOrder, PAYMENT_METHODS, ORDER_STATUSES, PAYMENT_STATUSES, useOrderById } from "@/hooks/useOrders";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import { formatVND } from "@/utils/format";

interface OrderFormProps {
  initialData?: Order | null;
  mode: "add" | "edit" | "view";
  onClose: () => void;
}

interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  attributes: { name: string; value: string }[];
}

interface Product {
  id: number;
  productName: string;
  thumbnail: string | null;
  categoryName: string;
  variants: ProductVariant[];
}

interface Category {
  id: number;
  categoryName: string;
}

interface CartItem {
  productId: number;
  productName: string;
  productImage: string | null;
  variantId: number;
  variantName: string;
  price: number;
  quantity: number;
}

interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingFee: number;
  paymentMethod: number;
  status: number;
  paymentStatus: number;
  note: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function OrderForm({ initialData, mode, onClose }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Customer Picker State
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(initialData?.customerId || null);

  const { customers: matchingCustomers, loading: customersLoading } = useCustomers({
    search: customerSearch,
    size: 5,
  });

  // Product Picker State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});

  const isDisabled = mode === "view";
  
  // Ensure we have a valid numeric ID for fetching
  const orderIdForFetch = (mode !== "add" && initialData?.id) ? Number(initialData.id) : null;
  const { order: fullOrder, loading: orderLoading } = useOrderById(orderIdForFetch);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      customerName: initialData?.customerName || "",
      customerPhone: initialData?.customerPhone || "",
      customerEmail: initialData?.customerEmail || "",
      shippingAddress: initialData?.shippingAddress || "",
      shippingFee: initialData?.shippingFee || 0,
      paymentMethod: initialData?.paymentMethod ?? 0,
      status: initialData?.status ?? 0,
      paymentStatus: initialData?.paymentStatus ?? 0,
      note: initialData?.note || "",
    },
  });

  // Load detailed data when fetched
  useEffect(() => {
    if (fullOrder) {
      reset({
        customerName: fullOrder.customerName,
        customerPhone: fullOrder.customerPhone,
        customerEmail: fullOrder.customerEmail,
        shippingAddress: fullOrder.shippingAddress,
        shippingFee: fullOrder.shippingFee,
        paymentMethod: fullOrder.paymentMethod,
        status: fullOrder.status,
        paymentStatus: fullOrder.paymentStatus,
        note: fullOrder.note || "",
      });
      setSelectedCustomerId(fullOrder.customerId);

      if (fullOrder.items) {
        const items: CartItem[] = fullOrder.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          variantId: item.productVariantId,
          variantName: item.variantName || "",
          price: item.unitPrice,
          quantity: item.quantity,
        }));
        setCartItems(items);
      }
    }
  }, [fullOrder, reset]);

  // Fetch products for picker
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const params = new URLSearchParams();
      if (productSearch) params.append("search", productSearch);
      if (categoryFilter) params.append("categoryId", String(categoryFilter));
      params.append("size", "20");

      const res = await fetch(`${API_URL}/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setProductsLoading(false);
    }
  }, [productSearch, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.content || data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    if (showProductPicker) {
      fetchProducts();
      fetchCategories();
    }
  }, [showProductPicker, fetchProducts, fetchCategories]);

  const formatCurrency = (amount: number) => {
    return formatVND(amount);
  };

  const getProductAttributes = (product: Product) => {
    const attributeMap: Record<string, Set<string>> = {};
    product.variants.forEach((v) => {
      v.attributes.forEach((attr) => {
        if (!attributeMap[attr.name]) attributeMap[attr.name] = new Set();
        attributeMap[attr.name].add(attr.value);
      });
    });
    return Object.entries(attributeMap).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  };

  const findMatchingVariant = (product: Product, selections: Record<string, string>) => {
    return product.variants.find((v) => v.attributes.every((attr) => selections[attr.name] === attr.value));
  };

  const handleAttributeSelect = (attrName: string, value: string) => {
    const newSelections = { ...variantSelections, [attrName]: value };
    setVariantSelections(newSelections);
    if (selectedProduct) {
      const variant = findMatchingVariant(selectedProduct, newSelections);
      setSelectedVariant(variant || null);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant) {
      toast.error("Vui lòng chọn biến thể");
      return;
    }
    if (cartItems.some((item) => item.variantId === selectedVariant.id)) {
      toast.error("Sản phẩm đã có trong đơn hàng");
      return;
    }
    const variantName = selectedVariant.attributes.map((a) => `${a.name}: ${a.value}`).join(", ");
    setCartItems([...cartItems, {
      productId: selectedProduct.id,
      productName: selectedProduct.productName,
      productImage: selectedVariant.imageUrl || selectedProduct.thumbnail,
      variantId: selectedVariant.id,
      variantName,
      price: selectedVariant.price,
      quantity: 1,
    }]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setVariantSelections({});
    toast.success("Đã thêm vào đơn hàng");
  };

  const handleRemoveFromCart = (id: number) => setCartItems(cartItems.filter(i => i.variantId !== id));
  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems(cartItems.map(i => i.variantId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setValue("customerName", customer.fullName);
    setValue("customerPhone", customer.phoneNumber);
    setValue("customerEmail", customer.email);
    
    // Auto-binding address: province, district, ward, addressDetail
    const addressParts = [
      customer.province,
      customer.district,
      customer.ward,
      customer.addressDetail
    ].filter(part => part && part.trim() !== "");
    
    if (addressParts.length > 0) {
      setValue("shippingAddress", addressParts.join(", "));
    }

    setSelectedCustomerId(customer.id);
    setShowCustomerResults(false);
    setCustomerSearch("");
    toast.success(`Đã chọn khách hàng "${customer.fullName}"`);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = watch("shippingFee") || 0;
  const total = subtotal + Number(shippingFee);

  const onSubmit = async (data: FormData) => {
    if (isDisabled) return;
    if (cartItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm");
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData: OrderInput = {
        id: initialData?.id,
        customerId: selectedCustomerId || undefined,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        shippingAddress: data.shippingAddress,
        shippingFee: Number(data.shippingFee),
        paymentMethod: Number(data.paymentMethod),
        status: Number(data.status),
        paymentStatus: Number(data.paymentStatus),
        note: data.note,
        items: cartItems.map((item) => ({ productVariantId: item.variantId, quantity: item.quantity })),
      };
      await saveOrder(orderData);
      toast.success(`Đơn hàng đã được ${mode === "add" ? "tạo" : "cập nhật"}`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi lưu đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (val: number) => {
    const s = ORDER_STATUSES.find(stat => stat.value === Number(val));
    const colors: Record<string, string> = {
      yellow: "text-amber-500 bg-amber-50",
      blue: "text-blue-500 bg-blue-50",
      purple: "text-purple-500 bg-purple-50",
      green: "text-emerald-500 bg-emerald-50",
      red: "text-rose-500 bg-rose-50",
      gray: "text-slate-500 bg-slate-50",
    };
    return colors[s?.color || "gray"];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-md transition-opacity" onClick={onClose}></div>

        <div className="relative inline-block align-middle bg-white dark:bg-slate-900 rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-5xl sm:w-full max-h-[92vh] flex flex-col border border-white dark:border-slate-700">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary text-2xl font-bold">
                  {mode === "add" ? "add_circle" : mode === "edit" ? "edit_square" : "description"}
                </span>
               </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white leading-none">
                  {mode === "add" ? "Tạo Đơn Hàng" : mode === "edit" ? "Sửa Đơn Hàng" : "Chi Tiết Đơn Hàng"}
                </h2>
                {initialData?.orderCode ? (
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 inline-block">
                    #{initialData.orderCode}
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 inline-block">Đơn Hàng Nháp</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {orderLoading && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-tighter animate-pulse border border-blue-100 dark:border-blue-800">
                  <div className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-ping"></div>
                  Đang Đồng Bộ...
                </div>
              )}
              <button 
                type="button"
                onClick={onClose} 
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all hover:rotate-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/50 relative">
            {orderLoading && !fullOrder && mode !== "add" && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-30 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl animate-pulse">cloud_download</span>
                  </div>
                </div>
                <p className="mt-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">Đang tải dữ liệu...</p>
              </div>
            )}

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Info & Items */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
                    <span className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
                    Thông Tin & Vận Chuyển
                  </h3>

                  {!isDisabled && (
                    <div className="mb-8 relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400">person_search</span>
                      </div>
                      <input 
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerResults(true);
                        }}
                        onFocus={() => setShowCustomerResults(true)}
                        className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-sm transition-all focus:border-primary/50" 
                        placeholder="Tìm kiếm khách hàng theo tên, sđt hoặc email..." 
                      />
                      
                      {showCustomerResults && customerSearch.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 max-h-72 overflow-y-auto p-2 scrollbar-hide">
                          {customersLoading ? (
                             <div className="p-8 text-center">
                               <div className="h-6 w-6 border-2 border-primary/20 border-t-primary animate-spin rounded-full mx-auto"></div>
                             </div>
                          ) : matchingCustomers.length === 0 ? (
                            <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Không tìm thấy khách hàng</div>
                          ) : (
                            matchingCustomers.map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelectCustomer(c)}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-left group"
                              >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-slate-800 dark:text-white truncate">{c.fullName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5">{c.phoneNumber} • {c.email}</p>
                                </div>
                              </button>
                            ))
                          )}
                          <div className="p-2 pt-0">
                             <button type="button" onClick={() => setShowCustomerResults(false)} className="w-full py-2 text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-500 transition-colors">Đóng Tìm Kiếm</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên Khách Hàng *</label>
                      <input {...register("customerName", { required: true })} disabled={isDisabled} className="w-full h-14 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary" placeholder="Nhập tên khách hàng" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SĐT Khách Hàng *</label>
                      <input {...register("customerPhone", { required: true })} disabled={isDisabled} className="w-full h-14 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary" placeholder="Nhập số điện thoại" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Khách Hàng *</label>
                      <input {...register("customerEmail", { required: true, pattern: /^\S+@\S+$/i })} disabled={isDisabled} className="w-full h-14 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary" placeholder="email@example.com" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa Chỉ Giao Hàng *</label>
                       <textarea {...register("shippingAddress", { required: true })} disabled={isDisabled} className="w-full h-24 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm outline-none focus:border-primary resize-none" placeholder="Nhập địa chỉ giao hàng chi tiết"></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[460px]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest flex items-center gap-3">
                       <span className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
                       <span className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
                       Sản Phẩm Đơn Hàng ({cartItems.length})
                    </h3>
                    {!isDisabled && (
                      <button type="button" onClick={() => setShowProductPicker(true)} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-sm font-bold">add_circle</span>
                        Thêm Sản Phẩm
                      </button>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-950/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-300">workspaces</span>
                      </div>
                      <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Đơn hàng trống</p>
                      <button type="button" onClick={() => setShowProductPicker(true)} className="mt-4 text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Chọn Sản Phẩm</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.variantId} className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white hover:border-primary/40 hover:shadow-lg hover:shadow-slate-200/50">
                          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-sm p-1">
                            <img src={item.productImage || ""} alt="" className="h-full w-full object-cover rounded-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 dark:text-white truncate">{item.productName}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5 tracking-tight">{item.variantName}</p>
                            <p className="text-xs font-black text-primary mt-1.5 flex items-center gap-1">
                              {formatCurrency(item.price)}
                              <span className="text-[8px] text-slate-300">/ cái</span>
                            </p>
                          </div>
                          <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl px-1.5 py-1.5 border border-slate-100 dark:border-slate-700 shadow-sm">
                            {!isDisabled && (
                              <button type="button" onClick={() => handleQuantityChange(item.variantId, -1)} className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <span className="material-symbols-outlined text-lg">remove</span>
                              </button>
                            )}
                            <span className="w-10 text-center font-black text-sm text-slate-800 dark:text-white">{item.quantity}</span>
                            {!isDisabled && (
                              <button type="button" onClick={() => handleQuantityChange(item.variantId, 1)} className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all">
                                <span className="material-symbols-outlined text-lg">add</span>
                              </button>
                            )}
                          </div>
                          <div className="w-32 text-right hidden sm:block">
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Thành Tiền Info</p>
                            <p className="font-black text-slate-800 dark:text-white text-base leading-none">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                          {!isDisabled && (
                            <button type="button" onClick={() => handleRemoveFromCart(item.variantId)} className="h-11 w-11 flex items-center justify-center rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Summary & Status */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                   <h3 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
                    <span className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50"></span>
                    Quy Trình Xử Lý
                  </h3>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng Thái Đơn</label>
                      <div className="relative">
                        <select {...register("status")} disabled={isDisabled} className={`w-full h-12 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black appearance-none cursor-pointer outline-none focus:border-primary ${getStatusColor(watch("status"))}`}>
                          {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none text-slate-400"><span className="material-symbols-outlined">expand_more</span></span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng Thái Thanh Toán</label>
                      <div className="relative">
                         <select {...register("paymentStatus")} disabled={isDisabled} className="w-full h-12 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black appearance-none cursor-pointer outline-none focus:border-primary">
                          {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none text-slate-400"><span className="material-symbols-outlined">expand_more</span></span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phương Thức Thanh Toán</label>
                      <div className="relative">
                         <select {...register("paymentMethod")} disabled={isDisabled} className="w-full h-12 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-black appearance-none cursor-pointer outline-none focus:border-primary">
                          {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none text-slate-400"><span className="material-symbols-outlined">expand_more</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/20 space-y-5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                     <span className="material-symbols-outlined text-8xl">payments</span>
                   </div>
                   
                   <div className="flex justify-between items-center pb-5 border-b border-white/10 relative">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Tổng Tiền Hàng</span>
                    <span className="font-extrabold text-lg">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Phí Vận Chuyển</label>
                    <div className="relative">
                      <span className="absolute left-5 inset-y-0 flex items-center text-white/30 text-xs font-black">₫</span>
                      <input type="number" {...register("shippingFee")} disabled={isDisabled} className="w-full h-13 pl-10 pr-5 bg-white/10 border border-white/10 rounded-2xl focus:bg-white/20 transition-all font-black text-base outline-none hover:border-white/20" />
                    </div>
                  </div>
                  <div className="pt-6 relative">
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Tổng Cộng</span>
                    <div className="text-4xl font-black mt-1 tracking-tighter">{formatCurrency(total)}</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-black text-slate-800 dark:text-white text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-slate-300 rounded-full"></span>
                    <span className="h-1.5 w-1.5 bg-slate-300 rounded-full"></span>
                    Ghi Chú
                  </h3>
                  <textarea {...register("note")} disabled={isDisabled} className="w-full p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none focus:border-primary" rows={4} placeholder="Ghi chú nội bộ hoặc hướng dẫn giao hàng..."></textarea>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-8 py-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4 z-10 shadow-2xl shadow-slate-900/10">
              <button type="button" onClick={onClose} className="px-10 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 active:scale-95 transition-all">
                {isDisabled ? "Đóng" : "Hủy Thay Đổi"}
              </button>
              {!isDisabled && (
                <button type="submit" disabled={isSubmitting} className="px-12 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-3">
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-sm font-bold">verified</span>
                  )}
                  Lưu Đơn Hàng
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            <div className="fixed inset-0 bg-primary/20 backdrop-blur-xl" onClick={() => setShowProductPicker(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_35px_100px_-15px_rgba(0,0,0,0.15)] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-white dark:border-slate-700 animate-in zoom-in-95 duration-200">
              <div className="px-8 py-7 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                 <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl font-bold">inventory_2</span>
                  </div>
                  Kho Sản Phẩm
                </h3>
                <button onClick={() => setShowProductPicker(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"><span className="material-symbols-outlined">close</span></button>
              </div>

              <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex-1 relative group">
                  <span className="absolute left-6 inset-y-0 flex items-center text-slate-300 group-focus-within:text-primary transition-colors"><span className="material-symbols-outlined text-xl">search</span></span>
                  <input type="text" placeholder="Tìm kiếm sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                </div>
                <select value={categoryFilter || ""} onChange={e => setCategoryFilter(e.target.value ? Number(e.target.value) : null)} className="h-14 px-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary appearance-none cursor-pointer">
                  <option value="">Tất Cả Danh Mục</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                {productsLoading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                     <div className="h-12 w-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                    <span className="material-symbols-outlined text-7xl font-light">search_off</span>
                    <p className="mt-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Không có kết quả</p>
                  </div>
                ) : selectedProduct ? (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <button type="button" onClick={() => { setSelectedProduct(null); setSelectedVariant(null); setVariantSelections({}); }} className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] px-5 py-3 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all active:scale-95">
                      <span className="material-symbols-outlined text-lg">arrow_back</span> Quay Lại Catalog
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                      <div className="md:col-span-5">
                         <div className="aspect-square rounded-[3rem] overflow-hidden bg-white border-8 border-white shadow-2xl shadow-slate-200/50">
                            <img src={selectedProduct.thumbnail || ""} className="h-full w-full object-cover" />
                         </div>
                      </div>
                      <div className="md:col-span-7 space-y-8">
                        <div>
                          <div className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded-full mb-3 border border-primary/10">
                            {selectedProduct.categoryName}
                          </div>
                          <h4 className="text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">{selectedProduct.productName}</h4>
                        </div>
                        <div className="space-y-6">
                          {getProductAttributes(selectedProduct).map(attr => (
                            <div key={attr.name} className="space-y-3">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{attr.name}</p>
                              <div className="flex flex-wrap gap-3">
                                {attr.values.map(val => (
                                  <button key={val} type="button" onClick={() => handleAttributeSelect(attr.name, val)} className={`px-8 py-3.5 rounded-2xl border-2 text-[11px] font-black transition-all ${variantSelections[attr.name] === val ? "bg-primary border-primary text-white shadow-xl shadow-primary/30" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-primary/30"}`}>{val}</button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedVariant && (
                          <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 dark:bg-primary/5 dark:border-primary/10 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                 <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                 SKU: {selectedVariant.sku}
                               </p>
                               <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{formatCurrency(selectedVariant.price)}</p>
                               <p className={`text-[11px] font-bold mt-2 flex items-center gap-2 ${selectedVariant.stockQuantity > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                 <span className={`h-2 w-2 rounded-full ${selectedVariant.stockQuantity > 0 ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-rose-500 shadow-lg shadow-rose-500/50"}`}></span> 
                                 Tồn Kho: {selectedVariant.stockQuantity}
                               </p>
                            </div>
                            <button type="button" onClick={handleAddToCart} disabled={selectedVariant.stockQuantity <= 0} className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30">Xác Nhận Thêm</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(p => (
                      <button key={p.id} type="button" onClick={() => setSelectedProduct(p)} className="text-left group animate-in fade-in duration-500">
                        <div className="aspect-square rounded-[2.5rem] bg-white dark:bg-slate-800/50 overflow-hidden mb-4 border-4 border-white shadow-lg group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:scale-105 transition-all duration-500 relative">
                          <img src={p.thumbnail || ""} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        </div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 ml-1">{p.categoryName}</p>
                        <p className="font-black text-sm text-slate-800 dark:text-white truncate px-1">{p.productName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
