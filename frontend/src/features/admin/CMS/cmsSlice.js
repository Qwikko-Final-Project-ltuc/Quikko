import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetAllCMSForAdmin, AddCMS, EditCMS, DeleteCMS } from "./cmsApi";

//  Get All CMS For Admin
export const allCMSForAdmin = createAsyncThunk(
  "cms/allCMSForAdmin",
  async (_, thunkAPI) => {
    try {
      const result = await GetAllCMSForAdmin();
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//  Add CMS
export const addCMS = createAsyncThunk(
  "cms/addCMS",
  async (cmsData, thunkAPI) => {
    try {
      const result = await AddCMS(cmsData);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//  Edit CMS
export const editCMS = createAsyncThunk(
  "cms/editCMS",
  async ({ id, cmsData }, thunkAPI) => {
    try {
      const result = await EditCMS(id, cmsData);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//  Delete CMS
export const deleteCMS = createAsyncThunk(
  "cms/deleteCMS",
  async (id, thunkAPI) => {
    try {
      await DeleteCMS(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Slice
const cmsSlice = createSlice({
  name: "cms",
  initialState: {
    cmsList: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(allCMSForAdmin.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(allCMSForAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.cmsList = action.payload;
    });
    builder.addCase(allCMSForAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Add
    builder
      .addCase(addCMS.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCMS.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.cmsList.push(action.payload);
      })
      .addCase(addCMS.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Edit
    builder
      .addCase(editCMS.fulfilled, (state, action) => {
        const { id, cmsData } = action.payload;
        if (state.cmsList[id]) {
          state.cmsList[id] = cmsData;
        }
      })
      .addCase(editCMS.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteCMS.fulfilled, (state, action) => {
        const index = action.payload;
        state.cmsList.splice(index, 1);
      })
      .addCase(deleteCMS.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default cmsSlice.reducer;
