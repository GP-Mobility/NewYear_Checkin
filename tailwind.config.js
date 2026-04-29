/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        'anuphan': ['var(--font-anuphan)', 'sans-serif'],
        'ibm-plex-sans-thai-looped': ['var(--font-ibm-plex-sans-thai-looped)', 'sans-serif'],
        'ibm-plex-sans-thai': ['var(--font-ibm-plex-sans-thai)', 'sans-serif'],
        'kanit': ['var(--font-kanit)', 'sans-serif'],
        'maitree': ['var(--font-maitree)', 'sans-serif'],
        'mali': ['var(--font-mali)', 'sans-serif'],
        'mitr': ['var(--font-mitr)', 'sans-serif'],
        'sans': ['var(--font-kanit)', 'sans-serif'], // ตั้งค่า default เป็น Kanit
      },
    },
  },
  plugins: [],
}

