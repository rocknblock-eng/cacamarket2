/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: {
          950: '#0E1712',
          900: '#14201A',
          800: '#1E2B22',
          700: '#2A3B2E',
          600: '#3B5241'
        },
        blaze: {
          600: '#C94A0A',
          500: '#E8590C',
          400: '#F17A2E'
        },
        brass: {
          500: '#8A7B4F',
          400: '#A5966A'
        },
        bone: {
          100: '#F5F0E3',
          200: '#EDE6D6',
          300: '#D9CFB8'
        }
      },
      fontFamily: {
        display: ['"Bitter"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      }
    }
  },
  plugins: []
}
