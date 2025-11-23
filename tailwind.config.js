/** @type {import('tailwindcss').Config} */
export default  {
  content : [
    "./index.html" ,
    "./src/**/*.{js,ts,jsx,tsx}" ,
  ],
  theme : {
    extend : {
      colors : {
        // Warna custom buat tema dashboard nanti
        'dark-bg': '#0f172a', // Slate 900
        'card-bg': '#1e293b', // Slate 800
        'accent': '#3b82f6',  // Blue 500
      }
    },
  },
  plugins : [],
}