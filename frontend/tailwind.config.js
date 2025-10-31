// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        light: {
          background: "#f0f2f1",
          textbox: "#f9f9f9",
          button: "#307A59",
          text: "#242625",
          div: "#ffffff",
          line: "#cccccc",
          unread: "#e8f1ff",
        },
        dark: {
          background: "#242625",
          div: "#666666",
          text: "#ffffff",
          button: "#307A59",
          textbox: "#f9f9f9",
          line: "#f9f9f9",
          unread: "#2a3b5f",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
