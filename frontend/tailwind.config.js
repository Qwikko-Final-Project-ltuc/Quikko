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
