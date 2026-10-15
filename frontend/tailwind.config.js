/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Civic-Tech Primary Action Palette (Forest Green)
        primary: {
          50:  '#F2F7F4',
          100: '#E1EDE6',
          200: '#C3DCCD',
          300: '#9BC3AC',
          400: '#6EA586',
          500: '#3D7856',
          600: '#2D6A4F', // deep forest green
          700: '#245E43', // primary dark green
          800: '#1B4332', // deep forest action
          900: '#133124',
          950: '#0A1C14',
        },
        // Forest green alias
        forest: {
          50:  '#F2F7F4',
          100: '#E1EDE6',
          200: '#C3DCCD',
          300: '#9BC3AC',
          400: '#6EA586',
          500: '#3D7856',
          600: '#2D6A4F',
          700: '#245E43',
          800: '#1B4332',
          900: '#133124',
        },
        // Restrained Saffron / Muted Terracotta Accent
        accent: {
          50:  '#FDF7F2',
          100: '#FAEADE',
          200: '#F5D3BC',
          300: '#EDB592',
          400: '#E29161',
          500: '#D96B27', // restrained saffron
          600: '#C85A17', // terracotta
          700: '#A3430C',
          800: '#7F340A',
          900: '#652A08',
        },
        terracotta: {
          50:  '#FDF7F2',
          100: '#FAEADE',
          500: '#D96B27',
          600: '#C85A17',
          700: '#A3430C',
        },
        // Warm Neutral & Cream Surfaces
        warm: {
          ivory:   '#FBF9F5', // primary page background
          cream:   '#F7F5F0', // soft surface
          card:    '#FFFFFF', // pure card surface
          cardAlt: '#FCFBF9', // subtle alternate card
          border:  '#E7E3DC', // refined border
          borderLight: '#F0ECE4',
          dark:    '#1A1918', // charcoal header
          charcoal:'#2A2724', // primary text
          muted:   '#68625A', // secondary text
          subtle:  '#999287',
        },
        // Neutral Slate / Charcoal
        slate: {
          50:  '#FBF9F5',
          100: '#F4F1EB',
          200: '#E7E3DC',
          300: '#D5CEC4',
          400: '#A49C90',
          500: '#6E675D',
          600: '#4F4A42',
          700: '#3A3630',
          800: '#262420',
          900: '#181715',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(27, 67, 50, 0.05)',
        card: '0 1px 3px 0 rgba(42, 39, 36, 0.06), 0 1px 2px -1px rgba(42, 39, 36, 0.04)',
        'card-hover': '0 8px 16px -4px rgba(27, 67, 50, 0.08), 0 2px 4px -2px rgba(27, 67, 50, 0.04)',
        'card-lg': '0 12px 24px -6px rgba(27, 67, 50, 0.1), 0 4px 8px -4px rgba(27, 67, 50, 0.05)',
      },
      borderRadius: {
        'lg': '0.625rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
