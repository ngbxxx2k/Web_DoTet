import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { WishlistService } from "@/services/wishlist.service";

type InitialState = {
  items: WishListItem[];
  userId: number | null;
  loading: boolean;
};

export type WishListItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

// Load from localStorage if available
const loadFromLocalStorage = (): WishListItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save to localStorage
const saveToLocalStorage = (items: WishListItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("wishlist", JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
};

// Async thunk to sync wishlist from backend for logged-in user
export const syncWishlistFromBackend = createAsyncThunk(
  "wishlist/syncFromBackend",
  async (userId: number) => {
    const items = await WishlistService.getWishlist(userId);
    return items.map(item => ({
      id: item.productId,
      title: item.title,
      price: item.basePrice,
      discountedPrice: item.discountedPrice,
      quantity: 1,
      status: item.status,
      imgs: {
        thumbnails: item.thumbnail ? [item.thumbnail] : [],
        previews: item.thumbnail ? [item.thumbnail] : [],
      },
    }));
  }
);

// Async thunk to add item to backend wishlist
export const addItemToBackendWishlist = createAsyncThunk(
  "wishlist/addToBackend",
  async ({ userId, productId }: { userId: number; productId: number }) => {
    await WishlistService.addToWishlist(userId, productId);
    return productId;
  }
);

// Async thunk to remove item from backend wishlist
export const removeItemFromBackendWishlist = createAsyncThunk(
  "wishlist/removeFromBackend",
  async ({ userId, productId }: { userId: number; productId: number }) => {
    await WishlistService.removeFromWishlist(userId, productId);
    return productId;
  }
);

// Async thunk to clear backend wishlist
export const clearBackendWishlist = createAsyncThunk(
  "wishlist/clearBackend",
  async (userId: number) => {
    await WishlistService.clearWishlist(userId);
  }
);

const initialState: InitialState = {
  items: [],
  userId: null,
  loading: false,
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Initialize from localStorage (call this on app mount)
    initializeWishlist: (state) => {
      state.items = loadFromLocalStorage();
    },

    // Set user ID when user logs in
    setWishlistUserId: (state, action: PayloadAction<number | null>) => {
      state.userId = action.payload;
    },
    
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (!existingItem) {
        state.items.push({
          id,
          title,
          price,
          quantity,
          imgs,
          discountedPrice,
          status,
        });
      }
      saveToLocalStorage(state.items);
    },
    
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      saveToLocalStorage(state.items);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      saveToLocalStorage(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncWishlistFromBackend.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncWishlistFromBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        saveToLocalStorage(state.items);
      })
      .addCase(syncWishlistFromBackend.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  initializeWishlist,
  setWishlistUserId,
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
