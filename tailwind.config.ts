import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: '#B66A3C',
        deepClay: '#8A4E2D',
        sand: '#EDE3D5',
        cream: '#F7F2EA',
        olive: '#75825B',
        charcoal: '#222222',
        taupe: '#C7B6A3'
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 20px 60px rgba(73,45,28,0.12)'
      }
    }
  },
  plugins: []
};
export default config;
