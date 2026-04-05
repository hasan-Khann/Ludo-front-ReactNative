/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        game: {
          primary: "#0f172a",
          surface: "#1e293b",
          accent: "#8b5cf6",
          gold: "#f59e0b",
          cyan: "#06b6d4",
          rose: "#e11d48",
        },
        ludo: {
          red: "#ef4444",
          green: "#22c55e",
          blue: "#3b82f6",
          yellow: "#eab308",
        }
      },
      boxShadow: {
        'rich': '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 15px rgba(139, 92, 246, 0.4)',
      },
      borderRadius: {
        'game': '24px',
      }
    },
  },
  plugins: [],
}