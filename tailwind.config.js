/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:    "#0A2647",
        gold:    "#D4AF37",
        skyblue: "#87CEEB",
        richblack: "#1A1A1A",
        steel:   "#1E3A5F",
        iron:    "#5A6380",
        alert:   "#FF4D4D",
        amber:   "#F5A623",
        success: "#22C55E",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        pill: "9999px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-dot": "bounce 1s infinite",
      },
    },
  },
  plugins: [],
};