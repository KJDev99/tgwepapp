/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
        dark: '#0f172a',
        light: '#f8fafc'
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
