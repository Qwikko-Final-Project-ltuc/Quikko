import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  GetAllCategory,
  AddCategory,
  EditCategory,
  DeleteCategory,
} from "./categoryApi";

//  Get All Categories
export const allCategory = createAsyncThunk(
  "categories/allCategory",
  async (thunkAPI) => {
    try {
      const result = await GetAllCategory();
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//  Add Category
export const addCategory = createAsyncThunk(
  "categories/addCategory",
  async (categoryData, thunkAPI) => {
    try {
      const result = await AddCategory(categoryData);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//  Edit Category
export const editCategory = createAsyncThunk(
  "categories/editCategory",
  async ({ id, categoryData }, thunkAPI) => {
    try {
      const result = await EditCategory(id, categoryData);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//  Delete Category
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, thunkAPI) => {
    try {
      await DeleteCategory(id);
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Slice
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categoryList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(allCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categoryList = action.payload;
    });

    // Add
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.categoryList.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Edit
    builder
      .addCase(editCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categoryList.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categoryList[index] = action.payload;
        }
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categoryList = state.categoryList.filter(
          (c) => c.id !== action.payload.id
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
