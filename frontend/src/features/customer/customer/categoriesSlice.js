// src/features/customer/customer/categoriesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "./services/customerAPI";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    return await customerAPI.getCategories();
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    selectedCategories: [], // مصفوفة بدل واحد
  },
  reducers: {
    toggleCategory: (state, action) => {
      const id = action.payload.id;
      if (id === "all") {
        // لو All مختارة، نفضي الاختيارات الأخرى
        state.selectedCategories = [];
      } else {
        // إضافة أو إزالة الكاتيجوري
        if (state.selectedCategories.find(cat => cat.id === id)) {
          state.selectedCategories = state.selectedCategories.filter(cat => cat.id !== id);
        } else {
          state.selectedCategories.push(action.payload);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.items = action.payload || []; state.status = "succeeded"; })
      .addCase(fetchCategories.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; });
  },
});

export const { toggleCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
