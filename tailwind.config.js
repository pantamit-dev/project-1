/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['var(--font-manrope)', 'Manrope', 'sans-serif'],
      },
      colors: {
        // Material Design 3 — StitchMCP "AI Facial Recognition System DS"
        primary: {
          DEFAULT: '#00478d',
          container: '#005eb8',
          fixed: '#d6e3ff',
          'fixed-dim': '#a9c7ff',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#c8daff',
          fixed: '#001b3d',
          'fixed-variant': '#00468c',
        },
        secondary: {
          DEFAULT: '#496175',
          container: '#c9e3fa',
          fixed: '#cce6fd',
          'fixed-dim': '#b0c9e1',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#4d6579',
          fixed: '#021e2f',
          'fixed-variant': '#31495c',
        },
        tertiary: {
          DEFAULT: '#534062',
          container: '#6c587b',
          fixed: '#f1daff',
          'fixed-dim': '#d6bee6',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#ead1fa',
          fixed: '#251433',
          'fixed-variant': '#523f61',
        },
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#d8dae2',
          bright: '#f9f9ff',
          container: '#ecedf6',
          'container-low': '#f2f3fb',
          'container-high': '#e7e8f0',
          'container-highest': '#e1e2ea',
          'container-lowest': '#ffffff',
          variant: '#e1e2ea',
          tint: '#005db6',
        },
        'on-surface': {
          DEFAULT: '#191c21',
          variant: '#424752',
        },
        'inverse': {
          surface: '#2e3037',
          'on-surface': '#eff0f8',
          primary: '#a9c7ff',
        },
        outline: {
          DEFAULT: '#727783',
          variant: '#c2c6d4',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          red: '#B00020',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        success: {
          green: '#2E7D32',
        },
        biometric: {
          active: '#4285F4',
        },
        background: '#f9f9ff',
        'on-background': '#191c21',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        'full': '9999px',
      },
      spacing: {
        'baseline': '8px',
      },
      fontSize: {
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'title-lg': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'scan-line': {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'scan-line': 'scan-line 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};
