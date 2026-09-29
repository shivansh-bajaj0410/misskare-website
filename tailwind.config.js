/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F6EFE6',
        camel: '#B98A5E',
        camel2: '#8C6541',
        blush: '#E9C6C0',
        ink: '#1B1512',
        charcoal: '#241E1A',
        gold: '#C9A15D',
        goldlight: '#E4C892',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(to top, rgba(10,7,5,0.92) 0%, rgba(10,7,5,0.55) 35%, rgba(10,7,5,0.15) 65%, rgba(10,7,5,0.35) 100%)',
        'candlelight':
          'radial-gradient(120% 100% at 50% 0%, rgba(201,161,93,0.16), rgba(0,0,0,0) 60%)',
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      keyframes: {
        fadeRise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeRise: 'fadeRise 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
        shimmer: 'shimmer 2.2s linear infinite',
      },
      boxShadow: {
        boutique: '0 20px 60px -20px rgba(20,14,8,0.45)',
      },
    },
  },
  plugins: [],
};
