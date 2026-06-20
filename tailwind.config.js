/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilita el modo oscuro basado en clase css 'dark'
  theme: {
    extend: {
      colors: {
        // Deep Navy Blue (Light Mode Base/Accents)
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43', // Deep Navy Blue
        },
        // Abyssal Dark Blue (Dark Mode Backgrounds)
        abyssal: {
          light: '#0b162c',
          DEFAULT: '#050b14', // Fondo principal Dark
          dark: '#02050a',
        },
        // Neon Cyan (Dark Mode Accents)
        cyan: {
          neon: '#00f2fe',
          glow: 'rgba(0, 242, 254, 0.5)',
        }
      },
      fontFamily: {
        sans: ['Comfortaa', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(0, 242, 254, 0.5)',
        'island': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
