import type { Config } from 'tailwindcss';

// Seeded from docs/frontend/staff/designs/flow1/_ds tokens (colors.css, spacing.css, typography.css).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          DEFAULT: '#1D4ED8',
          500: '#1D4ED8',
          600: '#1E40AF',
          dark: '#1E40AF',
          700: '#1E3A8A',
          800: '#172554',
          900: '#0F172A',
          light: '#EFF6FF',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        status: {
          info: { bg: '#DBEAFE', text: '#1D4ED8' },
          amber: { bg: '#FEF3C7', text: '#B45309' },
          orange: { bg: '#FFEDD5', text: '#C2410C' },
          success: { bg: '#D1FAE5', text: '#047857' },
          danger: { bg: '#FEE2E2', text: '#B91C1C' },
          neutral: { bg: '#F3F4F6', text: '#4B5563' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        nav: '0 1px 2px 0 rgba(15, 23, 42, 0.08)',
        soft: '0 1px 3px 0 rgba(15, 23, 42, 0.08)',
        card: '0 4px 12px -2px rgba(15, 23, 42, 0.1)',
        floating: '0 20px 40px -12px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
