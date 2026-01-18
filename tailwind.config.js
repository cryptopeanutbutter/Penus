/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Dark Egyptian Theme
        obsidian: {
          DEFAULT: '#0a0a0f',
          50: '#1a1a24',
          100: '#151520',
          200: '#12121a',
          300: '#0f0f16',
          400: '#0c0c12',
          500: '#0a0a0f',
        },
        gold: {
          DEFAULT: '#d4af37',
          50: '#fdf8e8',
          100: '#f9edc4',
          200: '#f3dc8c',
          300: '#e9c54d',
          400: '#d4af37',
          500: '#b8972e',
          600: '#967825',
          700: '#745c1d',
        },
        papyrus: {
          DEFAULT: '#f4e4bc',
          dark: '#d4c49c',
        },
        scarab: {
          DEFAULT: '#1e3a5f',
          light: '#2d5a8a',
        },
      },
      fontFamily: {
        egyptian: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
