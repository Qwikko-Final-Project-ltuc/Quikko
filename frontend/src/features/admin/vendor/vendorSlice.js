import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  vendors: [],
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    setVendors: (state, action) => {
      state.vendors = action.payload;
    },
    approveVendorLocal: (state, action) => {
      state.vendors = state.vendors.map((vendor) =>
        vendor.vendor_id === action.payload
          ? { ...vendor, status: "approved" }
          : vendor
      );
    },
    rejectVendorLocal: (state, action) => {
      state.vendors = state.vendors.map((vendor) =>
        vendor.vendor_id === action.payload
          ? { ...vendor, status: "rejected" }
          : vendor
      );
    },
  },
});

export const { setVendors, approveVendorLocal, rejectVendorLocal } = vendorsSlice.actions;
export default vendorsSlice.reducer;