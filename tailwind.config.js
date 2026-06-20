/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PERFX Brand Colors (Colores corporativos exactos)
        perfx: {
          blue: '#0B104A',   // Azul profundo del texto y borde del escudo
          orange: '#F97E00', // Naranja vibrante de la flecha y parte del escudo
        },
        // Paleta Navy recalibrada para que el tono 900 sea el azul PERFX
        navy: {
          50: '#f2f4fb',
          100: '#e6e8f6',
          200: '#c5c9e8',
          300: '#a3abdb',
          400: '#828dce',
          500: '#606fc1',
          600: '#4a579d',
          700: '#35407a',
          800: '#1f2856',
          900: '#0B104A', // <-- Reemplazado por el Azul PERFX
        },
        // Abyssal Dark Blue (Para fondos en Dark Mode, derivados del azul PERFX)
        abyssal: {
          light: '#11175c',
          DEFAULT: '#06092e', // Tono ultra oscuro del azul corporativo
          dark: '#03051a',
        },
        // Brand Accent (Reemplazo del Cyan Neón por el Naranja PERFX)
        accent: {
          DEFAULT: '#F97E00', // Naranja PERFX
          light: '#ff9833',
          glow: 'rgba(249, 126, 0, 0.5)',
        }
      },
      fontFamily: {
        sans: ['Comfortaa', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Brillos actualizados con los colores de la marca
        'glow-orange': '0 0 15px rgba(249, 126, 0, 0.4)',
        'glow-blue': '0 0 15px rgba(11, 16, 74, 0.4)',
        // Sombra de isla premium: Se cambia el negro puro (0,0,0) por el azul Perfx con opacidad.
        // Esto da un look tipo Liquid Glassmorphism mucho más limpio.
        'island': '0 10px 25px -5px rgba(11, 16, 74, 0.08), 0 8px 10px -6px rgba(11, 16, 74, 0.04)',
      }
    },
  },
  plugins: [],
}