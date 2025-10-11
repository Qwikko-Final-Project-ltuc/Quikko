import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deliveries: [],
};

const deliverySlice = createSlice({
  name: "deliveries",
  initialState,
  reducers: {
    setDelivery: (state, action) => {
      state.deliveries = action.payload;
    },
    approveDeliveryLocal: (state, action) => {
      state.deliveries = state.deliveries.map((delivery) =>
        delivery.company_id === action.payload
          ? { ...delivery, status: "approved" }
          : delivery
      );
    },
    rejectDeliveryLocal: (state, action) => {
      state.deliveries = state.deliveries.map((delivery) =>
        delivery.company_id === action.payload
          ? { ...delivery, status: "rejected" }
          : delivery
      );
    },
  },
});

export const { setDelivery, approveDeliveryLocal, rejectDeliveryLocal } = deliverySlice.actions;
export default deliverySlice.reducer;