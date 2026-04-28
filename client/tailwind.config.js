/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A00',
          dark: '#E66E00',
          light: '#FF9533',
        },
        secondary: {
          DEFAULT: '#FFF1E6',
          dark: '#FFE4CC',
        },
        surface: 'rgba(255, 255, 255, 0.85)',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #FFF1E6 0%, #FFFFFF 100%)',
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(255, 122, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
