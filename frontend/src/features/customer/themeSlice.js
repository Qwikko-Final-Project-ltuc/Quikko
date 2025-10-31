import { createSlice } from "@reduxjs/toolkit";

const customerThemeSlice = createSlice({
  name: "customerTheme",
  initialState: { mode: localStorage.getItem("theme") || "light" },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("theme", state.mode);
    },
  },
});


export const { toggleTheme, setTheme } = customerThemeSlice.actions;
export default customerThemeSlice.reducer;
