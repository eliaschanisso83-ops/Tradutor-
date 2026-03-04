/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        afri: {
          primary: '#D97706', // Ochre
          secondary: '#15803d', // Deep Green
          accent: '#9a3412', // Burnt Orange
          tertiary: '#7c2d12', // Darker Orange
          surface: '#ffffff',
          subtle: '#f3f4f6',
          warm: '#fffbeb'
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'heavy': '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(217, 119, 6, 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
}
