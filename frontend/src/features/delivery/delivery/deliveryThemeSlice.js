import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkMode: localStorage.getItem("deliveryTheme") === "dark",
};

const deliveryThemeSlice = createSlice({
  name: "deliveryTheme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("deliveryTheme", state.darkMode ? "dark" : "light");

      if (state.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setTheme: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem("deliveryTheme", action.payload ? "dark" : "light");

      if (action.payload) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
});

export const { toggleTheme, setTheme } = deliveryThemeSlice.actions;
export default deliveryThemeSlice.reducer;
