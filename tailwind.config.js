/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#0a0d12',
          900: '#11161d',
          850: '#151c24',
          800: '#1a222c',
          750: '#222b37',
          700: '#2b3644',
          600: '#3e4d5f',
          500: '#5c6f84',
          400: '#8698ac',
          300: '#b4c3d4',
          200: '#e1e8f0',
        },
        scada: {
          cyan: '#00f0ff',
          blue: '#0ea5e9',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          panel: '#131922',
          border: '#1e293b',
          glow: 'rgba(0, 240, 255, 0.15)',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
