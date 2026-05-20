import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // Design tokens matching the original CSS variables exactly
      colors: {
        bg: '#f5f2ec',
        surface: '#ffffff',
        surface2: '#f0ece3',
        border: '#e0d9cc',
        text: {
          DEFAULT: '#1a1510',
          2: '#6b6356',
          3: '#9e9485',
        },
        accent: {
          DEFAULT: '#2c5f3f',
          light: 'rgba(44,95,63,0.1)',
        },
        accent2: {
          DEFAULT: '#b8621a',
          light: 'rgba(184,98,26,0.1)',
        },
        danger: {
          DEFAULT: '#c0392b',
          light: '#fceae8',
        },
        amber: {
          DEFAULT: '#d4a012',
          light: '#fdf8e1',
        },
        blue: {
          DEFAULT: '#1a4a7a',
          light: '#e8f0f8',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        lg: '0 4px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
