import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        navy: {
          DEFAULT: '#1a1f36',
          light: '#252b48',
        },
        accent: {
          DEFAULT: '#4A90D9',
          light: '#6BA8E8',
        },
        indigo: {
          50: '#eef5fc',
          100: '#d9e9f8',
          200: '#b6d3f0',
          300: '#92bde8',
          400: '#6BA8E8',
          500: '#4A90D9',
          600: '#4A90D9',
          700: '#3a7ac0',
          800: '#2d619c',
          900: '#1a1f36',
          950: '#252b48',
        },
        brand: {
          purple: '#764ba2',
          'purple-light': '#667eea',
          green: '#10b981',
          orange: '#f59e0b',
        },
      },
      letterSpacing: {
        tightest: '-0.02em',
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-once': 'pulse-once 0.3s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-in-out',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-once': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
