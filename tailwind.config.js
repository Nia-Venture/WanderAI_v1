/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F0E8',
        surface: '#FFFDF7',
        primary: '#1A3A4A',
        accent: '#E8622A',
        'accent-2': '#2AB8A8',
        'text-main': '#2C2C2C',
        muted: '#8A8070',
        border: '#E2D9C8',
        'primary-light': '#2A5A74',
        'accent-light': '#F0824A',
        'accent-dark': '#C44E1E',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(26,58,74,0.07)',
        'card-hover': '0 4px 28px 0 rgba(26,58,74,0.13)',
        chat: '0 8px 40px 0 rgba(26,58,74,0.14)',
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        pulse2: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
