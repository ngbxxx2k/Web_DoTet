"use client";
import React, { useEffect, useState } from "react";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import Rating from "./Rating";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import { useCart } from "@/hooks/useCart";
import { ProductService } from "@/services/product.service";
import { mapToProduct } from "@/utils/productUtils";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { formatVND } from "@/utils/format";

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { addToCart } = useCart();

  const product = useAppSelector((state) => state.quickViewReducer.value);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  const [activePreview, setActivePreview] = useState(0);

  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(product));
    openPreviewModal();
  };

  const handleAddToWishlist = () => {
    if (isInWishlist) return;
    setIsAnimating(true);
    dispatch(addItemToWishlist({ ...product, status: product.status || "In Stock", quantity: 1 }));
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleAddToCart = () => {
    let productToAdd = { ...product };
    
    // Fix: If product has variants, use the first variant's ID
    if (product.variants && product.variants.length > 0) {
        productToAdd = {
            ...productToAdd,
            id: product.variants[0].id,
            price: product.variants[0].price || product.price,
            discountedPrice: product.variants[0].price || product.discountedPrice
        };
    }

    addToCart({
      ...productToAdd,
      quantity,
    });
    closeModal();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }
    
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      
      // Fix: Fetch full product details if variants are missing
      // This ensures we don't add a "virtual" parent product to cart
      if (product.id && (!product.variants || product.variants.length === 0)) {
        ProductService.getById(product.id)
          .then((data) => {
             const fullProduct = mapToProduct(data);
             // Verify if we got variants now
             if (fullProduct.variants && fullProduct.variants.length > 0) {
                dispatch(updateQuickView(fullProduct));
             }
          })
          .catch((err) => console.error("Failed to fetch product details for Quick View:", err));
      }
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
    };
  }, [isModalOpen, closeModal, product.id, product.variants, dispatch]);

  return (
    <div className={`${isModalOpen ? "z-[9999] flex" : "hidden"} fixed inset-0 items-center justify-center bg-black/70 p-4 sm:p-8`}>
      <div className="w-full max-w-[1100px] max-h-[90vh] overflow-hidden rounded-xl shadow-2xl bg-white relative modal-content flex flex-col">
        {/* Nút Close */}
        <button
          onClick={() => closeModal()}
          className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Layout Grid chính */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full overflow-y-auto no-scrollbar">
          
          {/* PHẦN TRÁI: ẢNH (Cố định khung hình) */}
          <div className="p-6 sm:p-10 bg-gray-50 flex flex-col gap-5 sticky top-0">
            <div className="flex gap-4 h-full">
              {/* List Thumbnails */}
              <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pr-2">
                {product.imgs.thumbnails?.map((img, key) => (
                  <button
                    onClick={() => setActivePreview(key)}
                    key={key}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activePreview === key ? "border-blue-500" : "border-transparent bg-white"}`}
                  >
                    <Image src={img || ""} alt="thumb" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Preview (Không làm giãn modal) */}
              <div className="relative flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden aspect-square max-h-[500px]">
                <button
                  onClick={handlePreviewSlider}
                  className="absolute top-4 right-4 z-10 p-2 bg-white shadow-md rounded-md hover:text-blue-500 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </button>
                
                {product?.imgs?.previews?.[activePreview] && (
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <Image
                      src={product.imgs.previews[activePreview]}
                      alt="preview"
                      width={500}
                      height={500}
                      priority
                      className="w-full h-full object-contain" // Đảm bảo ảnh luôn nằm gọn trong khung
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PHẦN PHẢI: THÔNG TIN (Chuyển toàn bộ sang phải) */}
          <div className="p-6 sm:p-10 flex flex-col">
           

            <h3 className="font-bold text-2xl xl:text-3xl text-gray-900 mb-4">
              {product.title}
            </h3>

            <div className="flex items-center gap-4 mb-6">
              <Rating rating={product.rating || 0} size={18} />
              <span className="text-sm text-gray-500">({product.reviews || 0} reviews)</span>
              <span className={`${product.status === 'Out of Stock' ? 'text-red' : 'text-green-600'} font-medium flex items-center gap-1`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  {product.status === 'Out of Stock' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  )}
                </svg>
                {product.status || 'In Stock'}
              </span>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description ||""}
            </p>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Price</h4>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-blue-600">{formatVND(product.discountedPrice)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Quantity</h4>
                <div className="flex items-center gap-3">
                  <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-10 h-10 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center">-</button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center">+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`px-6 rounded-xl border-2 transition-all flex items-center gap-2 font-bold ${
                  isInWishlist ? "bg-red-50 text-red-500 border-red-500" : "border-gray-200 hover:border-dark text-dark"
                } ${isAnimating ? "animate-bounce" : ""}`}
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {isInWishlist ? "Saved" : "Wishlist"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;