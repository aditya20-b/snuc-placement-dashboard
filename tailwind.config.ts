import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        placement: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb'
        },
        exam: {
          DEFAULT: '#ef4444',
          dark: '#dc2626'
        },
        info: {
          DEFAULT: '#10b981',
          dark: '#059669'
        },
        other: {
          DEFAULT: '#6b7280',
          dark: '#4b5563'
        }
      },
    },
  },
  plugins: [],
}
export default config