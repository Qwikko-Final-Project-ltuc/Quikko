import { createSlice } from "@reduxjs/toolkit";
import { colors } from "./colors";

const initialTheme = localStorage.getItem("theme") || "light";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: initialTheme,
    colors: colors[initialTheme],
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      state.colors = colors[state.mode];
      localStorage.setItem("theme", state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      state.colors = colors[action.payload];
      localStorage.setItem("theme", action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
