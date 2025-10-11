import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "./services/customerAPI";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ categoryId, page = 1, limit = 12, search } = {}) => {
    const params = { categoryId, page, limit, search };
    const products = await customerAPI.getProducts(params);
    return products; 
  }
);

export const fetchProductsWithSorting = createAsyncThunk(
  "products/fetchProductsWithSorting",
  async ({ sort, page = 1, limit = 12, categoryId, search } = {}) => {
    const params = { sort, page, limit, categoryId, search };
    const products = await customerAPI.getProductsWithSorting(params);
    return products;
  }
);


const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [], 
    totalItems: 0,
    totalPages: 1,
    status: "idle",
    error: null,
    searchQuery: "",
    sortBy: "default",
    currentPage: 1,  
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
      state.currentPage = 1; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload.items || []; 
        state.totalItems = action.payload.totalItems || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
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
        state.items = action.payload.items || [];
       state.totalItems = action.payload.totalItems || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
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
