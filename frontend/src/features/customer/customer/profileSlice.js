import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "../customer/services/customerAPI";

export const fetchProfile = createAsyncThunk("profile/fetch", async () => {
  return await customerAPI.getProfile();
});

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (data) => {
    return await customerAPI.updateProfile(data);
  }
);

export const deleteProfile = createAsyncThunk("profile/delete", async () => {
  return await customerAPI.deleteProfile(); 
});

const profileSlice = createSlice({
  name: "profile",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.loading = false;
        state.data = null;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default profileSlice.reducer;
