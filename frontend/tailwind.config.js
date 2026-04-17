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
        textMain: 'rgb(var(--color-text-main) / <alpha-value>)',
        textMuted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        borderMain: 'var(--border-main)',
        primary: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        brand: '#6366f1',
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
