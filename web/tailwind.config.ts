import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        'primary-bg': '#f7f5f0',
        'accent-gold': '#C9A36B',
        'text-dark': '#1F2814',
        'text-muted': '#4F5848',
        surface: '#FEFCF8',        /* was #FFF9EF — near-white with warmth */
        blush: '#FAF3E8',          /* was #F8EFDA — +3 L */
        cream: '#FAF3E8',          /* was #F8EFDA — +3 L */
        sand: '#F4EBD8',           /* was #F1E4C6 — +3 L */
        wheat: '#ECDDC4',          /* was #E8D5AF — +4 L */
        clay: '#B89668',
        moss: '#7BA055',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: '#5F8A3A',
        background: '#FAF5EE',     /* was #F8F1E1 */
        foreground: '#1F2814',
        primary: {
          DEFAULT: '#5B8A3A',
          foreground: '#FEFCF8',
        },
        secondary: {
          DEFAULT: '#1F3815',
          foreground: '#FEFCF8',
        },
        tertiary: {
          DEFAULT: '#C9A36B',
          foreground: '#1F2814',
        },
        muted: {
          DEFAULT: '#FAF3E8',      /* was #F8EFDA */
          foreground: '#4F5848',
        },
        accent: {
          DEFAULT: '#C9A36B',
          foreground: '#1F2814',
        },
        destructive: {
          DEFAULT: '#B53D24',
          foreground: '#FEFCF8',
        },
        card: {
          DEFAULT: '#FEFCF8',      /* was #FFF9EF — near-white */
          foreground: '#1F2814',
        },
        popover: {
          DEFAULT: '#FEFCF8',      /* was #FFF9EF */
          foreground: '#1F2814',
        },
      },
      fontFamily: {
        heading: ['var(--font-serif)', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        body: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        24: '96px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 18px 50px rgba(31, 56, 21, 0.08)',
        hover: '0 28px 70px rgba(31, 56, 21, 0.14)',
        gold: '0 18px 45px rgba(201, 163, 107, 0.32)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out',
        shimmer: 'shimmer 2s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
