/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Metin2 Dev Toolkit Color Palette
        'cyber-green': '#00FF7F',
        'vivid-blue': '#0080FF',
        'dark-bg': '#0F0F0F',
        'dark-surface': '#1A1A1A',
        'dark-border': '#2A2A2A',
        'dark-hover': '#333333',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0B0',
        'text-muted': '#666666',
        'danger': '#FF4444',
        'warning': '#FFB800',
        'success': '#00FF7F'
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00FF7F' },
          '100%': { boxShadow: '0 0 20px #00FF7F, 0 0 30px #00FF7F' }
        }
      }
    },
  },
  plugins: [],
}