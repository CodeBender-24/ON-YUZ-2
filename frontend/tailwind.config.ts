import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ad2460',
          50: '#fdeaf1',
          100: '#f9d2e0',
          200: '#f0a5c0',
          300: '#e677a1',
          400: '#d94a82',
          500: '#ad2460',
          600: '#8b1d4e',
          700: '#6a163d',
          800: '#490f2b',
          900: '#290819'
        }
      }
    }
  },
  plugins: []
}

export default config
