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
    selectedCategories: [], 
  },
  reducers: {
    toggleCategory: (state, action) => {
      const id = action.payload.id === "all" ? "all" : Number(action.payload.id);

      if (id === "all") {
        state.selectedCategories = [];
      } else {
        if (state.selectedCategories.includes(id)) {
          state.selectedCategories = state.selectedCategories.filter(catId => catId !== id);
        } else {
          state.selectedCategories.push(id);
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
