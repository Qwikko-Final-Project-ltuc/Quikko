import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://qwikko.onrender.com/api';

// Async thunk for fetching unread messages count
export const fetchUnreadMessagesCount = createAsyncThunk(
  'chatUnread/fetchCount',
  async (_, {  rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return { count: 0 };
      }

      const response = await axios.get(`${API_BASE_URL}/chat/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch unread count');
    }
  }
);

const chatUnreadSlice = createSlice({
  name: 'chatUnread',
  initialState: {
    unreadCount: 0,
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadMessagesCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadMessagesCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload.count || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUnreadMessagesCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.unreadCount = 0;
      });
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  resetUnreadCount,
  clearError,
} = chatUnreadSlice.actions;

export default chatUnreadSlice.reducer;