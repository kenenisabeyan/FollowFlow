/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: 'var(--bg-background)',
        surface: 'var(--bg-surface)',
        surfaceLighter: 'var(--bg-surface-lighter)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
        pureWhite: '#ffffff',
        textMain: 'rgb(var(--color-white) / <alpha-value>)',
        textMuted: 'rgb(var(--color-gray-400) / <alpha-value>)',
        borderMain: 'var(--border-main)',
        gray: {
          200: 'rgb(var(--color-gray-200) / <alpha-value>)',
          300: 'rgb(var(--color-gray-300) / <alpha-value>)',
          400: 'rgb(var(--color-gray-400) / <alpha-value>)',
          500: 'rgb(var(--color-gray-500) / <alpha-value>)',
        },
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        brand: '#6366f1',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
