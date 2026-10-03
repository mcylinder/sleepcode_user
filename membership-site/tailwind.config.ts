import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Desktop app layout (side rail) at and above; bottom tab bar below.
        wide: '900px',
      },
      colors: {
        bg: 'var(--bg)',
        'bg-alt': 'var(--bg-alt)',
        ink: 'var(--ink)',
        'ink-body': 'var(--ink-body)',
        'ink-muted': 'var(--ink-muted)',
        accent: 'var(--accent)',
        'on-accent': 'var(--on-accent)',
        hairline: 'var(--hairline)',
        'hairline-strong': 'var(--hairline-strong)',
        'p-bg': 'var(--p-bg)',
        'p-fg': 'var(--p-fg)',
        'p-muted': 'var(--p-muted)',
        'p-accent': 'var(--p-accent)',
        'p-on-accent': 'var(--p-on-accent)',
        'p-track': 'var(--p-track)',
        'p-chip-border': 'var(--p-chip-border)',
        'p-sheet': 'var(--p-sheet)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
}

export default config
