import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AddNotification } from "./notificationApi";

export const addNotification = createAsyncThunk(
  "notifications/addNotification",
  async (notificationsData, thunkAPI) => {
    try {
      const result = await AddNotification(notificationsData);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
  },
});

export const { setNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
