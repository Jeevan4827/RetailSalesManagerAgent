/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#060913',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#141e33',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
        },
        retail: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          navy: '#0c1a2e',
          teal: '#0d9488',
          'teal-light': '#14b8a6',
          'teal-dark': '#0f766e',
        }
      },
      boxShadow: {
        'glow-teal': '0 0 30px -5px rgba(13, 148, 136, 0.25)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.25)',
        'glow-purple': '0 0 30px -5px rgba(168, 85, 247, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'mesh-dark': 'radial-gradient(at 0% 0%, rgba(13, 148, 136, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.12) 0px, transparent 50%), radial-gradient(at 50% 20%, rgba(99, 102, 241, 0.08) 0px, transparent 60%)',
        'mesh-glow': 'radial-gradient(circle at 50% 0%, rgba(13, 148, 136, 0.2) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
