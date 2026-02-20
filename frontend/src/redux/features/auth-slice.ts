import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserAddress {
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
}

export type User = {
  id: number;
  fullName: string;
  email: string;
  roleCode: string;
  roleName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: UserAddress;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateUser } = auth.actions;
export default auth.reducer;
