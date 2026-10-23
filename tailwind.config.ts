import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FDF2F8', 100: '#FCE7F3', 300: '#F9A8D4',
          500: '#EC4899', 600: '#DB2777', 700: '#BE185D',
        },
        sky: {
          50: '#F0F9FF', 100: '#E0F2FE', 300: '#7DD3FC',
          500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1',
        },
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-thai)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #EC4899 0%, #0EA5E9 100%)',
        'gradient-soft': 'linear-gradient(180deg, #FDF2F8 0%, #F0F9FF 100%)',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(236, 72, 153, 0.08), 0 2px 8px rgba(14, 165, 233, 0.06)',
        glow: '0 8px 32px rgba(236, 72, 153, 0.35)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
} satisfies Config;