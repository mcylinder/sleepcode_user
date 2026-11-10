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
        'p-panel': 'var(--p-panel)',
        'p-panel-border': 'var(--p-panel-border)',
        'p-tile-active': 'var(--p-tile-active)',
        'p-well': 'var(--p-well)',
        'p-step-outline': 'var(--p-step-outline)',
        'p-today': 'var(--p-today)',
        'p-voice-bright': 'var(--p-voice-bright)',
        'p-voice-deep': 'var(--p-voice-deep)',
        'p-pulse-bright': 'var(--p-pulse-bright)',
        'p-pulse-deep': 'var(--p-pulse-deep)',
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
