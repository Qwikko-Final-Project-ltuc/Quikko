import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CustomerAuthAPI from "./CustomerAuthAPI";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../app/firebase";
import { setCurrentCart, clearTempCartId } from "../customer/cartSlice";
import customerAPI from "../customer/services/customerAPI";

// ====================== Thunks ====================== //
export const registerCustomer = createAsyncThunk(
  "auth/registerCustomer",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await CustomerAuthAPI.register(formData);
      return response.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Registration failed");
    }
  }
);

export const loginCustomer = createAsyncThunk(
  "auth/loginCustomer",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await CustomerAuthAPI.login(credentials);
      localStorage.setItem("token", response.token); 
      const profile = await customerAPI.getProfile();
      await dispatch(assignGuestCartAfterLogin(profile.id));
      return { token: response.token, user: profile };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      return {
        token,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const assignGuestCartAfterLogin = createAsyncThunk(
  "auth/assignGuestCartAfterLogin",
  async (userId, { dispatch }) => {
    const guestToken = localStorage.getItem("guest_token");

    if (guestToken) {
      const cart = await customerAPI.assignGuestCartsToUser(userId, guestToken);

      dispatch(setCurrentCart(cart));

      localStorage.removeItem("guest_token");
      dispatch(clearTempCartId());

      return cart;
    }
  }
);


// ====================== Slice ====================== //
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("guest_token");
    },
  },
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // login
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // google login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
