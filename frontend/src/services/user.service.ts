const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface UserAddress {
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  address?: UserAddress;
  roles?: string[];
  // Flat address fields from backend for internal mapping
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
}

function mapUserResponse(data: any): UserProfile {
  const hasAddress = data.province || data.district || data.ward || data.addressDetail;
  const profile = { ...data };
  
  if (hasAddress) {
      profile.address = {
          province: data.province || "",
          district: data.district || "",
          ward: data.ward || "",
          addressDetail: data.addressDetail || ""
      };
  }
  
  // Clean up flat fields if desired, but keeping them doesn't hurt much
  return profile;
}

export const UserService = {
  async getProfile(token: string): Promise<UserProfile> {
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    const data = await res.json();
    return mapUserResponse(data);
  },

  async updateProfile(data: Partial<UserProfile>, token: string): Promise<UserProfile> {
    // If updating address, need to flatten it back for the backend?
    // The backend expects flat fields for update too?
    // Let's check UserRequest.java
    
    // We need to map nested address back to flat fields if present in data
    const payload: any = { ...data };
    if (data.address) {
        payload.province = data.address.province;
        payload.district = data.address.district;
        payload.ward = data.address.ward;
        payload.addressDetail = data.address.addressDetail;
        delete payload.address;
    }

    const res = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Update profile failed:", errorText);
        throw new Error(errorText || "Failed to update profile");
    }
    const responseData = await res.json();
    return mapUserResponse(responseData);
  },

  async changePassword(oldPassword: string, newPassword: string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/users/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
      credentials: "include",
    });
    
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
             const errorJson = await res.json();
             throw new Error(errorJson.message || "Failed to change password");
        } else {
             const errorText = await res.text();
             throw new Error(errorText || "Failed to change password");
        }
    }
  },

  async uploadAvatar(file: File, token: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/users/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
         // "Content-Type" must NOT be set when using FormData, browser sets it with boundary
      },
      body: formData,
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to upload avatar");
    const data = await res.json();
    // The backend returns the full UserResponse, so we could theoretically update the whole user
    return data.avatarUrl; 
  },
};
