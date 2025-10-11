import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as reviewAPI from "./services/reviewAPI";

//  Thunks 
export const addReviewThunk = createAsyncThunk(
  "review/addReview",
  async ({ vendor_id, rating }, { rejectWithValue }) => {
    try {
      return await reviewAPI.addReview({ vendor_id, rating });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAverageRatingThunk = createAsyncThunk(
  "review/fetchAverageRating",
  async (vendor_id, { rejectWithValue }) => {
    try {
      const res = await reviewAPI.getVendorAverageRating(vendor_id);
      return res; 
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchStoresWithReviews = createAsyncThunk(
  "stores/fetchStoresWithReviews",
  async (_, { rejectWithValue }) => {
    try {
      const data = await reviewAPI.fetchVendorsWithReviews();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchUserRatingThunk = createAsyncThunk(
  "review/fetchUserRating",
  async (vendor_id, { rejectWithValue }) => {
    try {
      return await reviewAPI.getUserReview(vendor_id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchReviewsThunk = createAsyncThunk(
  "review/fetchReviews",
  async (vendor_id, { rejectWithValue }) => {
    try {
      return await reviewAPI.getReviewsByVendor(vendor_id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    allStores: [],
    loading: false,
    averageRating: 0,
    totalReviews: 0,
    userRating: 0,
    reviews: [],
    status: "idle",
    error: null,
    itemsPerPage: 12,
    currentPage: 1,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAverageRatingThunk.fulfilled, (state, action) => {
        state.averageRating = action.payload;
      })
      .addCase(fetchUserRatingThunk.fulfilled, (state, action) => {
        state.userRating = action.payload;
      })
      .addCase(addReviewThunk.fulfilled, (state, action) => {
        state.userRating = action.payload.rating;
        const existingIndex = state.reviews.findIndex(r => r.user_id === action.payload.user_id);
        if (existingIndex >= 0) state.reviews[existingIndex] = action.payload;
        else state.reviews.unshift(action.payload);
        state.totalReviews = state.reviews.length;
      })
      .addCase(fetchReviewsThunk.fulfilled, (state, action) => {
        state.reviews = action.payload;
        state.totalReviews = action.payload.length;
      })
      .addCase(fetchStoresWithReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoresWithReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.allStores = action.payload; 
      })
      .addCase(fetchStoresWithReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { setCurrentPage } = reviewSlice.actions;

export default reviewSlice.reducer;
