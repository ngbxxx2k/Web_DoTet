
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface Banner {
  bannerId: number;
  positionType: 'MAIN_SLIDER' | 'SIDE_BANNER';
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export const BannerService = {
  async getActiveBanners(type: 'MAIN_SLIDER' | 'SIDE_BANNER'): Promise<Banner[]> {
    const res = await fetch(`${API_URL}/banners/active?type=${type}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch banners");
    return res.json();
  },
};
