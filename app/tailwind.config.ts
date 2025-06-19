// tailwind.config.ts
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
        'typewriter-red': 'var(--color-typewriter-red)',
        'black': 'var(--color-black)',
        'white': 'var(--color-white)',
        'blockchain-blue': 'var(--color-blockchain-blue)',
        'digital-silver': 'var(--color-digital-silver)',
        'parchment': 'var(--color-parchment)',
        'verification-green': 'var(--color-verification-green)',
        'alert-amber': 'var(--color-alert-amber)',
      },
      fontFamily: {
        headlines: 'var(--font-headlines)',
        body: 'var(--font-body)',
        ui: 'var(--font-ui)',
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'var(--font-body)',
            h1: {
              fontFamily: 'var(--font-headlines)',
            },
            h2: {
              fontFamily: 'var(--font-headlines)',
            },
            h3: {
              fontFamily: 'var(--font-headlines)',
            },
            h4: {
              fontFamily: 'var(--font-headlines)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config