/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#2b2a26",
        surface: "#ffffff",
        "surface-muted": "#f2f1ed",
        border: "#e3ddd0",
        muted: "#7a7468",
        primary: {
          DEFAULT: "#3f6b58",
          hover: "#305444",
          foreground: "#ffffff",
        },
        accent: "#b98a52",
        danger: {
          DEFAULT: "#b3453d",
          hover: "#97362f",
        },
        ring: "#3f6b58",
      },
      fontFamily: {
        sans: [
          "var(--font-noto-sans-jp)",
          "Hiragino Sans",
          "Yu Gothic",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
