"use client";
import React, { useState, useEffect } from "react";
// import { uploadToCloudinary } from '@/lib/cloudinary'; // Placeholder, replace with actual upload logic or remove if using backend upload
import ImageUpload from "@/components/admin/products/ImageUpload";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Banner {
    bannerId: number;
    positionType: 'MAIN_SLIDER' | 'SIDE_BANNER';
    imageUrl: string;
    displayOrder: number;
    isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function BannerManagement() {
    // 2 sliders, 2 side banners
    const [mainSliders, setMainSliders] = useState<Banner[]>([]);
    const [sideBanners, setSideBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_URL}/banners`);
            if (res.ok) {
                const data: Banner[] = await res.json();
                setMainSliders(data.filter(b => b.positionType === 'MAIN_SLIDER').sort((a, b) => a.displayOrder - b.displayOrder));
                setSideBanners(data.filter(b => b.positionType === 'SIDE_BANNER').sort((a, b) => a.displayOrder - b.displayOrder));
            }
        } catch (error) {
            console.error("Failed to fetch banners", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Upload failed");
        }
        
        const data = await res.json();
        return data.url;
    };

    const handleUpdateBanner = async (idx: number, type: 'MAIN_SLIDER' | 'SIDE_BANNER', file: File | string, currentBannerId?: number) => {
        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                let url = "";
                if (file instanceof File) {
                    url = await handleUpload(file);
                } else {
                    url = file;
                }

                const bannerData = {
                    bannerId: currentBannerId,
                    positionType: type,
                    imageUrl: url,
                    displayOrder: idx + 1,
                    isActive: true
                };

                let res;
                if (currentBannerId) {
                    res = await fetch(`${API_URL}/banners/${currentBannerId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bannerData),
                    });
                } else {
                    res = await fetch(`${API_URL}/banners`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bannerData),
                    });
                }

                if (res.ok) {
                    fetchBanners();
                    resolve("Banner updated successfully");
                } else {
                    reject(new Error("Failed to update banner"));
                }
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });

        toast.promise(updatePromise, {
            loading: 'Đang tải lên & Cập nhật...',
            success: 'Cập nhật banner thành công!',
            error: 'Lỗi khi cập nhật banner.',
        });
    };
    
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        bannerId: 0,
    });

    const handleDeleteClick = (id: number) => {
        setConfirmModal({ isOpen: true, bannerId: id });
    };

    const confirmDelete = async () => {
        const id = confirmModal.bannerId;
        setConfirmModal({ isOpen: false, bannerId: 0 }); // Close modal immediately
        
        try {
            const res = await fetch(`${API_URL}/banners/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Đã xóa banner");
                fetchBanners();
            } else {
                toast.error("Lỗi khi xóa banner");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xóa banner");
        }
    };
    
    // Ensure we always have placeholders for 2 sliders and 2 side banners
    const renderSliders = () => {
        const slots = [0, 1];
        return slots.map(i => {
           const banner = mainSliders[i];
           return (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Slider Số {i + 1}</p>
                 <ImageUpload 
                    value={banner ? [banner.imageUrl] : []}
                    onChange={(files) => {
                        if (files.length > 0) {
                             handleUpdateBanner(i, 'MAIN_SLIDER', files[0], banner?.bannerId);
                        } else if (banner?.bannerId) {
                             handleDeleteClick(banner.bannerId);
                        }
                    }}
                    maxFiles={1}
                 />
            </div>
           )
        });
    };

    const renderSideBanners = () => {
        const slots = [0, 1];
        return slots.map(i => {
           const banner = sideBanners[i];
           return (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Banner Phụ Số {i + 1}</p>
                 <ImageUpload 
                    value={banner ? [banner.imageUrl] : []}
                    onChange={(files) => {
                        if (files.length > 0) {
                             handleUpdateBanner(i, 'SIDE_BANNER', files[0], banner?.bannerId);
                        } else if (banner?.bannerId) {
                             handleDeleteClick(banner.bannerId);
                        }
                    }}
                    maxFiles={1}
                 />
            </div>
           )
        });
    }

    if (loading) return <div className="p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

    return (
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Quản Lý Banner Website</h1>
            
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Main Sliders Area */}
                <div className="flex-1 space-y-6">
                    <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">view_carousel</span>
                        Slider Chính (Trái)
                    </h2>
                    <div className="space-y-4">
                        {renderSliders()}
                    </div>
                </div>

                {/* Side Banners Area */}
                <div className="w-full xl:w-96 space-y-6">
                     <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">ad_units</span>
                        Banner Phụ (Phải)
                    </h2>
                    <div className="space-y-4">
                        {renderSideBanners()}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Xóa Banner"
                message="Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác."
                onConfirm={confirmDelete}
                onCancel={() => setConfirmModal({ isOpen: false, bannerId: 0 })}
                confirmText="Xóa"
                type="danger"
            />
        </div>
    );
}
