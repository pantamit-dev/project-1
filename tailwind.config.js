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
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#005EB8',
          foreground: '#ffffff',
          container: '#005EB8',
          fixed: '#d6e3ff',
          'fixed-dim': '#a9c7ff',
        },
        secondary: {
          DEFAULT: '#496175',
          foreground: '#ffffff',
          container: '#c9e3fa',
        },
        tertiary: {
          DEFAULT: '#534062',
          container: '#6c587b',
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
        },
        success: {
          DEFAULT: '#2E7D32',
          light: '#4CAF50',
        },
        biometric: {
          active: '#4285F4',
        },
        outline: {
          DEFAULT: '#727783',
          variant: '#c2c6d4',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 25px rgba(0,0,0,0.08)',
        'elevated': '0 4px 12px rgba(0,0,0,0.1)',
        'biometric': '0 0 16px rgba(66, 133, 244, 0.3)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'scan-line': 'scan-line 2.5s ease-in-out infinite',
        'success-pop': 'success-pop 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      },
    },
  },
  plugins: [],
}
