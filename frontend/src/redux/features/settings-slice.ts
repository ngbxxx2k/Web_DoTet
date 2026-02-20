import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define the interface for the settings state
export interface SettingsState {
  settings: Record<string, string>;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: SettingsState = {
  settings: {},
  loading: false,
  error: null,
};

// Async thunk to fetch public settings
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8080/api/public/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      return rejectWithValue(error.message || "Failed to fetch settings");
    }
  }
);

// Create the slice
export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Action to manually update settings (e.g. after admin save)
    setSettings: (state, action: PayloadAction<Record<string, string>>) => {
      state.settings = action.payload;
    },
    updateSetting: (state, action: PayloadAction<{ key: string; value: string }>) => {
        state.settings[action.payload.key] = action.payload.value;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSettings, updateSetting } = settingsSlice.actions;

// Selectors
export const selectSettings = (state: any) => state.settingsReducer.settings;
export const selectSetting = (state: any, key: string) => state.settingsReducer.settings[key];

export default settingsSlice.reducer;
