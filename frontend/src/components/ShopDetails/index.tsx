"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import Rating from "../Common/Rating";
import { ProductService, ProductApiResponse, ProductVariant, ProductReview } from "@/services/product.service";
import { formatVND, formatDateVN } from "@/utils/format";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

interface ShopDetailsProps {
  productId: number | null;
}

const ShopDetails = ({ productId }: ShopDetailsProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const { isAuthenticated } = useAppSelector((state) => state.authReducer);
  
  // Product state
  const [product, setProduct] = useState<ProductApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Related products
  const [relatedProducts, setRelatedProducts] = useState<ProductApiResponse[]>([]);
  
  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  
  // Selected variant and options
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // UI state
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("tabOne");
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Check if in wishlist
  const isInWishlist = product ? wishlistItems.some((item) => item.id === product.id) : false;
  
  // Extract unique colors and sizes from variants
  const uniqueColors = product?.variants 
    ? Array.from(new Set(product.variants.map(v => v.color).filter(Boolean)))
    : [];
  const uniqueSizes = product?.variants
    ? Array.from(new Set(product.variants.map(v => v.size).filter(Boolean)))
    : [];
  
  // Get images for current selection
  const productImages = selectedVariant?.images || selectedVariant?.imageUrl 
    ? (selectedVariant.images || [selectedVariant.imageUrl!])
    : (product?.images || [product?.thumbnail].filter(Boolean)) as string[];
  
  // Current price based on variant
  const currentPrice = selectedVariant?.price || product?.basePrice || 0;
  const currentStock = selectedVariant?.stock || selectedVariant?.stockQuantity || 0;
  
  // Tabs config
  const tabs = [
    { id: "tabOne", title: "Mô tả" },
    { id: "tabTwo", title: "Thông tin bổ sung" },
    { id: "tabThree", title: "Đánh giá" },
  ];

  // Load product data
  useEffect(() => {
    const fetchProduct = async () => {
      // Validation: Ensure productId is a valid number
      if (!productId || isNaN(productId)) {
        setError("Không tìm thấy mã sản phẩm hợp lệ");
        setLoading(false);
        return;
      }
      
      let productData: ProductApiResponse | null = null;

      // 1. Fetch Main Product
      try {
        setLoading(true);
        setError(null);
        productData = await ProductService.getById(productId);
        setProduct(productData);
        
        // Set default variant if exists
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          setSelectedColor(productData.variants[0].color || null);
          setSelectedSize(productData.variants[0].size || null);
        }
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm. Vui lòng kiểm tra kết nối.");
        console.error("Main product fetch error:", err);
        setLoading(false);
        return; // Stop here if main product fails
      }

      // 2. Fetch Supplementary Data (each in its own try-catch to avoid breaking the main UI)
      if (productData) {
        // Fetch Related Products
        try {
          const categoryId = productData.categoryId || productData.category?.id;
          if (categoryId) {
            const related = await ProductService.getByCategory(categoryId, 4, productData.id);
            setRelatedProducts(related);
          }
        } catch (err) {
          console.error("Related products fetch error:", err);
        }

        // Fetch Reviews
        try {
          const reviewsData = await ProductService.getProductReviews(productId);
          setReviews(reviewsData);
        } catch (err) {
          console.error("Reviews fetch error:", err);
        }

        // Check Purchase Status
        try {
          if (isAuthenticated) {
            const purchased = await ProductService.checkPurchased(productId);
            setCanReview(purchased);
          }
        } catch (err) {
          console.error("Purchase check error:", err);
        }
      }
      
      setLoading(false);
    };
    
    fetchProduct();
  }, [productId, isAuthenticated]);
  
  // Update variant when color/size changes
  useEffect(() => {
    if (!product?.variants) return;
    
    const matchingVariant = product.variants.find(v => {
      const colorMatch = !selectedColor || v.color === selectedColor;
      const sizeMatch = !selectedSize || v.size === selectedSize;
      return colorMatch && sizeMatch;
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setPreviewImg(0);
    }
  }, [selectedColor, selectedSize, product]);
  
  // Calculate average rating from real reviews or use pre-calculated rating from product
  const averageRating = reviews.length > 0 
    ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length * 10) / 10 
    : (product?.averageRating || product?.rating || 0);

   const displayReviewCount = reviews.length > 0 ? reviews.length : (product?.totalReviews || product?.reviewsCount || product?.reviews || 0);

  const { addToCart } = useCart();

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    // Ensure we have a variant ID
    const variantId = selectedVariant?.id || (product.variants && product.variants.length > 0 ? product.variants[0].id : null);
    
    if (!variantId) {
        // Fallback or error if no variant found (should not happen if data is correct)
        // Check if product itself can be added (if backend supports direct product ID which maps to default variant)
        // For now, let's assume we need a variant ID.
        console.error("No variant ID found for product", product);
        return;
    }

    addToCart({
        id: variantId,
        title: product.title || product.productName || "",
        price: currentPrice,
        discountedPrice: currentPrice,
        quantity,
        imgs: {
          thumbnails: productImages,
          previews: productImages,
        },
    }, quantity);
  };
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    show: false,
    message: "",
    type: "success"
  });

  const showNotification = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    if (!product || isInWishlist) return;
    
    setIsWishlistAnimating(true);
    
    dispatch(
      addItemToWishlist({
        id: product.id,
        title: product.title || product.productName || "",
        price: currentPrice,
        discountedPrice: currentPrice,
        quantity: 1,
        status: "available",
        imgs: {
          thumbnails: productImages,
          previews: productImages,
        },
      })
    );
    
    showNotification("Đã thêm vào yêu thích!", "success");
    setTimeout(() => setIsWishlistAnimating(false), 600);
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!product || !newReview.comment.trim()) return;
    
    if (!isAuthenticated) {
      showNotification("Vui lòng đăng nhập để thực hiện đánh giá sản phẩm.", "warning");
      return;
    }
    
    try {
      setReviewSubmitting(true);
      
      // Check if user purchased this product
      const purchased = await ProductService.checkPurchased(product.id);
      if (!purchased) {
        showNotification("Rất tiếc, chỉ những khách hàng đã mua sản phẩm này mới có thể để lại đánh giá.", "error");
        setReviewSubmitting(false);
        return;
      }

      const review = await ProductService.addProductReview(
        product.id,
        newReview.rating,
        newReview.comment
      );
      
      // Update local state with new review using the correct interface fields
      const formattedReview: ProductReview = {
        reviewId: review.reviewId,
        productId: product.id,
        customerName: review.customerName || "Bạn",
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date().toISOString(),
        hasPurchased: true
      };
      
      // Do not add to local state immediately as it requires approval
      // setReviews([formattedReview, ...reviews]); 
      
      setNewReview({ rating: 5, comment: "" });
      showNotification("Đánh giá đã được gửi và đang chờ duyệt! Cảm ơn bạn.", "success");
    } catch (err) {
      console.error(err);
      showNotification("Có lỗi xảy ra trong quá trình gửi đánh giá. Vui lòng thử lại sau.", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return formatVND(price);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-lg text-gray-600">{error || "Không tìm thấy sản phẩm"}</p>
        <Link href="/shop-with-sidebar" className="text-blue hover:underline">
          ← Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Chi tiết sản phẩm"} pages={["chi tiết sản phẩm"]} />
      
      {/* Custom Global Notification */}
      {toast.show && (
        <div className="fixed top-20 right-4 z-[9999] animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white min-w-[300px] ${
            toast.type === "success" ? "bg-green-500" :
            toast.type === "error" ? "bg-red-500" : "bg-orange-500"
          }`}>
            {toast.type === "success" && (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.type === "error" && (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.type === "warning" && (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* Product Images */}
            <div className="lg:max-w-[570px] w-full">
              <div className="relative aspect-square rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 flex items-center justify-center overflow-hidden">
                <button
                  onClick={() => openPreviewModal()}
                  aria-label="button for zoom"
                  className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.14580 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.14580 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.14580 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.14580 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.1666 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z" fill="" />
                  </svg>
                </button>

                {productImages[previewImg] && (
                  <div className="relative w-full h-full p-8 flex items-center justify-center">
                    <Image
                      src={productImages[previewImg]}
                      alt={product.title || "Product"}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                {productImages.map((img, key) => (
                  <button
                    onClick={() => setPreviewImg(key)}
                    key={key}
                    className={`relative flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                      key === previewImg ? "border-blue" : "border-transparent"
                    }`}
                  >
                    <div className="relative w-full h-full p-1">
                      <Image 
                        fill
                        className="object-contain"
                        src={img} 
                        alt="thumbnail" 
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Content */}
            <div className="max-w-[539px] w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                  {product.title || product.productName}
                </h2>
              </div>

              {/* Rating & Stock */}
              <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                <div className="flex items-center gap-2.5">
                  <Rating rating={averageRating} size={16} />
                  <span className="text-sm">({displayReviewCount} đánh giá)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {currentStock > 0 ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z" fill="#22AD5C" />
                        <path d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z" fill="#22AD5C" />
                      </svg>
                      <span className="text-green">Còn hàng ({currentStock})</span>
                    </>
                  ) : (
                    <span className="text-red-500">Hết hàng</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <h3 className="font-semibold text-2xl text-blue mb-4.5">
                {formatPrice(currentPrice)}
              </h3>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}

              {/* Variants Selection */}
              <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                {/* Color Selection */}
                {uniqueColors.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="min-w-[80px]">
                      <h4 className="font-medium text-dark">Màu sắc:</h4>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {uniqueColors.map((color, key) => (
                        <button
                          key={key}
                          onClick={() => setSelectedColor(color as string)}
                          className={`px-4 py-2 rounded-md border transition-all ${
                            selectedColor === color
                              ? "border-blue bg-blue text-white"
                              : "border-gray-3 hover:border-blue"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {uniqueSizes.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="min-w-[80px]">
                      <h4 className="font-medium text-dark">Kích cỡ:</h4>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {uniqueSizes.map((size, key) => (
                        <button
                          key={key}
                          onClick={() => setSelectedSize(size as string)}
                          className={`px-4 py-2 rounded-md border transition-all ${
                            selectedSize === size
                              ? "border-blue bg-blue text-white"
                              : "border-gray-3 hover:border-blue"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SKU Info */}
                {selectedVariant && (
                  <div className="text-sm text-gray-500">
                    SKU: {selectedVariant.sku}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4.5">
                {/* Quantity */}
                <div className="flex items-center rounded-md border border-gray-3">
                  <button
                    aria-label="Giảm số lượng"
                    className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
                      <path d="M3.33301 10.0001C3.33301 9.53984 3.70610 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.70610 10.8334 3.33301 10.4603 3.33301 10.0001Z" fill="" />
                    </svg>
                  </button>
                  <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Tăng số lượng"
                    className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                  >
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
                      <path d="M3.33301 10C3.33301 9.5398 3.70610 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.70610 10.8334 3.33301 10.4603 3.33301 10Z" fill="" />
                      <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" fill="" />
                    </svg>
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className={`inline-flex font-medium text-white py-3 px-7 rounded-md ease-out duration-200 ${
                    currentStock > 0 ? "bg-blue hover:bg-blue-dark" : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Thêm vào giỏ hàng
                </button>

                {/* Add to Wishlist */}
                <button
                  onClick={handleAddToWishlist}
                  className={`flex items-center justify-center w-12 h-12 rounded-md border ease-out duration-200 
                    ${isInWishlist 
                      ? "border-red-500 bg-red-500 text-white" 
                      : "border-gray-3 hover:text-white hover:bg-red-500 hover:border-transparent"
                    }
                    ${isWishlistAnimating ? "animate-heartBeat" : ""}
                  `}
                >
                  <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
                    {isInWishlist ? (
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                    ) : (
                      <path fillRule="evenodd" clipRule="evenodd" d="M5.62436 4.42423C3.96537 5.18256 2.75 6.98626 2.75 9.13713C2.75 11.3345 3.64922 13.0283 4.93829 14.4798C6.00072 15.6761 7.28684 16.6677 8.54113 17.6346C8.83904 17.8643 9.13515 18.0926 9.42605 18.3219C9.95208 18.7366 10.4213 19.1006 10.8736 19.3649C11.3261 19.6293 11.6904 19.75 12 19.75C12.3096 19.75 12.6739 19.6293 13.1264 19.3649C13.5787 19.1006 14.0479 18.7366 14.5740 18.3219C14.8649 18.0926 15.1610 17.8643 15.4589 17.6346C16.7132 16.6677 17.9993 15.6761 19.0617 14.4798C20.3508 13.0283 21.25 11.3345 21.25 9.13713C21.25 6.98626 20.0346 5.18256 18.3756 4.42423C16.7639 3.68751 14.5983 3.88261 12.5404 6.02077C12.3990 6.16766 12.2039 6.25067 12 6.25067C11.7961 6.25067 11.6010 6.16766 11.4596 6.02077C9.40166 3.88261 7.23607 3.68751 5.62436 4.42423ZM12 4.45885C9.68795 2.39027 7.09896 2.1009 5.00076 3.05999C2.78471 4.07296 1.25 6.42506 1.25 9.13713C1.25 11.8027 2.3605 13.8361 3.81672 15.4758C4.98287 16.789 6.41022 17.888 7.67083 18.8586C7.95659 19.0786 8.23378 19.2921 8.49742 19.4999C9.00965 19.9037 9.55954 20.3343 10.1168 20.66C10.6739 20.9855 11.3096 21.25 12 21.25C12.6904 21.25 13.3261 20.9855 13.8832 20.66C14.4405 20.3343 14.9903 19.9037 15.5026 19.4999C15.7662 19.2921 16.0434 19.0786 16.3292 18.8586C17.5898 17.888 19.0171 16.789 20.1833 15.4758C21.6395 13.8361 22.75 11.8027 22.75 9.13713C22.75 6.42506 21.2153 4.07296 18.9992 3.05999C16.9010 2.1009 14.3121 2.39027 12 4.45885Z" fill="" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Category */}
              {(product.categoryName || product.category?.title) && (
                <div className="mt-6 text-sm text-gray-600">
                  <span className="font-medium">Danh mục:</span>{" "}
                  <Link href={`/shop-with-sidebar?category=${product.categoryId || product.category?.id}`} className="text-blue hover:underline">
                    {product.categoryName || product.category?.title || product.category?.categoryName}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Tab Headers */}
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {tabs.map((item, key) => (
              <button
                key={key}
                onClick={() => setActiveTab(item.id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${
                  activeTab === item.id ? "text-blue before:w-full" : "text-dark before:w-0"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          <div className={`mt-12.5 ${activeTab === "tabOne" ? "block" : "hidden"}`}>
            <div className="bg-white rounded-xl shadow-1 p-6">
              <h2 className="font-medium text-2xl text-dark mb-4">Mô tả sản phẩm</h2>
              <div className="prose max-w-none">
                {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </div>
            </div>
          </div>

          {/* Additional Info Tab */}
          <div className={`mt-12.5 ${activeTab === "tabTwo" ? "block" : "hidden"}`}>
            <div className="bg-white rounded-xl shadow-1 p-6">
              <h2 className="font-medium text-2xl text-dark mb-4">Thông tin bổ sung</h2>
              <div className="space-y-3">
                {product.vendor && (
                  <div className="flex py-2 border-b">
                    <span className="w-40 font-medium">Nhà cung cấp:</span>
                    <span>{product.vendor}</span>
                  </div>
                )}
                {(product.categoryName || product.category?.title) && (
                  <div className="flex py-2 border-b">
                    <span className="w-40 font-medium">Danh mục:</span>
                    <span>{product.categoryName || product.category?.title}</span>
                  </div>
                )}
                {uniqueColors.length > 0 && (
                  <div className="flex py-2 border-b">
                    <span className="w-40 font-medium">Màu sắc:</span>
                    <span>{uniqueColors.join(", ")}</span>
                  </div>
                )}
                {uniqueSizes.length > 0 && (
                  <div className="flex py-2 border-b">
                    <span className="w-40 font-medium">Kích cỡ:</span>
                    <span>{uniqueSizes.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Tab */}
          <div className={`mt-12.5 ${activeTab === "tabThree" ? "block" : "hidden"}`}>
            <div className="bg-white rounded-xl shadow-1 p-6">
              <h2 className="font-medium text-2xl text-dark mb-6">
                Đánh giá ({displayReviewCount})
              </h2>

              {/* Add Review Form - Always visible but checked on submit */}
              <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-3">
                <h3 className="font-medium text-lg text-dark mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Viết đánh giá của bạn
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-dark-4 font-medium">Đánh giá chung:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        <svg 
                          className={`w-7 h-7 ${star <= newReview.rating ? "text-orange" : "text-gray-3"}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-5">
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng sản phẩm..."
                    className="w-full p-4 border border-gray-3 rounded-lg resize-none h-32 focus:outline-none focus:border-blue bg-white transition-all text-dark-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 italic">
                    * Lưu ý: Ý kiến của bạn sẽ giúp cộng đồng mua sắm tốt hơn.
                  </p>
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting || !newReview.comment.trim()}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue text-white rounded-md font-medium hover:bg-blue-dark transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {reviewSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang gửi...
                      </>
                    ) : "Gửi đánh giá"}
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-gray-3 rounded-lg">
                    <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.reviewId} className="border-b border-gray-1 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue/10 flex-shrink-0 flex items-center justify-center text-blue font-semibold text-lg">
                            {review.customerAvatar ? (
                              <img 
                                src={review.customerAvatar}
                                alt={review.customerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (review.customerName || "K")?.[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-dark">{review.customerName || "Khách hàng"}</span>
                              {review.hasPurchased && (
                                <span className="flex items-center gap-1 text-[10px] bg-green/10 text-green px-2 py-0.5 rounded-full font-medium">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Đã mua hàng
                                </span>
                              )}
                            </div>
                            <Rating rating={review.rating} size={14} className="mt-1" />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.createdAt ? formatDateVN(review.createdAt) : "Gần đây"}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed pl-15">
                        {review.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products Slider */}
      <RecentlyViewdItems products={relatedProducts} title="Sản phẩm cùng danh mục" />

     
    </>
  );
};

export default ShopDetails;
