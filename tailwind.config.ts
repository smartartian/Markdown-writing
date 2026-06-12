import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{html,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: 'var(--accent)',
        border: 'var(--border-color)',
      },
      fontFamily: {
        editor: 'var(--editor-font)',
        code: 'var(--code-font)',
      },
      maxWidth: {
        editor: 'var(--editor-max-width)',
      },
    },
  },
  plugins: [],
} satisfies Config
