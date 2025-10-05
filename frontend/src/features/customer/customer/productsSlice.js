import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "./services/customerAPI";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ categoryId } = {}) => {
    const params = {};
    if (categoryId) params.categoryId = categoryId;
    const products = await customerAPI.getProducts(params);
    return products;
  }
);

export const fetchProductsWithSorting = createAsyncThunk(
  "products/fetchProductsWithSorting",
  async ({ sort } = {}) => {
    // sort can be: price_asc, price_desc, most_sold
    const products = await customerAPI.getProductsWithSorting(sort);
    return products;
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [], 
    status: "idle",
    error: null,
    searchQuery: "",
    sortBy: "default",
    currentPage: 1,   // الصفحة الحالية
    itemsPerPage: 12,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload.toLowerCase();
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // reset الصفحة لما يغير عدد العناصر بالصفحة
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload || []; 
        state.status = "succeeded";
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchProductsWithSorting.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductsWithSorting.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.status = "succeeded";
      })
      .addCase(fetchProductsWithSorting.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
export const { setSearchQuery, setSortBy , setCurrentPage, setItemsPerPage } = productsSlice.actions;

export default productsSlice.reducer;
