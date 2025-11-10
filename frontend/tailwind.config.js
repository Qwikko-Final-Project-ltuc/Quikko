// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
//   darkMode: "class",
//   theme: {
//     extend: {
//       colors: {
//         light: {
//           background: "#f0f2f1",
//           textbox: "#f9f9f9",
//           button: "#307A59",
//           text: "#242625",
//           div: "#ffffff",
//         },
//         dark: {
//           background: "#242625",
//           div: "#666666",
//           text: "#ffffff",
//           button: "#307A59",
//           textbox: "#f9f9f9",
//         },
//       },
//     },
//   },
//   plugins: [
//     function ({ addBase, theme }) {
//       addBase({
//         ":root": {
//           "--bg": theme("colors.light.background"),
//           "--text": theme("colors.light.text"),
//           "--div": theme("colors.light.div"),
//           "--button": theme("colors.light.button"),
//           "--textbox": theme("colors.light.textbox"),
//         },
//         ".dark": {
//           "--bg": theme("colors.dark.background"),
//           "--text": theme("colors.dark.text"),
//           "--div": theme("colors.dark.div"),
//           "--button": theme("colors.dark.button"),
//           "--textbox": theme("colors.dark.textbox"),
//         },
//       });
//     },
//   ],
// };


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // 📱 Mobile: 0px - 767px (default)
        'sm': '640px',
        // 📲 Tablet: 768px - 1023px
        'md': '768px',
        // 💻 Desktop: 1024px - 1279px
        'lg': '1024px',
        // 🖥️ Large Desktop: 1280px+
        'xl': '1280px',
      },
    },
  },
  plugins: [],
}