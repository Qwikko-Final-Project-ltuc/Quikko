import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "./services/customerAPI";

// ==== Thunks ====

// Fetch all carts
export const fetchAllCarts = createAsyncThunk(
  "cart/fetchAllCarts",
  async () => {
    const carts = await customerAPI.getCart();
    return carts; 
  }
);

// Fetch single cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (id) => {
    return await customerAPI.getCartById(id);
  }
);

// Delete item from cart
export const deleteItem = createAsyncThunk(
  "cart/deleteItem",
  async ({ cartId, itemId }, { dispatch }) => {
    await customerAPI.deleteItem({ cartId, itemId });
    dispatch(fetchCart(cartId));
    return itemId;
  }
);

// Delete entire cart
export const deleteCart = createAsyncThunk(
  "cart/deleteCart",
  async (cartId, { dispatch }) => {
    await customerAPI.deleteCart(cartId);
    dispatch(fetchAllCarts());
    return cartId;
  }
);

// Create new cart
export const createNewCart = createAsyncThunk(
  "cart/createNewCart",
  async (_, { dispatch }) => {
    const newCart = await customerAPI.createCart(); 
    dispatch(fetchAllCarts());
    return newCart;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return null; 
    try {
      const response = await customerAPI.getProfile();
      return response;
    } catch (err) {
      console.log(err);
      return rejectWithValue("Failed to fetch current user");
    }
  }
);


// Increase or decrease item quantity
export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ cartId, itemId, quantity }, { dispatch }) => {
    await customerAPI.updateItem(itemId, { quantity });
    dispatch(fetchCart(cartId));
    return { itemId, quantity };
  }
);



const cartSlice = createSlice({
  name: "cart",
  initialState: {
    allCarts: [],
    currentCart: null,
    tempCartId: null,
    user: null, 
    status: "idle",
    error: null,
  },
  reducers: {
    setTempCartId: (state, action) => {
      state.tempCartId = action.payload;
    },
    setCurrentCart: (state, action) => {
      state.currentCart = action.payload;
    },
    clearTempCartId: (state) => {
      state.tempCartId = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllCarts
      .addCase(fetchAllCarts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllCarts.fulfilled, (state, action) => {
        state.allCarts = (Array.isArray(action.payload) ? action.payload : [action.payload])
          .map(cart => ({
            ...cart,
            items: Array.isArray(cart.items) ? cart.items : [], 
          }));
        state.status = "succeeded";
      })

      .addCase(fetchAllCarts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.currentCart = null;

      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.currentCart = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
      state.status = "loading";
    })
    .addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload; 
      state.status = "succeeded";
    })
    .addCase(fetchCurrentUser.rejected, (state, action) => {
      state.user = null;
      state.status = "failed";
      state.error = action.payload || action.error.message;
    });
  },
});
export const { setTempCartId , setCurrentCart, clearTempCartId, setUser} = cartSlice.actions;

export default cartSlice.reducer;
