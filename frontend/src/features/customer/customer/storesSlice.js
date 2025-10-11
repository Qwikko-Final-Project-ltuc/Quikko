import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "./services/customerAPI";

// Thunks 
export const fetchStores = createAsyncThunk(
  "stores/fetchStores",
  async () => {
    const stores = await customerAPI.getStores();
    return stores; 
  }
);

export const fetchStoreById = createAsyncThunk(
  "stores/fetchStoreById",
  async (id) => {
    const response = await customerAPI.getStoreById(id);
    return response; 
  }
);
export const fetchStoreProducts = createAsyncThunk(
  "stores/fetchStoreProducts",
  async (storeId) => {
    const products = await customerAPI.getStoreProducts(storeId);
    return products; 
  }
);

// Slice 
const storesSlice = createSlice({
  name: "stores",
  initialState: {
    allStores: [],
    selectedStore: null,
    storeProducts: [],
    loading: false,
    error: null,
    currentPage: 1,  
    itemsPerPage: 8,
    currentProductPage: 1,
    productsPerPage: 8,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setProductPage: (state, action) => {
      state.currentProductPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.allStores = action.payload;
        state.currentProductPage = 1;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStoreById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStore = action.payload;
      })
      .addCase(fetchStoreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchStoreProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoreProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.storeProducts = action.payload;
      })
      .addCase(fetchStoreProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export const { setCurrentPage ,setProductPage} = storesSlice.actions;

export default storesSlice.reducer;
