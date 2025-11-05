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
      console.log("🔐 Login attempt with:", credentials);
      const response = await CustomerAuthAPI.login(credentials);
      console.log("📨 Full login response:", response);
      
      localStorage.setItem("token", response.token); 
      
      // محاولة استخراج بيانات المستخدم بطرق مختلفة
      let userData = null;
      
      if (response.user) {
        userData = response.user;
        console.log("✅ User data from response.user:", userData);
      } else if (response.data && response.data.user) {
        userData = response.data.user;
        console.log("✅ User data from response.data.user:", userData);
      } else if (response.id || response.userId) {
        // إذا كان الـ response نفسه يحتوي على id
        userData = {
          id: response.id || response.userId,
          email: credentials.email,
          role: response.role || 'customer'
        };
        console.log("✅ User data constructed from response:", userData);
      } else {
        console.log("❌ No user data found in response structure");
        console.log("Available keys:", Object.keys(response));
      }
      
      if (!userData || !userData.id) {
        // إذا ما فيش user data، جرب نستخدم الـ token لاحقاً
        console.log("⚠️ No user ID found, will try to proceed with token only");
        userData = {
          id: 'temp_id', // مؤقت
          email: credentials.email,
          role: 'customer'
        };
      }
      
      // حاول ننفذ assignGuestCartAfterLogin إذا في user id
      if (userData.id && userData.id !== 'temp_id') {
        try {
          await dispatch(assignGuestCartAfterLogin(userData.id));
          console.log("✅ Guest cart assigned successfully");
        } catch (cartError) {
          console.log("⚠️ Cart assignment failed:", cartError);
          // استمري حتى لو فشل الـ cart assignment
        }
      }
      
      return { 
        token: response.token, 
        user: userData
      };
    } catch (err) {
      console.log("❌ Login error:", err.response?.data || err.message);
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
      localStorage.removeItem("customerId");
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
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
        localStorage.setItem("customerId", String(action.payload.user.id));
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

export const { logout, clearError, setUser } = authSlice.actions;

export default authSlice.reducer;